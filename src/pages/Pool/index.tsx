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
import Row from "./TableRow";


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

export default function Pool({ history }: RouteComponentProps) {
    const { account, chainId } = useActiveWeb3React()
    const [showDetail, setShowDetail] = useState("")
    const { innerWidth } = window
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
    const handleRowClick = (key: string) => {
        if (showDetail === key) {
            setShowDetail("")
        } else {
            setShowDetail(key)
        }
    }
    const { supportedTokens } = useGetBridgeSupportedTokensQuery(
        { sourceChain: ALL_SUPPORTED_CHAIN_SHORT_NAMES[chainId ?? 1], targetChain: "alyx" },
        {
            // refetchOnMountOrArgChange: true,
            selectFromResult: ({ data }) => ({
                supportedTokens: data?.data?.tokens ? data?.data.tokens : [],
            }),
            skip: !chainId,
        }
    )




    const tableWidth = innerWidth / 1.2 + 'px'
    return (
        <AppBody>
            {pairs && pairs.length > 0 &&
                <Table width={tableWidth}>
                    <thead>
                        <tr>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="140px">Token</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="480px">Minted At ALYX</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="300px">Target Chains</TableHeader>
                            <TableHeader style={{ fontSize: "22px" }} scope="col" width="200px">Details</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {pairs?.map(pair => {
                            return Row(pair, showDetail, handleRowClick)
                        })}
                    </tbody>
                    <tfoot>
                        <TableRow>
                            <td>

                            </td>
                        </TableRow>
                    </tfoot>
                </Table>
            }
            {/* {
                pairs?.length
            } */}

        </AppBody>
    )
}