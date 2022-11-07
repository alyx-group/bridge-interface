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
  [SupportedChainId.POLYGON]: '0x011Edf4c5d90780d46eB37fe2dfD17c78Ba35003',
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
  [SupportedChainId.MAINNET]: '0xC28D9b9612D6B79c4d1346752398a7754ca0A22F', 
  [SupportedChainId.BSC]: '0xB964C1195A4FDA888D45adb3fA779efA07EcA2B0', 
  [SupportedChainId.POLYGON]: '0x4C0a71971381FfC5b090341f5988ABACc14e5A8e', 
  [SupportedChainId.ALYX]: '0x6858cbea8063fa542cF608fFa35Bf7300A9FFAda', 
  [SupportedChainId.HECO]: '0x452a500B1c44dd3561C607d3c8e71F95e828cBfc', 
}
