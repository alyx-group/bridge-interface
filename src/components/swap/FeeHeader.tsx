import { Trans } from '@lingui/macro'
import { useSwapState } from 'state/swap/hooks'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { RowBetween, RowFixed } from '../Row'
import { CHAIN_INFO } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import { useMemo } from 'react'

const StyledSwapHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: auto;
  color: ${({ theme }) => theme.text2};
`

export default function FeeHeader() {
  const { fee } = useSwapState()
  const { chainId } = useActiveWeb3React()
  const nativeSymbol = useMemo(() => {
    if (chainId) {
      return CHAIN_INFO[chainId].nativeCurrency.symbol
    } else {
      return ""
    }
  }, [chainId])

  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
            {fee !== null && (
              <>
                <Trans>Transfer Fee</Trans>
                : {Number(fee) / 1e18} {nativeSymbol}
              </>
            )}
          </TYPE.black>
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  )
}
