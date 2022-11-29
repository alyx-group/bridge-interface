import { Trans } from '@lingui/macro'
import useScrollPosition from '@react-hook/window-scroll'
import { CHAIN_INFO, SupportedChainId } from 'constants/chains'
import { darken } from 'polished'
import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { NavLink } from 'react-router-dom'
import { Text } from 'rebass'
import { useDarkModeManager } from 'state/user/hooks'
import { useETHBalances } from 'state/wallet/hooks'
import styled from 'styled-components/macro'
import Logo from '../../assets/images/logo-color.png'
import LogoDark from '../../assets/images/logo-color.png'
import { useActiveWeb3React } from '../../hooks/web3'
import { ExternalLink, TYPE } from '../../theme'
import { CardNoise } from '../earn/styled'
import Menu from '../Menu'
import Row from '../Row'
import Web3Status from '../Web3Status'


const Transition = styled.div`
  display: flex;
  justify-content: center;
  z-index: 100;
  width: 100%;
  .active {
    visibility: visible;
    transition: all 200ms ease-in;
  }
  .hidden {
    visibility: hidden;
    transition: all 200ms ease-out;
    transform: translate(0, -100%);
  }
`
const HeaderFrame = styled.div<{
  showBackground: boolean;
  width?: string;
}>`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: 70%;
  top: 0;
  position: relative;
  z-index: 21;
  position: fixed;
  /* Background slide effect on scroll. */
  background-image: ${({ theme }) => `linear-gradient(to bottom, transparent 50%, ${theme.bg0} 50% )}}`};
  background-position: ${({ showBackground }) => (showBackground ? '0 -100%' : '0 0')};
  background-size: 100% 200%;
  box-shadow: 0px 0px 0px 1px ${({ theme, showBackground }) => (showBackground ? theme.bg2 : 'transparent;')};
  transition: background-position 0.1s, box-shadow 0.1s;
  background-blend-mode: hard-light;
  height: 69px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 48px 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:  1rem;
    grid-template-columns: 1fr 1fr;
    
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding:  5px;
    grid-template-columns: 1fr 1fr;
    height: 54px;
    width: 100%;
  `};
`
const LogoText = styled(Text)`
  color: white;
  font-size: 16px;
  padding-left: 10px;
  height: 19px;
  font-family: montserrat_bold;
`

const SemiBoldLogoText = styled(LogoText)`
  font-weight: 900;
  font-family: montserrat_semi_bold;
`

const BoldLogoText = styled(LogoText)`
  font-family: montserrat_extra_bold;
`
const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  &:not(:first-child) {
    margin-left: 0.5em;
  }

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  
  background-color: transparent;
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  /* align-items: center; */
  /* align-items: flex-end; */
  justify-content: flex-end;
  /* justify-items: flex-end; */
  /* border: 1px solid green; */
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    justify-self: start;  
    `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display:none;
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    z-index: 99;
    position: fixed;
    bottom: 0; right: 50%;
    transform: translate(50%,-50%);
    margin: 0 auto;
    background-color: ${({ theme }) => theme.bg0};
    border: 1px solid ${({ theme }) => theme.bg2};
    box-shadow: 0px 6px 10px rgb(0 0 0 / 2%);
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg1)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  font-size: 14px;
  :focus {
    border: 1px solid blue;
  }
`

const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  
  /* border: 3px solid green; */
  text-decoration: none;
  color: white;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: flex-start;
    padding-left: 10px;
  `};
  :hover {
    cursor: pointer;
  }
`

// transition: transform 0.3s ease;
// :hover {
//   transform: rotate(-5deg);
// }

const UniIcon = styled.div`
  background-color: white;
  border-radius: 13px;
  width: 45px;
  height: 45px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    border-radius: 50%;
    width: 24px;
    height: 24px;
  `};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    justify-content: center;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg2};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledLink = styled.a.attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    justify-content: center;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg2};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName,
}) <{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
    text-decoration: none;
  }
`
// width: ${({ size }) => 5*size};
// width: 100px;

const AppLogo = styled.img<{ size: string }>`
  width: 45px;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0);
  border-radius: 0px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 24px;
    height: 24px;
  `};
`

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  // console.log("account", account)

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const [darkMode] = useDarkModeManager()

  const scrollY = useScrollPosition()

  const { infoLink } = CHAIN_INFO[chainId ? chainId : SupportedChainId.MAINNET]
  // <Logo width="24px" height="100%" title="logo-dark" path=''/>
  // <LogoDark width="24px" height="100%" title="logo-white" path='' />
  return (
    <Transition>
      <HeaderFrame showBackground={scrollY > 100} className={scrollY > 100 ? "hidden" : "active"}>
        <Title href=".">
          <UniIcon>
            {darkMode ? (
              <AppLogo src={LogoDark} alt="heco logo" size={'24px'} />
            ) : (
              <AppLogo src={Logo} alt="heco logo" size={'24px'} />
            )}
          </UniIcon>
          <LogoText fontSize={isMobile ? "14px" : "16px"}>
            Alyx Bridge
          </LogoText>
        </Title>
        {!isMobile && <>
          <HeaderLinks>
            <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
              <Trans>Swap</Trans>
            </StyledNavLink>
            <StyledNavLink id={`swap-nav-link`} to={'/pool'}>
              <Trans>Pool</Trans>
            </StyledNavLink>
            <StyledNavLink id={`swap-nav-link`} to={'/history'}>
              <Trans>History</Trans>
            </StyledNavLink>
            <StyledLink id={`funding-nav-link`} href={"https://docs.alyxbridge.com/"} target="#">
              <Trans>Docs</Trans>
            </StyledLink>
            {/* <StyledNavLink id={`swap-nav-link`} to={'/mine'}>
          <Trans>Mine</Trans>
        </StyledNavLink> */}
          </HeaderLinks>

        </>}
        <HeaderControls>
          <HeaderElement>
            <AccountElement active={!!account}>
              {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0, userSelect: 'none' }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                  <Trans>
                    {userEthBalance?.toSignificant(3) +
                      ' ' +
                      CHAIN_INFO[chainId ? chainId : SupportedChainId.ALYX].nativeCurrency.symbol}
                  </Trans>
                </BalanceText>
              ) : null}
              <Web3Status />
            </AccountElement>
          </HeaderElement>
        </HeaderControls>
      </HeaderFrame>
    </Transition>
  )
}
