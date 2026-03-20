import type { Metadata } from 'next'
import './globals.css'
import './styles/globals.css'
import { LocaleProvider } from '@/lib/LocaleContext'
import { LocaleProvider as ContextLocaleProvider } from '@/context/LocaleContext'
import { SiteProvider } from '@/lib/SiteContext'

export const metadata: Metadata = {
  title: 'K Energy Save | ระบบบริหารจัดการ',
  description: 'ระบบบริหารจัดการครบวงจร - บริษัท เค เอ็นเนอร์จี เซฟ จำกัด | K Energy Save Co., Ltd.',
  icons: {
    icon: [
      { url: '/k-energy-save-logo.png', sizes: 'any' },
      { url: '/k-energy-save-logo.jpg', type: 'image/jpeg' }
    ],
    apple: '/k-energy-save-logo.png',
  },
  openGraph: {
    title: 'K Energy Save | ระบบบริหารจัดการ',
    description: 'ระบบบริหารจัดการครบวงจร - บริษัท เค เอ็นเนอร์จี เซฟ จำกัด',
    images: ['/k-energy-save-logo.jpg'],
    siteName: 'K Energy Save',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K Energy Save | ระบบบริหารจัดการ',
    description: 'ระบบบริหารจัดการครบวงจร - บริษัท เค เอ็นเนอร์จี เซฟ จำกัด',
    images: ['/k-energy-save-logo.jpg'],
  },
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
