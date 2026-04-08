'use client'

import React, { useState, useRef, useEffect } from 'react'
import { isSpendPermissionClientError, prepareOptimisticSpendCallData } from '@/lib/spend-permission-client'

interface JobListing {
  title: string
  url: string
  company: string
  summary: string
  publishedDate?: string
  matchedQueries?: string[]
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'agent'
  timestamp: Date
  toolCall?: boolean
  details?: any
}

interface ChatInterfaceProps {
  isAuthenticated: boolean
  userAddress?: string
}

const USER_PULL_STEP_USDC = BigInt(100_000)

export function ChatInterface({ isAuthenticated, userAddress }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "I'm your job search assistant. Paste your CV or describe your skills, experience, and preferences, and I'll find relevant roles for you.",
      sender: 'agent',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isAuthenticated) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Prepare messages for API
      const chatMessages = messages
        .concat([userMessage])
        .filter(m => m.sender === 'user' || m.sender === 'agent')
        .map(m => ({
          role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content,
        }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: chatMessages }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.toolCall && data.details?.function?.name === 'search_jobs') {
        await handleJobSearch(data.details.function.arguments)
        return
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: 'agent',
        timestamp: new Date(),
        toolCall: data.toolCall,
        details: data.details,
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'agent',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobSearch = async (args: any) => {
    try {
      const { queries } = typeof args === 'string' ? JSON.parse(args) : args

      if (!Array.isArray(queries) || queries.length === 0) {
        throw new Error('No search queries were generated')
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Searching for jobs with ${queries.length} targeted ${queries.length === 1 ? 'query' : 'queries'}...`,
        sender: 'agent',
        timestamp: new Date(),
      }])

      const storedPermission = localStorage.getItem('spendPermission')
      let topUpSpendCalls: unknown[] | undefined

      if (storedPermission) {
        const permission = JSON.parse(storedPermission)
        const { prepareSpendCallData } = await import('@base-org/account/spend-permission')

        try {
          topUpSpendCalls = await prepareSpendCallData(permission, USER_PULL_STEP_USDC)
        } catch (error) {
          console.warn('Failed to prepare top-up spend calls on the client:', error)

          if (isSpendPermissionClientError(error)) {
            topUpSpendCalls = prepareOptimisticSpendCallData(permission, USER_PULL_STEP_USDC)
          }
        }
      }

      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries, topUpSpendCalls }),
      })

      const searchResult = await searchResponse.json()

      if (!searchResponse.ok) {
        throw new Error(searchResult.error || 'Job search failed')
      }

      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: searchResult.success
          ? searchResult.formattedResults
          : `Search failed: ${searchResult.error}`,
        sender: 'agent',
        timestamp: new Date(),
        toolCall: true,
        details: searchResult,
      }

      setMessages(prev => [...prev, resultMessage])
    } catch (error) {
      console.error('Job search error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Failed to search jobs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'agent',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please sign in with Base to start chatting with the agent.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="border-b border-slate-200 bg-white/80 p-3 backdrop-blur-sm sm:p-4">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Job Search Agent</h2>
        <p className="text-xs text-slate-600 sm:text-sm">Connected: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-xs lg:max-w-md ${
                message.sender === 'user'
                  ? 'bg-base-blue shadow-blue-100'
                  : 'bg-white border border-slate-200 shadow-slate-100'
              }`}
            >
              <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                message.sender === 'user' ? 'text-white' : 'text-slate-900'
              }`}>{message.content}</p>
              {message.toolCall && message.details?.success && Array.isArray(message.details.results) && message.details.results.length > 0 && (
                <div className="mt-3 space-y-3">
                  {(message.details.results as JobListing[]).slice(0, 6).map((job, index) => (
                    <div key={`${job.url}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                          <p className="text-xs text-slate-600">{job.company}{job.publishedDate ? ` • ${job.publishedDate.slice(0, 10)}` : ''}</p>
                        </div>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full rounded-lg bg-base-blue px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto sm:shrink-0"
                        >
                          View Listing
                        </a>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-700">{job.summary}</p>
                      {job.matchedQueries?.length ? (
                        <p className="mt-2 text-[11px] text-slate-500">Matched via: {job.matchedQueries.slice(0, 2).join(' | ')}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              <p className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[88%] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-slate-100 sm:max-w-xs lg:max-w-md">
              <div className="flex items-center gap-2">
                <div className="flex animate-pulse gap-1">
                  <div className="w-2 h-2 bg-base-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-base-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-base-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-slate-900">Searching for jobs...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 bg-white/80 p-3 backdrop-blur-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Paste your CV or describe your skills, experience, and ideal role..."
            className="flex-1 p-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-base-blue focus:border-transparent bg-white shadow-sm transition-all duration-200 text-slate-900 placeholder-slate-500"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="w-full rounded-xl bg-base-blue px-6 py-3 text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-base-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <span className="font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
