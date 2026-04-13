'use client'

import { useConnection, useConnect, useConnectors, useDisconnect } from 'wagmi'

export function ConnectWallet() {
  const { address, status } = useConnection()
  const { mutate: connect } = useConnect()
  const { mutate: disconnect } = useDisconnect()
  const connectors = useConnectors()

  const injected = connectors.find((c) => c.type === 'injected')

  switch (status) {
    case 'reconnecting':
      return (
        <span className="px-4 py-2 text-sm text-gray-400 border border-gray-200 rounded-xl">
          Reconnecting...
        </span>
      )

    case 'connecting':
      return (
        <button
          disabled
          className="px-5 py-2.5 bg-[#003ecb] text-white font-semibold rounded-xl text-sm opacity-50"
        >
          Connecting...
        </button>
      )

    case 'connected':
      return (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
          >
            Disconnect
          </button>
        </div>
      )

    case 'disconnected':
      if (!injected) return null
      return (
        <button
          onClick={() => connect({ connector: injected })}
          className="px-5 py-2.5 bg-[#0052ff] hover:bg-[#003ecb] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Connect
        </button>
      )
  }
}
