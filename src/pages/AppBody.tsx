import React from 'react'
import { isMobile } from 'react-device-detect';
import styled from 'styled-components'
import MobileBackground from 'assets/images/background-mobile.jpg'
export const Body = styled.main<{ margin?: string; maxWidth?: string }>`
  /* background-color: #9d0d0d; */
  /* border: 3px solid red; */
  z-index: 2;
  width: 100%;
  /* min-height: 999px; */
`

export const BodyWrapper = styled.main<{ margin?: string; maxWidth?: string }>`
  position: relative;
  margin-top: ${({ margin }) => margin ?? '0px'};
  max-width: ${({ maxWidth }) => maxWidth ?? '100%'};
  width: 100%;
  border-radius: 24px;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* border: 3px solid green; */
`
const BackGroundVedio = styled.video`
    /* width: 100%;  */
    width: inherit;
    min-height: 1000px; 
    object-fit: fill; 
    position: absolute;
    z-index: -100;
    top: 0px;
    /* border: 3px solid red; */
    padding: 0;
    margin: 0;
    /* background-color: yellow; */
    
`
const BackGroundImg = styled.img`
    /* width: 100%;  */
    width: inherit;
    height: 1200px; 
    object-fit: fill; 
    position: absolute;
    z-index: -1;
    top: 0px;
    /* border: 3px solid red; */
    padding: 0;
    margin: 0;
    /* background-color: yellow; */
    
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, ...rest }: { children: React.ReactNode }) {
  if (isMobile) {
    return (
      <Body>
        <BackGroundImg src={MobileBackground}></BackGroundImg>
        <BodyWrapper {...rest}>
          {children}
        </BodyWrapper>
      </Body>
    )
  }
  return (
    <Body>
      <BackGroundVedio autoPlay loop muted>
        <source src='file.mp4' type='video/mp4'></source>
      </BackGroundVedio>
      <BodyWrapper {...rest}>
        {children}
      </BodyWrapper>
    </Body>
  )
}
