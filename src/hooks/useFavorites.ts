'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'resipacial_favorites'

function loadIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setIds(loadIds())
  }, [])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids])

  return { ids, count: ids.length, toggle, isFavorite }
}
