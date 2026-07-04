'use client'

import { useState } from 'react'

export default function ContactForm({ propertyId, contactName }: { propertyId: string; contactName: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId, ...form }),
    })

    if (res.ok) {
      setStatus('sent')
      setForm({ name: '', phone: '', email: '', message: '' })
    } else {
      setStatus('error')
    }
  }

  const field = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'

  if (status === 'sent') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-3xl mb-2">✅</p>
        <p className="font-semibold text-green-700">ส่งข้อความแล้วค่ะ!</p>
        <p className="text-sm text-green-600 mt-1">{contactName} จะติดต่อกลับโดยเร็วค่ะ</p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-blue-600 hover:underline">
          ส่งอีกครั้ง
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">📩 ติดต่อสอบถาม</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="ชื่อ-นามสกุล *"
          required
          className={field}
        />
        <input
          value={form.phone}
          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          placeholder="เบอร์โทรศัพท์ *"
          required
          className={field}
        />
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          placeholder="อีเมล (ถ้ามี)"
          className={field}
        />
        <textarea
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder="ข้อความ เช่น ต้องการนัดดูทรัพย์ หรือมีคำถาม *"
          required
          rows={3}
          className={field}
        />
        {status === 'error' && <p className="text-red-500 text-sm">เกิดข้อผิดพลาด กรุณาลองใหม่ค่ะ</p>}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors"
        >
          {status === 'sending' ? 'กำลังส่ง...' : 'ส่งข้อความ'}
        </button>
      </form>
    </div>
  )
}
