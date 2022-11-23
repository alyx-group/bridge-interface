import { Trans } from '@lingui/macro'
import Column from 'components/Column'
import TargetAddressInput from 'components/CurrencyInputPanel/targetAddressInput'
import Row from 'components/Row'
import { CHAIN_INFO, L2_CHAIN_IDS, SupportedChainId, SupportedL2ChainId } from 'constants/chains'
import { ALL_SUPPORTED_CHAIN_SHORT_NAMES } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from 'hooks/web3'
import ms from 'ms.macro'
import { useCallback, useRef, useState } from 'react'
import { ArrowDownCircle, ChevronDown } from 'react-feather'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { useAppSelector } from 'state/hooks'
import styled from 'styled-components'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
import { switchToNetwork } from 'utils/switchToNetwork'

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
  top: 64px;
  left: 0px;
  
  width: 133px;
  z-index: 99;

  & > *:not(:last-child) {
    margin-bottom: 12px;
  }
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    top: 50px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 127px;
    position: relative;
    top: 10px;
    left: -2px;
  `};
`
const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  align-self: center;
  /* background-color: ${({ active, theme }) => (active ? theme.bg2 : 'transparent')}; */
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 6px;
  /* margin: 6px 10px; */
  text-align: left;
  width: 90%;
  :hover{
    background-color: ${({ active, theme }) => theme.bg3};
  }
`

const Logo = styled.img`
  height: 25px;
  width: 25px;
  margin-right: 8px;
`
const NetworkLabel = styled.div`
  /* padding-left: 30px; */
  flex: 1 0 auto;
`
const SelectorLabel = styled.div`
  flex: 0 1 auto;
  // display: none;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
    margin-right: 8px;
  }
  
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
    text-decoration: underline;  
    margin-right: 0px;
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
    width: 160px;
    height: 28px;
    justify-content: flex-start;
  `}
`
const SelectorLogo = styled(Logo) <{ interactive?: boolean }>`
  margin-right: ${({ interactive }) => (interactive ? 8 : 0)}px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin-right: 8px;
  }
  width: 24px;
  height: 24px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 30px;
    height: 30px;
    margin-right: 0px;
  `}
`
const SelectorWrapper = styled.div`
  width: auto;
  height: 41px;
  border: 3px solid rgb(29, 103, 205);
  border-radius: 15px;
  :hover {
    /* background-color: #689ADE; */
  }
  background-color: rgba(255, 255, 255, 0.3);
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 28px;
    border: none;
    background-color: #132035;
  `}
`
const StyledChevronDown = styled(ChevronDown)`
  width: 20px;
  padding-left: 2px;
  padding-top: 5px;
`
const BridgeText = ({ chainId }: { chainId: SupportedL2ChainId }) => {
  switch (chainId) {
    default:
      return <Trans>Bridge</Trans>
  }
}
const ExplorerText = ({ chainId }: { chainId: SupportedL2ChainId }) => {
  switch (chainId) {
    default:
      return <Trans>Explorer</Trans>
  }
}

interface NetworkSelectorProps {
  supportedChains: number[]
  onSwitchChain: (chain: string) => void
}

export default function NetworkSelector({ supportedChains, onSwitchChain }: NetworkSelectorProps) {
  const { chainId, library } = useActiveWeb3React()
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.TARGET_NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.TARGET_NETWORK_SELECTOR)
  useOnClickOutside(node, open ? toggle : undefined)

  const [selectedTargetChain, setSelectedTargetChain] = useState(supportedChains[0])
  const implements3085 = useAppSelector((state) => state.application.implements3085)

  const info = chainId ? CHAIN_INFO[selectedTargetChain] : undefined

  // const isOnL2 = chainId ? L2_CHAIN_IDS.includes(chainId) : false
  // const showSelector = Boolean(implements3085)
  const showSelector = true
  const mainnetInfo = CHAIN_INFO[SupportedChainId.ALYX]

  if (!supportedChains.includes(selectedTargetChain)) {
    setSelectedTargetChain(supportedChains[0])
  }
  const conditionalToggle = useCallback(() => {
    if (showSelector) {
      toggle()
    }
  }, [showSelector, toggle])

  if (!chainId || !info || !library) {
    return null
  }

  function Chain({ targetChain }: { targetChain: number }) {
    if (!library || !chainId) {
      return null
    }
    const handleRowClick = (event) => {
      setSelectedTargetChain(targetChain)
      if (ALL_SUPPORTED_CHAIN_SHORT_NAMES[targetChain]) {
        onSwitchChain(ALL_SUPPORTED_CHAIN_SHORT_NAMES[targetChain])
      }
      toggle()
    }
    // const active = chainId === targetChain
    // const hasExtendedInfo = L2_CHAIN_IDS.includes(targetChain)
    // const isOptimism = targetChain === SupportedChainId.OPTIMISM
    // const rowText = `${CHAIN_INFO[targetChain].label}${isOptimism ? ' (Optimism)' : ''}`
    const rowText = `${CHAIN_INFO[targetChain].label}`
    const RowContent = () => (
      <FlyoutRow onClick={handleRowClick} active={false}>
        <Logo src={CHAIN_INFO[targetChain].logoUrl} />
        <NetworkLabel>{rowText}</NetworkLabel>
        {/* {selectedTargetChain === targetChain && <FlyoutRowActiveIndicator />} */}
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
    <SelectorWrapper ref={node as any}>
      <SelectorControls onClick={conditionalToggle} interactive={showSelector}>
        <SelectorLogo interactive={showSelector} src={info.logoUrl || mainnetInfo.logoUrl} />
        <SelectorLabel>{info.label}</SelectorLabel>
        {/* {showSelector && <StyledChevronDown />} */}
      </SelectorControls>
      {open && (
        <FlyoutMenu>
          <FlyoutHeader>
            <Trans>Select To Chain</Trans>
          </FlyoutHeader>
          {supportedChains?.map((chainId) => (
            <Chain key={chainId} targetChain={chainId} />
          ))}
        </FlyoutMenu>
      )}
    </SelectorWrapper>
  )
}
