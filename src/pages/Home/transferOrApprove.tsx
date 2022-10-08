import { Trans } from '@lingui/macro'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ArrowDown, CheckCircle, HelpCircle, Info } from 'react-feather'
import ReactGA from 'react-ga'
import styled, { ThemeContext } from 'styled-components'

import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import Loader from '../../components/Loader'
import Row, { AutoRow, RowFixed } from '../../components/Row'
import { MouseoverTooltip, MouseoverTooltipContent } from '../../components/Tooltip'
import {
    ApprovalState,
    useApproveCallbackFromBridgeSwap,
    useApproveCallbackFromTrade,
} from '../../hooks/useApproveCallback'
import { useERC20PermitFromTrade, UseERC20PermitState } from '../../hooks/useERC20Permit'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import useToggledVersion from '../../hooks/useToggledVersion'
import { useActiveWeb3React } from '../../hooks/web3'
import { Field } from '../../state/swap/actions'
import {
    useDefaultsFromURLSearch,
    useSwapActionHandlers,
    useDerivedSwapInfo,
    useSwapState,
} from '../../state/swap/hooks'

type ButtonProps = {
    TransferButton: React.ComponentType;
};

export default function ApproveFlow({ TransferButton }: ButtonProps) {
    const { account, chainId } = useActiveWeb3React()
    const theme = useContext(ThemeContext)
    // get version from the url
    const toggledVersion = useToggledVersion()
    const {
        v3Trade: { state: v3TradeState },
        bestTrade: trade,
        allowedSlippage,
        currencyBalances,
        parsedAmount,
        currencies,
        inputError: swapInputError,
    } = useDerivedSwapInfo(toggledVersion)

    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

    const isArgentWallet = useIsArgentWallet()
    // check whether the user has approved the router on the input token

    const [approvalState, approveCallback] = useApproveCallbackFromBridgeSwap()
    const { state: signatureState, signatureData, gatherPermitSignature } = useERC20PermitFromTrade(
        trade,
        allowedSlippage
    )

    const showApproveFlow =
        !isArgentWallet &&
        // !swapInputError &&
        (approvalState === ApprovalState.NOT_APPROVED ||
            approvalState === ApprovalState.PENDING ||
            (approvalSubmitted && approvalState === ApprovalState.APPROVED))

    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
        if (approvalState === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approvalState, approvalSubmitted])

    const handleApprove = useCallback(async () => {
        if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
            try {
                await gatherPermitSignature()
            } catch (error) {
                // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
                if (error?.code !== 4001) {
                    await approveCallback()
                }
            }
        } else {
            console.log("handleApprove->signatureState", signatureState)
            await approveCallback()

            ReactGA.event({
                category: 'Bridge',
                action: 'Approve',
                label: [trade?.inputAmount.currency.symbol, toggledVersion].join('/'),
            })
        }
    }, [approveCallback, gatherPermitSignature, signatureState, toggledVersion, trade?.inputAmount.currency.symbol])
    if (isMobile) {
        const style = {
            "width": '300px',
            "height": '28px',
            "align-self": "center",

        }
        return (
            <>
                {
                    showApproveFlow ? (
                    // true ? (
                        <Column style={{ width: '100%', margin:'80px 0 0 0'}} gap="12px" alignItems='center' >
                            <ButtonConfirmed
                                onClick={handleApprove}
                                disabled={
                                    approvalState !== ApprovalState.NOT_APPROVED ||
                                    approvalSubmitted ||
                                    signatureState === UseERC20PermitState.SIGNED
                                }
                                width="300px"
                                altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                                confirmed={
                                    approvalState === ApprovalState.APPROVED ||
                                    signatureState === UseERC20PermitState.SIGNED
                                }
                            >
                                <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <CurrencyLogo
                                            currency={currencies[Field.INPUT]}
                                            size={'20px'}
                                            style={{ marginLeft: '8px', marginRight: '8px', flexShrink: 0 }}
                                        />
                                        {/* we need to shorten this string on mobile */}
                                        {approvalState === ApprovalState.APPROVED ||
                                            signatureState === UseERC20PermitState.SIGNED ? (
                                            // <Trans>You can now transfer {currencies[Field.INPUT]?.symbol}</Trans>
                                            <Trans>Approved</Trans>
                                        ) : (
                                            <Trans>
                                                {/* Allow Alyx Bridge Protocol to use your {currencies[Field.INPUT]?.symbol} */}
                                                Approve
                                            </Trans>
                                        )}
                                    </span>
                                    {approvalState === ApprovalState.PENDING ? (
                                        <Loader stroke="white" style={{ marginLeft: '8px', marginRight: '8px' }}/>
                                    ) : (approvalSubmitted && approvalState === ApprovalState.APPROVED) ||
                                        signatureState === UseERC20PermitState.SIGNED ? (
                                        <CheckCircle size="20" color={theme.green1} style={{ marginLeft: '8px', marginRight: '8px' }} />
                                    ) : (
                                        <MouseoverTooltip
                                            text={
                                                <Trans>
                                                    You must give Alyx Bridge contracts permission to use your{' '}
                                                    {currencies[Field.INPUT]?.symbol}. You only have to do this once per token.
                                                </Trans>
                                            }
                                        >
                                            <HelpCircle size="20" color={'white'} style={{ marginLeft: '8px', marginRight: '8px', marginTop:'4px' }} />
                                        </MouseoverTooltip>
                                    )}
                                </AutoRow>
                            </ButtonConfirmed>
                        </Column>
                    ) : (
                        <TransferButton></TransferButton>
                    )}
            </>
        )
    }
    return (
        <>
            {
                showApproveFlow ? (
                    <AutoRow style={{ flexWrap: 'nowrap', width: '408px', height: '45px', margin: '0 0 0 217px' }}>
                        <AutoColumn style={{ width: '100%', }} gap="12px">
                            <ButtonConfirmed
                                onClick={handleApprove}
                                disabled={
                                    approvalState !== ApprovalState.NOT_APPROVED ||
                                    approvalSubmitted ||
                                    signatureState === UseERC20PermitState.SIGNED
                                }
                                width="100%"
                                altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                                confirmed={
                                    approvalState === ApprovalState.APPROVED ||
                                    signatureState === UseERC20PermitState.SIGNED
                                }
                            >
                                <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <CurrencyLogo
                                            currency={currencies[Field.INPUT]}
                                            size={'20px'}
                                            style={{ marginRight: '8px', flexShrink: 0 }}
                                        />
                                        {/* we need to shorten this string on mobile */}
                                        {approvalState === ApprovalState.APPROVED ||
                                            signatureState === UseERC20PermitState.SIGNED ? (
                                            <Trans>You can now transfer {currencies[Field.INPUT]?.symbol}</Trans>
                                        ) : (
                                            <Trans>
                                                Allow Alyx Bridge Protocol to use your {currencies[Field.INPUT]?.symbol}
                                            </Trans>
                                        )}
                                    </span>
                                    {approvalState === ApprovalState.PENDING ? (
                                        <Loader stroke="white" />
                                    ) : (approvalSubmitted && approvalState === ApprovalState.APPROVED) ||
                                        signatureState === UseERC20PermitState.SIGNED ? (
                                        <CheckCircle size="20" color={theme.green1} />
                                    ) : (
                                        <MouseoverTooltip
                                            text={
                                                <Trans>
                                                    You must give Alyx Bridge contracts permission to use your{' '}
                                                    {currencies[Field.INPUT]?.symbol}. You only have to do this once per token.
                                                </Trans>
                                            }
                                        >
                                            <HelpCircle size="20" color={'white'} style={{ marginLeft: '8px' }} />
                                        </MouseoverTooltip>
                                    )}
                                </AutoRow>
                            </ButtonConfirmed>
                        </AutoColumn>
                    </AutoRow>
                ) : (
                    <TransferButton></TransferButton>
                )}
        </>
    )
}
