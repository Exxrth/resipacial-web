'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import type { Property, PropertyInsert } from '@/types/property'
import ImageUploader from './ImageUploader'

// Leaflet uses `window` — load client-side only
const AdminMapPicker = dynamic(() => import('./AdminMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl bg-gray-100 flex items-center justify-center" style={{ height: 340 }}>
      <p className="text-gray-400 text-sm">กำลังโหลดแผนที่...</p>
    </div>
  ),
})

const EMPTY: PropertyInsert = {
  title: '', description: '', type: 'house', status: 'for_sale',
  price: 0, area_sqm: 0, bedrooms: null, bathrooms: null,
  location: '', province: '', latitude: null, longitude: null,
  images: [], features: [], contact_name: '', contact_phone: '',
  contact_email: null, is_featured: false,
}

export default function PropertyForm({ property }: { property?: Property }) {
  const isEdit = !!property
  const [form, setForm] = useState<PropertyInsert>(property ?? EMPTY)
  const [featuresInput, setFeaturesInput] = useState(property?.features.join('\n') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Address geocoding state
  const [addressSearch, setAddressSearch] = useState('')
  const [geoLoading, setGeoLoading]       = useState(false)
  const [geoMsg, setGeoMsg]               = useState('')
  const router = useRouter()

  function set<K extends keyof PropertyInsert>(key: K, value: PropertyInsert[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function geocodeAddress() {
    if (!addressSearch.trim()) return
    setGeoLoading(true)
    setGeoMsg('')
    try {
      const key = process.env.NEXT_PUBLIC_LONGDO_KEY ?? ''
      const q   = encodeURIComponent(addressSearch)
      const res  = await fetch(
        `https://search.longdo.com/mapsearch/json/search?keyword=${q}&key=${key}&limit=5`
      )
      const data = await res.json()
      const results = data.data ?? []   // Longdo API uses 'data', not 'result'
      if (results.length > 0) {
        const best = results[0]
        set('latitude',  parseFloat(best.lat))
        set('longitude', parseFloat(best.lon))
        const name = best.name ?? best.address ?? 'พบตำแหน่ง'
        setGeoMsg(`✅ พบพิกัด: ${name}`)
      } else {
        setGeoMsg('❌ ไม่พบพิกัด — ลองพิมพ์ที่อยู่ให้ละเอียดขึ้นค่ะ')
      }
    } catch {
      setGeoMsg('❌ เกิดข้อผิดพลาดค่ะ — ลองใหม่อีกครั้ง')
    }
    setGeoLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...form,
      features: featuresInput.split('\n').map(s => s.trim()).filter(Boolean),
    }

    const url = isEdit ? `/api/properties/${property.id}` : '/api/properties'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'เกิดข้อผิดพลาดค่ะ')
      setLoading(false)
      return
    }

    router.push('/admin/listings')
    router.refresh()
  }

  const field = 'border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300'
  const label = 'text-sm font-medium text-gray-700 block mb-1'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 max-w-3xl">
      {/* Basic info */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-4">ข้อมูลทั่วไป</h2>
        <div className="space-y-4">
          <div>
            <label className={label}>ชื่อ *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required className={field} placeholder="เช่น บ้านเดี่ยว 3 ห้องนอน ลาดพร้าว" />
          </div>
          <div>
            <label className={label}>รายละเอียด</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className={field} placeholder="คำอธิบายทรัพย์..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>ประเภท *</label>
              <select value={form.type} onChange={e => set('type', e.target.value as PropertyInsert['type'])} className={field}>
                <option value="house">บ้านเดี่ยว</option>
                <option value="condo">คอนโด</option>
                <option value="townhouse">ทาวน์เฮ้าส์</option>
                <option value="land">ที่ดิน</option>
                <option value="commercial">พาณิชย์</option>
              </select>
            </div>
            <div>
              <label className={label}>สถานะ *</label>
              <select value={form.status} onChange={e => set('status', e.target.value as PropertyInsert['status'])} className={field}>
                <option value="for_sale">ขาย</option>
                <option value="for_rent">เช่า</option>
                <option value="sold">ขายแล้ว</option>
                <option value="rented">เช่าแล้ว</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Price & Size */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-4">ราคาและขนาด</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>ราคา (บาท) *</label>
            <input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} required min={0} className={field} />
          </div>
          <div>
            <label className={label}>พื้นที่ (ตร.ม.) *</label>
            <input type="number" value={form.area_sqm} onChange={e => set('area_sqm', Number(e.target.value))} required min={0} className={field} />
          </div>
          <div>
            <label className={label}>ห้องนอน</label>
            <input type="number" value={form.bedrooms ?? ''} onChange={e => set('bedrooms', e.target.value ? Number(e.target.value) : null)} min={0} className={field} />
          </div>
          <div>
            <label className={label}>ห้องน้ำ</label>
            <input type="number" value={form.bathrooms ?? ''} onChange={e => set('bathrooms', e.target.value ? Number(e.target.value) : null)} min={0} className={field} />
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-4">ที่ตั้ง</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={label}>ย่าน/พื้นที่ *</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} required className={field} placeholder="เช่น อโศก, บางนา" />
          </div>
          <div>
            <label className={label}>จังหวัด *</label>
            <input value={form.province} onChange={e => set('province', e.target.value)} required className={field} placeholder="เช่น กรุงเทพมหานคร" />
          </div>
        </div>

        {/* Address geocoding */}
        <div className="bg-blue-50 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">📍 พิกัดบนแผนที่ (สำหรับ Map View)</p>

          {/* Auto-search */}
          <div>
            <label className={label}>ค้นหาพิกัดจากที่อยู่ (อัตโนมัติ)</label>
            <div className="flex gap-2">
              <input
                value={addressSearch}
                onChange={e => setAddressSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), geocodeAddress())}
                className={`flex-1 ${field}`}
                placeholder="เช่น ถนนสุขุมวิท 21 กรุงเทพมหานคร"
              />
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={geoLoading || !addressSearch.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {geoLoading ? '⌛ ค้นหา...' : '🔍 ค้นหา'}
              </button>
            </div>
            {geoMsg && <p className="text-xs mt-1.5 text-gray-600">{geoMsg}</p>}
          </div>

          {/* Manual lat/lng inputs */}
          <div>
            <label className={label}>หรือใส่พิกัดเอง (Manual)</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="any"
                value={form.latitude ?? ''}
                onChange={e => set('latitude', e.target.value ? Number(e.target.value) : null)}
                className={field} placeholder="Latitude เช่น 13.7367" />
              <input type="number" step="any"
                value={form.longitude ?? ''}
                onChange={e => set('longitude', e.target.value ? Number(e.target.value) : null)}
                className={field} placeholder="Longitude เช่น 100.5231" />
            </div>
          </div>

          {/* Interactive map picker — click or drag to pin */}
          <div>
            <label className={label}>หรือปักหมุดบนแผนที่</label>
            <AdminMapPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={(lat, lng) => {
                set('latitude',  lat)
                set('longitude', lng)
              }}
            />
          </div>

          <p className="text-xs text-gray-400">
            💡 ค้นหาที่อยู่ด้านบน → แผนที่จะนำทางให้ → คลิกหรือลากหมุดเพื่อปรับตำแหน่งค่ะ
          </p>
        </div>
      </section>

      {/* Images & Features */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-4">รูปภาพและสิ่งอำนวยความสะดวก</h2>
        <div className="space-y-4">
          <div>
            <label className={label}>รูปภาพ</label>
            <ImageUploader
              value={form.images}
              onChange={(urls) => set('images', urls)}
            />
          </div>
          <div>
            <label className={label}>สิ่งอำนวยความสะดวก (1 รายการต่อบรรทัด)</label>
            <textarea value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} rows={3} className={field} placeholder="ที่จอดรถ&#10;สระว่ายน้ำ&#10;ฟิตเนส" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-4">ข้อมูลติดต่อ</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>ชื่อผู้ติดต่อ *</label>
            <input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} required className={field} />
          </div>
          <div>
            <label className={label}>เบอร์โทร *</label>
            <input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} required className={field} placeholder="08X-XXX-XXXX" />
          </div>
          <div>
            <label className={label}>อีเมล (ถ้ามี)</label>
            <input type="email" value={form.contact_email ?? ''} onChange={e => set('contact_email', e.target.value || null)} className={field} />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 text-blue-600" />
            <label htmlFor="is_featured" className="text-sm text-gray-700">⭐ แสดงเป็นทรัพย์แนะนำ</label>
          </div>
        </div>
      </section>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-xl text-sm transition-colors">
          {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มทรัพย์'}
        </button>
        <button type="button" onClick={() => router.back()} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-xl text-sm transition-colors">
          ยกเลิก
        </button>
      </div>
    </form>
  )
}
