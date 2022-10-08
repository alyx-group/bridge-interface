import { Trans } from '@lingui/macro'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { ReactNode } from 'react'
import { Text } from 'rebass'

import { ButtonError } from '../Button'
import Row, { AutoRow } from '../Row'
import { SwapCallbackError } from './styleds'
import styled from 'styled-components'

const ButtonWrapper = styled(ButtonError)`
  width: 100%;
  height: 45px;
`
export default function SwapModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: {
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
}) {
  return (
    <>
      <Row justify='center'>
        <ButtonWrapper
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            <Trans>Confirm Transfer</Trans>
          </Text>
        </ButtonWrapper>
        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </Row>
    </>
  )
}
