import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import useToggledVersion from 'hooks/useToggledVersion'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { useCallback, useMemo, useState } from 'react'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { useActiveWeb3React } from '../../hooks/web3'
import { Field } from '../../state/swap/actions'


export default function CurrencyInput() {

  const {
    independentField,
    typedValue,
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
  return (
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
    ></CurrencyInputPanel>
  )
}
