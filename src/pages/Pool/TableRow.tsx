import { NavLink, RouteComponentProps } from "react-router-dom";
import { Button, Text } from "rebass";
import { useGetBridgeSupportedTokensQuery, useGetPairsQuery } from "state/bridge/slice";
import styled from "styled-components";
import AppBody from '../AppBody'
import ms from 'ms.macro'
import DropDownSvg from '../../assets/images/arrow-down-blue.svg'
import MetamaskSvg from '../../assets/svg/metamask.svg'
import CopySvg from '../../assets/svg/copy.svg'
import { PairToken, SupportedToken } from "state/bridge/types";
import { useCallback, useMemo, useState } from "react";
import { ALL_SUPPORTED_CHAIN_FULL_NAMES, ALL_SUPPORTED_CHAIN_SHORT_NAMES, CHAIN_INFO } from "constants/chains";
import { BRIDGE_ADDRESSES } from "constants/addresses";
import { watchAsset } from "utils/watchAsset";
import { useActiveWeb3React } from "hooks/web3";
import { Web3Provider } from "@ethersproject/providers";
import CopyHelper from "components/AccountDetails/Copy";

const HomeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    /* border: 1px solid green; */
`
const Table = styled.table`
    /* display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
    margin-top: 30px; */
    background-color:rgba(33, 38, 62, 0.9);
    /* width: 1600px; */
    /* height: 800px; */
    font-size: 18px;
    padding: 16px 40px;
    /* box-shadow: rgb(0 0 0 / 40%) 0px 0.125rem 0.25rem 0px; */
    border-radius: 10px;
    /* border: 1px solid green; */
    grid-row-gap: 20px;
    
`
const TableHeader = styled.th<{
    width?: string
    textAlign?: string
}>`
    /* display: flex; */
    /* flex-direction: row; */
    /* justify-items: center; */
    /* align-items: center; */
    /* margin-top: 30px; */
    text-align: center;
    /* border: 1px solid yellowgreen; */
    /* width: 100px; */
    width: ${props => props.width ?? "200px"};
    text-align: ${props => props.textAlign ?? "center"};
    height: 30px;
    padding: 12px 8px;
    
    /* gap: 100px; */
`
const TableData = styled.td`
    text-align: center;
    padding: 10px;
    
`
const TableDataDetail = styled(TableData)`
    /* border-bottom: 1px solid darkgray; */
    padding: 30px 0;
    background-color:rgb(33, 48, 62);
`
const CellWithImg = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
    justify-content: center;
    /* border: 1px solid red; */

`
const TableRow = styled.tr<{
    shadow?: boolean
}>`
    /* background-color:red; */
    /* border: 3px solid yellowgreen; */
    
    margin-bottom: 12px;
    height: 100px;
    border-radius: 20px;
    /* box-shadow: rgb(0 0 0 / 40%) 0px 0.125rem 0.25rem 0px; */
    box-shadow: ${props => props.shadow ? "rgb(0 0 0 / 40%) 0px 0.125rem 0.25rem 0px;" : ""};
`


const TableRowDetail = styled.tr`
    /* background-color:red; */
    border-bottom: 1px solid yellowgreen;
    /* margin-bottom: 12px; */
    height: 50px;
    width: 50%;
    /* box-shadow: rgb(0 0 0 / 10%) 0px 0.125rem 0.25rem 0px; */
`
const CellLink = styled.a`
    
    text-decoration: none;
`

const CellImgWidth = "35px"

function formatChainName(name: string) {
    if (name === "bsc") {
        return "BSC"
    }
    if (name.length > 0) {
        return name.substring(0, 1).toLocaleUpperCase() + name.substring(1,)
    }
    return name
}

function contactExplorerLink(explorer: string, rest: string) {
    if (explorer.endsWith("/")) {
        return `${explorer}${rest}`
    }

    return `${explorer}/${rest}`
}

function AddAssetButton(
    {
        token,
        library,
    }: {
        token?: SupportedToken,
        library?: Web3Provider | undefined,
    }
) {
    function handleWatchAsset(
        library: Web3Provider | undefined,
        token: SupportedToken,
    ) {
        try {
            if (library) {
                console.log("library", library)
                watchAsset({
                    library,
                    token: {
                        type: "ERC20",
                        address: token.address,
                        symbol: token.symbol,
                        decimals: token.decimals,
                        image: token.logoURI,
                    }
                })
            }
        }
        catch {
        }
    }
    if (token && library) {
        return (
            <>
                <CopyHelper toCopy={token.address} ></CopyHelper>&nbsp;
                <img
                    onClick={() => handleWatchAsset(library, token)}
                    id="watchAssetIcon" style={{ marginTop: "2px", cursor: "pointer" }} src={MetamaskSvg} width="22px"></img>
            </>
        )
    } else {
        return (
            <>
                <CopyHelper toCopy={"none"}></CopyHelper>&nbsp;
                <img id="watchAssetIcon" style={{ marginTop: "2px", cursor: "pointer" }} src={MetamaskSvg} width="22px"></img>
            </>
        )
    }
}

