export enum V3TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING,
}

export interface BridgePairInfo {
  sourceChain: string,
  sourceToken: string,
  sourceTokenDecimals: number,
  targetChain: string,
  targetToken: string,
  targetTokenDecimals: number,
  minimumCrossTransfer: number,
  maximumCrossTransfer: number,
  feeRate: number,
  minimumCrossFee: number,
  maximumCrossFee: number,
  targetTokenBalance: number,
}
export interface getBridgePairInfo {
  code: number
  data: BridgePairInfo
  msg: string
}

export interface GetWithdrawTxHashResult {
  code: number
  data: string
  msg: string
}

export interface GetBridgeSupportedTokenResult {
  code: number
  data: {
    address: string
    name: string
    symbol: string
  }[]
  msg: string
}

export interface GetBridgeSupportedChainsResult {
  code: number
  data: number[]
  msg: string
}

export interface GetBridgeSupportedTargetNetworksResult {
  code: number
  data: number[]
  msg: string
}

export interface GetQuoteResult {
  blockNumber: string
  gasPriceWei: string
  gasUseEstimate: string
  gasUseEstimateQuote: string
  gasUseEstimateQuoteDecimals: string
  gasUseEstimateUSD: string
  methodParameters: { calldata: string; value: string }
  quote: string
  quoteDecimals: string
  quoteGasAdjusted: string
  quoteGasAdjustedDecimals: string
  quoteId: string
  route: {
    address: string
    amountIn?: string
    amountOut?: string
    fee: string
    liquidity: string
    sqrtRatioX96: string
    tickCurrent: string
    tokenIn: {
      address: string
      chainId: number
      decimals: string | number
      symbol?: string
    }
    tokenOut: {
      address: string
      chainId: number
      decimals: string | number
      symbol?: string
    }
  }[][]
  routeString: string
}

export interface BindAddressResult {
  code: number
  data: {
    succeed: boolean
  }
  msg: string
}


// {
//   "chainId": 1314,
//   "address": "0x1A06D0F464ab5ca56a6161c6AF4feDF42f7FDa44",
//   "name": "ALYX PEG USDC",
//   "symbol": "USDC",
//   "logoURI": "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
//   "decimals": 18,
//   "supply": 25578954781684573630,
//   "targets": {
//       "bsc": {
//           "chainId": 56,
//           "address": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
//           "name": "Binance-Peg USD Coin",
//           "symbol": "USDC",
//           "logoURI": "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
//           "decimals": 18,
//           "balance": 3807718890565464500
//       },
//       "ethereum": {
//           "chainId": 1,
//           "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//           "name": "USD Coin",
//           "symbol": "USDC",
//           "logoURI": "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
//           "decimals": 6,
//           "balance": 62765786
//       },
//       "polygon": {
//           "chainId": 137,
//           "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
//           "name": "USD Coin (PoS)",
//           "symbol": "USDC",
//           "logoURI": "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
//           "decimals": 6,
//           "balance": 4005451
//       }
//   }
// },

export interface PairTargets {
  [heco: string]: {
    chainId: number,
    address: string,
    name: string,
    symbol: string,
    logoURI: string,
    decimals: number,
    balance: number
  }
}

export interface PairToken {
  chainId: number,
  address: string,
  name: string,
  symbol: string,
  logoURI: string,
  decimals: number,
  supply: number,
  targets: PairTargets,
}
export interface GetPairsResult {
  code: number
  data: PairToken[]
  msg: string
}