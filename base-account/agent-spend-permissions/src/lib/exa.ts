import { x402Client, wrapFetchWithPayment } from '@x402/fetch'
import { x402HTTPClient } from '@x402/core/client'
import type { ClientEvmSigner } from '@x402/evm'
import { registerExactEvmScheme } from '@x402/evm/exact/client'

export interface ExaSearchResult {
  title: string
  url: string
  publishedDate?: string
  author?: string
  text?: string
  highlights?: string[]
  summary?: string
}

export interface SearchRoundResult {
  query: string
  results: ExaSearchResult[]
  error?: string
}

export interface JobListing {
  title: string
  url: string
  company: string
  summary: string
  publishedDate?: string
  matchedQueries: string[]
}

interface SearchJobsOptions {
  publicClient?: any
}

export interface SearchQuote {
  query: string
  amount: bigint
}

const QUERY_RETRY_LIMIT = 3
const QUERY_RETRY_DELAY_MS = 1_500
const RECENT_JOB_WINDOW_DAYS = 30

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRecentPublishedDate() {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - RECENT_JOB_WINDOW_DAYS)
  return date.toISOString()
}

function buildSearchBody(query: string) {
  return {
    query,
    numResults: 10,
    type: 'auto',
    startPublishedDate: getRecentPublishedDate(),
    contents: {
      highlights: { maxCharacters: 300 },
      summary: { query: 'Summarize the role, company, location, and recency of this job posting.' },
      maxAgeHours: 0,
    },
  }
}

function isRetriableX402Failure(status: number, errorText: string): boolean {
  if (status !== 402) {
    return false
  }

  return errorText.includes('X402_VERIFICATION_FAILED') ||
    errorText.includes('Payment verification failed') ||
    errorText.includes('Payment settlement failed') ||
    errorText.includes('Your payment was not processed')
}

async function waitForSettlementVisibility(publicClient: any, transactionHash?: string) {
  if (!publicClient?.waitForTransactionReceipt || !transactionHash) {
    return
  }

  try {
    await publicClient.waitForTransactionReceipt({
      hash: transactionHash as `0x${string}`,
      pollingInterval: 1_000,
      timeout: 20_000,
    })
  } catch (error) {
    console.warn('Payment settlement receipt was not observed before continuing:', transactionHash, error)
  }
}

function getCompanyName(result: ExaSearchResult): string {
  if (result.author?.trim()) {
    return result.author.trim()
  }

  try {
    const hostname = new URL(result.url).hostname.replace(/^www\./, '')
    return hostname
      .split('.')
      .slice(0, 2)
      .join('.')
  } catch {
    return 'Unknown company'
  }
}

function getSummary(result: ExaSearchResult): string {
  if (result.summary?.trim()) {
    return result.summary.trim()
  }

  if (result.highlights?.length) {
    return result.highlights.join(' ').trim()
  }

  if (result.text?.trim()) {
    return result.text.trim().slice(0, 220)
  }

  return 'No summary available.'
}

export function flattenJobResults(searchResults: SearchRoundResult[]): JobListing[] {
  const jobs = new Map<string, JobListing>()

  for (const round of searchResults) {
    for (const result of round.results) {
      if (!result.url) {
        continue
      }

      const existing = jobs.get(result.url)

      if (existing) {
        if (!existing.matchedQueries.includes(round.query)) {
          existing.matchedQueries.push(round.query)
        }

        if (existing.summary === 'No summary available.' && getSummary(result) !== 'No summary available.') {
          existing.summary = getSummary(result)
        }

        continue
      }

      jobs.set(result.url, {
        title: result.title || 'Untitled role',
        url: result.url,
        company: getCompanyName(result),
        summary: getSummary(result),
        publishedDate: result.publishedDate,
        matchedQueries: [round.query],
      })
    }
  }

  return Array.from(jobs.values()).sort((a, b) => {
    if (a.publishedDate && b.publishedDate) {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    }

    if (a.publishedDate) {
      return -1
    }

    if (b.publishedDate) {
      return 1
    }

    return 0
  })
}

