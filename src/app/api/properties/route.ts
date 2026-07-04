import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PropertyFilters } from '@/types/property'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filters: PropertyFilters = {
    query:    searchParams.get('query')    ?? undefined,
    type:     (searchParams.get('type')    ?? undefined) as PropertyFilters['type'],
    status:   (searchParams.get('status')  ?? undefined) as PropertyFilters['status'],
    province: searchParams.get('province') ?? undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    bedrooms:  searchParams.get('bedrooms')  ? Number(searchParams.get('bedrooms'))  : undefined,
  }

  const supabase = await createClient()
  let query = supabase.from('properties').select('*')

  if (filters.type)      query = query.eq('type', filters.type)
  if (filters.status)    query = query.eq('status', filters.status)
  if (filters.province)  query = query.ilike('province', `%${filters.province}%`)
  if (filters.min_price) query = query.gte('price', filters.min_price)
  if (filters.max_price) query = query.lte('price', filters.max_price)
  if (filters.bedrooms)  query = query.gte('bedrooms', filters.bedrooms)
  if (filters.query) {
    query = query.or(
      `title.ilike.%${filters.query}%,location.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
    )
  }

  const { data, error } = await query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { data, error } = await supabase.from('properties').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
