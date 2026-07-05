import Link from 'next/link'
import Image from 'next/image'
import type { Property } from '@/types/property'
import FavoriteButton from './FavoriteButton'

const TYPE_LABELS: Record<string, string> = {
  house: 'บ้านเดี่ยว', condo: 'คอนโด', townhouse: 'ทาวน์เฮ้าส์',
  land: 'ที่ดิน', commercial: 'พาณิชย์',
}
const STATUS_LABELS: Record<string, string> = {
  for_sale: 'ขาย', for_rent: 'เช่า', sold: 'ขายแล้ว', rented: 'เช่าแล้ว',
}
const STATUS_COLORS: Record<string, string> = {
  for_sale: 'bg-green-100 text-green-700',
  for_rent: 'bg-blue-100 text-blue-700',
  sold: 'bg-gray-100 text-gray-500',
  rented: 'bg-gray-100 text-gray-500',
}

function formatPrice(price: number, status: string) {
  const formatted = price.toLocaleString('th-TH')
  return status === 'for_rent' ? `฿${formatted}/เดือน` : `฿${formatted}`
}

export default function PropertyCard({ property }: { property: Property }) {
  const coverImage = property.images[0] ?? 'https://placehold.co/800x600?text=No+Image'

  return (
    <Link href={`/listings/${property.id}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[property.status]}`}>
          {STATUS_LABELS[property.status]}
        </span>
        {property.is_featured && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
            ⭐ แนะนำ
          </span>
        )}
        {/* Favorite button */}
        <div className="absolute bottom-3 right-3">
          <FavoriteButton propertyId={property.id} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-blue-600 font-medium mb-1">{TYPE_LABELS[property.type]}</p>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
          <span>📍</span> {property.location}, {property.province}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          {property.bedrooms != null && <span>🛏 {property.bedrooms}</span>}
          {property.bathrooms != null && <span>🚿 {property.bathrooms}</span>}
          <span>📐 {property.area_sqm.toLocaleString()} ตร.ม.</span>
        </div>

        <p className="text-lg font-bold text-blue-600">
          {formatPrice(property.price, property.status)}
        </p>
      </div>
    </Link>
  )
}
