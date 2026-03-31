import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { PostHogProvider } from '@/components/layout/PostHogProvider'

export const metadata: Metadata = {
  title: 'DTU MogWars — The Ultimate Personality Arena',
  description: 'Battle for the top spot at Delhi Technological University. Submit your profile, vote on others, rise through the ranks.',
  keywords: ['DTU', 'Delhi Technological University', 'MogWars', 'personality', 'leaderboard'],
  openGraph: {
    title: 'DTU MogWars',
    description: 'The Ultimate Personality Arena at DTU',
    type: 'website',
    url: 'https://dtumogwars.vercel.app',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <PostHogProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a28',
                color: '#e8e8f5',
                border: '1px solid #252535',
                borderRadius: '12px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#00f5ff', secondary: '#050508' },
              },
              error: {
                iconTheme: { primary: '#ff006e', secondary: '#050508' },
              },
            }}
          />
        </PostHogProvider>
      </body>
    </html>
  )
}
