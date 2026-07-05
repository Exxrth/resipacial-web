'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFavorites } from '@/hooks/useFavorites'
import PropertyCard from '@/components/properties/PropertyCard'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { Property } from '@/types/property'

export default function FavoritesPage() {
  const { ids } = useFavorites()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); setProperties([]); return }
    const supabase = createClient()
    supabase
      .from('properties')
      .select('*')
      .in('id', ids)
      .then(({ data }) => {
        setProperties(data ?? [])
        setLoading(false)
      })
  }, [ids])

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">❤️ รายการโปรด</h1>
          {ids.length > 0 && (
            <span className="bg-red-100 text-red-600 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {ids.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4 animate-pulse">❤️</p>
            <p>กำลังโหลด...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏚</p>
            <p className="text-lg mb-2">ยังไม่มีรายการโปรดค่ะ</p>
            <p className="text-sm mb-6">กด ❤️ บนการ์ดทรัพย์เพื่อบันทึกไว้ที่นี่</p>
            <Link
              href="/listings"
              className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              ดูทรัพย์ทั้งหมด
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
