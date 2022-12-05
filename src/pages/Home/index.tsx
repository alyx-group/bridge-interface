import { rgb } from "polished";
import { NavLink, RouteComponentProps } from "react-router-dom";
import { Button, Text } from "rebass";
import styled from "styled-components";
import HomeMain from '../../assets/images/home-main.png'
import TwitterLogo from '../../assets/images/Twitter Logo-w.png'
import TelegramLogo from '../../assets/images/Telegram Logo-w.png'
import MediumLogo from '../../assets/images/Medium-w.png'
import DiscordLogo from '../../assets/images/Discord-w.png'
import GithubLogo from '../../assets/images/Github-w.png'
import AppBody from '../AppBody'
import HomeGif from '../../assets/images/home.gif'
const HomeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    /* border: 1px solid green; */
`

const MediaWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
    /* border: 1px solid yellow; */
    margin-top: 50px;
    gap: 50px;
`

const Media = styled.div`
    
    /* border: 1px solid green; */
`
interface socialMedia {
    name: string
    href: string
    logo: string
}
export default function Home({ history }: RouteComponentProps) {
    const { innerWidth } = window
    const links: socialMedia[] = [
        {
            name: "Twitter",
            href: "https://twitter.com/Alyx_Chain",
            logo: TwitterLogo,
        },
        {
            name: "Telegram",
            href: "https://t.me/AlyxChain",
            logo: TelegramLogo,
        },
        {
            name: "Medium",
            href: "https://medium.com/@alyxchain",
            logo: MediumLogo,
        },
        {
            name: "Discord",
            href: "https://discord.gg/b8jzADM477",
            logo: DiscordLogo,
        },
        {
            name: "Github",
            href: "https://github.com/alyx-group",
            logo: GithubLogo,
        }
    ]
    return (
        <AppBody>
            <HomeWrapper>
                <img src={HomeGif} width={innerWidth / 2.5 + 'px'}></img>
                {/* <img src={HomeGif}></img> */}
                {/* <img src={HomeMain} width={innerWidth / 2.5 + 'px'}></img> */}
            </HomeWrapper>
            <Text fontSize={"40px"}>
                Mint & Burn Cross-Chain Protocol
            </Text>
            <NavLink to={'/swap'} >
                <Button style={{
                    width: "250px",
                    height: "50px",
                    borderRadius: "35px",
                    fontSize: "20px",
                    fontWeight: 400,
                    marginTop: "30px",
                    backgroundColor: rgb(32, 74, 169),

                }}
                >Enter Dapp</Button>
            </NavLink>
            <MediaWrapper>
                {links.map(link => (
                    <Media key={link.name}>
                        <a href={link.href} target="#">
                            <img src={link.logo} width="50px"></img>
                        </a>
                    </Media>
                ))}
            </MediaWrapper>
        </AppBody>
    )
}