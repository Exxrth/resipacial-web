import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteButton from '@/components/admin/DeleteButton'

const TYPE_LABELS: Record<string, string> = {
  house: 'บ้านเดี่ยว', condo: 'คอนโด', townhouse: 'ทาวน์เฮ้าส์',
  land: 'ที่ดิน', commercial: 'พาณิชย์',
}
const STATUS_LABELS: Record<string, string> = {
  for_sale: 'ขาย', for_rent: 'เช่า', sold: 'ขายแล้ว', rented: 'เช่าแล้ว',
}

export default async function AdminListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: properties } = await supabase
    .from('properties')
    .select('id,title,type,status,price,province,is_featured,created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">จัดการทรัพย์ ({properties?.length ?? 0})</h1>
        <Link href="/admin/listings/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + เพิ่มทรัพย์ใหม่
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">ชื่อ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">ประเภท</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">สถานะ</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">ราคา</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">จังหวัด</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">แนะนำ</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {properties?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">{TYPE_LABELS[p.type]}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'for_sale' ? 'bg-green-100 text-green-700' : p.status === 'for_rent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-900">฿{Number(p.price).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{p.province}</td>
                <td className="px-4 py-3 text-center">{p.is_featured ? '⭐' : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/listings/${p.id}`} className="text-blue-600 hover:underline text-xs">แก้ไข</Link>
                    <DeleteButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!properties || properties.length === 0) && (
          <p className="text-center text-gray-400 py-12">ยังไม่มีทรัพย์ค่ะ — <Link href="/admin/listings/new" className="text-blue-600 hover:underline">เพิ่มทรัพย์แรก</Link></p>
        )}
      </div>
    </div>
  )
}
