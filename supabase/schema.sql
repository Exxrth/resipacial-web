-- =====================================================
-- Real Estate Website — Supabase Schema
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- PROPERTIES TABLE
-- =====================================================
create table public.properties (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text not null default '',
  type        text not null check (type in ('house','condo','townhouse','land','commercial')),
  status      text not null check (status in ('for_sale','for_rent','sold','rented')) default 'for_sale',
  price       numeric(15,2) not null,
  area_sqm    numeric(10,2) not null,
  bedrooms    int,
  bathrooms   int,
  location    text not null,
  province    text not null,
  latitude    float,
  longitude   float,
  images      text[] not null default '{}',
  features    text[] not null default '{}',
  contact_name  text not null,
  contact_phone text not null,
  contact_email text,
  is_featured   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_updated_at
  before update on public.properties
  for each row execute function update_updated_at();

-- Indexes for common queries
create index idx_properties_type     on public.properties(type);
create index idx_properties_status   on public.properties(status);
create index idx_properties_province on public.properties(province);
create index idx_properties_price    on public.properties(price);
create index idx_properties_featured on public.properties(is_featured) where is_featured = true;

-- Full-text search index (Thai + English)
create index idx_properties_fts on public.properties
  using gin(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(location,'')));

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table public.properties enable row level security;

-- Public: read active listings only
create policy "Public can read properties"
  on public.properties for select
  using (status in ('for_sale', 'for_rent'));

-- Admin: full access (authenticated users)
create policy "Authenticated users have full access"
  on public.properties for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE BUCKET FOR IMAGES
-- =====================================================
insert into storage.buckets (id, name, public)
  values ('property-images', 'property-images', true)
  on conflict do nothing;

create policy "Public can view property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "Authenticated users can delete images"
  on storage.objects for delete
  using (bucket_id = 'property-images' and auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA
-- =====================================================
insert into public.properties
  (title, description, type, status, price, area_sqm, bedrooms, bathrooms, location, province, images, features, contact_name, contact_phone, is_featured)
values
  ('บ้านเดี่ยว 2 ชั้น สไตล์โมเดิร์น', 'บ้านเดี่ยวสวยงาม ทำเลดี ใกล้ทางด่วน', 'house', 'for_sale', 4500000, 180, 3, 2, 'ลาดพร้าว', 'กรุงเทพมหานคร', ARRAY['https://placehold.co/800x600?text=House'], ARRAY['ที่จอดรถ','สวน','ระบบรักษาความปลอดภัย'], 'สมชาย ใจดี', '081-234-5678', true),
  ('คอนโด 1 ห้องนอน ใจกลางเมือง', 'วิวสวย ชั้น 15 ใกล้ BTS อโศก', 'condo', 'for_sale', 3200000, 35, 1, 1, 'อโศก', 'กรุงเทพมหานคร', ARRAY['https://placehold.co/800x600?text=Condo'], ARRAY['ฟิตเนส','สระว่ายน้ำ','ที่จอดรถ'], 'มาลี สวยงาม', '089-876-5432', true),
  ('ทาวน์เฮ้าส์ 3 ชั้น หมู่บ้าน Perfect Place', 'ทาวน์เฮ้าส์ใหม่ 3 ชั้น ใกล้โรงเรียนนานาชาติ', 'townhouse', 'for_rent', 25000, 120, 3, 3, 'บางนา', 'กรุงเทพมหานคร', ARRAY['https://placehold.co/800x600?text=Townhouse'], ARRAY['ที่จอดรถ 2 คัน','ครัวไทย'], 'วิชัย มั่งมี', '062-111-2222', false);
