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
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import TargetAddressInput from '../../components/CurrencyInputPanel/targetAddressInput'
import CurrencyLogo from '../../components/CurrencyLogo'
import Loader from '../../components/Loader'
import Row, { AutoRow, RowFixed } from '../../components/Row'
import SourceNetworkSelector from '../../components/swap/SourceNetworkSelector'
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

export default function Swap({ history }: RouteComponentProps) {
  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const { isLoading, isError, data } = useGetBridgeSupportedChainsQuery(undefined, {
    // pollingInterval: ms`10s`,
    // refetchOnFocus: true
  })
  const supportedChains = data?.data
  // const connectedNetworkIsSupported = supportedChains?.includes(chainId)
  const { supportedTargets } = useGetBridgeSupportedTargetNetworksQuery(
    { chainId },
    {
      refetchOnMountOrArgChange: true,
      selectFromResult: ({ data }) => ({
        supportedTargets: data?.data,
      }),
    }
  )

  // get version from the url
  const toggledVersion = useToggledVersion()
  // const { independentField, typedValue, recipient } = useSwapState()
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
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  useEffect(() => {
    supportedTargets &&
      ALL_SUPPORTED_CHAIN_SHORT_NAMES[supportedTargets[0]] &&
      onSwitchTargetChain(ALL_SUPPORTED_CHAIN_SHORT_NAMES[supportedTargets[0]])
  }, [supportedTargets, chainId, onSwitchTargetChain])

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
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
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    history.push('/swap/')
  }, [history])

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }
  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
  }, [maxInputAmount, onUserInput])

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  // mark when a user has submitted an approval, reset onTokenSelection for input field
  // useEffect(() => {
  //   if (approvalState === ApprovalState.PENDING) {
  //     setApprovalSubmitted(true)
  //   }
  // }, [approvalState, approvalSubmitted])
  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  // button
  const toggleWalletModal = useWalletModalToggle()

  const isArgentWallet = useIsArgentWallet()
  // check whether the user has approved the router on the input token

  const [approvalState, approveCallback] = useApproveCallbackFromBridgeSwap()
  const { state: signatureState, signatureData, gatherPermitSignature } = useERC20PermitFromTrade(
    trade,
    allowedSlippage
  )

  const showApproveFlow =
    !isArgentWallet &&
    // !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED))

  // console.log('showApproveFlow', showApproveFlow)
  // console.log('!isArgentWallet', !isArgentWallet)
  // console.log('!swapInputError', !swapInputError)
  // console.log(
  //   'approvalState === ApprovalState.NOT_APPROVED ||approvalState === ApprovalState.PENDING ',
  //   approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING
  // )
  // console.log(
  //   'approvalState === ApprovalState.NOT_APPROVED ||approvalState === ApprovalState.PENDING ',
  //   approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING
  // )

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  const handleApprove = useCallback(async () => {
    if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approveCallback()
        }
      }
    } else {
      await approveCallback()

      ReactGA.event({
        category: 'Bridge',
        action: 'Approve',
        label: [trade?.inputAmount.currency.symbol, toggledVersion].join('/'),
      })
    }
  }, [approveCallback, gatherPermitSignature, signatureState, toggledVersion, trade?.inputAmount.currency.symbol])

  // modal and loading
  // const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
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

  const isValid = !swapInputError

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useBridgeSwapCallback(signatureData)

  // console.log('isValid', isValid)
  // console.log('swapCallbackError', swapCallbackError)
  // console.log('swapInputError', swapInputError)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, txHash])

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

  // bridgeContract?.provider.getCode("").then(res=>console.log('res', res))
  // bridgeContract?.callStatic["fee"].call({}).then(res=>console.log('res', res))
  return (
    <>
      <NetworkAlert />
      <AppBody>
        {!account && false ? (
          <ButtonLight onClick={toggleWalletModal}>
            <Trans>Connect Wallet</Trans>
          </ButtonLight>
        ) : (
          <>
            <SwapHeader />
            <Wrapper id="swap-page">
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

              <AutoColumn gap={'sm'}>
                <div style={{ display: 'relative' }}>
                  <SourceNetworkSelector supportedChains={supportedChains} />
                  {chainId && supportedChains && supportedChains?.includes(chainId) && (
                    <>
                      <ArrowWrapper clickable>
                        <ArrowDown
                          size="16"
                          // onClick={() => {}}
                          color={theme.text1}
                        />
                      </ArrowWrapper>
                      {supportedTargets && (
                        <TargetNetworkSelector supportedChains={supportedTargets} onSwitchChain={handleSwitchChain} />
                      )}
                      {/* <FeeHeader /> */}
                      <TokenSelectionHeader />
                      <CurrencyInputPanel
                        label={
                          independentField === Field.OUTPUT && !showWrap ? (
                            <Trans>From (at most)</Trans>
                          ) : (
                            <Trans>From</Trans>
                          )
                        }
                        value={formattedAmounts[Field.INPUT]}
                        showMaxButton={showMaxButton}
                        currency={currencies[Field.INPUT]}
                        onUserInput={handleTypeInput}
                        onMax={handleMaxInput}
                        fiatValue={fiatValueInput ?? undefined}
                        onCurrencySelect={handleInputSelect}
                        otherCurrency={currencies[Field.OUTPUT]}
                        showCommonBases={true}
                        id="swap-currency-input"
                        loading={independentField === Field.OUTPUT}
                      />
                      <TargetAddressInputHeader />
                      <TargetAddressInput onUserInput={handleAddressInput} />
                      <BuyNativeCheck />
                      <br />
                      <br />
                      <br />
                      {showApproveFlow ? (
                        <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
                          <AutoColumn style={{ width: '100%' }} gap="12px">
                            <ButtonConfirmed
                              onClick={handleApprove}
                              disabled={
                                approvalState !== ApprovalState.NOT_APPROVED ||
                                approvalSubmitted ||
                                signatureState === UseERC20PermitState.SIGNED
                              }
                              width="100%"
                              altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                              confirmed={
                                approvalState === ApprovalState.APPROVED ||
                                signatureState === UseERC20PermitState.SIGNED
                              }
                            >
                              <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                  <CurrencyLogo
                                    currency={currencies[Field.INPUT]}
                                    size={'20px'}
                                    style={{ marginRight: '8px', flexShrink: 0 }}
                                  />
                                  {/* we need to shorten this string on mobile */}
                                  {approvalState === ApprovalState.APPROVED ||
                                    signatureState === UseERC20PermitState.SIGNED ? (
                                    <Trans>You can now trade {currencies[Field.INPUT]?.symbol}</Trans>
                                  ) : (
                                    <Trans>
                                      Allow the Bridge Protocol to use your {currencies[Field.INPUT]?.symbol}
                                    </Trans>
                                  )}
                                </span>
                                {approvalState === ApprovalState.PENDING ? (
                                  <Loader stroke="white" />
                                ) : (approvalSubmitted && approvalState === ApprovalState.APPROVED) ||
                                  signatureState === UseERC20PermitState.SIGNED ? (
                                  <CheckCircle size="20" color={theme.green1} />
                                ) : (
                                  <MouseoverTooltip
                                    text={
                                      <Trans>
                                        You must give the Bridge smart contracts permission to use your{' '}
                                        {currencies[Field.INPUT]?.symbol}. You only have to do this once per token.
                                      </Trans>
                                    }
                                  >
                                    <HelpCircle size="20" color={'white'} style={{ marginLeft: '8px' }} />
                                  </MouseoverTooltip>
                                )}
                              </AutoRow>
                            </ButtonConfirmed>
                            {/* <ButtonError
                              onClick={() => {
                                if (isExpertMode) {
                                  handleSwap()
                                } else {
                                  setSwapState({
                                    tradeToConfirm: trade,
                                    attemptingTxn: false,
                                    swapErrorMessage: undefined,
                                    showConfirm: true,
                                    txHash: undefined,
                                  })
                                }
                              }}
                              width="100%"
                              id="swap-button"
                              disabled={
                                !isValid ||
                                (approvalState !== ApprovalState.APPROVED &&
                                  signatureState !== UseERC20PermitState.SIGNED) ||
                                priceImpactTooHigh
                              }
                              error={isValid && priceImpactSeverity > 2}
                            >
                              <Text fontSize={16} fontWeight={500}>
                                {priceImpactTooHigh ? (
                                  <Trans>High Price Impact</Trans>
                                ) : priceImpactSeverity > 2 ? (
                                  <Trans>Swap Anyway</Trans>
                                ) : (
                                  <Trans>Swap</Trans>
                                )}
                              </Text>
                            </ButtonError> */}
                          </AutoColumn>
                        </AutoRow>
                      ) : (
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
                          <Text fontSize={20} fontWeight={500}>
                            {swapInputError ? swapInputError : <Trans>Swap</Trans>}
                          </Text>
                        </ButtonError>
                      )}
                    </>
                  )}
                </div>
              </AutoColumn>
            </Wrapper>
          </>
        )}
      </AppBody>
      <SwitchLocaleLink />
    </>
  )
}
