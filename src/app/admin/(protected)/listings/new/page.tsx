import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PropertyForm from '@/components/admin/PropertyForm'
import Link from 'next/link'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/listings" className="text-sm text-gray-400 hover:text-gray-600">← กลับ</Link>
        <h1 className="text-2xl font-bold text-gray-900">เพิ่มทรัพย์ใหม่</h1>
      </div>
      <PropertyForm />
    </div>
  )
}
