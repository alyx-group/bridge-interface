import { Trans } from '@lingui/macro'
import Column from 'components/Column'
import Row from 'components/Row'
import { CHAIN_INFO, L2_CHAIN_IDS, SupportedChainId, SupportedL2ChainId } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from 'hooks/web3'
import ms from 'ms.macro'
import { useCallback, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import { ArrowDownCircle, ChevronDown } from 'react-feather'
import { Text } from 'rebass'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { useAppSelector } from 'state/hooks'
import styled from 'styled-components'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
import { switchToNetwork } from 'utils/switchToNetwork'
import SourceAddress from './SourceAddress'
const FlyoutHeader = styled.div`
  color: ${({ theme }) => theme.text2};
  font-weight: 400;
  font-size: 14px;
`
const FlyoutMenu = styled.div`
  align-items: flex-start;
  /* background-color: ${({ theme }) => theme.bg3}; */
  background-color: rgba(7,98,184, 0.99);
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow: auto;
  padding: 16px;
  position: absolute;
  width: 137px;
  z-index: 99;
  left: -2px;

  & > *:not(:last-child) {
    margin-bottom: 12px;
  }
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    top: 50px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: relative;
    top: 10px;
    left: -72px;
    display: none;
  `};
`
const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  /* background-color: ${({ active, theme }) => (active ? theme.bg2 : 'transparent')}; */
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 10px;
  text-align: left;
  width: 90%;
  :hover{
    background-color: ${({ active, theme }) => theme.bg2};
  }
`

const Logo = styled.img`
  height: 25px;
  width: 25px;
  margin-right: 8px;
`
const NetworkLabel = styled.div`
  flex: 1 0 auto;
`
const SelectorLabel = styled.div`
  // display: none;
  flex: 0 1 auto;
  margin-left: 4px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
    margin-right: 8px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 11px;
    margin-left: 0px;
  `}
`
const SelectorControls = styled.div<{ interactive: boolean }>`
  align-items: center;
  /* border: 2px solid ${({ theme }) => theme.bg1}; */
  
  color: ${({ theme }) => theme.text1};
  cursor: ${({ interactive }) => (interactive ? 'pointer' : 'auto')};
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 500;
  justify-content: center;
  /* padding: 6px 8px; */
  /* height: auto; */
  width: 165px;
  height: 43px;
  border-radius: 15px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 60px;
    height: 28px;
  `}
`
const SelectorLogo = styled(Logo) <{ interactive?: boolean }>`
  width: 24px;
  height: 24px;
  margin-right: ${({ interactive }) => (interactive ? 8 : 0)}px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin-right: 8px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 30px;
    height: 30px;
    margin-right: 2px;
  `}
`
const SelectorWrapper = styled.div`
  /* background-color: green; */
  /* border: 3px solid green; */
  width: 165px;
  height: 41px;
  border: 1px solid rgb(29, 103, 205);
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.3);
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 60px;
    height: 28px;
    border: none;
    background-color: #142436;
  `}
`
const StyledChevronDown = styled(ChevronDown)`
  width: 20px;
  padding-left: 2px;
  padding-top: 5px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

interface NetworkSelectorProps {
  supportedChains: number[] | undefined
}

export default function NetworkSelector({ supportedChains }: NetworkSelectorProps) {
  const { chainId, library } = useActiveWeb3React()
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  useOnClickOutside(node, open ? toggle : undefined)
  const implements3085 = useAppSelector((state) => state.application.implements3085)

  const info = chainId ? CHAIN_INFO[chainId] : undefined

  // const isOnL2 = chainId ? L2_CHAIN_IDS.includes(chainId) : false
  // const showSelector1 = Boolean(implements3085)
  const showSelector = true
  const mainnetInfo = CHAIN_INFO[SupportedChainId.ALYX]

  const conditionalToggle = useCallback(() => {
    if (showSelector) {
      toggle()
    }
  }, [showSelector, toggle])

  if (!chainId || !info || !library) {
    return null
  }

  function Chain({ targetChain }: { targetChain: number }) {
    // if (!library || !chainId || (!implements3085 && targetChain !== chainId)) {
    if (!library || !chainId ) {
      return null
    }
    const handleRowClick = () => {
      // console.log('SourceNetworkSelector->handleRowClick')
      switchToNetwork({ library, chainId: targetChain })
      toggle()
    }
    const active = chainId === targetChain
    const rowText = `${CHAIN_INFO[targetChain].label}`
    const RowContent = () => (
      <FlyoutRow onClick={handleRowClick} active={active}>
        <Logo src={CHAIN_INFO[targetChain].logoUrl} />
        <NetworkLabel>{rowText}</NetworkLabel>
        {/* {chainId === targetChain && <FlyoutRowActiveIndicator />} */}
      </FlyoutRow>
    )
    // if (active) {
    //   return (
    //     <ActiveRowWrapper>
    //       <RowContent />
    //       {/* <ActiveRowLinkList>
    //         <ExternalLink href={CHAIN_INFO[targetChain as SupportedL2ChainId].bridge}>
    //           <BridgeText chainId={chainId} /> <LinkOutCircle />
    //         </ExternalLink>
    //         <ExternalLink href={CHAIN_INFO[targetChain].explorer}>
    //           <ExplorerText chainId={chainId} /> <LinkOutCircle />
    //         </ExternalLink>
    //       </ActiveRowLinkList> */}
    //     </ActiveRowWrapper>
    //   )
    // }
    return <RowContent />
  }

  return (
    <>
      {/* {!isLoading && ( */}
      {/* {chainId} */}
      {/* {chainId && supportedChains && supportedChains.indexOf(chainId) > -1 ? ( */}
      {chainId && supportedChains ? (
        <SelectorWrapper ref={node as any}>
          <SelectorControls onClick={conditionalToggle} interactive={showSelector}>
            <SelectorLogo interactive={showSelector} src={info.logoUrl || mainnetInfo.logoUrl} />
            <SelectorLabel>{info.label}</SelectorLabel>
            {/* {showSelector && !isMobile && <StyledChevronDown />} */}
          </SelectorControls>
          {open && !isMobile && (
            <FlyoutMenu>
              <FlyoutHeader>
                <Trans>Select From Chain</Trans>
              </FlyoutHeader>
              {supportedChains?.map((chainId) => (
                <Chain key={chainId} targetChain={chainId} />
              ))}
            </FlyoutMenu>
          )}
        </SelectorWrapper>
      ) : (
        <>
          <SelectorWrapper ref={node as any}>
            <SelectorControls onClick={conditionalToggle} interactive={showSelector}>
              {/* Connected &nbsp; */}
              <SelectorLogo interactive={showSelector} src={info.logoUrl || mainnetInfo.logoUrl} />
              <SelectorLabel>{info.label}</SelectorLabel>
              {/* network not supported yet. Reselect&nbsp; */}
              {/* {showSelector && <StyledChevronDown />} */}
            </SelectorControls>
            {open && (
              <FlyoutMenu>
                <FlyoutHeader>
                  <Trans>Select From Chain</Trans>
                </FlyoutHeader>
                {supportedChains?.map((chainId) => (
                  <Chain key={chainId} targetChain={chainId} />
                ))}
              </FlyoutMenu>
            )}
          </SelectorWrapper>
        </>
      )}
      {/* )} */}
    </>
  )
}