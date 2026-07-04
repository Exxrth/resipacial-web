import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PropertyForm from '@/components/admin/PropertyForm'
import Link from 'next/link'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: property } = await supabase.from('properties').select('*').eq('id', id).single()
  if (!property) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/listings" className="text-sm text-gray-400 hover:text-gray-600">← กลับ</Link>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขทรัพย์</h1>
      </div>
      <PropertyForm property={property} />
    </div>
  )
}
