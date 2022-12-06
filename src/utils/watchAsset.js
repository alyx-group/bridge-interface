import { Web3Provider } from '@ethersproject/providers'
import { L1ChainInfo, L2ChainInfo, SupportedChainId } from 'constants/chains'
import { BigNumber, utils } from 'ethers'
import { createTypeReferenceDirectiveResolutionCache } from 'typescript'

// interface WatchAssetParams {
//   library: Web3Provider
//   chainId: SupportedChainId
//   token: {
//     type: string
//     address: string
//     symbol: string
//     decimals: number
//     image: string
//   }
// }
export async function watchAsset({ library, token }) {
  const { ethereum } = window
  if (!library?.provider?.request) {
    return
  }
  console.log("ethereum", ethereum)
  if (!ethereum) {
    return
  }
  try {
    // request?: (request: { method: string, params?: Array<any> }) => Promise<any>
    // library.provider = (request: { method: string, params?: Array<any> }) => Promise<any> 
    const res = await library?.provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: token,
      }
    }
      // , (err, res) => {
      //   if (err) {
      //     throw err;
      //   }
      //   console.error('adding watch res: ', res)
      // }
    )
    console.log('res', res)
  } catch (error) {

    console.error('error adding watch asset: ', token, error)
  }
}
