import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminInquiriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*, properties(title)')
    .order('created_at', { ascending: false })

  const unread = inquiries?.filter(i => !i.is_read).length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          ข้อความติดต่อ
          {unread > 0 && (
            <span className="ml-2 bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">{unread}</span>
          )}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {inquiries && inquiries.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {inquiries.map((inq) => (
              <div key={inq.id} className={`p-5 hover:bg-gray-50 transition-colors ${!inq.is_read ? 'border-l-4 border-blue-500' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!inq.is_read && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">ใหม่</span>}
                      <p className="font-semibold text-gray-900">{inq.name}</p>
                    </div>
                    <p className="text-sm text-blue-600 mb-2 truncate">
                      🏠 {(inq as { properties?: { title: string } }).properties?.title ?? 'ทรัพย์ที่ถูกลบแล้ว'}
                    </p>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{inq.message}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <a href={`tel:${inq.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                        📞 {inq.phone}
                      </a>
                      {inq.email && (
                        <a href={`mailto:${inq.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          ✉️ {inq.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(inq.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric', month: 'short', year: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">ยังไม่มีข้อความติดต่อค่ะ</p>
        )}
      </div>
    </div>
  )
}
