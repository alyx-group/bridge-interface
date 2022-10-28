import { Contract } from '@ethersproject/contracts'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { abi as MulticallABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import ARGENT_WALLET_DETECTOR_ABI from 'abis/argent-wallet-detector.json'
import ALYX_BRIDGE_CONTRACT_ABI from 'abis/alyx-bridge-contract.json'
import HECO_BRIDGE_CONTRACT_ABI from 'abis/heco-bridge-contract.json'
import BSC_BRIDGE_CONTRACT_ABI from 'abis/heco-bridge-contract.json'
import EIP_2612 from 'abis/eip_2612.json'
import ENS_PUBLIC_RESOLVER_ABI from 'abis/ens-public-resolver.json'
import ENS_ABI from 'abis/ens-registrar.json'
import ERC20_ABI from 'abis/erc20.json'
import ERC20_BYTES32_ABI from 'abis/erc20_bytes32.json'
import WETH_ABI from 'abis/weth.json'
import {
  ARGENT_WALLET_DETECTOR_ADDRESS,
  ENS_REGISTRAR_ADDRESSES,
  MULTICALL_ADDRESS,
  QUOTER_ADDRESSES,
  V2_ROUTER_ADDRESS,
  BRIDGE_ADDRESSES,
} from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useMemo } from 'react'
import { Quoter, UniswapInterfaceMulticall } from 'types/v3'
import { getContract } from 'utils'

import { ArgentWalletDetector, EnsPublicResolver, EnsRegistrar, Erc20, Weth } from '../abis/types'
import { UNI, WETH9_EXTENDED } from '../constants/tokens'
import { useActiveWeb3React } from './web3'
// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useActiveWeb3React()
  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T
}

export function useMulticall2Contract() {
  // return
  return useContract<UniswapInterfaceMulticall>(MULTICALL_ADDRESS, MulticallABI, false) as UniswapInterfaceMulticall
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  return useContract<EnsRegistrar>(ENS_REGISTRAR_ADDRESSES, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
  return useContract<EnsPublicResolver>(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useV3Quoter() {
  return useContract<Quoter>(QUOTER_ADDRESSES, QuoterABI)
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const { chainId } = useActiveWeb3React()
  return useContract<Weth>(chainId ? WETH9_EXTENDED[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract() {
  return useContract<ArgentWalletDetector>(ARGENT_WALLET_DETECTOR_ADDRESS, ARGENT_WALLET_DETECTOR_ABI, false)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false)
}

export function useV2RouterContract(): Contract | null {
  return useContract(V2_ROUTER_ADDRESS, IUniswapV2Router02ABI, true)
}

export function useBridgeContract(chainId: SupportedChainId | undefined): Contract | null {
  let abi = [] as any
  switch (chainId) {
    case SupportedChainId.ALYX:
      abi = ALYX_BRIDGE_CONTRACT_ABI
      break;
    case SupportedChainId.HECO:
      abi = HECO_BRIDGE_CONTRACT_ABI
      break;
    case SupportedChainId.BSC:
      abi = BSC_BRIDGE_CONTRACT_ABI
      break;
    case SupportedChainId.MAINNET:
      abi = ALYX_BRIDGE_CONTRACT_ABI
      break;
    default:
      break;
  }
  return useContract(chainId?BRIDGE_ADDRESSES[chainId]:'', abi, true)
}
