import {
  fetchPermissions,
  requestRevoke,
} from '@base-org/account/spend-permission'
import { getBaseAccountProvider } from '@/lib/base-account'

export const USDC_BASE_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'

export async function getUserSpendPermissions(
  userAccount: string,
  spenderAccount: string
) {
  try {
    const provider = getBaseAccountProvider()

    const permissions = await fetchPermissions({
      account: userAccount as `0x${string}`,
      chainId: 8453,
      spender: spenderAccount as `0x${string}`,
      provider,
    })

    return permissions.filter(p =>
      p.permission?.token?.toLowerCase() === USDC_BASE_ADDRESS.toLowerCase()
    )
  } catch (error) {
    console.error('Failed to fetch spend permissions:', error)
    return []
  }
}

export async function revokeSpendPermission(permission: any): Promise<string> {
  try {
    const normalizedPermission = {
      permission: permission,
      provider: getBaseAccountProvider(),
    }

    const result = await requestRevoke(normalizedPermission)

    const hash: string = (result as any).id

    return hash
  } catch (error) {
    console.error('Failed to revoke spend permission:', error)
    throw new Error(`Failed to revoke spend permission: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
