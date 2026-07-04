import { createClient } from '@/lib/supabase/server'
import PropertyCard from '@/components/properties/PropertyCard'
import Navbar from '@/components/Navbar'
import type { PropertyFilters } from '@/types/property'

// Parse searchParams into typed filters
function parseFilters(params: Record<string, string | string[] | undefined>): PropertyFilters {
  return {
    query:    typeof params.query    === 'string' ? params.query    : undefined,
    type:     typeof params.type     === 'string' ? (params.type     as PropertyFilters['type'])   : undefined,
    status:   typeof params.status   === 'string' ? (params.status   as PropertyFilters['status']) : undefined,
    province: typeof params.province === 'string' ? params.province : undefined,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    bedrooms:  params.bedrooms  ? Number(params.bedrooms)  : undefined,
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const filters = parseFilters(params)
  const supabase = await createClient()

  let query = supabase.from('properties').select('*').in('status', ['for_sale', 'for_rent'])

  if (filters.type)     query = query.eq('type', filters.type)
  if (filters.status)   query = query.eq('status', filters.status)
  if (filters.province) query = query.ilike('province', `%${filters.province}%`)
  if (filters.min_price) query = query.gte('price', filters.min_price)
  if (filters.max_price) query = query.lte('price', filters.max_price)
  if (filters.bedrooms)  query = query.gte('bedrooms', filters.bedrooms)
  if (filters.query) {
    query = query.or(
      `title.ilike.%${filters.query}%,location.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
    )
  }

  const { data: properties, error } = await query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <form method="get" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <input
              name="query"
              defaultValue={filters.query ?? ''}
              placeholder="ค้นหา..."
              className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <select name="type" defaultValue={filters.type ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">ทุกประเภท</option>
              <option value="house">บ้านเดี่ยว</option>
              <option value="condo">คอนโด</option>
              <option value="townhouse">ทาวน์เฮ้าส์</option>
              <option value="land">ที่ดิน</option>
              <option value="commercial">พาณิชย์</option>
            </select>
            <select name="status" defaultValue={filters.status ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">ซื้อ/เช่า</option>
              <option value="for_sale">ขาย</option>
              <option value="for_rent">เช่า</option>
            </select>
            <input name="province" defaultValue={filters.province ?? ''} placeholder="จังหวัด" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
              กรอง
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            ทรัพย์ทั้งหมด{' '}
            <span className="text-blue-600">({properties?.length ?? 0})</span>
          </h1>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">เกิดข้อผิดพลาด: {error.message}</p>}

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏚</p>
            <p>ไม่พบทรัพย์ที่ตรงกับเงื่อนไขค่ะ</p>
          </div>
        )}
      </main>
    </>
  )
}
