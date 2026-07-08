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
  for_sale: 'bg-sage/90 text-white',
  for_rent: 'bg-navy/90 text-white',
  sold: 'bg-silver/80 text-white',
  rented: 'bg-silver/80 text-white',
}

function formatPrice(price: number, status: string) {
  const formatted = price.toLocaleString('th-TH')
  return status === 'for_rent' ? `฿${formatted}/เดือน` : `฿${formatted}`
}

export default function PropertyCard({ property }: { property: Property }) {
  const coverImage = property.images[0] ?? 'https://placehold.co/800x600?text=No+Image'

  return (
    <Link
      href={`/listings/${property.id}`}
      className="group block bg-white rounded-2xl shadow-[0_2px_20px_rgba(30,58,95,0.06)] hover:shadow-[0_8px_40px_rgba(30,58,95,0.14)] transition-all duration-300 overflow-hidden border border-light-stone hover:border-gold/40"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-light-stone">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className={`absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm ${STATUS_COLORS[property.status]}`}>
          {STATUS_LABELS[property.status]}
        </span>
        {property.is_featured && (
          <span className="absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full bg-gold text-navy-deep shadow-sm">
            ⭐ แนะนำ
          </span>
        )}
        {/* Favorite button */}
        <div className="absolute bottom-3 right-3">
          <FavoriteButton propertyId={property.id} />
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-xs tracking-wide uppercase text-gold font-semibold mb-1">{TYPE_LABELS[property.type]}</p>
        <h3 className="font-display text-lg text-navy line-clamp-2 mb-2 group-hover:text-gold transition-colors">
          {property.title}
        </h3>
        <p className="text-sm text-silver mb-3 flex items-center gap-1">
          <span>📍</span> {property.location}, {property.province}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-charcoal/70 mb-4">
          {property.bedrooms != null && <span>🛏 {property.bedrooms}</span>}
          {property.bathrooms != null && <span>🚿 {property.bathrooms}</span>}
          <span>📐 {property.area_sqm.toLocaleString()} ตร.ม.</span>
        </div>

        <div className="gold-rule mb-3" />

        <p className="font-price text-2xl font-semibold text-navy tracking-tight">
          {formatPrice(property.price, property.status)}
        </p>
      </div>
    </Link>
  )
}
