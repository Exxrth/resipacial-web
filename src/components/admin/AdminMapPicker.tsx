'use client'

import { useCallback, useRef, useEffect } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

interface Props {
  lat: number | null
  lng: number | null
  onChange: (lat: number | null, lng: number | null) => void
}

const THAILAND_CENTER = { lat: 13.736717, lng: 100.523186 }
const MAP_CONTAINER   = { width: '100%', height: '340px' }
const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
}

export default function AdminMapPicker({ lat, lng, onChange }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
    language: 'th',
    region: 'TH',
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const hasPin = lat != null && lng != null

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  // Pan + zoom when coordinates are set externally (e.g. after geocoding)
  useEffect(() => {
    if (mapRef.current && lat != null && lng != null) {
      mapRef.current.panTo({ lat, lng })
      mapRef.current.setZoom(15)
    }
  }, [lat, lng])

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) onChange(e.latLng.lat(), e.latLng.lng())
  }, [onChange])

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) onChange(e.latLng.lat(), e.latLng.lng())
  }, [onChange])

  if (loadError) return (
    <div className="rounded-xl bg-red-50 border border-red-200 flex items-center justify-center" style={{ height: 340 }}>
      <p className="text-red-500 text-sm">❌ โหลด Google Maps ไม่สำเร็จ — ตรวจสอบ API key ค่ะ</p>
    </div>
  )

  if (!isLoaded) return (
    <div className="rounded-xl bg-gray-100 flex items-center justify-center animate-pulse" style={{ height: 340 }}>
      <p className="text-gray-400 text-sm">กำลังโหลด Google Maps...</p>
    </div>
  )

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER}
          center={hasPin ? { lat, lng } : THAILAND_CENTER}
          zoom={hasPin ? 14 : 6}
          options={MAP_OPTIONS}
          onClick={onMapClick}
          onLoad={onMapLoad}
        >
          {hasPin && (
            <Marker
              position={{ lat, lng }}
              draggable
              onDragEnd={onMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full shadow">
            {hasPin ? '📍 ลากหมุดหรือคลิกเพื่อย้ายตำแหน่ง' : '🖱️ คลิกบนแผนที่เพื่อปักหมุด'}
          </span>
        </div>
      </div>

      {hasPin && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>📍 {lat.toFixed(6)}, {lng.toFixed(6)}</span>
          <button type="button" onClick={() => onChange(null, null)}
            className="text-red-400 hover:text-red-600 underline">
            ✕ ลบหมุด
          </button>
        </div>
      )}
    </div>
  )
}
