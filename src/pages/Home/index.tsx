import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
// import { LoadingOpacityContainer } from 'components/Loader/styled'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import ConfirmBridgeSwapModal from 'components/swap/ConfirmBridgeSwapModal'
import { ALL_SUPPORTED_CHAIN_SHORT_NAMES, ALL_SUPPORTED_CHAIN_SHORT_NAMES_MAP_TO_CHAINID } from 'constants/chains'
import { useBridgeContract } from 'hooks/useContract'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown, CheckCircle, HelpCircle, Info } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { useGetBridgePairInfoQuery, useGetBridgeSupportedChainsQuery, useGetBridgeSupportedTargetNetworksQuery } from 'state/bridge/slice'
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
import CurrencyOutput from './currencyOutput'
import { isMobile, useDeviceData, deviceType } from 'react-device-detect'
import ApproveFlow from './transferOrApprove'
import LogoDiamond from '../../assets/images/diamond.gif'
import { number } from '@lingui/core/cjs/formats'
import SettingGaer from '../../assets/images/setting-gaer.png'
import ReminderLogo from '../../assets/images/reminder.png'

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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 408px;
  /* width: 100%; */
  height: 45px;
  margin-left: 217px;
  gap: 5px;

  
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    height: 58px;
    // margin: 0px;
    margin-top: 40px;
    margin-bottom: 80px;
    // padding-top: 40px;
    // padding-bottom: 40px;
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
const ReminderHeader = styled.div<{
  color?: string
}>`
  display: flex;
  flex-direction: row;
  color: ${props => props.color ?? "#B4B4B4"};
  text-align: left;
  justify-content: center;
  align-items: center;
  margin-bottom: -5px;
  div:before{
    /* content:"• "; */
  }
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
  padding-left: 8px;
  font-size: 10px;
  font-family: montserrat;
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

// const supportedChains = [1, 128, 56]
// const supportedTargets = [1, 128, 56]

const NetworkWrapper = styled(Column) <{
  width?: string
  margin?: string
}>`
  /* display: flex; */
  width: ${props => props.width ?? "inherit"};
  margin: ${props => props.margin ?? "0"};
  /* width: ${props => props.width ?? "inherit"}; */
  flex-direction: column;
  border: 1px solid #254699;
  background-color: #122032;
  border-radius: 12px;
  /* margin-top: 15px; */
