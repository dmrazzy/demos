'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

type NotificationResult = 'idle' | 'loading' | 'success' | 'not-pinned' | 'error'

export function NotificationButton() {
  const { address, status } = useAccount()
  const [result, setResult] = useState<NotificationResult>('idle')

  async function sendNotification() {
    if (!address) return
    setResult('loading')

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      })

      const data = await response.json()

      if (data.sent) {
        setResult('success')
      } else if (data.error?.includes('user has not saved this app')) {
        setResult('not-pinned')
      } else {
        setResult('error')
      }
    } catch {
      setResult('error')
    }
  }

  const isLoading = result === 'loading'
  const isConnected = status === 'connected'

  const resultMessage: Record<NotificationResult, { text: string; color: string } | null> = {
    idle: null,
    loading: null,
    success: { text: 'Notification sent successfully.', color: 'text-green-600' },
    'not-pinned': { text: 'Please pin the app first.', color: 'text-amber-600' },
    error: { text: 'Failed to send notification. Please try again.', color: 'text-red-500' },
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={sendNotification}
        disabled={!isConnected || isLoading}
        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
          isConnected && !isLoading
            ? 'bg-[#0052ff] hover:bg-[#003ecb] text-white cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading
          ? 'Sending...'
          : isConnected
            ? 'Send Notification'
            : 'Connect wallet to send'}
      </button>

      {resultMessage[result] && (
        <p className={`text-sm font-medium ${resultMessage[result].color}`}>
          {resultMessage[result].text}
        </p>
      )}
    </div>
  )
}
