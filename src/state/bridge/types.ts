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