'use client'

import Link from 'next/link'
import { useFavorites } from '@/hooks/useFavorites'

export default function FavoritesNavLink() {
  const { count } = useFavorites()
  return (
    <Link href="/favorites" className="relative hover:text-gold transition-colors flex items-center gap-1">
      <span>❤️ โปรด</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-3 bg-gold text-navy text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