`
export default function Home({ history }: RouteComponentProps) {
  const { account, chainId } = useActiveWeb3React()
  // get version from the url


  const { supportedChains } = useGetBridgeSupportedChainsQuery(undefined, {
    // pollingInterval: ms`10s`,
    // refetchOnFocus: true
    selectFromResult: ({ data }) => ({
      supportedChains: data?.data
    })
  })
  const { supportedTargets } = useGetBridgeSupportedTargetNetworksQuery(
    { chainId },
    {
      // refetchOnMountOrArgChange: true,
      selectFromResult: ({ data }) => ({
        supportedTargets: data?.data ? data?.data : [chainId ? chainId : 1],
      }),
    }
  )

  const toggledVersion = useToggledVersion()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
    fee,
    targetChain,
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
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

  useEffect(() => {
    if (account) {
      onAddressInput(account)
    }
  }, [account, onAddressInput])

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

  const { pairInfo } = useGetBridgePairInfoQuery({
    source_chain: ALL_SUPPORTED_CHAIN_SHORT_NAMES[chainId ?? "undefined"],
    token: inputCurrencyId ?? "undefined",
    target_chain: targetChain ?? "undefined",
  }, {
    refetchOnMountOrArgChange: true,
    selectFromResult: ({ data }) => ({
      pairInfo: data?.data ? data.data : null
    }),
    skip: !chainId || !inputCurrencyId || !targetChain,
  })
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
    // console.log("handleSwap")
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

  // console.log("parsedAmount", parsedAmount)
  // console.log("parsedAmount", parsedAmount?.toFixed(6), typeof Number(parsedAmount?.toFixed(6)))
  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, txHash])

  const crossFee = useMemo(
    () => {
      let fee = 0
      if (independentField && parsedAmount && pairInfo) {
        fee = pairInfo.feeRate * Number(parsedAmount?.toFixed(6))
        // console.log("calculate fee", fee)
        if (fee < pairInfo.minimumCrossFee) {
          fee = pairInfo.minimumCrossFee
        } else if (fee > pairInfo.maximumCrossFee) {
          fee = pairInfo.maximumCrossFee
        }
      }
      return fee.toFixed(2)
    },
    [independentField, parsedAmount, pairInfo]
  )
  const TransferButton = () => (
    <ButtonWrapper>
      {targetChain && pairInfo && !isMobile && pairInfo.targetChain != "alyx" &&
        <Text fontSize={"14px"} fontFamily="montserrat">
          {targetChain.slice(0, 1).toLocaleUpperCase() + targetChain.slice(1, targetChain.length)} Pool: {pairInfo.targetTokenBalance} {inputCurrency?.symbol}</Text>
      }
      {/* {
        pairInfo &&
        <Text fontSize={isMobile ? "10px" : "14px"} fontFamily="montserrat">
          Fee rate: {pairInfo.feeRate * 100}%
          {
            inputCurrency && parsedAmount && <>
              ≈ {crossFee} {inputCurrency?.symbol}
            </>
          }
        </Text>
      } */}
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



  const { innerHeight, innerWidth } = window
  // useDeviceData()
  if (isMobile) {
    return (
      <>
        <NetworkAlert />
        <AppBody>
          {/* {!account ? ( */}
          {false ? (
            <ButtonLight>
              <Trans>Please Connect Wallet</Trans>
            </ButtonLight>
          ) : (
            <Column className='container'>
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
              <Row gap='15px' justify='center' alignItems="center" padding="50px 0 0 0">
                <Text fontSize={"20px"}>Cross Chain</Text>
                <img src={SettingGaer} width={"28px"} height={"28px"}></img>
              </Row>
              <NetworkWrapper padding="15px 10px 0px 10px" width={innerWidth * 88 / 100 + "px"} margin={"20px 0 0 0"}>
                <Row gap='15px' justifyContent="center" alignItems="center" padding="0px 0px 0px 5px">
                  <Text fontSize={"14px"} width="40px" textAlign={"left"}>From</Text>
                  <SourceNetworkSelector supportedChains={supportedChains} />
                </Row>
                <Row gap='15px' justifyContent="center" alignItems="center" >
                  <CurrencyInput></CurrencyInput>
                </Row>
              </NetworkWrapper>
              <ArrowWrapper clickable={false}>
                <svg preserveAspectRatio="none" data-bbox="16.451 43.607 167.098 112.786" viewBox="16.451 43.607 167.098 112.786" height="25" width="35" fill="rgba(255,255,255, 1)" xmlns="http://www.w3.org/2000/svg" data-type="shape" role="presentation" aria-hidden="true" aria-labelledby="svgcid-cwqqkl-k090dk"><title id="svgcid-cwqqkl-k090dk"></title>
                  <g>
                    <path d="M100.316 98.235l54.312-54.312 28.921 28.921L100 156.393 16.451 72.844l29.237-29.237 54.628 54.628z"></path>
                  </g>
                </svg>
              </ArrowWrapper>
              <NetworkWrapper padding="15px 10px 0px 10px"  width={innerWidth * 88 / 100 + "px"}>
                <Row padding='0 0 0 5px' gap="15px" justifyContent="center" alignItems="center">
                  <Text fontSize={"14px"} width="40px" textAlign={"left"}>To</Text>
                  <TargetNetworkSelector supportedChains={supportedTargets} onSwitchChain={handleSwitchChain} />
                  {/* <TargetAddressInput onUserInput={handleAddressInput} />
                  {targetChain && pairInfo && pairInfo.targetChain != "alyx" &&
                    <Text fontSize={"14px"}>
                      {targetChain.slice(0, 1).toLocaleUpperCase() + targetChain.slice(1, targetChain.length)} Pool: {pairInfo.targetTokenBalance} {inputCurrency?.symbol}</Text>
                  } */}
                </Row>
                <Row gap='15px' justifyContent="center" alignItems="center" >
                  <CurrencyOutput></CurrencyOutput>
                </Row>
              </NetworkWrapper>
              <NetworkWrapper padding="15px 10px 15px 10px"  width={innerWidth * 88 / 100 + "px"} margin={"20px 0 0 0"}>
                {pairInfo ? <Column gap={"2px"} padding={"0px 0 0 0px"} alignItems='flex-start'>
                  <ReminderHeader color="white">
                    <img src={ReminderLogo} width={"35px"}></img>
                    <Text fontSize="11px" fontFamily="montserrat_bold"> Reminder</Text>
                  </ReminderHeader>
                  <Reminder><Text>Crosschain Fee is {pairInfo.feeRate * 100}%, Minimum Crosschain Fee is {pairInfo.minimumCrossFee} {inputCurrency?.symbol}</Text></Reminder>
                  <Reminder><Text>Maximum Crosschain Fee is {pairInfo.maximumCrossFee} {inputCurrency?.symbol}</Text></Reminder>
                  <Reminder><Text>Minimum Crosschain Amount is {pairInfo.minimumCrossTransfer} {inputCurrency?.symbol}</Text></Reminder>
                  <Reminder><Text>Maximum Crosschain Amount is {pairInfo.maximumCrossTransfer} {inputCurrency?.symbol}</Text></Reminder>
                  <Reminder><Text>Estimated Time of Crosschain Arrival is 10-30 min</Text></Reminder>
                  <Reminder><Text>Crosschain amount larger than {pairInfo.maximumCrossTransfer} {inputCurrency?.symbol} could take up to 12 hours</Text></Reminder>
                </Column> :
                  <Column gap={"2px"} padding={"0px 0 0 10px"} alignItems='flex-start'>
                    <ReminderHeader color="white">
                      <img src={ReminderLogo} width={"35px"}></img>
                      <Text fontSize="11px" fontFamily="montserrat_bold"> Reminder</Text>
                    </ReminderHeader>
                    <Reminder><Text>Crosschain Fee is 0.5 %, Minimum Crosschain Fee is 1 USDC</Text></Reminder>
                    <Reminder><Text>Maximum Crosschain Fee is 1,000 USDC</Text></Reminder>
                    <Reminder><Text>Minimum Crosschain Amount is 12 USDC</Text></Reminder>
                    <Reminder><Text>Maximum Crosschain Amount is 20,000,000 USDC</Text></Reminder>
                    <Reminder><Text>Estimated Time of Crosschain Arrival is 10-30 min</Text></Reminder>
                    <Reminder><Text>Crosschain amount larger than 5,000,000 USDC could take up to 12 hours</Text></Reminder>
                  </Column>
                }

              </NetworkWrapper>
              <ApproveFlow TransferButton={TransferButton}></ApproveFlow>


              {/* <SwapLeft></SwapLeft> */}
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
        {/* {!account ? ( */}
        {false ? (
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
              {supportedTargets && supportedTargets.length > 0 &&
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
              {pairInfo ? <Column gap={"10px"} padding={"50px 0 0 50px"} alignItems='flex-start'>
                <Reminder color="white">
                  <Text fontSize="11px" fontFamily="montserrat_bold"> Reminder:</Text>
                </Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Crosschain Fee is {pairInfo.feeRate * 100}%, Minimum Crosschain Fee is {pairInfo.minimumCrossFee} {inputCurrency?.symbol},</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Maximum Crosschain Fee is {pairInfo.maximumCrossFee} {inputCurrency?.symbol}</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Minimum Crosschain Amount is {pairInfo.minimumCrossTransfer} {inputCurrency?.symbol}</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Maximum Crosschain Amount is {pairInfo.maximumCrossTransfer} {inputCurrency?.symbol}</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Estimated Time of Crosschain Arrival is 10-30 min</Text></Reminder>
                <Reminder><Text fontSize="7px" fontFamily="montserrat">Crosschain amount larger than {pairInfo.maximumCrossTransfer} {inputCurrency?.symbol} could take up to 12 hours</Text></Reminder>
              </Column> :
                <Column gap={"10px"} padding={"50px 0 0 50px"} alignItems='flex-start'>
                  <Reminder color="white"><Text fontSize="11px" fontFamily="montserrat_bold">Reminder:</Text></Reminder>
                  <Reminder><Text fontSize="7px" fontFamily="montserrat">Crosschain Fee is 0.5 %, Minimum Crosschain Fee is 1 USDC,</Text></Reminder>
                  <Reminder><Text fontSize="7px" fontFamily="montserrat">Maximum Crosschain Fee is 1,000 USDC</Text></Reminder>
                  <Reminder><Text fontSize="7px" fontFamily="montserrat">Minimum Crosschain Amount is 12 USDC</Text></Reminder>
                  <Reminder><Text fontSize="7px" fontFamily="montserrat">Maximum Crosschain Amount is 20,000,000 USDC</Text></Reminder>
                  <Reminder><Text fontSize="7px" fontFamily="montserrat">Estimated Time of Crosschain Arrival is 10-30 min</Text></Reminder>
                  <Reminder><Text fontSize="7px" fontFamily="montserrat">Crosschain amount larger than 5,000,000 USDC could take up to 12 hours</Text></Reminder>
                </Column>
              }
            </SwapRight>
          </Row >

        )}
      </AppBody>
      <SwitchLocaleLink />
    </>
  )
}
