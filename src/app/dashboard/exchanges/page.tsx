import { createClient } from '@/lib/supabase/server'
import { formatVND, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftRight } from 'lucide-react'

export default async function ExchangesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user!.id).single()

  const { data: exchangesRaw } = await supabase
    .from('returns')
    .select('*')
    .eq('merchant_id', merchant!.id)
    .eq('outcome', 'exchange')
    .order('created_at', { ascending: false })
  const exchanges = exchangesRaw ?? []

  const totalBonus = exchanges.reduce((s, e) => s + (e.bonus_credit ?? 0), 0)
  const totalValue = exchanges.reduce((s, e) => s + (e.refund_amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đổi hàng</h1>
        <p className="mt-1 text-sm text-gray-500">{exchanges.length} yêu cầu đổi hàng</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-2xl font-bold text-green-600">{exchanges.length}</div>
            <div className="text-sm text-gray-500">Tổng đổi hàng</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-2xl font-bold text-blue-600">{formatVND(totalValue)}</div>
            <div className="text-sm text-gray-500">Doanh thu giữ lại</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-2xl font-bold text-purple-600">{formatVND(totalBonus)}</div>
            <div className="text-sm text-gray-500">Tổng bonus đã tặng</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Danh sách đổi hàng</CardTitle></CardHeader>
        <CardContent className="p-0">
          {exchanges.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center text-gray-400">
              <ArrowLeftRight className="mb-3 h-10 w-10 opacity-30" />
              <p>Chưa có yêu cầu đổi hàng</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Mã yêu cầu</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Khách hàng</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Giá trị</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Bonus tặng</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exchanges.map(ex => (
                  <tr key={ex.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">{ex.return_code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{ex.customer_name}</div>
                      <div className="text-xs text-gray-400">{ex.customer_phone ?? ex.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">{formatVND(ex.refund_amount)}</td>
                    <td className="px-4 py-3 text-right text-purple-600">
                      {ex.bonus_credit > 0 ? `+${formatVND(ex.bonus_credit)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        ex.status === 'completed' ? 'bg-green-100 text-green-700' :
                        ex.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ex.status === 'completed' ? 'Hoàn thành' : ex.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(ex.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
