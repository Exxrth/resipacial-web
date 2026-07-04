'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('ต้องการลบทรัพย์นี้ใช่ไหมคะ?')) return
    setLoading(true)
    await fetch(`/api/properties/${id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 text-xs disabled:opacity-40"
    >
      {loading ? '...' : 'ลบ'}
    </button>
  )
}
