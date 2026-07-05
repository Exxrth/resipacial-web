'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix broken default marker icons in webpack/Next.js
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

/** Listens to map clicks → places/moves pin */
function ClickHandler({ onChange }: { onChange: Props['onChange'] }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/** Pans map to coordinates when they change externally (e.g. after geocoding) */
function PanTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMapEvents({})
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 14))
  }, [lat, lng, map])
  return null
}

const THAILAND_CENTER: [number, number] = [13.736717, 100.523186]

export default function AdminMapPicker({ lat, lng, onChange }: Props) {
  const hasPin = lat != null && lng != null

  return (
    <div className="space-y-2">
      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-blue-200" style={{ height: 340 }}>
        <MapContainer
          center={hasPin ? [lat, lng] : THAILAND_CENTER}
          zoom={hasPin ? 14 : 6}
          className="w-full h-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Click to pin */}
          <ClickHandler onChange={onChange} />

          {/* Pan when coords come from geocoding */}
          {hasPin && <PanTo lat={lat} lng={lng} />}

          {/* Draggable marker */}
          {hasPin && (
            <Marker
              position={[lat, lng]}
              draggable
              eventHandlers={{
                dragend(e) {
                  const pos = (e.target as L.Marker).getLatLng()
                  onChange(pos.lat, pos.lng)
                },
              }}
            />
          )}
        </MapContainer>

        {/* Hint overlay */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {hasPin
              ? '📍 ลากหมุดหรือคลิกเพื่อย้ายตำแหน่ง'
              : '🖱️ คลิกบนแผนที่เพื่อปักหมุด'}
          </span>
        </div>
      </div>

      {/* Coordinates + clear button */}
      {hasPin && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>📍 {lat.toFixed(6)}, {lng.toFixed(6)}</span>
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="text-red-400 hover:text-red-600 underline"
          >
            ✕ ลบหมุด
          </button>
        </div>
      )}
    </div>
  )
}
