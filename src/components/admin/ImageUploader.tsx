'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    setError('')
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} ไม่ใช่ไฟล์รูปภาพค่ะ`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} ขนาดเกิน 5MB ค่ะ`)
        continue
      }

      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(`อัปโหลด ${file.name} ไม่สำเร็จ: ${uploadError.message}`)
        continue
      }

      const { data } = supabase.storage.from('property-images').getPublicUrl(filename)
      newUrls.push(data.publicUrl)
    }

    if (newUrls.length > 0) onChange([...value, ...newUrls])
    setUploading(false)
  }

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files) }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-500 text-sm">กำลังอัปโหลด...</p>
          </div>
        ) : (
          <>
            <p className="text-4xl mb-2">📷</p>
            <p className="text-sm font-medium text-gray-600">คลิกหรือลากรูปมาวางที่นี่</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF — สูงสุด 5MB ต่อรูป | อัปโหลดได้หลายรูปพร้อมกัน</p>
          </>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Preview grid */}
      {value.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">รูปแรก = cover image · hover เพื่อลบ</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {value.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <Image src={url} alt={`รูป ${i + 1}`} fill className="object-cover" sizes="120px" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                    cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  title="ลบรูปนี้"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
