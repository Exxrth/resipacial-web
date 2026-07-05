'use client'

import { useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Props {
  lat: number | null
  lng: number | null
  onChange: (lat: number | null, lng: number | null) => void
}

function ClickHandler({ onChange }: { onChange: Props['onChange'] }) {
  useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng) } })
  return null
}

function PanTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMapEvents({})
  useEffect(() => { map.setView([lat, lng], Math.max(map.getZoom(), 15)) }, [lat, lng, map])
  return null
}

const THAILAND: [number, number] = [13.736717, 100.523186]

export default function AdminMapPicker({ lat, lng, onChange }: Props) {
  const hasPin = lat != null && lng != null

  const onDragEnd = useCallback((e: any) => {
    const pos = e.target.getLatLng()
    onChange(pos.lat, pos.lng)
  }, [onChange])

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-blue-200" style={{ height: 340 }}>
        <MapContainer
          center={hasPin ? [lat, lng] : THAILAND}
          zoom={hasPin ? 14 : 6}
          className="w-full h-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          {hasPin && <PanTo lat={lat} lng={lng} />}
          {hasPin && (
            <Marker
              position={[lat, lng]}
              draggable
              eventHandlers={{ dragend: onDragEnd }}
            />
          )}
        </MapContainer>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {hasPin ? '📍 ลากหมุดหรือคลิกเพื่อย้าย' : '🖱️ คลิกบนแผนที่เพื่อปักหมุด'}
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
