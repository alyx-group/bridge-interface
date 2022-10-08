import { createReducer } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'
import {
  Field,
  inputTargetAddress,
  replaceSwapState,
  selectCurrency,
  setRecipient,
  switchCurrencies,
  switchTargetChain,
  typeInput,
  setFee,
  setBuyNative,
  setMinDeposit,
} from './actions'

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined | null
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined | null
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly targetAddress: string | null
  readonly targetChain: string | null
  readonly fee: string
  readonly buyNative: boolean
  readonly minDeposit: number | null
}

const initialState: SwapState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: null,
  },
  [Field.OUTPUT]: {
    currencyId: null,
  },
  recipient: null,
  targetAddress: '',
  targetChain: '',
  fee: '',
  buyNative: false,
  minDeposit: null,
}

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (state, { payload: { typedValue, recipient, field, inputCurrencyId, outputCurrencyId } }) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          independentField: field,
          typedValue,
          recipient,
          targetAddress: state.targetAddress,
          targetChain: state.targetChain,
          fee: state.fee,
          buyNative: false,
          minDeposit: null,
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId },
        }
      }
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
    .addCase(inputTargetAddress, (state, { payload: { address } }) => {
      return {
        ...state,
        targetAddress: address,
      }
    })
    .addCase(switchTargetChain, (state, { payload: { chain } }) => {
      return {
        ...state,
        targetChain: chain,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(setFee, (state, { payload: { fee } }) => {
      // console.log('setFee', fee)
      state.fee = fee
    })
    .addCase(setBuyNative, (state, { payload: { buyNative } }) => {
      state.buyNative = buyNative
    })
    .addCase(setMinDeposit, (state, { payload: { minDeposit } }) => {
      if (minDeposit) {
        state.minDeposit = minDeposit
      }
    })
)
