import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://base-agent-spend-permissions.vercel.app'),
  title: 'Job Search Agent',
  description: 'AI-powered job search agent using Base Account spend permissions and Exa search over x402 on Base',
  keywords: ['Base', 'AI Agent', 'Job Search', 'Spend Permissions', 'Exa', 'x402', 'OpenAI', 'Web3'],
  authors: [{ name: 'Base Agent Team' }],
  creator: 'Base Agent Team',
  publisher: 'Base Agent Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://base-agent-spend-permissions.vercel.app',
    title: 'Job Search Agent',
    description: 'Find jobs with AI-powered search funded by Base Account spend permissions and x402 payments.',
    siteName: 'Job Search Agent',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Job Search Agent',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Search Agent',
    description: 'Find jobs with AI-powered search funded by Base Account spend permissions and x402 payments.',
    images: ['/og-image.svg'],
    creator: '@base',
    site: '@base',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  category: 'productivity',
  classification: 'AI Job Search Assistant',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0052FF" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
