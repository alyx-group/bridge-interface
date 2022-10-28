import { Currency } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import AlyxLogo from '../../assets/images/logo-color.png'
import HecoLogo from '../../assets/images/heco-logo.png'
import BscLogo from '../../assets/images/bsc-logo.jpg'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/wrappedTokenInfo'
import Logo from '../Logo'

export const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
  ...rest
}: {
  currency?: Currency | null
  size?: string
  style?: React.CSSProperties
}) {
  const { account, chainId } = useActiveWeb3React()
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (!currency || currency.isNative) return []

    if (currency.isToken) {
      const defaultUrls = currency.chainId === 1 ? [getTokenLogoURL(currency.address)] : []
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, ...defaultUrls]
      }
      return defaultUrls
    }
    return []
  }, [currency, uriLocations])

  if (currency?.isNative) {
    switch (chainId) {
      case SupportedChainId.ALYX:
        return <StyledEthereumLogo src={AlyxLogo} alt="alyx logo" size={size} style={style} {...rest} />
      case SupportedChainId.HECO:
        return <StyledEthereumLogo src={HecoLogo} alt="heco logo" size={size} style={style} {...rest} />
      case SupportedChainId.BSC:
        return <StyledEthereumLogo src={BscLogo} alt="bsc logo" size={size} style={style} {...rest} />
      default:
        break
    }
    return <StyledEthereumLogo src={EthereumLogo} alt="ethereum logo" size={size} style={style} {...rest} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} {...rest} />
}
