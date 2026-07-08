'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MemberLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้องค่ะ')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-stone px-4 py-12">
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(30,58,95,0.10)] border border-light-stone p-8 w-full max-w-sm">
        <div className="text-center mb-7">
          <Link href="/" className="font-display text-2xl font-bold text-navy">Resipecial</Link>
          <div className="gold-rule w-16 mx-auto my-3" />
          <h1 className="font-display text-xl text-navy">เข้าสู่ระบบสมาชิก</h1>
          <p className="text-sm text-silver mt-1">ยินดีต้อนรับกลับค่ะ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal block mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-light-stone rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal block mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-light-stone rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy hover:bg-navy-deep disabled:opacity-50 text-soft-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-sm text-silver mt-6">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-gold font-medium hover:underline">สมัครสมาชิก</Link>
        </p>
        <p className="text-center text-xs text-silver/70 mt-3">
          เป็นผู้ดูแลระบบ?{' '}
          <Link href="/admin/login" className="text-navy hover:underline">เข้าสู่ระบบ Admin</Link>
        </p>
      </div>
    </div>
  )
}
