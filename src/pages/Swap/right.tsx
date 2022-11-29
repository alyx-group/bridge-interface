import styled from "styled-components"
import LogoTriangle from '../../assets/images/logo-color.png'
import LogoDiamond from '../../assets/images/diamond.gif'
import TelegramLogo from '../../assets/images/Telegram Logo-w.png'
import TwitterLogo from '../../assets/images/Twitter Logo-w.png'
import DiscordLogo from '../../assets/images/Discord-w.png'
import MediumLogo from '../../assets/images/Medium-w.png'
import { Text, PText } from './common'
import Row from 'components/Row'

const Wrapper = styled.div`
  flex: 1;
  /* background-color: green; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`


export default function SwapRight() {
    return (
        <Wrapper>
            <Row>

            </Row>
        </Wrapper>
    )
}
