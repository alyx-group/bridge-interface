import { NavLink, RouteComponentProps } from "react-router-dom";
import { Button, Text } from "rebass";
import { useGetPairsQuery, useGetUserHistoryQuery } from "state/bridge/slice";
import styled from "styled-components";
import AppBody from '../AppBody'
import ms from 'ms.macro'
import DropDownSvg from '../../assets/images/arrow-down-blue.svg'
import { PairToken, UserHistory } from "state/bridge/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_SUPPORTED_CHAIN_FULL_NAMES, ALL_SUPPORTED_CHAIN_IDS, ALL_SUPPORTED_CHAIN_SHORT_NAMES, ALL_SUPPORTED_CHAIN_SHORT_NAMES_MAP_TO_CHAINID, CHAIN_INFO } from "constants/chains";
import { BRIDGE_ADDRESSES } from "constants/addresses";
import { useActiveWeb3React } from "hooks/web3";
import { useCurrency } from "hooks/Tokens";

const HomeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    /* border: 1px solid green; */
`
const Table = styled.table<
    {
        height?: string
    }>`
    /* display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
    margin-top: 30px; */
    background-color:rgba(33, 38, 62, 0.9);
    /* width: 1600px; */
    display: block;
    /* height: 800px; */
    height: ${props => props.height ?? "700px"};
    overflow-y: scroll;
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
    height: 50px;
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
    height: 70px;
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

const CellImgWidth = "24px"

function formatChainName(name: string) {
    if (name === "bsc") {
        return "BSC"
    }
    if (name.length > 0) {
        return name.substring(0, 1).toLocaleUpperCase() + name.substring(1,)
    }
    return name
}

function formatAddress(address: string) {
    if (address.length >= 40) {
        return address.substring(0, 6) + "..." + address.substring(address.length - 4,)
    }

    return address
}

function contactExplorerLink(explorer: string, rest: string) {
    if (explorer.endsWith("/")) {
        return `${explorer}${rest}`
    }

    return `${explorer}/${rest}`
}

function Row(
    transfer: UserHistory,
    sourceToken: {
        address: string;
        name: string;
        symbol: string;
        logoURI: string;
        decimals: number;
    } | null | undefined,
    targetToken: {
        address: string;
        name: string;
        symbol: string;
        logoURI: string;
        decimals: number;
    } | null | undefined
) {
    const parts = transfer.proof.split("_")
    // const token = useCurrency(parts[1])

    const sourceChainInfo = CHAIN_INFO[ALL_SUPPORTED_CHAIN_SHORT_NAMES_MAP_TO_CHAINID[transfer.sourceChain]]
    const targetChainInfo = CHAIN_INFO[ALL_SUPPORTED_CHAIN_SHORT_NAMES_MAP_TO_CHAINID[transfer.targetChain]]
    return (
        <>
            {
                sourceToken && targetToken && parts.length === 5 &&
                <TableRow key={transfer.proof} shadow={true} >
                    <TableData scope="row" > {formatChainName(transfer.sourceChain)}</TableData>
                    <TableData scope="row" >{formatAddress(transfer.from)}</TableData>
                    <TableData scope="row" >{formatChainName(transfer.targetChain)}</TableData>
                    <TableData scope="row" >{formatAddress(transfer.to)}</TableData>
                    <TableData scope="row" >
                        <CellWithImg >
                            <CellLink target={"#"} href={contactExplorerLink(sourceChainInfo.explorer, `tx/${parts[2]}`)}>
                                {Number(transfer.amount).toPrecision(6)}
                                &nbsp;{sourceToken?.symbol}&nbsp;
                            </CellLink>
                            <img src={sourceToken.logoURI} width={CellImgWidth}></img>
                        </CellWithImg>
                    </TableData>
                    <TableData scope="row" >
                        <CellWithImg >
                            <CellLink target={"#"} href={contactExplorerLink(targetChainInfo.explorer, `tx/${transfer.doneTxHash}`)}>
                                {(Number(transfer.amount) - Number(transfer.fee)).toPrecision(6)}
                                &nbsp;{targetToken?.symbol}&nbsp;
                            </CellLink>
                            <img src={targetToken.logoURI} width={CellImgWidth}></img>
                        </CellWithImg>
                    </TableData>
                    <TableData scope="row" >{Number(transfer.fee).toPrecision(6)}</TableData>
                    {/* <TableData scope="row" >{transfer.doneTxHash}</TableData> */}
                    {/* <TableData scope="row" >{transfer.to}</TableData> */}
                </TableRow>
            }
        </>
    )
}

