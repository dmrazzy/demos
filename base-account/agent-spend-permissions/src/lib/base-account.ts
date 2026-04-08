import { createBaseAccountSDK } from '@base-org/account'
import { base } from 'viem/chains'

type BaseAccountSDK = ReturnType<typeof createBaseAccountSDK>
type BaseAccountProvider = ReturnType<BaseAccountSDK['getProvider']>

declare global {
  var __baseAccountSDK__: BaseAccountSDK | undefined
  var __baseAccountProvider__: BaseAccountProvider | undefined
}

const APP_NAME = 'Job Search Agent'
export const BASE_CHAIN_ID = base.id
export const BASE_CHAIN_HEX = `0x${base.id.toString(16)}`

export function getBaseAccountSDK(): BaseAccountSDK {
  globalThis.__baseAccountSDK__ ??= createBaseAccountSDK({
    appName: APP_NAME,
    appChainIds: [BASE_CHAIN_ID],
  })

  return globalThis.__baseAccountSDK__
}

export function getBaseAccountProvider(): BaseAccountProvider {
  globalThis.__baseAccountProvider__ ??= getBaseAccountSDK().getProvider()

  return globalThis.__baseAccountProvider__
}

export async function forceBaseChain(provider: BaseAccountProvider) {
  await provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: BASE_CHAIN_HEX }],
  })
}

export async function ensureBaseAccountConnected() {
  const provider = getBaseAccountProvider()

  const accounts = await provider.request({
    method: 'eth_requestAccounts',
  }) as string[]

  await forceBaseChain(provider)

  return {
    provider,
    accounts,
  }
}
