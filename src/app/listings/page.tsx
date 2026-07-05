import { createClient } from '@/lib/supabase/server'
import PropertyCard from '@/components/properties/PropertyCard'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { PropertyFilters } from '@/types/property'

const PAGE_SIZE = 12

function parseFilters(params: Record<string, string | string[] | undefined>): PropertyFilters & { page: number } {
  return {
    query:    typeof params.query    === 'string' ? params.query    : undefined,
    type:     typeof params.type     === 'string' ? (params.type     as PropertyFilters['type'])   : undefined,
    status:   typeof params.status   === 'string' ? (params.status   as PropertyFilters['status']) : undefined,
    province: typeof params.province === 'string' ? params.province : undefined,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    bedrooms:  params.bedrooms  ? Number(params.bedrooms)  : undefined,
    page: params.page ? Math.max(1, Number(params.page)) : 1,
  }
}

/** Build a URL preserving all current filters but overriding page */
function pageUrl(params: Record<string, string | string[] | undefined>, page: number) {
  const q = new URLSearchParams()
  const keys = ['query', 'type', 'status', 'province', 'min_price', 'max_price', 'bedrooms']
  for (const k of keys) {
    const v = params[k]
    if (v && typeof v === 'string') q.set(k, v)
  }
  q.set('page', String(page))
  return `/listings?${q.toString()}`
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const filters = parseFilters(params)
  const { page } = filters
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const supabase = await createClient()

  let countQuery = supabase.from('properties').select('id', { count: 'exact', head: true }).in('status', ['for_sale', 'for_rent'])
  let dataQuery  = supabase.from('properties').select('*').in('status', ['for_sale', 'for_rent'])

  // Apply same filters to both queries
  for (const q of [countQuery, dataQuery] as any[]) {
    if (filters.type)      q.eq('type', filters.type)
    if (filters.status)    q.eq('status', filters.status)
    if (filters.province)  q.ilike('province', `%${filters.province}%`)
    if (filters.min_price) q.gte('price', filters.min_price)
    if (filters.max_price) q.lte('price', filters.max_price)
    if (filters.bedrooms)  q.gte('bedrooms', filters.bedrooms)
    if (filters.query)     q.or(`title.ilike.%${filters.query}%,location.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
  }

  dataQuery = dataQuery.order('is_featured', { ascending: false }).order('created_at', { ascending: false }).range(from, to)

  const [{ count }, { data: properties, error }] = await Promise.all([countQuery, dataQuery])

  const totalCount  = count ?? 0
  const totalPages  = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const showingFrom = totalCount === 0 ? 0 : from + 1
  const showingTo   = Math.min(to + 1, totalCount)

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

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            ทรัพย์ทั้งหมด{' '}
            <span className="text-blue-600">({totalCount.toLocaleString()})</span>
          </h1>
          {totalCount > 0 && (
            <p className="text-sm text-gray-400">
              แสดง {showingFrom}–{showingTo} จาก {totalCount.toLocaleString()} รายการ
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">เกิดข้อผิดพลาด: {error.message}</p>}

        {properties && properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {currentPage > 1 && (
                  <Link
                    href={pageUrl(params, currentPage - 1)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    ← ก่อนหน้า
                  </Link>
                )}

                {/* Page numbers — show max 5 around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, i) =>
                    item === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                    ) : (
                      <Link
                        key={item}
                        href={pageUrl(params, item as number)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                          ${item === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {item}
                      </Link>
                    )
                  )}

                {currentPage < totalPages && (
                  <Link
                    href={pageUrl(params, currentPage + 1)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    ถัดไป →
                  </Link>
                )}
              </div>
            )}
          </>
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
