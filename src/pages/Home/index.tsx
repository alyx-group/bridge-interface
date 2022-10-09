import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
// import { LoadingOpacityContainer } from 'components/Loader/styled'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import ConfirmBridgeSwapModal from 'components/swap/ConfirmBridgeSwapModal'
import { ALL_SUPPORTED_CHAIN_SHORT_NAMES } from 'constants/chains'
import { useBridgeContract } from 'hooks/useContract'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown, CheckCircle, HelpCircle, Info } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { useGetBridgeSupportedChainsQuery, useGetBridgeSupportedTargetNetworksQuery } from 'state/bridge/slice'
import styled, { ThemeContext } from 'styled-components'

import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import TargetAddressInput from '../../components/CurrencyInputPanel/targetAddressInput'
import CurrencyLogo from '../../components/CurrencyLogo'
import Loader from '../../components/Loader'
import Row, { AutoRow, RowFixed } from '../../components/Row'
import SourceNetworkSelector from '../../components/swap/SourceNetworkSelector'
import SourceAddress from '../../components/swap/SourceAddress'
import { ArrowWrapper, Wrapper } from '../../components/swap/styleds'
import SwapHeader from '../../components/swap/SwapHeader'
import TargetAddressInputHeader from '../../components/swap/TargetAddressInputHeader'
import TargetNetworkSelector from '../../components/swap/TargetNetworkSelector'
import TokenSelectionHeader from '../../components/swap/TokenSelectionHeader'
import FeeHeader from '../../components/swap/FeeHeader'
import BuyNativeCheck from '../../components/swap/BuyNativeCheck'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { MouseoverTooltip, MouseoverTooltipContent } from '../../components/Tooltip'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import {
  ApprovalState,
  useApproveCallbackFromBridgeSwap,
  useApproveCallbackFromTrade,
} from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useERC20PermitFromTrade, UseERC20PermitState } from '../../hooks/useERC20Permit'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import { useSwapCallback, useBridgeSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion from '../../hooks/useToggledVersion'
import { useUSDCValue } from '../../hooks/useUSDCPrice'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useActiveWeb3React } from '../../hooks/web3'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import AppBody from '../AppBody'

import SwapLeft, { LogoTitle } from './left'
import CurrencyInput from './currencyInput'
import { isMobile, useDeviceData, deviceType } from 'react-device-detect'
import ApproveFlow from './transferOrApprove'
import LogoDiamond from '../../assets/images/diamond.gif'


const SwapRight = styled.div`
  /* flex: 3; */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 100px 0 0 0px;
  gap: 50px;
  /* background-color: greenyellow; */
  width: auto;
  /* height: 500px; */
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 408px;
  /* width: 100%; */
  height: 45px;
  margin-left: 217px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    height: 28px;
    margin: 0px;
    padding-top: 80px;
    align-self: center;
    margin-left: 0px;
  `};
`
const ReminderTitle = styled.div<{
  color?: string
}>`
  color: ${props => props.color ?? "#B4B4B4"};
  text-align: left;
  /* text-decoration: underline; */
  /* text-decoration: dotted; */
`
const Reminder = styled.div<{
  color?: string
}>`
  color: ${props => props.color ?? "#B4B4B4"};
  text-align: left;
  div:before{
    content:"• ";
  }
  /* text-decoration: underline; */
  /* text-decoration: dotted; */
`

const Triangle = styled.img<{
  width?: string
}>`
  /* max-width: 487px; */
  width: ${({ width }) => width};
  /* position: absolute; */
  z-index: -1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 280px;
      // height: 280px;
  `};
`

const supportedChains = [1, 128, 56]
const supportedTargets = [1, 128, 56]

