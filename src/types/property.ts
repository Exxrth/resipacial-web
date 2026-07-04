export type PropertyType = 'house' | 'condo' | 'townhouse' | 'land' | 'commercial'
export type PropertyStatus = 'for_sale' | 'for_rent' | 'sold' | 'rented'

export interface Property {
  id: string
  title: string
  description: string
  type: PropertyType
  status: PropertyStatus
  price: number
  area_sqm: number
  bedrooms: number | null
  bathrooms: number | null
  location: string
  province: string
  latitude: number | null
  longitude: number | null
  images: string[]
  features: string[]
  contact_name: string
  contact_phone: string
  contact_email: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type PropertyInsert = Omit<Property, 'id' | 'created_at' | 'updated_at'>
export type PropertyUpdate = Partial<PropertyInsert>

export interface PropertyFilters {
  type?: PropertyType
  status?: PropertyStatus
  province?: string
  min_price?: number
  max_price?: number
  min_area?: number
  max_area?: number
  bedrooms?: number
  query?: string
}
