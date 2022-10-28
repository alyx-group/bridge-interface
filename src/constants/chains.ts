import ethereumLogoUrl from 'assets/images/ethereum-logo.png'
import arbitrumLogoUrl from 'assets/svg/arbitrum_logo.svg'
import alyxLogoUrl from 'assets/images/logo-color.png'
import hecoLogoUrl from 'assets/svg/huobi-light.svg'
import bscLogoUrl from 'assets/svg/bsc-light.svg'
import optimismLogoUrl from 'assets/svg/optimistic_ethereum.svg'
import ms from 'ms.macro'

export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,

  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  OPTIMISM = 10,
  OPTIMISTIC_KOVAN = 69,

  HECO = 128,
  BSC = 56,
  ALYX = 1314, 
}

export const ALL_SUPPORTED_CHAIN_SHORT_NAMES = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.ALYX]: 'alyx',
  [SupportedChainId.HECO]: 'heco',
  [SupportedChainId.BSC]: 'bsc',
}
export const ALL_SUPPORTED_CHAIN_SHORT_NAMES_WITH_CAPITAL_LETTER = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.ALYX]: 'alyx',
  [SupportedChainId.HECO]: 'HECO',
  [SupportedChainId.BSC]: 'BSC',
}
export const ALL_SUPPORTED_CHAIN_SHORT_NAMES_MAP_TO_CHAINID = {
  'ethereum': SupportedChainId.MAINNET,
  'alyx': SupportedChainId.ALYX,
  'heco': SupportedChainId.HECO,
  'bsc': SupportedChainId.BSC,
}
export const ALL_SUPPORTED_CHAIN_FULL_NAMES = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.ALYX]: 'ALYX Chain',
  [SupportedChainId.HECO]: 'Huobi ECO Chain',
  [SupportedChainId.BSC]: 'Binance Smart Chain',
}
export const ALL_SUPPORTED_CHAIN_SHORT_FULL_NAME_MAP = {
  [ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.MAINNET]]: ALL_SUPPORTED_CHAIN_FULL_NAMES[SupportedChainId.MAINNET],
  [ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.ALYX]]: ALL_SUPPORTED_CHAIN_FULL_NAMES[SupportedChainId.ALYX],
  [ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.HECO]]: ALL_SUPPORTED_CHAIN_FULL_NAMES[SupportedChainId.HECO],
  [ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.BSC]]: ALL_SUPPORTED_CHAIN_FULL_NAMES[SupportedChainId.BSC],
}
export const ALL_SUPPORTED_CHAIN_SHORT_NAME_MAP_TO_CAPITAL_LETTER = {
  [ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.MAINNET]]: ALL_SUPPORTED_CHAIN_SHORT_NAMES_WITH_CAPITAL_LETTER[SupportedChainId.MAINNET],
  [ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.ALYX]]: ALL_SUPPORTED_CHAIN_SHORT_NAMES_WITH_CAPITAL_LETTER[SupportedChainId.ALYX],
  [ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.HECO]]: ALL_SUPPORTED_CHAIN_SHORT_NAMES_WITH_CAPITAL_LETTER[SupportedChainId.HECO],
  [ALL_SUPPORTED_CHAIN_SHORT_NAMES[SupportedChainId.BSC]]: ALL_SUPPORTED_CHAIN_SHORT_NAMES_WITH_CAPITAL_LETTER[SupportedChainId.BSC],
}
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.KOVAN,

  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,

  SupportedChainId.ALYX,
  SupportedChainId.HECO,
  SupportedChainId.BSC,
]

export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.KOVAN,
  SupportedChainId.ALYX,
  SupportedChainId.HECO,
  SupportedChainId.BSC,
] as const

export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number]

export const L2_CHAIN_IDS = [
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
] as const

export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number]

export interface L1ChainInfo {
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly explorer: string
  readonly infoLink: string
  readonly label: string
  readonly logoUrl?: string
  readonly rpcUrls?: string[]
  readonly nativeCurrency: {
    name: string // 'Goerli ETH',
    symbol: string // 'gorETH',
    decimals: number //18,
  }
}
export interface L2ChainInfo extends L1ChainInfo {
  readonly bridge: string
  readonly logoUrl: string
  readonly statusPage?: string
}

export type ChainInfo = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo
} &
  { readonly [chainId in SupportedL1ChainId]: L1ChainInfo }

export const CHAIN_INFO: ChainInfo = {
  [SupportedChainId.ARBITRUM_ONE]: {
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://arbiscan.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum',
    label: 'Arbitrum',
    logoUrl: 'arbitrumLogoUrl',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  },
  [SupportedChainId.ARBITRUM_RINKEBY]: {
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://rinkeby-explorer.arbitrum.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum/',
    label: 'Arbitrum Rinkeby',
    logoUrl: 'arbitrumLogoUrl',
    nativeCurrency: { name: 'Rinkeby ArbETH', symbol: 'rinkArbETH', decimals: 18 },
    rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
  },
  [SupportedChainId.MAINNET]: {
    docs: '',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.ALYX]: {
    docs: 'https://docs.alyxchain.com/',
    explorer: 'https://www.alyxscan.com/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'ALYX',
    logoUrl: alyxLogoUrl,
    nativeCurrency: { name: 'ALYX', symbol: 'ALYX', decimals: 18 },
  },
  [SupportedChainId.HECO]: {
    docs: 'https://docs.hecochain.com/',
    explorer: 'https://hecoinfo.com/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'HECO',
    logoUrl: hecoLogoUrl,
    nativeCurrency: { name: 'HT', symbol: 'HT', decimals: 18 },
  },
  [SupportedChainId.BSC]: {
    docs: 'https://docs.binance.org/smart-chain/guides/bsc-intro.html',
    explorer: 'https://bscscan.com/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'BSC',
    logoUrl: bscLogoUrl,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  [SupportedChainId.RINKEBY]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://rinkeby.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Rinkeby',
    nativeCurrency: { name: 'Rinkeby ETH', symbol: 'rinkETH', decimals: 18 },
  },
  [SupportedChainId.ROPSTEN]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://ropsten.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ropsten',
    nativeCurrency: { name: 'Ropsten ETH', symbol: 'ropETH', decimals: 18 },
  },
  [SupportedChainId.KOVAN]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://kovan.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Kovan',
    nativeCurrency: { name: 'Kovan ETH', symbol: 'kovETH', decimals: 18 },
  },
  [SupportedChainId.GOERLI]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Görli',
    nativeCurrency: { name: 'Görli ETH', symbol: 'görETH', decimals: 18 },
  },
  [SupportedChainId.OPTIMISM]: {
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://gateway.optimism.io/',
    docs: 'https://optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism',
    label: 'OΞ',
    logoUrl: 'optimismLogoUrl',
    nativeCurrency: { name: 'Optimistic ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io'],
    statusPage: 'https://optimism.io/status',
  },
  [SupportedChainId.OPTIMISTIC_KOVAN]: {
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://gateway.optimism.io/',
    docs: 'https://optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism',
    label: 'Optimistic Kovan',
    rpcUrls: ['https://kovan.optimism.io'],
    logoUrl: 'optimismLogoUrl',
    nativeCurrency: { name: 'Optimistic kovETH', symbol: 'kovOpETH', decimals: 18 },
    statusPage: 'https://optimism.io/status',
  },
}

export const ARBITRUM_HELP_CENTER_LINK = 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum'
export const OPTIMISM_HELP_CENTER_LINK =
  'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ'
