import type { Metadata } from 'next'
import './globals.css'
import './styles/globals.css'
import { LocaleProvider } from '@/lib/LocaleContext'
import { LocaleProvider as ContextLocaleProvider } from '@/context/LocaleContext'
import { SiteProvider } from '@/lib/SiteContext'

export const metadata: Metadata = {
  title: 'Korea Management System',
  description: 'Comprehensive management system for Korea operations',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <SiteProvider>
          <LocaleProvider>
            <ContextLocaleProvider>
              {children}
            </ContextLocaleProvider>
          </LocaleProvider>
        </SiteProvider>
      </body>
    </html>
  )
}
