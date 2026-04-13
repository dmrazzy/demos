import { NextRequest, NextResponse } from 'next/server'

interface SendNotificationRequest {
  walletAddress: string
  title?: string
  message?: string
}

interface BaseAPIResult {
  walletAddress: string
  sent: boolean
  error?: string
}

interface BaseAPIResponse {
  success: boolean
  results: BaseAPIResult[]
  sentCount: number
  failedCount: number
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()

  try {
    const body: SendNotificationRequest = await request.json()
    const { walletAddress, title, message } = body

    if (!walletAddress) {
      console.log(JSON.stringify({
        timestamp,
        level: 'warn',
        message: 'Missing wallet address in request',
      }))
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.BASE_API_KEY
    if (!apiKey) {
      console.log(JSON.stringify({
        timestamp,
        level: 'error',
        message: 'BASE_API_KEY environment variable is not configured',
      }))
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    const response = await fetch('https://dashboard.base.org/api/v1/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        app_url: appUrl,
        wallet_addresses: [walletAddress],
        title: title || 'Hello from Base',
        message: message || 'This is a test notification from the demo app.',
        target_path: '/',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log(JSON.stringify({
        timestamp,
        level: 'error',
        message: 'Base API request failed',
        status: response.status,
        response: errorText,
      }))
      return NextResponse.json(
        { success: false, error: `API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data: BaseAPIResponse = await response.json()

    if (data.results && data.results.length > 0) {
      const result = data.results[0]

      if (result.sent) {
        console.log(JSON.stringify({
          timestamp,
          level: 'info',
          message: 'Notification sent successfully',
          wallet: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        }))
        return NextResponse.json({
          success: true,
          sent: true,
        })
      }

      console.log(JSON.stringify({
        timestamp,
        level: 'info',
        message: 'Notification not sent',
        reason: result.error,
        wallet: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      }))
      return NextResponse.json({
        success: true,
        sent: false,
        error: result.error,
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Unexpected response from notification service',
    })
  } catch (error) {
    console.log(JSON.stringify({
      timestamp,
      level: 'error',
      message: 'Failed to send notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    }))
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