export default function Row(
    pair: PairToken,
    showDetail: string,
    // library: Web3Provider | undefined,
    onClick: (key: string) => void,
) {
    const { account, chainId, library } = useActiveWeb3React()
    const LogoList = Object.keys(pair.targets).map((chain) => {
        const targetToken = pair.targets[chain]
        const targetChainInfo = CHAIN_INFO[targetToken.chainId]
        return targetChainInfo.logoUrl
    })
    const sourceChainInfo = CHAIN_INFO[pair.chainId]
    const chainString = Object.keys(pair.targets).reduce((previousChain, currentChain) => previousChain + "|" + currentChain)
    // const sourceBridgeAddress = BRIDGE_ADDRESSES[pair.chainId]

    return (
        <>
            <TableRow key={pair.name} shadow={true} >
                <TableData scope="row" colSpan={4}>
                    <Table style={{ padding: "0", borderRadius: "20px" }} width={"100%"} >
                        <thead onClick={(event) => {
                            console.log("event", JSON.stringify((event.target as Element).id))
                            if ((event.target as Element).id !== "copyAddressIcon" && (event.target as Element).id !== "watchAssetIcon") {
                                onClick(pair.address)
                            }
                        }} style={{ height: "100px", }}>
                            <tr >
                                <TableHeader width="140px" id="copy">
                                    <CellWithImg  >
                                        <img src={pair.logoURI} width={CellImgWidth}></img>&nbsp;&nbsp;{pair.symbol}&nbsp;&nbsp;
                                        {
                                            pair.chainId === chainId &&
                                            <AddAssetButton library={library} token={
                                                {
                                                    address: pair.address,
                                                    chainId: pair.chainId,
                                                    decimals: pair.decimals,
                                                    logoURI: pair.logoURI,
                                                    name: pair.name,
                                                    symbol: pair.symbol,
                                                }
                                            } />
                                        }
                                    </CellWithImg>
                                </TableHeader>

                                <TableHeader width="480px" id="token-name">
                                    <CellLink href={contactExplorerLink(sourceChainInfo.explorer, `token/${pair.address}`)} target="#">
                                        {(pair.supply / (10 ** pair.decimals)).toFixed(4)}
                                    </CellLink>
                                </TableHeader>
                                <TableHeader width="300px">
                                    <CellWithImg>
                                        {LogoList.map((logo) => (
                                            <>
                                                <img src={logo} width={"24px"}></img>&nbsp;&nbsp;
                                            </>
                                        ))}
                                    </CellWithImg>
                                </TableHeader>
                                <TableHeader width="200px"><button onClick={() => onClick(pair.address)}><img src={DropDownSvg}></img></button></TableHeader>
                            </tr>
                        </thead>
                        {showDetail === pair.address && <>
                            {Object.keys(pair.targets).map((chain) => {
                                const targetToken = pair.targets[chain]
                                const targetChainInfo = CHAIN_INFO[targetToken.chainId]
                                const targetBridgeAddress = BRIDGE_ADDRESSES[targetToken.chainId]
                                return (
                                    <TableRowDetail key={chain} >
                                        <TableDataDetail scope="row" >
                                            <CellWithImg >
                                                <img src={targetChainInfo.logoUrl} width={"26px"} ></img>&nbsp;{formatChainName(chain)}
                                                {/* <div style={{  textAlign: "right" }} >
                                                    
                                                </div> */}

                                            </CellWithImg>
                                        </TableDataDetail>
                                        <TableDataDetail >
                                            <CellWithImg >
                                                <img src={targetToken.logoURI} width={CellImgWidth}></img>&nbsp;&nbsp;
                                                <CellLink href={contactExplorerLink(targetChainInfo.explorer, `token/${targetToken.address}`)} target="#">
                                                    {targetToken.symbol}({targetToken.name})
                                                </CellLink>
                                                {
                                                    targetToken.chainId === chainId &&
                                                    <AddAssetButton library={library} token={
                                                        {
                                                            address: targetToken.address,
                                                            chainId: targetToken.chainId,
                                                            decimals: targetToken.decimals,
                                                            logoURI: targetToken.logoURI,
                                                            name: targetToken.name,
                                                            symbol: targetToken.symbol,
                                                        }
                                                    } />
                                                }
                                            </CellWithImg>
                                        </TableDataDetail>
                                        <TableDataDetail scope="row">
                                            <CellLink target="#" href={contactExplorerLink(targetChainInfo.explorer, `token/${targetToken.address}?a=${targetBridgeAddress}`)} >
                                                Pool Size: {(targetToken.balance / (10 ** targetToken.decimals)).toFixed(4)}
                                            </CellLink>
                                        </TableDataDetail>
                                        <TableDataDetail scope="row" >Available</TableDataDetail>
                                    </TableRowDetail>
                                )
                            })}
                        </>}
                    </Table>

                </TableData>
            </TableRow>
        </>
    )
}
