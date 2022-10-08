import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { SupportedChainId } from 'constants/chains'
import qs from 'qs'

import {
  GetBridgeSupportedChainsResult,
  GetBridgeSupportedTargetNetworksResult,
  GetBridgeSupportedTokenResult,
  GetWithdrawTxHashResult,
  BindAddressResult,
} from './types'

export const bridgeApi = createApi({
  reducerPath: 'bridgeApi',
  baseQuery: fetchBaseQuery({
    // baseUrl: 'http://127.0.0.1:8080/v1/bridge', // local
    baseUrl: 'https://api.esbridge.io/v1/bridge', // hsc1
    // baseUrl: 'http://192.168.1.6:8080/v1/bridge', // t440
  }),
  endpoints: (build) => ({
    getBridgeSupportedChains: build.query<GetBridgeSupportedChainsResult, undefined>({
      query: (args) => `/supported/chains?${qs.stringify(args)}`,
    }),
    getBridgeSupportedTargetNetworks: build.query<
      GetBridgeSupportedTargetNetworksResult,
      { chainId: SupportedChainId | undefined }
    >({
      query: (args) => `/supported/target-networks?${qs.stringify(args)}`,
    }),
    getBridgeSupportedTokens: build.query<GetBridgeSupportedTokenResult, { chainId: SupportedChainId }>({
      query: (args) => `/supported/tokens?${qs.stringify(args)}`,
    }),
    getTargetChainWithdrawTxHash: build.query<GetWithdrawTxHashResult, { proof: string }>({
      query: (args) => `/withdraw/hash?${qs.stringify(args)}`,
    }),
  }),
})
export const {
  useGetBridgeSupportedChainsQuery,
  useGetBridgeSupportedTargetNetworksQuery,
  useGetBridgeSupportedTokensQuery,
  useGetTargetChainWithdrawTxHashQuery,
} = bridgeApi

export const { } = bridgeApi.internalActions