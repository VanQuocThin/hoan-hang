'use client'
import { useState } from 'react'
import { formatVND, getStatusColor, getStatusLabel, getOutcomeLabel, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Return, ReturnStatus } from '@/types'
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STATUS_OPTIONS: ReturnStatus[] = ['pending', 'approved', 'rejected', 'shipped', 'completed', 'cancelled']

export default function ReturnsTable({
  returns: initial,
  merchantId,
}: {
  returns: Return[]
  merchantId: string
}) {
  const [returns, setReturns] = useState<Return[]>(initial)
  const [filter, setFilter] = useState<ReturnStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Return | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = returns
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      const q = search.toLowerCase()
      return !q || r.return_code.toLowerCase().includes(q) ||
        r.customer_name?.toLowerCase().includes(q) ||
        r.order_number?.toLowerCase().includes(q)
    })

  async function updateStatus(id: string, status: ReturnStatus) {
    setLoading(id)
    const supabase = createClient()
    await supabase.from('returns').update({ status }).eq('id', id)
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    setLoading(null)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Input
            placeholder="Tìm theo mã, tên, đơn hàng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', ...STATUS_OPTIONS] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Tất cả' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Mã yêu cầu</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Khách hàng</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Kết quả</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Số tiền</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày tạo</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  Không có yêu cầu nào
                </td>
              </tr>
            ) : filtered.map(ret => (
              <tr key={ret.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-gray-900">{ret.return_code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{ret.customer_name ?? '—'}</div>
                  <div className="text-xs text-gray-400">{ret.customer_phone ?? ret.customer_email}</div>
                </td>
                <td className="px-4 py-3">
                  {ret.outcome ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      ret.outcome === 'exchange' ? 'bg-green-100 text-green-700' :
                      ret.outcome === 'store_credit' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getOutcomeLabel(ret.outcome)}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatVND(ret.refund_amount + ret.store_credit_amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(ret.status)}`}>
                    {getStatusLabel(ret.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(ret.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelected(ret)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {ret.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(ret.id, 'approved')}
                          disabled={loading === ret.id}
                          className="rounded p-1.5 text-green-500 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(ret.id, 'rejected')}
                          disabled={loading === ret.id}
                          className="rounded p-1.5 text-red-400 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">{selected.return_code}</h2>
                <p className="text-sm text-gray-500">Đơn #{selected.order_number}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Khách hàng:</span> <span className="font-medium ml-1">{selected.customer_name}</span></div>
                <div><span className="text-gray-500">SĐT:</span> <span className="font-medium ml-1">{selected.customer_phone ?? '—'}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-1">{selected.customer_email ?? '—'}</span></div>
                <div><span className="text-gray-500">Kết quả:</span> <span className="font-medium ml-1">{selected.outcome ? getOutcomeLabel(selected.outcome) : '—'}</span></div>
                <div><span className="text-gray-500">Hoàn tiền:</span> <span className="font-medium ml-1">{formatVND(selected.refund_amount)}</span></div>
                <div><span className="text-gray-500">Bonus:</span> <span className="font-medium ml-1">{formatVND(selected.bonus_credit)}</span></div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Sản phẩm:</p>
                <div className="space-y-2">
                  {(selected.items as ReturnItem[]).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.reason} · SL: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">{formatVND(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                  <strong>Ghi chú:</strong> {selected.notes}
                </div>
              )}

              {selected.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => { updateStatus(selected.id, 'approved'); setSelected(null) }}
                  >
                    <CheckCircle className="h-4 w-4" /> Duyệt
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => { updateStatus(selected.id, 'rejected'); setSelected(null) }}
                  >
                    <XCircle className="h-4 w-4" /> Từ chối
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ReturnItem { name: string; reason?: string; quantity: number; price: number; image_url?: string }
