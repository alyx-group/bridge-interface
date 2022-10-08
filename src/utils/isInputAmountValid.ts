import { Currency } from '@uniswap/sdk-core'
export default function isInputAmountValid(typedValue: string, inputCurrency: Currency | null | undefined):boolean {
    const parts = typedValue.split(".")
    if (inputCurrency && (parts.length<=1 || parts.length==2 && parts[1].length<= inputCurrency.decimals )){
      return true
    } else {
      return false
    }
}
