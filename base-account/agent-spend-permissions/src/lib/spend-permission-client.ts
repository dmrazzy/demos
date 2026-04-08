import { encodeFunctionData, getAddress } from 'viem'

const ETERNITY_TIMESTAMP = 281474976710655
const SPEND_PERMISSION_MANAGER_ADDRESS = '0xf85210B21cC50302F477BA56686d2019dC9b67Ad'

const SPEND_PERMISSION_TYPED_DATA_TYPES = {
  SpendPermission: [
    { name: 'account', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'allowance', type: 'uint160' },
    { name: 'period', type: 'uint48' },
    { name: 'start', type: 'uint48' },
    { name: 'end', type: 'uint48' },
    { name: 'salt', type: 'uint256' },
    { name: 'extraData', type: 'bytes' },
  ],
} as const

const SPEND_PERMISSION_MANAGER_ABI = [
  {
    type: 'function',
    name: 'approveWithSignature',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'spendPermission',
        type: 'tuple',
        components: [
          { name: 'account', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'allowance', type: 'uint160' },
          { name: 'period', type: 'uint48' },
          { name: 'start', type: 'uint48' },
          { name: 'end', type: 'uint48' },
          { name: 'salt', type: 'uint256' },
          { name: 'extraData', type: 'bytes' },
        ],
      },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'spend',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'spendPermission',
        type: 'tuple',
        components: [
          { name: 'account', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'allowance', type: 'uint160' },
          { name: 'period', type: 'uint48' },
          { name: 'start', type: 'uint48' },
          { name: 'end', type: 'uint48' },
          { name: 'salt', type: 'uint256' },
          { name: 'extraData', type: 'bytes' },
        ],
      },
      { name: 'value', type: 'uint160' },
    ],
    outputs: [],
  },
] as const

export interface StoredSpendPermission {
  createdAt: number
  chainId: number
  permissionHash?: string
  signature: `0x${string}`
  permission: {
    account: `0x${string}`
    spender: `0x${string}`
    token: `0x${string}`
    allowance: string
    period: number
    start: number
    end: number
    salt: `0x${string}`
    extraData: `0x${string}`
  }
}

interface SpendPermissionRequest {
  account: `0x${string}`
  spender: `0x${string}`
  token: `0x${string}`
  chainId: number
  allowance: bigint
  periodInDays: number
  start?: Date
  end?: Date
  salt?: `0x${string}`
  extraData?: `0x${string}`
}

function dateToTimestampInSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000)
}

function getRandomHexString(byteLength: number): `0x${string}` {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)

  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`
}

export function createSpendPermissionTypedData(request: SpendPermissionRequest) {
  const {
    account,
    spender,
    token,
    chainId,
    allowance,
    periodInDays,
    start,
    end,
    salt,
    extraData,
  } = request

  return {
    domain: {
      name: 'Spend Permission Manager',
      version: '1',
      chainId,
      verifyingContract: SPEND_PERMISSION_MANAGER_ADDRESS,
    },
    types: SPEND_PERMISSION_TYPED_DATA_TYPES,
    primaryType: 'SpendPermission' as const,
    message: {
      account: getAddress(account),
      spender: getAddress(spender),
      token: getAddress(token),
      allowance: allowance.toString(),
      period: 86400 * periodInDays,
      start: dateToTimestampInSeconds(start ?? new Date()),
      end: end ? dateToTimestampInSeconds(end) : ETERNITY_TIMESTAMP,
      salt: salt ?? getRandomHexString(32),
      extraData: extraData ?? '0x',
    },
  }
}

export function prepareOptimisticSpendCallData(permission: StoredSpendPermission, amount: bigint) {
  const spendPermission = {
    ...permission.permission,
    allowance: BigInt(permission.permission.allowance),
    salt: BigInt(permission.permission.salt),
  }

  const approveData = encodeFunctionData({
    abi: SPEND_PERMISSION_MANAGER_ABI,
    functionName: 'approveWithSignature',
    args: [spendPermission, permission.signature],
  })

  const spendData = encodeFunctionData({
    abi: SPEND_PERMISSION_MANAGER_ABI,
    functionName: 'spend',
    args: [spendPermission, amount],
  })

  return [
    {
      to: SPEND_PERMISSION_MANAGER_ADDRESS,
      data: approveData,
      value: '0x0',
    },
    {
      to: SPEND_PERMISSION_MANAGER_ADDRESS,
      data: spendData,
      value: '0x0',
    },
  ]
}

export function isSpendPermissionClientError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    message.includes('No client found for chain ID') ||
    message.includes('No client available for chain ID') ||
    message.includes('Please ensure SDK is in connected state') ||
    message.includes('Make sure the SDK is in connected state')
  )
}
