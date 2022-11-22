import { number } from '@lingui/core/cjs/formats'
import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ALL_SUPPORTED_CHAIN_SHORT_NAMES } from 'constants/chains'
import useToggledVersion from 'hooks/useToggledVersion'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { useCallback, useMemo, useState } from 'react'
import { useGetBridgePairInfoQuery } from 'state/bridge/slice'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import CurrencyOutputPanel from '../../components/CurrencyOutputPanel'
import { useActiveWeb3React } from '../../hooks/web3'
import { Field } from '../../state/swap/actions'
import { BridgePairInfo } from 'state/bridge/types'


export default function CurrencyInput() {
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    targetChain,
  } = useSwapState()

  const toggledVersion = useToggledVersion()
  
  const {
    bestTrade: trade,
    currencies,
    currencyBalances,
    parsedAmount,
    inputError: swapInputError,
  } = useDerivedSwapInfo(toggledVersion)
  // console.log("CurrencyInput.currencies", currencies)
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  // format input
  const parsedAmounts = useMemo(
    () => showWrap ?
      {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      } : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      },
    [independentField, parsedAmount, showWrap, trade]
  )
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap ? parsedAmounts[independentField]?.toExact() ?? '' :
      parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }
  // show max button
  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  // handle input
  const {
    onUserInput,
    onCurrencySelection,
  } = useSwapActionHandlers()

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleMaxInput = useCallback(
    () => {
      maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
    },
    [maxInputAmount, onUserInput]
  )
  // fiatValue
  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])

  // token selection
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false)
      onCurrencySelection(Field.INPUT, inputCurrency)
    }, [onCurrencySelection]
  )
  const { account, chainId } = useActiveWeb3React()


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

  const outputAmount = useMemo(()=>{
    let outAmount = 0
    if(typedValue && typeof Number(typedValue) === 'number' && pairInfo){
      // const amount = Number(typedValue) 
      const feeByRate =  Number(typedValue) * pairInfo?.feeRate
      
      if (feeByRate > pairInfo.minimumCrossFee){
        outAmount = Number(typedValue) - feeByRate
      } else{
        outAmount = Number(typedValue) - pairInfo.minimumCrossFee
      }
    }
    if (outAmount < 0){
      return "0"
    }
    return outAmount
  }, [typedValue, pairInfo])
  return (
    <CurrencyOutputPanel
      label={
        independentField === Field.OUTPUT && !showWrap ? (
          <Trans>From (at most)</Trans>
        ) : (
          <Trans>From</Trans>
        )
      }
      value={String(outputAmount)}
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
      poolSize={pairInfo?.targetTokenBalance}
    ></CurrencyOutputPanel>
  )
}