export default function UserHistoryTransfer({ history }: RouteComponentProps) {
    const { account, chainId } = useActiveWeb3React()
    const [showDetail, setShowDetail] = useState("")
    const [requestParams, setRequetParams] = useState({
        chain: "",
        address: "",
        page: 1,
        limit: 50,
        sort: "id",
        direction: "desc"
    })
    useEffect(() => {
        if (chainId && ALL_SUPPORTED_CHAIN_SHORT_NAMES[chainId] && account) {
            setRequetParams({
                chain: ALL_SUPPORTED_CHAIN_SHORT_NAMES[chainId],
                address: account,
                page: 1,
                limit: 50,
                sort: "id",
                direction: "desc"
            })
        }
    }, [chainId, account])

    const { innerWidth, innerHeight } = window
    const { total, userHistoryList } = useGetUserHistoryQuery(requestParams, {
        pollingInterval: ms`30s`,
        refetchOnMountOrArgChange: true,
        skip: !chainId || !account || !ALL_SUPPORTED_CHAIN_SHORT_NAMES[chainId] || ALL_SUPPORTED_CHAIN_SHORT_NAMES[chainId] === "",
        selectFromResult: ({ data }) => ({
            total: data?.data?.total,
            userHistoryList: data?.data?.list
        })
    })
    const { pairs } = useGetPairsQuery(null, {
        pollingInterval: ms`30s`,
        selectFromResult: ({ data }) => ({
            pairs: data?.data?.filter((token) => {
                if (token.address.toLowerCase() !== "0x480bAacEa7d2DCDd28da31A5B31f49DfC4e6104E".toLowerCase()) {
                    return true
                }
                return false
            })
        })
    })
    const { sourceToken, targetToken } = useMemo(() => {
        if (userHistoryList && pairs) {
            for (let index = 0; index < userHistoryList.length; index++) {
                const transfer = userHistoryList[index];
                const parts = transfer.proof.split("_")
                const token = parts[1]
                if (transfer.sourceChain == "alyx") {
                    const pair = pairs?.filter((pair) => {
                        return pair.address.toLocaleLowerCase() === token.toLowerCase()
                    })
                    const targetToken = pair[0].targets[transfer.targetChain]
                    if (pair[0]) {
                        return {
                            sourceToken: {
                                address: pair[0].address,
                                name: pair[0].name,
                                symbol: pair[0].symbol,
                                logoURI: pair[0].logoURI,
                                decimals: pair[0].decimals,
                            },
                            targetToken: {
                                address: targetToken.address,
                                name: targetToken.name,
                                symbol: targetToken.symbol,
                                logoURI: targetToken.logoURI,
                                decimals: targetToken.decimals,
                            }
                        }
                    }
                } else if (transfer.targetChain == "alyx") {
                    const pair = pairs?.filter((pair) => {
                        return pair.targets[transfer.sourceChain].address.toLocaleLowerCase() === token.toLowerCase()
                    })
                    console.log("transfer", transfer)
                    console.log("pair", pair)
                    if (pair[0] && pair[0].targets[transfer.sourceChain]) {
                        return {
                            sourceToken: {
                                address: pair[0].targets[transfer.sourceChain].address,
                                name: pair[0].targets[transfer.sourceChain].name,
                                symbol: pair[0].targets[transfer.sourceChain].symbol,
                                logoURI: pair[0].targets[transfer.sourceChain].logoURI,
                                decimals: pair[0].targets[transfer.sourceChain].decimals,
                            },
                            targetToken: {
                                address: pair[0].address,
                                name: pair[0].name,
                                symbol: pair[0].symbol,
                                logoURI: pair[0].logoURI,
                                decimals: pair[0].decimals,
                            }
                        }
                    }
                }
            }
        }
        return {
            sourceToken: null,
            targetToken: null
        }
    }, [pairs, userHistoryList])

    const getTokens = (transfer: UserHistory) => {
        const parts = transfer.proof.split("_")
        const token = parts[1]
        if (pairs) {
            if (transfer.sourceChain == "alyx") {
                const pair = pairs?.filter((pair) => {
                    return pair.address.toLocaleLowerCase() === token.toLowerCase()
                })
                if (pair[0]) {
                    const targetToken = pair[0].targets[transfer.targetChain]
                    return {
                        sourceToken: {
                            address: pair[0].address,
                            name: pair[0].name,
                            symbol: pair[0].symbol,
                            logoURI: pair[0].logoURI,
                            decimals: pair[0].decimals,
                        },
                        targetToken: {
                            address: targetToken.address,
                            name: targetToken.name,
                            symbol: targetToken.symbol,
                            logoURI: targetToken.logoURI,
                            decimals: targetToken.decimals,
                        }
                    }
                }
            } else if (transfer.targetChain == "alyx") {
                const pair = pairs?.filter((pair) => {
                    return pair.targets[transfer.sourceChain].address.toLocaleLowerCase() === token.toLowerCase()
                })
                console.log("transfer", transfer)
                console.log("pair", pair)
                if (pair[0] && pair[0].targets[transfer.sourceChain]) {
                    return {
                        sourceToken: {
                            address: pair[0].targets[transfer.sourceChain].address,
                            name: pair[0].targets[transfer.sourceChain].name,
                            symbol: pair[0].targets[transfer.sourceChain].symbol,
                            logoURI: pair[0].targets[transfer.sourceChain].logoURI,
                            decimals: pair[0].targets[transfer.sourceChain].decimals,
                        },
                        targetToken: {
                            address: pair[0].address,
                            name: pair[0].name,
                            symbol: pair[0].symbol,
                            logoURI: pair[0].logoURI,
                            decimals: pair[0].decimals,
                        }
                    }
                }
            }
        }
        return {
            sourceToken: null,
            targetToken: null
        }
    }
    const handleRowClick = (key: string) => {
        if (showDetail === key) {
            setShowDetail("")
        } else {
            setShowDetail(key)
        }
    }
    const tableWidth = innerWidth / 1.2 + 'px'
    const tableHeight = innerHeight / 1.2 + 30 + 'px'
    return (
        <AppBody>
            {userHistoryList &&
                <Table width={tableWidth} height={tableHeight}>
                    <thead>
                        <tr>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="200px">SourceChain</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="200px">From</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="200px">TargetChain</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="200px">To</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="200px">Amount</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="200px">Received</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="200px">Fee</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {userHistoryList?.map(userHistory => {
                            const tokens = getTokens(userHistory)
                            return (Row(userHistory, tokens?.sourceToken, tokens?.targetToken))
                        })}
                    </tbody>
                    <tfoot>
                        {/* <td>deee</td> */}
                    </tfoot>
                </Table>
            }
            {/* {userHistoryList?.length} */}
            {/* {JSON.stringify(userHistoryList)} */}

        </AppBody>
    )
}