'use client'

import { useFavorites } from '@/hooks/useFavorites'

export default function FavoriteButton({
  propertyId,
  className = '',
}: {
  propertyId: string
  className?: string
}) {
  const { toggle, isFavorite } = useFavorites()
  const saved = isFavorite(propertyId)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault() // ไม่ให้ navigate เมื่ออยู่ใน <Link>
        e.stopPropagation()
        toggle(propertyId)
      }}
      aria-label={saved ? 'ลบออกจากรายการโปรด' : 'บันทึกรายการโปรด'}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all
        ${saved
          ? 'bg-red-500 text-white shadow-md scale-110'
          : 'bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white shadow'
        } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
