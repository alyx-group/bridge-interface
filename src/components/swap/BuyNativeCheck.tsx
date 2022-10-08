import styled from 'styled-components'
import { TYPE } from '../../theme'
import { Trans } from '@lingui/macro'
import { RowBetween, RowFixed } from '../Row'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setBuyNative } from 'state/swap/actions'
import { SupportedChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import { useMemo } from 'react'

const StyledSelect = styled.input.attrs({ type: 'checkbox' })`
    padding-top: 10px;
`
const Hint = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: auto;
  color: ${({ theme }) => theme.text2};
`

export default function BuyNativeCheck() {
  const { chainId } = useActiveWeb3React()
  const inputCurrencyId = useAppSelector((state) => state.swap.INPUT.currencyId)
  const buyNative = useAppSelector((state) => state.swap.buyNative)
  const dispatch = useAppDispatch()
  const showBuyNative = useMemo(()=>{
    const isUSDT = chainId === SupportedChainId.HECO && inputCurrencyId === "0xa71EdC38d189767582C38A3145b5873052c3e47a" ||
    chainId === SupportedChainId.BSC && inputCurrencyId === "0x55d398326f99059fF775485246999027B3197955" ||
    chainId === SupportedChainId.MAINNET && inputCurrencyId === "0xdAC17F958D2ee523a2206206994597C13D831ec7" 
    
    const isUSDC = chainId === SupportedChainId.HECO && inputCurrencyId === "0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B" ||
    chainId === SupportedChainId.BSC && inputCurrencyId === "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" ||
    chainId === SupportedChainId.MAINNET && inputCurrencyId === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" 

    return isUSDT || isUSDC
  },[chainId, inputCurrencyId])
  return (
    <>
      {/* {chainId === SupportedChainId.HECO && inputCurrencyId === "0x0298c2b32eae4da002a15f36fdf7615bea3da047" && */}
      {showBuyNative &&
        <Hint>
          <RowBetween>
            <RowFixed>
              <TYPE.black fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
                <Trans>Buy 0.1 native token of target chain for gas</Trans>
              </TYPE.black>
              
              <StyledSelect
                checked={buyNative}
                onChange={(event) => { dispatch(setBuyNative({ buyNative: event.target.checked })) }}
              />
            </RowFixed>
          </RowBetween>
        </Hint>
      }
    </>
  )
}