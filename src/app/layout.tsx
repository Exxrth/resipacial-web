import type { Metadata } from 'next'
import { Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google'
import ClientLayout from '@/components/ClientLayout'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Resipecial — Take a rest with your special place', template: '%s | Resipecial' },
  description: 'Resipecial — Take a rest with your special place. ค้นหาบ้าน คอนโด ที่ดิน อสังหาริมทรัพย์คุณภาพทั่วประเทศไทย',
  keywords: ['อสังหาริมทรัพย์', 'บ้าน', 'คอนโด', 'ที่ดิน', 'ซื้อบ้าน', 'เช่าบ้าน', 'Resipecial'],
  openGraph: {
    siteName: 'Resipecial',
    title: 'Resipecial — 𝗧𝗮𝗸𝗲 𝗮 𝗿𝗲𝘀𝘁 𝘄𝗶𝘁𝗵 𝘆𝗼𝘂𝗿 𝘀𝗽𝗲𝗰𝗶𝗮𝗹 𝗽𝗹𝗮𝗰𝗲',
    description: '𝗧𝗮𝗸𝗲 𝗮 𝗿𝗲𝘀𝘁 𝘄𝗶𝘁𝗵 𝘆𝗼𝘂𝗿 𝘀𝗽𝗲𝗰𝗶𝗮𝗹 𝗽𝗹𝗮𝗰𝗲 — ค้นหาบ้าน คอนโด ที่ดิน ทั่วประเทศไทย',
    type: 'website',
    locale: 'th_TH',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-soft-white text-charcoal">
        {children}
        <ClientLayout />
      </body>
    </html>
  )
}
