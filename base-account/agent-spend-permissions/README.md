# Job Search Agent

An AI-powered Next.js application that turns a Base Account session plus a small USDC spend permission into paid job search queries. Users sign in, grant a limited daily USDC budget, paste their CV or describe their background, and the app uses Exa over x402 to find relevant roles.

## Features

- Sign in with Base for wallet-based authentication
- Daily spend permissions from $1-$5 USDC on Base Mainnet
- GPT-4o-mini chat flow that generates targeted job search queries
- CDP server wallet with a smart account for spend-permission execution
- x402 payments for Exa search using the server wallet EOA signer
- Chat UI that returns formatted job results with direct listing links
- Gas sponsorship through a CDP paymaster

## How It Works

1. The user signs in with Base Account.
2. The frontend creates a server wallet and asks the user to grant a USDC spend permission to its smart account.
3. The user pastes a CV or describes their background in chat.
4. GPT-4o-mini generates 3 to 5 targeted search queries through the `search_jobs` tool.
5. On the first search in a browser session, the frontend prepares spend calls for the full remaining daily allowance.
6. The backend executes the spend permission, transfers the funded USDC from the smart account to the server wallet EOA, and uses that EOA to pay Exa through x402.
7. The app returns deduplicated job listings into the chat interface.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Required values:

- `CDP_API_KEY_ID`
- `CDP_API_KEY_SECRET`
- `CDP_WALLET_SECRET`
- `OPENAI_API_KEY`
- `PAYMASTER_URL`

Optional values:

- `SESSION_SECRET` for a production-ready session implementation

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Environment

```env
# CDP SDK Configuration
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Base Network Configuration
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Paymaster
PAYMASTER_URL=paymaster_url

# Session Secret (optional - only needed for production JWT signing)
# SESSION_SECRET=your-random-session-secret-here
```

## Example Prompts

- `I'm a frontend engineer with 5 years of React and TypeScript experience looking for remote roles.`
- `Here is my CV. I want staff-level backend roles in fintech in New York or remote.`
- `Refine the search for early-stage startups and companies hiring in Europe.`

## API Routes

- `GET/POST /api/auth/verify` for SIWE nonce creation and signature verification
- `GET/POST /api/wallet/create` for per-user server wallet creation and lookup
- `POST /api/chat` for GPT-driven chat responses and tool calls
- `POST /api/search` for spend execution, wallet funding, and Exa/x402 job searches

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS
- Base Account SDK and spend permissions
- Coinbase Developer Platform server wallets and smart accounts
- OpenAI GPT-4o-mini
- Exa search API over x402
- viem for Base-compatible signing and contract interactions

## Notes

- The first search in a browser session funds the server wallet EOA with the full remaining daily spend amount.
- Subsequent searches reuse that funded balance and do not re-execute the spend permission until a new session is started.
- If the server restarts, users may need to recreate their server wallet and repeat the spend-permission setup.

## License

MIT License - see LICENSE file for details.
