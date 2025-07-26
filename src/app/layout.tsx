import type { Metadata } from 'next'
// 1. Impor font Urbanist dari next/font/google
import { Urbanist } from 'next/font/google'
import './globals.css'

// 2. Konfigurasikan font yang ingin Anda gunakan
const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'], // Pilih weight yang Anda butuhkan
})

export const metadata: Metadata = {
  title: 'LearnMate',
  description: 'AI-Powered Learning Platform',
  icons: {
    icon: 'images/logo.ico',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // 3. Terapkan class font ke elemen html atau body
    <html lang="en">
      <body className={urbanist.className}>{children}</body>
    </html>
  )
}