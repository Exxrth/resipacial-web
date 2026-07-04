import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import ClientLayout from '@/components/ClientLayout'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { default: 'อสังหาริมทรัพย์', template: '%s | อสังหาริมทรัพย์' },
  description: 'ค้นหาบ้าน คอนโด ที่ดิน อสังหาริมทรัพย์ทั่วไทย',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
        <ClientLayout />
      </body>
    </html>
  )
}
