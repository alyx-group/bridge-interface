import styled from "styled-components"
import LogoTriangle from '../../assets/images/logo-color.png'
import LogoDiamond from '../../assets/images/diamond.gif'
import TelegramLogo from '../../assets/images/Telegram Logo-w.png'
import TwitterLogo from '../../assets/images/Twitter Logo-w.png'
import DiscordLogo from '../../assets/images/Discord-w.png'
import MediumLogo from '../../assets/images/Medium-w.png'
import { Text, PText } from './common'
import { isMobile } from "react-device-detect"
import Column from "components/Column"
import Row from "components/Row"

const Wrapper = styled.div`
  flex: 1;
  /* background-color: green; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
        // max-height: 500px;
  `};
`
const PaddingLeft = styled(Wrapper)`
    padding-left: 200px;
`
const Triangle = styled.img`
    width: 587px;
    position: absolute;
    z-index: -1;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 280px;
        // height: 280px;
    `};
`
const Diamond = styled.img`
    width: 329px;
    height: 448px;
    /* position: absolute; */
    /* border: 3px solid red; */
    /* top: 210px; */;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: auto;
        height: 220px;
        position: absolute;
        top: 745px;
    `};
`
const Logo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const CommunityLinks = styled.div`
    display: flex;
    flex-direction: row;
    gap: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        gap: 25px;
    `};
`
const CommunityLink = styled.a`
    width: 44px;
    height: 44px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 24px;
        height: 24px;
    `};
`
const CommunityLogo = styled.img`
    position: relative;
    width: 44px;
    height: 44px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 24px;
        height: 24px;
    `};
`
const CommunityLogoWrapper = styled.div`
    width: 44px;
    height: 44px;
    background-color: rgba(0,0,0, 0.4);
    z-index: 2;
    position: absolute;
    border-radius: 50%;
    border: none;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 24px;
        height: 24px;
    `};
`
const Top = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    /* top: -215px; */
    padding: 0;
`
const PaddingTop = styled.div<{
    top?: string|null
}>`
    padding-top: ${props => props.top??"650px"};
`
export default function SwapLeft() {
    const style = {
        padding: "10px 0 0 0"
    }
    const communityLinks = [
        {
            name: "Telegram",
            logo: TelegramLogo,
            detail: "Join the community",
            href: "https://t.me/AlyxChain"
        },
        {
            name: "Discord",
            logo: DiscordLogo,
            detail: "Join the community",
            href: "https://discord.com/invite/b8jzADM477"
        },
        {
            name: "Twitter",
            logo: TwitterLogo,
            detail: "Follow last news",
            href: "https://twitter.com/Alyx_Chain"
        },
        {
            name: "Medium",
            logo: MediumLogo,
            detail: "Read Alyx articles",
            href: "https://medium.com/@alyxchain"
        },
    ]
    if (isMobile) {
        return (
            <Wrapper>
                <Triangle src={LogoDiamond}></Triangle>
                {/* <Diamond src={LogoDiamond}></Diamond> */}
                <PaddingTop top="300px"></PaddingTop>
                <Top>
                    <Column gap="5px">
                        <Text fontSize={"16px"} letterSpacing={"0px"}>Alyx Bridge</Text>
                        <PText fontSize={"8px"} >Mint & Burn cross-chain protocol</PText>
                    </Column>
                    <Row padding="20px 0 0 0" >
                        <CommunityLinks>
                            {
                                communityLinks.map(link => (
                                    <CommunityLink href={link.href} key={link.name}>
                                        <CommunityLogoWrapper></CommunityLogoWrapper>
                                        <CommunityLogo src={link.logo}></CommunityLogo>
                                    </CommunityLink>
                                ))
                            }
                        </CommunityLinks>
                    </Row>
                </Top>
            </Wrapper>
        )
    }
    return (
        <Wrapper>
            <PaddingLeft>
                {/* <Triangle src={LogoTriangle}></Triangle> */}
                <Triangle src={LogoDiamond}></Triangle>
                <PaddingTop></PaddingTop>
                <Text fontSize={"40px"} letterSpacing={"3px"}>Alyx Bridge</Text>
                <PText fontSize={"14px"} letterSpacing={"1.2px"}>Mint & Burn cross-chain protocol</PText>
                <CommunityLinks style={style}>
                    {
                        communityLinks.map(link => (
                            <CommunityLink href={link.href} key={link.name}>
                                <CommunityLogoWrapper></CommunityLogoWrapper>
                                <CommunityLogo src={link.logo}></CommunityLogo>
                            </CommunityLink>
                        ))
                    }
                </CommunityLinks>
            </PaddingLeft>
        </Wrapper>
    )
}
