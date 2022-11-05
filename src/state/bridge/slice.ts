import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ALL_SUPPORTED_CHAIN_SHORT_NAMES_MAP_TO_CHAINID, SupportedChainId } from 'constants/chains'
import qs from 'qs'

import {
  GetBridgeSupportedChainsResult,
  GetBridgeSupportedTargetNetworksResult,
  GetBridgeSupportedTokenResult,
  GetWithdrawTxHashResult,
  getBridgePairInfo
} from './types'

export const bridgeApi = createApi({
  reducerPath: 'bridgeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:8080/v1', // local
    // baseUrl: 'https://api.alyxbridge.com/v1', // alyx
    // baseUrl: 'http://192.168.1.6:8080/v1', // t440
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
    getBridgePairInfo: build.query<getBridgePairInfo, {
      source_chain: string;
      token: string;
      target_chain: string;
    }>({
      query: (args) => ({
        url: `/pair`,
        method: 'POST',
        body: `${JSON.stringify({
          source_chain: args.source_chain,
          token: args.token,
          target_chain: args.target_chain,
        })}`,
      })
    }),
  }),
})
export const {
  useGetBridgeSupportedChainsQuery,
  useGetBridgeSupportedTargetNetworksQuery,
  useGetBridgeSupportedTokensQuery,
  useGetTargetChainWithdrawTxHashQuery,
  useGetBridgePairInfoQuery,
} = bridgeApi

export const { } = bridgeApi.internalActions