export default function Home({ history }: RouteComponentProps) {
  const { account, chainId } = useActiveWeb3React()
  // get version from the url
  const toggledVersion = useToggledVersion()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
    fee,
  } = useSwapState()

  const {
    v3Trade: { state: v3TradeState },
    bestTrade: trade,
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(toggledVersion)

  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
          [Field.INPUT]: parsedAmount,
          [Field.OUTPUT]: parsedAmount,
        }
        : {
          [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
          [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
        },
    [independentField, parsedAmount, showWrap, trade]
  )

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])

  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onAddressInput,
    onSwitchTargetChain,
  } = useSwapActionHandlers()

  useEffect(() => {
    supportedTargets &&
      ALL_SUPPORTED_CHAIN_SHORT_NAMES[supportedTargets[0]] &&
      onSwitchTargetChain(ALL_SUPPORTED_CHAIN_SHORT_NAMES[supportedTargets[0]])
  }, [supportedTargets, chainId, onSwitchTargetChain])

  const handleAddressInput = useCallback(
    (address: string) => {
      onAddressInput(address)
    },
    [onAddressInput]
  )
  const handleSwitchChain = useCallback(
    (chain: string) => {
      onSwitchTargetChain(chain)
    },
    [onSwitchTargetChain]
  )

  // check whether the user has approved the router on the input token

  const { state: signatureState, signatureData, gatherPermitSignature } = useERC20PermitFromTrade(
    trade,
    allowedSlippage
  )

  const isValid = !swapInputError
  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useBridgeSwapCallback(signatureData)

  const [{ showConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    // tradeToConfirm: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    // tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const handleSwap = useCallback(() => {
    console.log("handleSwap")
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, showConfirm, swapErrorMessage: undefined, txHash: hash })
        // ReactGA.event({
        //   category: 'Swap',
        //   action:
        //     recipient === null
        //       ? 'Swap w/o Send'
        //       : (recipientAddress ?? recipient) === account
        //       ? 'Swap w/o Send + recipient'
        //       : 'Swap w/ Send',
        //   label: [
        //     trade?.inputAmount?.currency?.symbol,
        //     trade?.outputAmount?.currency?.symbol,
        //     'MH',
        //   ].join('/'),
        // })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [swapCallback, showConfirm, recipient, recipientAddress, account, trade])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, txHash])

  const TransferButton = () => (
    <ButtonWrapper>
      <ButtonError
        onClick={() => {
          setSwapState({
            showConfirm: true,
            // tradeToConfirm: trade,
            attemptingTxn: false,
            swapErrorMessage: undefined,
            txHash: undefined,
          })
        }}
        id="swap-button"
        disabled={!isValid || !!swapCallbackError}
        error={!isValid && !swapCallbackError}
      >
        <Text fontSize={14} fontWeight={500}>
          {swapInputError ? swapInputError : <Trans>Transfer</Trans>}
        </Text>
      </ButtonError>
    </ButtonWrapper>
  )
  // useDeviceData()
  if (isMobile) {
    return (
      <>
        <NetworkAlert />
        <AppBody>
          {!account ? (
            <ButtonLight>
              <Trans>Please Connect Wallet</Trans>
            </ButtonLight>
          ) : (
            <Column>
              <ConfirmBridgeSwapModal
                isOpen={showConfirm}
                onAcceptChanges={() => { return }}
                attemptingTxn={attemptingTxn}
                txHash={txHash}
                recipient={recipient}
                allowedSlippage={allowedSlippage}
                onConfirm={handleSwap}
                swapErrorMessage={swapErrorMessage}
                onDismiss={handleConfirmDismiss}
              />
              <Column gap='15px' justifyContent="center" alignItems="center">
                <Text fontSize={"13px"}>From Chain</Text>
                <SourceNetworkSelector supportedChains={supportedChains} />
                {/* <SourceAddress></SourceAddress> */}
              </Column>
              <CurrencyInput></CurrencyInput>
              <ArrowWrapper clickable={false}>
                <svg preserveAspectRatio="none" data-bbox="16.451 43.607 167.098 112.786" viewBox="16.451 43.607 167.098 112.786" height="30" width="46" fill="rgba(187,192,198, 0.8)" xmlns="http://www.w3.org/2000/svg" data-type="shape" role="presentation" aria-hidden="true" aria-labelledby="svgcid-cwqqkl-k090dk"><title id="svgcid-cwqqkl-k090dk"></title>
                  <g>
                    <path d="M100.316 98.235l54.312-54.312 28.921 28.921L100 156.393 16.451 72.844l29.237-29.237 54.628 54.628z"></path>
                  </g>
                </svg>
              </ArrowWrapper>
              <Column padding='50px 0 0 0' gap="15px" justifyContent="center" alignItems="center">
                <Text fontSize={"13px"}>To</Text>
                <TargetNetworkSelector supportedChains={supportedTargets} onSwitchChain={handleSwitchChain} />
                <TargetAddressInput onUserInput={handleAddressInput} />
              </Column>
              <ApproveFlow TransferButton={TransferButton}></ApproveFlow>
              <Column gap={"10px"} padding={"50px 0 0 50px"} alignItems='flex-start'>
                <Reminder color="white"><Text fontSize="11px" fontFamily="montserrat_bold">Reminder:</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Crosschain Fee is 0.5 %, Minimum Crosschain Fee is 1 USDC,</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Maximum Crosschain Fee is 1,000 USDC</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Minimum Crosschain Amount is 12 USDC</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Maximum Crosschain Amount is 20,000,000 USDC</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Estimated Time of Crosschain Arrival is 10-30 min</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Crosschain amount larger than 5,000,000 USDC could take up to 12 hours</Text></Reminder>
              </Column>
              <SwapLeft></SwapLeft>
            </Column>
          )
          }
        </AppBody>
      </>
    )
  }

  return (
    <>
      <NetworkAlert />
      <AppBody>
        {!account ? (
          <ButtonLight>
            <Trans>Please Connect Wallet</Trans>
          </ButtonLight>
        ) : (
          <Row flex={1} width="100%" justify='center' gap='150px'>
            <SwapLeft></SwapLeft>
            <SwapRight>
              <ConfirmBridgeSwapModal
                isOpen={showConfirm}
                onAcceptChanges={() => { return }}
                attemptingTxn={attemptingTxn}
                txHash={txHash}
                recipient={recipient}
                allowedSlippage={allowedSlippage}
                onConfirm={handleSwap}
                swapErrorMessage={swapErrorMessage}
                onDismiss={handleConfirmDismiss}
              />
              {/* <Row justify='center' width="100%"> */}
              {/* <Triangle src={LogoDiamond} width="40%"></Triangle> */}
              {/* <Triangle src={LogoDiamond} width="50%"></Triangle> */}
              {/* <Column gap={"30px"}> */}
              <Row gap={"50px"}>
                <Column gap='5px'>
                  <Text fontSize={"14px"}>From Chain</Text>
                  <SourceNetworkSelector supportedChains={supportedChains} />
                </Column>
                <Column gap='5px'>
                  <Text fontSize={"14px"}>Wallet Address</Text>
                  <SourceAddress></SourceAddress>
                </Column>
              </Row>
              <Row>
                <CurrencyInput></CurrencyInput>
              </Row>
              <ArrowWrapper clickable={false}>
                <svg preserveAspectRatio="none" data-bbox="16.451 43.607 167.098 112.786" viewBox="16.451 43.607 167.098 112.786" height="38" width="57" fill="rgba(187,192,198, 0.8)" xmlns="http://www.w3.org/2000/svg" data-type="shape" role="presentation" aria-hidden="true" aria-labelledby="svgcid-cwqqkl-k090dk"><title id="svgcid-cwqqkl-k090dk"></title>
                  <g>
                    <path d="M100.316 98.235l54.312-54.312 28.921 28.921L100 156.393 16.451 72.844l29.237-29.237 54.628 54.628z"></path>
                  </g>
                </svg>
              </ArrowWrapper>
              {supportedTargets &&
                <Row gap={"50px"}>
                  <Column gap="5px">
                    <Text fontSize={"14px"}>To Chain</Text>
                    <TargetNetworkSelector supportedChains={supportedTargets} onSwitchChain={handleSwitchChain} />
                  </Column>
                  <Column gap="5px">
                    <Text fontSize={"14px"}>Wallet Address</Text>
                    <TargetAddressInput onUserInput={handleAddressInput} />
                  </Column>
                </Row>
              }
              <ApproveFlow TransferButton={TransferButton}></ApproveFlow>
              {/* </Column> */}
              {/* </Row> */}

              {/* <Row justify='center' width="100%"> */}
              {/* <LogoTitle></LogoTitle> */}
              <Column gap={"9px"} padding={"50px 0 0 217px"}>
                <ReminderTitle color="white"><Text fontSize="11px" fontFamily="montserrat_bold">Reminder:</Text></ReminderTitle>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Crosschain Fee is 0.5 %, Minimum Crosschain Fee is 1 USDC</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Maximum Crosschain Fee is 1,000 USDC</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Minimum Crosschain Amount is 12 USDC</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Maximum Crosschain Amount is 20,000,000 USDC</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Estimated Time of Crosschain Arrival is 10-30 min</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Crosschain amount larger than 5,000,000 USDC could take up to 12 hours</Text></Reminder>
              </Column>
              {/* </Row> */}
            </SwapRight>
          </Row >

        )}
      </AppBody>
      <SwitchLocaleLink />
    </>
  )
}
