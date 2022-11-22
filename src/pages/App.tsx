// import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
// import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
// import AddressClaimModal from '../components/claim/AddressClaimModal'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'
import Footer from 'components/Footer'
import Polling from 'components/Header/Polling'
import Web3ReactManager from 'components/Web3ReactManager'
import { BigNumber } from 'ethers'
import { useBridgeContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks/web3'
import { Route, Switch } from 'react-router-dom'
import store from 'state'
import styled from 'styled-components'

import Popups from '../components/Popups'
import { ApplicationModal } from '../state/application/actions'
import { useModalOpen, useToggleModal } from '../state/application/hooks'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Home from './Home'
import { isMobile, useDeviceData, deviceType } from 'react-device-detect'

const AppWrapper = styled.div<{
  minHeigth?: string;
}>`
  display: flex;
  flex-flow: column;
  min-height: ${({ minHeigth }) => minHeigth};
  align-content: center;
  justify-content: center;
  align-items: center;
  justify-items: center;
  width: 100%;
  /* margin-top: -10px;
  padding-right: 10px;
  padding-bottom: 20px; */
  margin: 0;
  /* border: 1px solid green; */
  /* zoom: 80%; */
  /* ${({ theme }) => theme.mediaWidth.upTo1600`
    zoom: 90%;
  `};
  ${({ theme }) => theme.mediaWidth.upTo2200`
    zoom: 95%;
  `}; */
`
const BackgroundGradient = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  position: fixed;
  width: 100%;
  height: 300px;
  top: 300px;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* padding: 70px 0px 16px 0px; */
  align-items: center;
  align-self: center;
  flex: 1;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 69px 0px 16px 0px;
  `};
  /* border: 3px solid green; */
  /* min-height: 500px; */
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  /* justify-content: space-between; */
  position: fixed;
  top: 0;
  background-color: #000000;
  height: 69px;
  z-index: 100;
  /* border: 3px solid red; */
  /* height: 90px; */
`

const FooterWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: inherit;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: relative;
  `};
`

const Marginer = styled.div`
margin-top: 5rem;
${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0.5rem;
  `};
`

// function TopLevelModals() {
//   const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
//   const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
//   return <AddressClaimModal isOpen={open} onDismiss={toggle} />
// }
// Deferrable<TransactionRequest>
export default function App() {
  const { innerHeight, innerWidth } = window
  // console.log("window.innerWidth", window.innerWidth)
  // console.log("window.innerHeight", window.innerHeight)
  // const { chainId, library } = useActiveWeb3React()
  // const bridgeContract = useBridgeContract(chainId)
  // console.log('bridgeContract?.functions', bridgeContract)
  // bridgeContract?.callStatic["minDeposit"]('alyx', '0xD16bAbe52980554520F6Da505dF4d1b124c815a7').then(res => {
  //   const minDeposit = BigNumber.from(res).toBigInt()
  //   console.log('minDeposit', minDeposit)
  // })
  // return (
  //   <AppWrapper>
  //     <HeaderWrapper>
  //       <Header />
  //     </HeaderWrapper>
  //   </AppWrapper>
  // )
  return (
    <ErrorBoundary>
      {/* <Route component={GoogleAnalyticsReporter} /> */}
      <Route component={DarkModeQueryParamReader} />
      <Web3ReactManager>
        <AppWrapper minHeigth={innerHeight+"px"}>
          {/* <BackgroundGradient></BackgroundGradient> */}
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper>
            <Popups />
            <Polling />
            <Switch>
              <Route exact strict path="/" component={Home} />
            </Switch>
            <Marginer />
          </BodyWrapper>
          <Footer></Footer>
          {/* <FooterWrapper> */}
          {/* </FooterWrapper> */}
        </AppWrapper>
      </Web3ReactManager>
    </ErrorBoundary>
  )
}
