import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: stats } = await supabase.from('properties').select('status')
  const total = stats?.length ?? 0
  const forSale = stats?.filter(p => p.status === 'for_sale').length ?? 0
  const forRent = stats?.filter(p => p.status === 'for_rent').length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/admin/listings/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + เพิ่มทรัพย์ใหม่
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'ทรัพย์ทั้งหมด', value: total, icon: '🏠', color: 'blue' },
          { label: 'ขาย', value: forSale, icon: '💰', color: 'green' },
          { label: 'เช่า', value: forRent, icon: '🔑', color: 'purple' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-3xl mb-2">{s.icon}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm">ไปที่ <Link href="/admin/listings" className="text-blue-600 hover:underline">จัดการทรัพย์</Link> เพื่อเพิ่ม แก้ไข หรือลบรายการค่ะ</p>
      </div>
    </div>
  )
}
