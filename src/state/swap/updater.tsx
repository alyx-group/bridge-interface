import { useBridgeContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks/web3'
import { useEffect } from 'react'
import { Field, setBuyNative, setMinDeposit } from 'state/swap/actions'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useSwapState } from './hooks'
import { useCurrency } from 'hooks/Tokens'
import {
  BigNumber,
} from 'ethers'

import * as ethers from 'ethers'
import { ALL_SUPPORTED_CHAIN_FULL_NAMES, ALL_SUPPORTED_CHAIN_IDS, ALL_SUPPORTED_CHAIN_SHORT_NAMES, SupportedChainId } from 'constants/chains'

export default function Updater(): null {
  const dispatch = useAppDispatch()
  const { chainId, library } = useActiveWeb3React()
  const bridgeContract = useBridgeContract(chainId)

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
    targetChain,
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  // keep dark mode in sync with the system
  useEffect(() => {
    // console.log('inputCurrency', inputCurrency)
    // console.log('typedValue', typedValue)
    if (inputCurrency) {
      // console.log('get minDeposit', inputCurrency?.isToken, targetChain)
      // console.log('targetChain', targetChain)
      if (inputCurrency.isToken && targetChain === 'alyx') {
        bridgeContract?.callStatic["minDeposit"]('alyx', inputCurrency.address).then(res => {
          const minDeposit0 = BigNumber.from(res).div(BigNumber.from(`${Math.pow(10, inputCurrency.decimals)}`))
          const minDeposit1 = BigNumber.from(res).mod(BigNumber.from(`${Math.pow(10, inputCurrency.decimals)}`))
          // console.log('get minDeposit done', minDeposit0, minDeposit1)
          const minDeposit = ethers.utils.formatUnits(BigNumber.from(res), inputCurrency.decimals)
          // console.log('get minDeposit done', minDeposit)
          // dispatch(setMinDeposit({ minDeposit: Number(minDeposit) }))
        })
      }
    }
  }, [dispatch, inputCurrency, targetChain, bridgeContract])

  useEffect(() => {
    if (targetChain && targetChain === ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.ALYX]) {
      dispatch(setBuyNative({ buyNative: true }))
    } else {
      dispatch(setBuyNative({ buyNative: false }))
    }
  }, [targetChain])
  return null
}
