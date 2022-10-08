import styled from 'styled-components/macro'
import Row from '../Row'
import { Text } from 'rebass'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: 100%;
  bottom: 0;
  /* padding: 1rem; */
  z-index: 21;
  position: relative;
  bottom: 0;
  /* border: solid 3px green; */
/* 
  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 48px 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:  1rem;
    grid-template-columns: 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding:  1rem;
    grid-template-columns: 36px 1fr;
  `}; */
`

const CopyRight = styled(Row)`
  background-color: black;
  height: 36px;
  /* position: relative; */
  /* bottom: 0; */
`
export default function Footer() {

  return (
    <FooterFrame>
      <CopyRight padding={"30px"} justify="center">
        <Text color={"#707070"} fontSize="10px" fontFamily="montserrat">Copyright © 2022 Alyx Bridge. All rights reserved. </Text>
      </CopyRight>
    </FooterFrame>
  )
}
