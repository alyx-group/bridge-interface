import { FACTORY_ADDRESS as V2_FACTORY_ADDRESS } from '@uniswap/v2-sdk'
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from '@uniswap/v3-sdk'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }

export const UNI_ADDRESS: AddressMap = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984')
export const MULTICALL_ADDRESS: AddressMap = {
  [SupportedChainId.ALYX]: '0x72c5b4AfED48BC5e33c17631cf820A8422c3C414',
  [SupportedChainId.HECO]: '0xBE27605F6FcD6fB1D34bcB8C16AfA188E3c2e146',
  [SupportedChainId.BSC]: '0x109E2A040B11518daB19A7cDDd24EB18549D13e1',
  [SupportedChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
}

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
}
export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x65770b5283117639760beA3F867b69b3697a91dd',
}

export const V2_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(V2_FACTORY_ADDRESS)

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(V3_FACTORY_ADDRESS, [
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
])

export const QUOTER_ADDRESSES: AddressMap = constructSameAddressMap('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', [
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
])

export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8',
}

export const V2_ROUTER_ADDRESS: AddressMap = constructSameAddressMap('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')

export const SWAP_ROUTER_ADDRESSES: AddressMap = constructSameAddressMap('0xE592427A0AEce92De3Edee1F18E0157C05861564')

export const BRIDGE_ADDRESSES: AddressMap = {
  [SupportedChainId.BSC]: '0x452a500B1c44dd3561C607d3c8e71F95e828cBfc', 
  [SupportedChainId.ALYX]: '0x9476815BED176a308aDF65a3e91d446Cec165ba0', 
  [SupportedChainId.HECO]: '', // '0xD5Eb0307618d0FBFAB3B87BEAcf672d3F9026Ce8', 0xE5Bd1C5c1AA3796F0baAfFE8Db7C4D47B6a4720D, 0x525B75Fd6479f67E3433d334b9dbD17173900911, 0x04c6f2518CD36F6cfb19FF83a2dbf69eff093392 // 0xb7991604e998ee0f9b7bce6da93a4bf0e54f1c83 // 0xf7cdfA32b75d02C2B348ecB0afb2270c7E6F826c
  [SupportedChainId.MAINNET]: '', 
}
