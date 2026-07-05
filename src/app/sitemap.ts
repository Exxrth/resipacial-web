import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://resipacial.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .in('status', ['for_sale', 'for_rent'])

  const propertyRoutes: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${BASE_URL}/listings/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: BASE_URL,            lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...propertyRoutes,
  ]
}
