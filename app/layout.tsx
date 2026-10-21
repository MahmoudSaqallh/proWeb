import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { TransitionProvider } from '../components/PageTransition'
import { profile } from '../data/portfolio'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.intro,
}

export const viewport = { themeColor: '#0a0908' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  )
}
