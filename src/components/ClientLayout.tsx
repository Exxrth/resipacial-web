'use client'

import { usePathname } from 'next/navigation'
import ChatWidget from './chat/ChatWidget'

export default function ClientLayout() {
  const pathname = usePathname()
  // ไม่แสดง ChatWidget บน admin pages
  if (pathname.startsWith('/admin')) return null
  return <ChatWidget />
}
