-- Add inquiries table for contact form submissions
create table public.inquiries (
  id          uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade,
  name        text not null,
  phone       text not null,
  email       text,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.inquiries enable row level security;

-- Public can submit inquiries
create policy "Anyone can submit inquiry"
  on public.inquiries for insert
  with check (true);

-- Only authenticated (admin) can read inquiries
create policy "Authenticated can read inquiries"
  on public.inquiries for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can update inquiries"
  on public.inquiries for update
  using (auth.role() = 'authenticated');

create index idx_inquiries_property on public.inquiries(property_id);
create index idx_inquiries_unread   on public.inquiries(is_read) where is_read = false;
