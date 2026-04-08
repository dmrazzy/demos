import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export const SYSTEM_PROMPT = `You are a job search assistant. Users will share their CV, resume, or describe their skills and experience, and you will help them find relevant job opportunities.

When a user shares their CV or describes their background:
1. Analyze their skills, experience, titles, and industry context
2. Use the search_jobs function to find relevant opportunities
3. Generate 3 to 5 diverse, targeted search queries

Make queries specific and varied:
- Include job title variations when helpful
- Target industries or company types mentioned by the user
- Include location preferences if they are mentioned
- Mix broader and narrower searches so the results set is useful

If the user has not shared enough information to search well, ask a focused follow-up question instead of calling the tool.

Be professional, concise, and focused on helping users find strong job matches.`

export const JOB_SEARCH_FUNCTION = {
  type: 'function' as const,
  function: {
    name: 'search_jobs',
    description: 'Search for job opportunities based on the user profile, CV, and preferences',
    parameters: {
      type: 'object',
      properties: {
        queries: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'An array of 3 to 5 targeted search queries for job listings that cover different angles of the user profile',
        },
      },
      required: ['queries'],
    },
  },
}

export async function generateChatResponse(
  messages: ChatMessage[],
  tools: any[] = [JOB_SEARCH_FUNCTION]
) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      tools,
      tool_choice: 'auto',
      max_completion_tokens: 1000,
    })

    return response
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate chat response')
  }
}

export async function streamChatResponse(
  messages: ChatMessage[],
  tools: any[] = [JOB_SEARCH_FUNCTION]
) {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      tools,
      tool_choice: 'auto',
      max_completion_tokens: 1000,
      stream: true,
    })

    return stream
  } catch (error) {
    console.error('OpenAI streaming error:', error)
    throw new Error('Failed to stream chat response')
  }
}
