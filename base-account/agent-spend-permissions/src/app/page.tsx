'use client'

import React, { useEffect, useState } from 'react'
import { SignInWithBaseButton } from '@/components/SignInWithBase'
import { ChatInterface } from '@/components/ChatInterface'
import { SpendPermissionSetup } from '@/components/SpendPermissionSetup'
import { SpendPermissionManager } from '@/components/SpendPermissionManager'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAddress, setUserAddress] = useState<string>()
  const [hasSpendPermission, setHasSpendPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      setIsLoading(false)
    }
  }

  const handleSignIn = async (address: string) => {
    console.log('User authenticated with address:', address)
    setIsAuthenticated(true)
    setUserAddress(address)
  }

  const handlePermissionGranted = () => {
    setHasSpendPermission(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-base-blue"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Job Search Agent</h1>
              <p className="text-sm text-gray-600 sm:text-base">AI-powered job search with on-chain spend permissions</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <a
                href="https://github.com/base/demos/tree/master/base-account/agent-spend-permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View Code
              </a>
              {isAuthenticated && (
                <div className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 sm:text-sm">
                  {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {!isAuthenticated ? (
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">Welcome to Job Search Agent</h2>
              <p className="mx-auto mb-6 max-w-2xl text-base text-gray-600 sm:mb-8 sm:text-lg">
                Sign in with Base, grant a small daily USDC budget, and let the agent turn your CV into targeted Exa-powered job searches.
              </p>
              <div className="mb-8 flex justify-center">
                <div className="w-full max-w-sm">
                  <SignInWithBaseButton onSignIn={handleSignIn} colorScheme="light" />
                </div>
              </div>
            </div>

            <div className="mx-auto grid max-w-3xl gap-4 sm:gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
                <div className="w-12 h-12 bg-base-blue rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sign In</h3>
                <p className="text-sm text-gray-600">Authenticate with your Base Account</p>
              </div>

              <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
                <div className="w-12 h-12 bg-base-blue rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Set Permissions</h3>
                <p className="text-sm text-gray-600">Approve a daily USDC limit between $1 and $5</p>
              </div>

              <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
                <div className="w-12 h-12 bg-base-blue rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Search Jobs</h3>
                <p className="text-sm text-gray-600">Paste your CV and receive targeted job listings in chat</p>
              </div>
            </div>
          </div>
        ) : !hasSpendPermission ? (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Almost Ready!</h2>
              <p className="text-gray-600 mb-8">
                Set up your spend permission to fund paid Exa job searches.
              </p>
            </div>
            <SpendPermissionSetup userAddress={userAddress!} onPermissionGranted={handlePermissionGranted} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <div className="chat-container h-[70dvh] min-h-[28rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:h-[600px]">
                <ChatInterface isAuthenticated={isAuthenticated} userAddress={userAddress} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="min-h-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:h-[600px]">
                <SpendPermissionManager isAuthenticated={isAuthenticated} userAddress={userAddress} />
              </div>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:mt-16 sm:p-8">
            <h2 className="mb-6 text-center text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl">How It Works</h2>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <a
                  href="https://docs.base.org/base-account/overview/what-is-base-account?utm_source=x&utm_medium=video&utm_campaign=spend-permissions-youssef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-6 flex flex-col gap-4 rounded-lg p-4 text-left transition-colors duration-200 hover:bg-gray-50 sm:mb-8 sm:flex-row sm:items-center"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white transition-colors group-hover:bg-blue-600 sm:h-16 sm:w-16">
                      👤
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">Base Account</h3>
                    <p className="text-gray-600">Signs in and grants spend permission to the server wallet smart account</p>
                  </div>
                </a>

                <a
                  href="https://docs.base.org/base-account/improve-ux/spend-permissions?utm_source=x&utm_medium=video&utm_campaign=spend-permissions-youssef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-6 flex flex-col gap-4 rounded-lg p-4 text-left transition-colors duration-200 hover:bg-gray-50 sm:mb-8 sm:flex-row sm:items-center"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-lg font-bold text-white transition-colors group-hover:bg-purple-600 sm:h-16 sm:w-16">
                      💻
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">Frontend</h3>
                    <p className="text-gray-600">Prepares initial spend calls and sends CV-driven search requests to the backend</p>
                  </div>
                </a>

                <a
                  href="https://chatgpt.com?utm_source=x&utm_medium=video&utm_campaign=spend-permissions-youssef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-6 flex flex-col gap-4 rounded-lg p-4 text-left transition-colors duration-200 hover:bg-gray-50 sm:mb-8 sm:flex-row sm:items-center"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-lg font-bold text-white transition-colors group-hover:bg-green-600 sm:h-16 sm:w-16">
                      🤖
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">AI Agent (GPT-4o-mini)</h3>
                    <p className="text-gray-600">Analyzes your background and generates 3 to 5 targeted job search queries</p>
                  </div>
                </a>

                <a
                  href="https://docs.cdp.coinbase.com/server-wallets/v2/introduction/welcome?utm_source=x&utm_medium=video&utm_campaign=spend-permissions-youssef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-6 flex flex-col gap-4 rounded-lg p-4 text-left transition-colors duration-200 hover:bg-gray-50 sm:mb-8 sm:flex-row sm:items-center"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white transition-colors group-hover:bg-orange-600 sm:h-16 sm:w-16">
                      🏦
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">Server Wallet</h3>
                    <p className="text-gray-600">Executes the spend permission, moves USDC to its EOA, and signs x402 payments</p>
                  </div>
                </a>

                <a
                  href="https://exa.ai/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-6 flex flex-col gap-4 rounded-lg p-4 text-left transition-colors duration-200 hover:bg-gray-50 sm:mb-8 sm:flex-row sm:items-center"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white transition-colors group-hover:bg-emerald-700 sm:h-16 sm:w-16">
                      🔎
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">Exa Search (x402)</h3>
                    <p className="text-gray-600">Runs paid job searches over x402, one request per query, on Base</p>
                  </div>
                </a>

                <a
                  href="https://docs.base.org/base-chain/quickstart/why-base?utm_source=x&utm_medium=video&utm_campaign=spend-permissions-youssef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-4 rounded-lg p-4 text-left transition-colors duration-200 hover:bg-gray-50 sm:flex-row sm:items-center"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white transition-colors group-hover:bg-blue-700 sm:h-16 sm:w-16">
                      ⛓️
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">Base Chain</h3>
                    <p className="text-gray-600">The permission execution and funding transactions settle on Base with gas sponsorship</p>
                  </div>
                </a>
              </div>

              <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2">
                <a
                  href="https://docs.base.org/base-account/improve-ux/spend-permissions?utm_source=x&utm_medium=video&utm_campaign=spend-permissions-youssef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer rounded-lg bg-slate-50 p-5 transition-colors duration-200 hover:bg-slate-100 sm:p-6"
                >
                  <h4 className="font-semibold text-gray-900 mb-3 group-hover:text-blue-600">🔐 Spend Permissions</h4>
                  <p className="text-sm text-gray-600">
                    Users grant limited USDC spending authority to the server wallet smart account. The app can only take the approved amount.
                  </p>
                </a>

                <a
                  href="https://docs.base.org/base-account/improve-ux/sponsor-gas/paymasters?utm_source=x&utm_medium=video&utm_campaign=spend-permissions-youssef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer rounded-lg bg-slate-50 p-5 transition-colors duration-200 hover:bg-slate-100 sm:p-6"
                >
                  <h4 className="font-semibold text-gray-900 mb-3 group-hover:text-blue-600">⛽ Gas Sponsorship</h4>
                  <p className="text-sm text-gray-600">
                    The smart-account funding step uses CDP paymaster sponsorship, so users do not need ETH for gas.
                  </p>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
