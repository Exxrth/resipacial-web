import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PropertyCard from '@/components/properties/PropertyCard'
import Navbar from '@/components/Navbar'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: featured } = await supabase
    .from('properties')
    .select('*')
    .eq('is_featured', true)
    .in('status', ['for_sale', 'for_rent'])
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative bg-navy text-soft-white overflow-hidden">
          {/* Decorative gradient + gold glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-deep" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />

          <div className="relative max-w-4xl mx-auto text-center px-4 py-24 md:py-32">
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-5">Resipecial</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
              ค้นหาที่พักพิเศษ<br className="hidden md:block" /> ที่เป็นของคุณ
            </h1>
            <p className="text-soft-white/70 text-base md:text-lg mb-10 max-w-2xl mx-auto">
              อสังหาริมทรัพย์คัดสรรคุณภาพ บ้าน คอนโด ที่ดิน ทั่วประเทศไทย
            </p>

            <form action="/listings" method="get" className="flex gap-2 max-w-2xl mx-auto p-2 bg-soft-white rounded-2xl shadow-2xl">
              <input
                name="query"
                type="text"
                placeholder="ค้นหา เช่น บ้านสุขุมวิท, คอนโดใกล้ BTS..."
                className="flex-1 px-4 py-3 rounded-xl text-charcoal text-sm bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gold hover:bg-gold-soft text-navy font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                ค้นหา
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { label: '🏠 ซื้อบ้าน', href: '/listings?status=for_sale&type=house' },
                { label: '🏢 ซื้อคอนโด', href: '/listings?status=for_sale&type=condo' },
                { label: '🔑 เช่า', href: '/listings?status=for_rent' },
                { label: '🌳 ที่ดิน', href: '/listings?type=land' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-gold/40 hover:border-gold hover:bg-gold/10 text-soft-white/90 text-sm px-4 py-2 rounded-full transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-3">
            <p className="text-gold text-xs tracking-[0.25em] uppercase mb-2">Featured</p>
            <h2 className="font-display text-3xl font-bold text-charcoal">ทรัพย์แนะนำ</h2>
          </div>
          <div className="gold-rule w-24 mx-auto mb-12" />
          {featured && featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <p className="text-center text-silver py-12">ยังไม่มีทรัพย์แนะนำค่ะ</p>
          )}
          <div className="text-center mt-12">
            <Link
              href="/listings"
              className="inline-block border border-navy text-navy hover:bg-navy hover:text-soft-white font-medium px-8 py-3 rounded-full transition-colors"
            >
              ดูทรัพย์ทั้งหมด →
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-navy text-soft-white py-16">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
            {[
              { label: 'ทรัพย์ทั้งหมด', value: '500+' },
              { label: 'จังหวัดทั่วไทย', value: '77' },
              { label: 'ลูกค้าพึงพอใจ', value: '1,000+' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-price text-4xl md:text-5xl font-bold text-gold">{s.value}</p>
                <p className="text-sm text-soft-white/60 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-navy-deep text-soft-white/50 text-sm text-center py-8">
        <p className="font-display text-gold text-base mb-1">Resipecial</p>
        © 2026 Resipecial — 𝗧𝗮𝗸𝗲 𝗮 𝗿𝗲𝘀𝘁 𝘄𝗶𝘁𝗵 𝘆𝗼𝘂𝗿 𝘀𝗽𝗲𝗰𝗶𝗮𝗹 𝗽𝗹𝗮𝗰𝗲
      </footer>
    </>
  )
}
