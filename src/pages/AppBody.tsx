import React from 'react'
import { isMobile } from 'react-device-detect';
import styled from 'styled-components'
import MobileBackground from 'assets/images/background-mobile.jpg'
export const Body = styled.main<{
  margin?: string;
  maxWidth?: string;
  minHeigth?: string;
}>`
  /* border: 1px solid red; */
  z-index: 2;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  justify-items: center;

  position: relative;
  top: 150px;
  
  /* background-color: red; */
  min-height: ${({ minHeigth }) => minHeigth};
  zoom: 80%;
`

export const BodyWrapper = styled.main<{ margin?: string; maxWidth?: string; minHeigth?: string; }>`
  position: relative;
  margin-top: ${({ margin }) => margin ?? '0px'};
  max-width: ${({ maxWidth }) => maxWidth ?? '100%'};
  width: 100%;
  border-radius: 24px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* border: 1px solid yellow; */
  /* position: relative; */
  /* top: 0; */
  min-height: ${({ minHeigth }) => minHeigth};
`
const BackGroundVedio = styled.video<{
  width?: string
  height?: string
}>`
    width: 100%;
    height: 100%; 
    object-fit: fill; 
    position: fixed;
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
    top: -30px;
    /* border: 3px solid red; */
    padding: 0;
    margin: 0;
    /* background-color: yellow; */
    
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, ...rest }: { children: React.ReactNode }) {
  const { innerHeight, innerWidth } = window
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
    <Body minHeigth={(innerHeight - 72) + "px"}>
      <BackGroundVedio
        autoPlay loop muted>
        <source src='file.mp4' type='video/mp4'></source>
      </BackGroundVedio>
      {children}
      {/* <BodyWrapper minHeigth={(innerHeight - 72) + "px"}{...rest}> */}
      {/* </BodyWrapper> */}
    </Body>
  )
}
