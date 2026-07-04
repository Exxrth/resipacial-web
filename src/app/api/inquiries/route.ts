import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { property_id, name, phone, email, message } = body

  if (!property_id || !name || !phone || !message) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบค่ะ' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inquiries')
    .insert({ property_id, name, phone, email, message })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
