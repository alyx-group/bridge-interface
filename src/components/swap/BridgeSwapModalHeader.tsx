import { Trans } from '@lingui/macro'
import { parseUnits } from '@ethersproject/units'
import JSBI from 'jsbi'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { useContext, useState, useMemo } from 'react'
import { AlertTriangle, ArrowDown, ArrowRight } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'

import { useUSDCValue } from '../../hooks/useUSDCPrice'
import { TYPE } from '../../theme'
import { isAddress, shortenAddress } from '../../utils'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { ButtonPrimary } from '../Button'
import { LightCard } from '../Card'
import { AutoColumn } from '../Column'
import { FiatValue } from '../CurrencyInputPanel/FiatValue'
import CurrencyLogo from '../CurrencyLogo'
import Row, { RowBetween, RowFixed } from '../Row'
import TradePrice from '../swap/TradePrice'
import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import { SwapShowAcceptChanges, TruncatedText } from './styleds'

import { useSwapState, tryParseAmount } from 'state/swap/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { ALL_SUPPORTED_CHAIN_FULL_NAMES, ALL_SUPPORTED_CHAIN_SHORT_NAME_MAP_TO_CAPITAL_LETTER, ALL_SUPPORTED_CHAIN_SHORT_NAMES_WITH_CAPITAL_LETTER, ALL_SUPPORTED_CHAIN_SHORT_FULL_NAME_MAP } from 'constants/chains'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'

// const ArrowWrapper = styled.div`
//   padding: 4px;
//   border-radius: 12px;
//   height: 32px;
//   width: 32px;
//   position: relative;
//   margin-top: -18px;
//   margin-bottom: -18px;
//   left: calc(50% - 16px);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   background-color: ${({ theme }) => theme.bg1};
//   border: 4px solid;
//   border-color: ${({ theme }) => theme.bg0};
//   z-index: 2;
// `

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  height: 45px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-self: center;
  padding-top: 10px;
  padding-bottom: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-top: 10px;
    padding-bottom: 10px;
    width: 100%;
  `};
`
const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '18px' : '18px')};
`

const ChainName = styled.div`
  flex: 1;
  /* text-align: right; */
  min-width: 90px;
  /* border: 3px solid green; */
`
const Address = styled.div`
  flex: 10;
  text-align: right;
  /* border: 3px solid  green; */
`

export default function BridgeSwapModalHeader() {
  const theme = useContext(ThemeContext)
  const { account, chainId } = useActiveWeb3React()
  const { targetChain: targetChainShortName, targetAddress, typedValue, [Field.INPUT]: { currencyId: inputCurrencyId }, buyNative, } = useSwapState()
  const sourceChain = chainId ? ALL_SUPPORTED_CHAIN_SHORT_NAMES_WITH_CAPITAL_LETTER[chainId] : undefined
  const targetChain = targetChainShortName ? ALL_SUPPORTED_CHAIN_SHORT_NAME_MAP_TO_CAPITAL_LETTER[targetChainShortName] : undefined

  const inputCurrency = useCurrency(inputCurrencyId)
  console.log('inputCurrency', inputCurrency)
  const parsedAmount = useMemo(
    () => {
      const parts = typedValue.split(".")
      if (inputCurrency && (parts.length <= 1 || parts.length == 2 && parts[1].length <= inputCurrency.decimals)) {
        return tryParseAmount(typedValue, inputCurrency)
      } else {
        return undefined
      }
    },
    [inputCurrency, typedValue]
  )

  return (
    <AutoColumn gap={'4px'} style={{ marginTop: '1rem' }}>
      <LightCard padding="1.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap={'8px'}>
          <RowBetween>
            <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              <Trans>From</Trans>
            </TYPE.body>
            {/* <FiatValue fiatValue={fiatValueInput} /> */}
          </RowBetween>
          <RowBetween align="center">
            <Row gap={'0px'}>
              <ChainName>
                {sourceChain + ": "}
              </ChainName>
              {/* <ArrowRight size="18" color={theme.text2} /> */}
              <Address>
                {account ? account.substring(0, 10) + "***" + account.substring(account.length - 10, account.length) : ''}
              </Address>
            </Row>
          </RowBetween>
        </AutoColumn>
        {/* </LightCard> */}
        <br></br>
        <br></br>
        {/* <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}> */}
        <AutoColumn gap={'8px'}>
          <RowBetween>
            {/* <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              <Trans>Token</Trans>
            </TYPE.body> */}
            {/* <FiatValue fiatValue={fiatValueInput} /> */}
          </RowBetween>
          <RowBetween align="center">

            <RowFixed gap={'0px'}>
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                color={theme.primary1}
              >
                {parsedAmount?.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={inputCurrency} size={'24px'} />
              {/* {inputCurrencyId} */}
              <StyledTokenName className="token-symbol-container" active={Boolean(inputCurrency && inputCurrency.symbol)}>
                {(inputCurrency && inputCurrency.symbol && inputCurrency.symbol.length > 20
                  ? inputCurrency.symbol.slice(0, 4) +
                  '...' +
                  inputCurrency.symbol.slice(inputCurrency.symbol.length - 5, inputCurrency.symbol.length)
                  : inputCurrency?.symbol)}
              </StyledTokenName>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
      </LightCard>

      {/* <ArrowWrapper> */}
      <ArrowWrapper clickable={false}>
        <svg preserveAspectRatio="none" data-bbox="16.451 43.607 167.098 112.786" viewBox="16.451 43.607 167.098 112.786" height="38" width="57" fill="rgba(187,192,198, 0.8)" xmlns="http://www.w3.org/2000/svg" data-type="shape" role="presentation" aria-hidden="true" aria-labelledby="svgcid-cwqqkl-k090dk"><title id="svgcid-cwqqkl-k090dk"></title>
          <g>
            <path d="M100.316 98.235l54.312-54.312 28.921 28.921L100 156.393 16.451 72.844l29.237-29.237 54.628 54.628z"></path>
          </g>
        </svg>
      </ArrowWrapper>
      {/* </ArrowWrapper> */}
      <LightCard padding="1.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap={'8px'}>
          <RowBetween>
            <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              <Trans>To</Trans>
            </TYPE.body>
            {/* <FiatValue fiatValue={fiatValueInput} /> */}
          </RowBetween>
          <RowBetween align="center">
            <Row gap={'0px'}>
              <ChainName>
                {targetChain + ": "}
              </ChainName>
              {/* <ArrowRight size="18" color={theme.text2} /> */}
              <Address>
                {targetAddress ? targetAddress.substring(0, 10) + "***" + targetAddress.substring(targetAddress.length - 10, targetAddress.length) : ''}
              </Address>
            </Row>
          </RowBetween>
        </AutoColumn>
      </LightCard>

      {targetChain === "ALYX" &&
        <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
          <AutoColumn gap={'8px'}>
            <RowBetween>
              <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
                <Trans>Buy Native</Trans>
              </TYPE.body>
              {/* <FiatValue fiatValue={fiatValueInput} /> */}
            </RowBetween>
            <RowBetween align="center">
              <RowFixed gap={'0px'}>
                <StyledTokenName className="token-symbol-container" active={Boolean(inputCurrency && inputCurrency.symbol)}>
                  {buyNative ? <>TRUE</> : <>FALSE</>}
                </StyledTokenName>
              </RowFixed>
            </RowBetween>
          </AutoColumn>
        </LightCard>
      }

      {/* <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
          <Trans>Price</Trans>
        </TYPE.body>
      </RowBetween> */}
    </AutoColumn>
  )
}
