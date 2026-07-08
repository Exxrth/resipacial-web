import Link from 'next/link'
import FavoritesNavLink from './FavoritesNavLink'

export default function Navbar() {
  return (
    <header className="bg-navy text-soft-white sticky top-0 z-40 shadow-lg shadow-navy/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl font-bold text-gold tracking-wide">Resipecial</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-soft-white/50 group-hover:text-gold/70 transition-colors">
            special place
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-soft-white/80">
          <Link href="/listings?status=for_sale" className="hover:text-gold transition-colors">ซื้อ</Link>
          <Link href="/listings?status=for_rent" className="hover:text-gold transition-colors">เช่า</Link>
          <Link href="/listings" className="hover:text-gold transition-colors">ทรัพย์ทั้งหมด</Link>
          <FavoritesNavLink />
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-soft-white/80 hover:text-gold px-3 py-2 transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline text-sm border border-gold/60 text-gold px-4 py-2 rounded-full hover:bg-gold hover:text-navy transition-all"
          >
            สมัครสมาชิก
          </Link>
          <Link
            href="/admin"
            className="text-sm bg-gold text-navy font-semibold px-4 py-2 rounded-full hover:bg-gold-soft transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}
