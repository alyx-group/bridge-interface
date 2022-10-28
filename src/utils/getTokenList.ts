import { TokenList } from '@uniswap/token-lists'
import { ValidateFunction } from 'ajv'
import { ALL_SUPPORTED_CHAIN_SHORT_NAMES_MAP_TO_CHAINID } from 'constants/chains'

import contenthashToUri from './contenthashToUri'
import { parseENSAddress } from './parseENSAddress'
import uriToHttp from './uriToHttp'

// lazily get the validator the first time it is used
const getTokenListValidator = (() => {
  let tokenListValidator: Promise<ValidateFunction>
  return () => {
    if (!tokenListValidator) {
      tokenListValidator = new Promise<ValidateFunction>(async (resolve) => {
        const [ajv, schema] = await Promise.all([
          import('ajv'),
          import('@uniswap/token-lists/src/tokenlist.schema.json'),
        ])
        const validator = new ajv.default({ allErrors: true }).compile(schema)
        resolve(validator)
      })
    }
    return tokenListValidator
  }
})()

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 * @param resolveENSContentHash resolves an ens name to a contenthash
 */
export default async function getTokenList(
  sourceChain: string | null,
  targetChain: string | null,
  listUrl: string,
  resolveENSContentHash: (ensName: string) => Promise<string>
): Promise<TokenList> {
  const tokenListValidator = getTokenListValidator()
  const parsedENS = parseENSAddress(listUrl)
  let urls: string[]
  if (parsedENS) {
    let contentHashUri
    try {
      contentHashUri = await resolveENSContentHash(parsedENS.ensName)
    } catch (error) {
      console.debug(`Failed to resolve ENS name: ${parsedENS.ensName}`, error)
      throw new Error(`Failed to resolve ENS name: ${parsedENS.ensName}`)
    }
    let translatedUri
    try {
      translatedUri = contenthashToUri(contentHashUri)
    } catch (error) {
      console.debug('Failed to translate contenthash to URI', contentHashUri)
      throw new Error(`Failed to translate contenthash to URI: ${contentHashUri}`)
    }
    urls = uriToHttp(`${translatedUri}${parsedENS.ensPath ?? ''}`)
  } else {
    urls = uriToHttp(listUrl)
  }
  for (let i = 0; i < urls.length; i++) {
    console.log("getTokenList->sourceChain", sourceChain)
    console.log("getTokenList->targetChain", targetChain)
    let url = urls[i]
    if (sourceChain && targetChain) {
      url = `${url}?source_chain=${sourceChain}&target_chain=${targetChain}`
    }
    console.log("getTokenList->url", url)

    const isLast = i === urls.length - 1
    let response
    try {
      response = await fetch(url, { credentials: 'omit' })
    } catch (error) {
      console.debug('Failed to fetch list', listUrl, error)
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }

    if (!response.ok) {
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }

    const [json, validator] = await Promise.all([response.json(), tokenListValidator])

    console.log("getTokenList->response", json)
    console.log("getTokenList->url.search('supported/tokens') > -1", url.search('supported/tokens') > -1)
    let validatorResult
    if (url.search('supported/tokens') > -1) {
      validatorResult = validator(json.data)
      console.log("getTokenList->json.data", json.data)
      console.log("getTokenList->validator", validator)
      console.log("getTokenList->validatorResult", validatorResult)
    } else {
      validatorResult = validator(json)
    }
    // if (!validatorResult) {
    //   const validationErrors: string =
    //     validator.errors?.reduce<string>((memo, error) => {
    //       const add = `${error.dataPath} ${error.message ?? ''}`
    //       return memo.length > 0 ? `${memo}; ${add}` : `${add}`
    //     }, '') ?? 'unknown error'
    //   throw new Error(`Token list failed validation: ${validationErrors}`)
    // }
    if (url.search('supported/tokens') > -1) {
      // adapt backend data json format
      return json.data
    } else {
      return json
    }

  }
  throw new Error('Unrecognized list URL protocol.')
}
