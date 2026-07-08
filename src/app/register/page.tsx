'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรค่ะ')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'อีเมลนี้ถูกใช้งานแล้วค่ะ'
        : 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่ค่ะ')
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-stone px-4">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(30,58,95,0.10)] border border-light-stone p-8 w-full max-w-sm text-center">
          <p className="text-4xl mb-3">✉️</p>
          <h1 className="font-display text-xl text-navy mb-2">ยืนยันอีเมลของคุณ</h1>
          <p className="text-sm text-silver mb-6">
            เราส่งลิงก์ยืนยันไปที่ <span className="text-charcoal font-medium">{email}</span> แล้วค่ะ
            กรุณาตรวจสอบกล่องอีเมลเพื่อเปิดใช้งานบัญชี
          </p>
          <Link
            href="/login"
            className="inline-block bg-navy hover:bg-navy-deep text-soft-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
          >
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-stone px-4 py-12">
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(30,58,95,0.10)] border border-light-stone p-8 w-full max-w-sm">
        <div className="text-center mb-7">
          <Link href="/" className="font-display text-2xl font-bold text-navy">Resipecial</Link>
          <div className="gold-rule w-16 mx-auto my-3" />
          <h1 className="font-display text-xl text-navy">สมัครสมาชิก</h1>
          <p className="text-sm text-silver mt-1">สร้างบัญชีเพื่อบันทึกทรัพย์ที่ชื่นชอบ</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal block mb-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-light-stone rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="ชื่อของคุณ"
            />
          </div>
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
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-soft disabled:opacity-50 text-navy font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="text-center text-sm text-silver mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-gold font-medium hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
