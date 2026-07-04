import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI, propertyFunctions, SYSTEM_PROMPT } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'
import type { PropertyFilters } from '@/types/property'

// Execute function calls from ChatGPT
async function executeFunction(name: string, args: Record<string, unknown>) {
  const supabase = await createClient()

  if (name === 'search_properties') {
    const filters = args as PropertyFilters
    let query = supabase.from('properties').select('id,title,type,status,price,area_sqm,bedrooms,location,province,images,is_featured').in('status', ['for_sale','for_rent'])

    if (filters.type)      query = query.eq('type', filters.type)
    if (filters.status)    query = query.eq('status', filters.status)
    if (filters.province)  query = query.ilike('province', `%${filters.province}%`)
    if (filters.min_price) query = query.gte('price', filters.min_price)
    if (filters.max_price) query = query.lte('price', filters.max_price)
    if (filters.bedrooms)  query = query.gte('bedrooms', filters.bedrooms)
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,location.ilike.%${filters.query}%`)
    }

    const { data } = await query.order('is_featured', { ascending: false }).limit(5)
    return { results: data ?? [], count: data?.length ?? 0 }
  }

  if (name === 'get_property_details') {
    const { data } = await supabase.from('properties').select('*').eq('id', args.id).single()
    return data ?? { error: 'ไม่พบทรัพย์' }
  }

  return { error: 'Unknown function' }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
  }

  const ai = getOpenAI()
  const completion = await ai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    tools: propertyFunctions,
    tool_choice: 'auto',
  })

  const message = completion.choices[0].message

  // Handle function calls
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolResults = await Promise.all(
      message.tool_calls.map(async (tc) => {
        if (tc.type !== 'function') {
          return { tool_call_id: tc.id, role: 'tool' as const, content: '{}' }
        }
        const result = await executeFunction(tc.function.name, JSON.parse(tc.function.arguments))
        return { tool_call_id: tc.id, role: 'tool' as const, content: JSON.stringify(result) }
      })
    )

    // Second pass — let GPT synthesize the tool results
    const finalCompletion = await ai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
        message,
        ...toolResults,
      ],
    })

    return NextResponse.json({ message: finalCompletion.choices[0].message.content })
  }

  return NextResponse.json({ message: message.content })
}
