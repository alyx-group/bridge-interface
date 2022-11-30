import { rgb } from "polished";
import { NavLink, RouteComponentProps } from "react-router-dom";
import { Button, Text } from "rebass";
import styled from "styled-components";
import HomeMain from '../../assets/images/home-main.png'
import AppBody from '../AppBody'
const HomeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    /* border: 1px solid green; */
`
export default function Home({ history }: RouteComponentProps) {
    const { innerWidth } = window
    return (
        <AppBody>
            <HomeWrapper>
                <img src={HomeMain} width={innerWidth / 2.5 + 'px'}></img>
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
                    backgroundColor: rgb(32,74,169),

                }}
                >Enter Dapp</Button>
            </NavLink>
        </AppBody>
    )
}