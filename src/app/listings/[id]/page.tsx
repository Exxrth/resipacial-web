import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ContactForm from '@/components/properties/ContactForm'
import ImageGallery from '@/components/properties/ImageGallery'
import type { Metadata } from 'next'

const TYPE_LABELS: Record<string, string> = {
  house: 'บ้านเดี่ยว', condo: 'คอนโด', townhouse: 'ทาวน์เฮ้าส์',
  land: 'ที่ดิน', commercial: 'พาณิชย์',
}
const STATUS_LABELS: Record<string, string> = {
  for_sale: 'ขาย', for_rent: 'เช่า/เดือน', sold: 'ขายแล้ว', rented: 'เช่าแล้ว',
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('properties').select('title, description').eq('id', id).single()
  return { title: data?.title ?? 'ไม่พบทรัพย์', description: data?.description }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: property } = await supabase.from('properties').select('*').eq('id', id).single()

  if (!property) notFound()

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/listings" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← กลับไปรายการทรัพย์</Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Image Gallery — clickable lightbox */}
          <div className="relative">
            <span className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full pointer-events-none">
              {STATUS_LABELS[property.status]} · {TYPE_LABELS[property.type]}
            </span>
            <ImageGallery
              images={property.images.length > 0 ? property.images : ['https://placehold.co/1200x675?text=No+Image']}
              title={property.title}
            />
          </div>

          <div className="p-6 md:p-8">
            <div className="md:flex md:items-start md:justify-between gap-6">
              {/* Left */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <p className="text-gray-500 mb-6 flex items-center gap-1">📍 {property.location}, {property.province}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4 mb-6">
                  {property.bedrooms  != null && <Stat label="ห้องนอน"  value={`${property.bedrooms} ห้อง`}  icon="🛏" />}
                  {property.bathrooms != null && <Stat label="ห้องน้ำ"  value={`${property.bathrooms} ห้อง`} icon="🚿" />}
                  <Stat label="พื้นที่" value={`${property.area_sqm.toLocaleString()} ตร.ม.`} icon="📐" />
                  <Stat label="ประเภท" value={TYPE_LABELS[property.type]} icon="🏠" />
                </div>

                {/* Description */}
                <h2 className="font-semibold text-gray-900 mb-2">รายละเอียด</h2>
                <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">{property.description || 'ไม่มีคำอธิบาย'}</p>

                {/* Features */}
                {property.features.length > 0 && (
                  <>
                    <h2 className="font-semibold text-gray-900 mb-3">สิ่งอำนวยความสะดวก</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {property.features.map((f: string) => (
                        <span key={f} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">✓ {f}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right — Price + Contact */}
              <div className="md:w-72 bg-blue-50 rounded-xl p-6 flex-shrink-0 mt-6 md:mt-0">
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  ฿{property.price.toLocaleString('th-TH')}
                  {property.status === 'for_rent' && <span className="text-sm font-normal text-gray-500">/เดือน</span>}
                </p>
                <p className="text-sm text-gray-500 mb-6">{STATUS_LABELS[property.status]}</p>

                <div className="space-y-3">
                  <p className="font-semibold text-gray-900">{property.contact_name}</p>
                  <a href={`tel:${property.contact_phone}`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors justify-center">
                    📞 {property.contact_phone}
                  </a>
                  {property.contact_email && (
                    <a href={`mailto:${property.contact_email}`}
                      className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors justify-center">
                      ✉️ ส่งอีเมล
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">📍 ตำแหน่งที่ตั้ง</h2>
              <div className="rounded-xl overflow-hidden border border-gray-100 aspect-[16/7]">
                <iframe
                  title="ตำแหน่งทรัพย์"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${property.location}, ${property.province}, ประเทศไทย`)}&output=embed&z=15`}
                  className="w-full h-full"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                📍 {property.location}, {property.province}
              </p>
            </div>

            {/* Contact Form — full width below columns */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <ContactForm propertyId={property.id} contactName={property.contact_name} />
            </div>

          </div>
        </div>
      </main>
    </>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="font-semibold text-gray-900 text-sm">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
