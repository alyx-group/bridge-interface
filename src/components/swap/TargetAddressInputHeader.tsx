import { Trans } from '@lingui/macro'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { RowBetween, RowFixed } from '../Row'

const StyledSwapHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: auto;
  color: ${({ theme }) => theme.text2};
`

export default function TargetAddressInputHeader() {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
            <Trans>Enter receiving address on target chain</Trans>     
          </TYPE.black>
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  )
}
