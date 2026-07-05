'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: Props) {
  const [main, setMain]       = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = useCallback(() =>
    setLightbox(i => (i != null ? (i - 1 + images.length) % images.length : null)), [images.length])
  const next = useCallback(() =>
    setLightbox(i => (i != null ? (i + 1) % images.length : null)), [images.length])

  useEffect(() => {
    if (lightbox == null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  const src = (i: number) => images[i] ?? 'https://placehold.co/1200x675?text=No+Image'

  return (
    <>
      {/* ── Main image ── */}
      <div
        className="relative aspect-[16/9] bg-gray-100 cursor-zoom-in overflow-hidden"
        onClick={() => setLightbox(main)}
        title="คลิกเพื่อดูรูปขยาย"
      >
        <Image src={src(main)} alt={title} fill className="object-cover" priority />
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
            🔍 {main + 1} / {images.length}
          </span>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setMain(i); setLightbox(i) }}
              className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gray-100 transition-all
                ${i === main ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-70 hover:opacity-100'}`}
            >
              <Image src={img} alt={`รูปที่ ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox overlay ── */}
      {lightbox != null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none z-10"
          >
            ✕
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightbox + 1} / {images.length}
          </span>

          {/* Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 text-white/70 hover:text-white text-4xl px-3 py-6 z-10"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full mx-16"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={src(lightbox)}
              alt={`${title} — รูปที่ ${lightbox + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 text-white/70 hover:text-white text-4xl px-3 py-6 z-10"
            >
              ›
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-full">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  className={`relative flex-shrink-0 w-14 h-10 rounded overflow-hidden transition-all
                    ${i === lightbox ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-80'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
