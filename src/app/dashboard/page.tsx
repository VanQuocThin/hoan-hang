import { createClient } from '@/lib/supabase/server'
import { formatVND, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp, ArrowLeftRight, Wallet } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: merchant } = await supabase
    .from('merchants').select('id').eq('user_id', user!.id).single()

  const { data: returnsRaw } = await supabase
    .from('returns')
    .select('*')
    .eq('merchant_id', merchant!.id)
    .order('created_at', { ascending: false })
    .limit(100)
  const returns = returnsRaw ?? []

  const total = returns.length
  const pending = returns.filter(r => r.status === 'pending').length
  const exchanges = returns.filter(r => r.outcome === 'exchange').length
  const refunded = returns.reduce((sum, r) => sum + (r.refund_amount ?? 0), 0)
  const retained = returns
    .filter(r => r.outcome === 'exchange' || r.outcome === 'store_credit')
    .reduce((sum, r) => sum + (r.refund_amount ?? 0) + (r.store_credit_amount ?? 0), 0)

  const recent = returns.slice(0, 8)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="mt-1 text-sm text-gray-500">Theo dõi hoạt động đổi trả của cửa hàng</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng yêu cầu', value: total, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: 'Chờ duyệt', value: pending, icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Đổi hàng', value: exchanges, icon: ArrowLeftRight, color: 'text-green-600 bg-green-50' },
          { label: 'Doanh thu giữ lại', value: formatVND(retained), icon: Wallet, color: 'text-purple-600 bg-purple-50' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Returns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Yêu cầu gần đây</CardTitle>
          <a href="/dashboard/returns" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Xem tất cả →
          </a>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <Package className="mb-3 h-10 w-10 opacity-30" />
              <p className="font-medium">Chưa có yêu cầu đổi trả nào</p>
              <p className="mt-1 text-sm">Khách hàng sẽ gửi yêu cầu qua portal của bạn</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map(ret => (
                <div key={ret.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{ret.return_code}</span>
                      <span className="text-sm text-gray-400">#{ret.order_number}</span>
                    </div>
                    <div className="mt-0.5 text-sm text-gray-500">
                      {ret.customer_name} · {formatDate(ret.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      {formatVND(ret.refund_amount + ret.store_credit_amount)}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(ret.status)}`}>
                      {getStatusLabel(ret.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
