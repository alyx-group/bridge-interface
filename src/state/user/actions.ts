import { createAction } from '@reduxjs/toolkit'
import { SupportedLocale } from 'constants/locales'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export const updateUserLocale = createAction<{ userLocale: SupportedLocale }>('user/updateUserLocale')

export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>('user/updateUserDarkMode')

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>('user/updateMatchesDarkMode')

export const updateUserClientSideRouter = createAction<{ userClientSideRouter: boolean }>(
  'user/updateUserClientSideRouter'
)