export async function quoteSearchJobs(queries: string[]): Promise<SearchQuote[]> {
  const httpClient = new x402HTTPClient(new x402Client())
  const quotes: SearchQuote[] = []

  for (const query of queries) {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildSearchBody(query)),
    })

    if (response.status !== 402) {
      const body = await response.text()
      throw new Error(`Unexpected Exa quote response (${response.status}): ${body || 'Missing payment challenge'}`)
    }

    const paymentRequired = httpClient.getPaymentRequiredResponse((name) => response.headers.get(name))
    const exactRequirement = paymentRequired.accepts.find((accept) => accept.network === 'eip155:8453') ?? paymentRequired.accepts[0]

    if (!exactRequirement?.amount) {
      throw new Error(`Exa did not return a usable payment amount for query: ${query}`)
    }

    quotes.push({
      query,
      amount: BigInt(exactRequirement.amount),
    })
  }

  return quotes
}

export async function searchJobs(
  queries: string[],
  signer: ClientEvmSigner,
  options: SearchJobsOptions = {}
): Promise<SearchRoundResult[]> {
  const client = new x402Client()
  registerExactEvmScheme(client, {
    signer,
    networks: ['eip155:8453'],
  })
  const httpClient = new x402HTTPClient(client)
  const x402Fetch = wrapFetchWithPayment(fetch, client)
  const allResults: SearchRoundResult[] = []

  for (const query of queries) {
    try {
      let resolved = false

      for (let attempt = 1; attempt <= QUERY_RETRY_LIMIT; attempt++) {
        const response = await x402Fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildSearchBody(query)),
        })

        if (response.ok) {
          try {
            const settleResponse = httpClient.getPaymentSettleResponse((name) => response.headers.get(name))
            console.log('x402 payment settled for query:', query, settleResponse)
            await waitForSettlementVisibility(options.publicClient, settleResponse.transaction)
          } catch {
            console.log('No payment settle header found for query:', query)
          }

          const data = await response.json() as { results?: ExaSearchResult[] }
          allResults.push({
            query,
            results: Array.isArray(data.results) ? data.results : [],
          })
          resolved = true
          break
        }

        const errorText = await response.text()

        if (attempt < QUERY_RETRY_LIMIT && isRetriableX402Failure(response.status, errorText)) {
          console.warn(`Retrying Exa search for query "${query}" after transient x402 failure (attempt ${attempt}/${QUERY_RETRY_LIMIT})`, errorText)
          await sleep(QUERY_RETRY_DELAY_MS * attempt)
          continue
        }

        throw new Error(`Exa search failed (${response.status}): ${errorText || 'Unknown error'}`)
      }

      if (!resolved) {
        throw new Error('Exa search retry loop exited without a result')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Search failed for query "${query}":`, error)

      allResults.push({
        query,
        results: [],
        error: message,
      })
    }
  }

  return allResults
}

export function formatJobResults(searchResults: SearchRoundResult[]): string {
  const jobs = flattenJobResults(searchResults)
  const failedQueries = searchResults.filter((result) => result.error)

  if (!jobs.length) {
    if (failedQueries.length) {
      return `I couldn't return job listings yet. ${failedQueries.length} search ${failedQueries.length === 1 ? 'request failed' : 'requests failed'}, so please try again in a moment.`
    }

    return 'I searched for matching roles but did not find any strong results yet. Try refining the target role, location, or seniority.'
  }

  const lines = jobs.slice(0, 8).map((job, index) => {
    const published = job.publishedDate ? ` (${job.publishedDate.slice(0, 10)})` : ''
    return `${index + 1}. ${job.title} at ${job.company}${published}\n${job.url}`
  })

  const failureNote = failedQueries.length
    ? `\n\n${failedQueries.length} query ${failedQueries.length === 1 ? 'failed' : 'failed'} during the search, so these results may be incomplete.`
    : ''

  return `I found ${jobs.length} relevant job ${jobs.length === 1 ? 'listing' : 'listings'} across ${searchResults.length} search queries.\n\n${lines.join('\n\n')}${failureNote}`
}
