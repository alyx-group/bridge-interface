import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import Column, { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import { useTokenComparator } from 'components/SearchModal/sorting'
import { useAllTokens, useCurrency } from 'hooks/Tokens'
import { darken } from 'polished'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Lock } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import useTheme from '../../hooks/useTheme'
import { useActiveWeb3React } from '../../hooks/web3'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { ButtonGray } from '../Button'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import Row, { RowBetween, RowFixed } from '../Row'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { FiatValue } from './FiatValue'

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  /* background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)}; */
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : '100%')};
`

const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.bg1};
  opacity: 0.95;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

const Container = styled.div<{ hideInput: boolean }>`
  display: flex;
  flex-direction: column;
  background: none;
  gap: 2px;
  /* border: 1px solid red; */
  width: 100%;
  /* height: 50px; */
  /* border-radius: 15px; */
  /* width: 500px; */
  /* border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)}; */
  /* background-color: ${({ theme }) => theme.bg1}; */
  /* width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')}; */
  /* width: 100%; */
  /* :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  } */
  ;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 0px;
  `};
  
`

const CurrencySelect = styled(ButtonGray) <{ visible: boolean; selected: boolean; hideInput?: boolean }>`
  width: 200px;
  height: 80px;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  /* background-color: ${({ selected, theme }) => (selected ? theme.bg0 : theme.primary1)}; */
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 25px;
  /* box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')}; */
  /* box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075); */
  outline: none;
  cursor: pointer;
  user-select: none;
  /* padding: 0 8px; */
  justify-content: space-between;
  /* margin-right: ${({ hideInput }) => (hideInput ? '0' : '12px')}; */
  border: 1px solid rgb(175,179,186);
  background: rgba(0, 0, 0, 0.6);

  :focus,
  :hover {
    background-color: #689ADE;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 3;
    height: 60px;
    font-size: 11px;
    border-radius: 15px;
    padding: 5px;
    border: 1px solid #254699;
  `};
`

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 0.75rem 1rem')};
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: center;
  align-content: center;
  /* border: 3px solid green; */
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(DropDown) <{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
  `}
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '18px' : '18px')};
  font-family: montserrat_semi_bold;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 15px;
    margin: 0 0 0 0;
    padding-left: 5px;
  `}
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: white;
  border: none;
  
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  color: rgb(54,79,141);
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};
  margin-right: 1.25rem;
  height: 30px;
  width: 60px;
  border-radius: 7px;
  :focus {
    outline: none;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: auto;
    width: auto;
    background-color: transparent;
    margin-right: 0;
    font-size: 14px;
    color: ${({ theme }) => theme.primaryText1};
    // flex: 1;
    // border: 1px solid red;
  `};
`
const StyledNumericalInputWrapper = styled.div`
  flex: 5;
  display: flex;
  /* flex-direction: column; */
  border-radius: 25px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgb(175,179,186);
  justify-content: center;
  align-items: center;
  padding-left: 15px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 5;
    height: 60px;
    border-radius: 15px;
    border: 1px solid #254699;
    padding: 0 10px;
  `};
`
const StyledNumericalInput = styled(NumericalInput) <{ $loading: boolean }>`
  ${loadingOpacityMixin}
  text-align: center;
  width: auto;
  height: 80px;
  border-radius: 15px;
  /* border: 1px solid rgb(29, 103, 205); */
  font-size: 30px;
  padding-left: 5px;
  background: transparent;
  text-align: left;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 5;
    width: 100px;
    height: auto;
    border: none;
    font-size: 20px;
    text-align: left;
    background: transparent;
    padding-left: 5px;
  `};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue?: CurrencyAmount<Token> | null
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  loading?: boolean
}

const BalanceWrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-bottom: -10px;
    margin-top: 10px;
    padding-right: 10px;
    font-size: 10px;
    font-weight: 300;
    text-align: right;
  `};
`
const LogoWhiteBackground = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: white;
  border-radius: 50%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 40px;
    height: 40px;
    background-color: white;
    border-radius: 50%;
  `}
`

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  loading = false,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  // console.log("CurrencyInputPanel->currency", currency)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const allTokens = useAllTokens()
  // console.log("CurrencyInputPanel->allTokens", allTokens)
  const tokenComparator = useTokenComparator(false)
  const firstToken: Token = useMemo(() => {
    return Object.values(allTokens).sort(tokenComparator)[0]
  }, [allTokens, tokenComparator])
  // console.log("CurrencyInputPanel->firstToken", firstToken)

  const firstToken0 = useMemo(() => {
    for (const key in allTokens) {
      if (Object.prototype.hasOwnProperty.call(allTokens, key)) {
        const token = allTokens[key];
        if (token?.symbol?.includes("USDT") || token?.symbol?.includes("usdt")) {
          return token
        }
      }
    }
    return null
  }, [allTokens])

  useEffect(() => {
    if (onCurrencySelect && firstToken0) {
      onCurrencySelect(firstToken0)
    }
  }, [onCurrencySelect, firstToken0])

  if (isMobile) {
    return (
      <InputPanel id={id} hideInput={hideInput} {...rest}>
        <Container hideInput={hideInput} id='container'>
          {/* <Row padding="20px 0"justify='flex-end'> */}
          <BalanceWrapper>
            {!hideBalance && currency && selectedCurrencyBalance ? (
              <Text>
                Balance: {formatCurrencyAmount(selectedCurrencyBalance, 8)} {/* {currency.symbol} */}
              </Text>
            ) : null}
          </BalanceWrapper>
          {/* </Row> */}
          <Row padding="15px 0" gap='10px' justify='space-between'>
            <CurrencySelect
              visible={true}
              selected={!!currency}
              hideInput={hideInput}
              className="open-currency-select-button"
              onClick={() => {
                if (onCurrencySelect) {
                  setModalOpen(true)
                }
              }}
            >
              <Aligner>
                <Row justify="center">
                  {pair ? (
                    <span style={{ marginRight: '0.5rem' }}>
                      <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={20} margin={true} />
                    </span>
                  ) : currency ? (
                    <LogoWhiteBackground>
                      <CurrencyLogo style={{ marginRight: '0rem' }} currency={currency} size={'30px'} />
                    </LogoWhiteBackground>
                  ) : null}
                  {pair ? (
                    <StyledTokenName className="pair-name-container">
                      {pair?.token0.symbol}:{pair?.token1.symbol}
                    </StyledTokenName>
                  ) : (
                    <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                      {(currency && currency.symbol && currency.symbol.length > 20
                        ? currency.symbol.slice(0, 4) +
                        '...' +
                        currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                        : currency?.symbol) || <Trans>Token</Trans>}
                    </StyledTokenName>
                  )}
                </Row>
              </Aligner>
            </CurrencySelect>
            {!hideInput && (
              <StyledNumericalInputWrapper>
                <StyledNumericalInput
                  className="token-amount-input"
                  value={value}
                  onUserInput={onUserInput}
                  $loading={loading}
                />
                <StyledBalanceMax onClick={onMax}>
                  <Trans>MAX</Trans>
                  {/* {showMaxButton && selectedCurrencyBalance ? (
                  ) : <></>} */}
                </StyledBalanceMax>
              </StyledNumericalInputWrapper>
            )}
          </Row>
          {onCurrencySelect && (
            <CurrencySearchModal
              isOpen={modalOpen}
              onDismiss={handleDismissSearch}
              onCurrencySelect={onCurrencySelect}
              selectedCurrency={currency}
              otherSelectedCurrency={otherCurrency}
              showCommonBases={showCommonBases}
              showCurrencyAmount={showCurrencyAmount}
              disableNonToken={disableNonToken}
            />
          )}
        </Container>
      </InputPanel>
    )
  }
  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      <Container hideInput={hideInput} id='container'>
        {/* <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={!onCurrencySelect}>
        </InputRow> */}
        {/* <Row style={{border:"0px solid green", alignContent:"center", alignItems: "center", justifyContent: "flex-end" }} > */}
        {!hideInput && !hideBalance && (
          <Row style={{ border: "0px solid red", justifyContent: "flex-end" }}>
            {/* <RowBetween> */}

            {account ? (
              <RowFixed style={{ height: '24px', border: "0px solid green", marginRight: "10px" }}>
                <TYPE.body
                  onClick={onMax}
                  color={theme.text2}
                  fontWeight={400}
                  fontSize={14}
                  style={{ display: 'inline', cursor: 'pointer', textAlign: 'center' }}
                >
                  <Trans>Balance:</Trans>
                  {!hideBalance && currency && selectedCurrencyBalance ? (
                    renderBalance ? (
                      renderBalance(selectedCurrencyBalance)
                    ) : (
                      <>
                        &nbsp;&nbsp;{formatCurrencyAmount(selectedCurrencyBalance, 8)} {currency.symbol}
                      </>
                    )
                  ) : null}
                </TYPE.body>

              </RowFixed>
            ) : (
              <span />
            )}
          </Row>
        )}

        {/* </Row> */}
        <Row gap="10px">
          <CurrencySelect
            visible={true}
            selected={!!currency}
            hideInput={hideInput}
            className="open-currency-select-button"
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              <Row justify="center" gap='5px'>
                {pair ? (
                  <span style={{ marginRight: '0.5rem' }}>
                    <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                  </span>
                ) : currency ? (
                  <LogoWhiteBackground>
                    <CurrencyLogo style={{ marginRight: '0rem' }} currency={currency} size={'40px'} />
                  </LogoWhiteBackground>
                ) : null}
                {pair ? (
                  <StyledTokenName className="pair-name-container">
                    {pair?.token0.symbol}:{pair?.token1.symbol}
                  </StyledTokenName>
                ) : (
                  <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                    {(currency && currency.symbol && currency.symbol.length > 20
                      ? currency.symbol.slice(0, 4) +
                      '...' +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                      : currency?.symbol) || <Trans>Select</Trans>}
                  </StyledTokenName>
                )}
              </Row>
              {/* {onCurrencySelect && <StyledDropDown selected={!!currency} />} */}
            </Aligner>
          </CurrencySelect>
          {!hideInput && (
            <StyledNumericalInputWrapper>
              <StyledNumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={onUserInput}
                $loading={loading}
                style={{ borderRadius: "25px", flex: 1 }}
              />
              {showMaxButton && selectedCurrencyBalance ? (
                <StyledBalanceMax onClick={onMax}>
                  <Trans>MAX</Trans>
                </StyledBalanceMax>
              ) : null}
            </StyledNumericalInputWrapper>
          )}

        </Row>
      </Container>
      {onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          disableNonToken={disableNonToken}
        />
      )}
    </InputPanel>
  )
}
