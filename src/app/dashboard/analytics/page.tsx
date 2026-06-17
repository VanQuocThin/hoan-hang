import { createClient } from '@/lib/supabase/server'
import { formatVND } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AnalyticsCharts from '@/components/dashboard/analytics-charts'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user!.id).single()

  const { data: returnsRaw } = await supabase
    .from('returns').select('*').eq('merchant_id', merchant!.id)
  const returns = returnsRaw ?? []

  const totalReturns = returns.length
  const completedReturns = returns.filter(r => r.status === 'completed').length

  const outcomeBreakdown = ['refund', 'exchange', 'store_credit'].map(o => ({
    name: o === 'refund' ? 'Hoàn tiền' : o === 'exchange' ? 'Đổi hàng' : 'Tín dụng',
    value: returns.filter(r => r.outcome === o).length,
  }))

  const reasonBreakdown = returns.reduce((acc: Record<string, number>, r) => {
    (r.items as Array<{ reason?: string }>).forEach(item => {
      const reason = item.reason ?? 'Khác'
      acc[reason] = (acc[reason] ?? 0) + 1
    })
    return acc
  }, {})

  const topReasons = Object.entries(reasonBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }))

  const retained = returns
    .filter(r => r.outcome !== 'refund')
    .reduce((s, r) => s + (r.refund_amount ?? 0) + (r.store_credit_amount ?? 0), 0)

  const refunded = returns
    .filter(r => r.outcome === 'refund')
    .reduce((s, r) => s + (r.refund_amount ?? 0), 0)

  const retentionRate = totalReturns > 0
    ? Math.round((returns.filter(r => r.outcome !== 'refund').length / totalReturns) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Phân tích hiệu quả quản lý đổi trả</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng yêu cầu', value: totalReturns },
          { label: 'Tỷ lệ giữ doanh thu', value: `${retentionRate}%` },
          { label: 'Doanh thu giữ lại', value: formatVND(retained) },
          { label: 'Đã hoàn tiền', value: formatVND(refunded) },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="mt-1 text-sm text-gray-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnalyticsCharts
        outcomeBreakdown={outcomeBreakdown}
        topReasons={topReasons}
        returns={returns as Array<{ created_at: string; outcome?: string }>}
      />
    </div>
  )
}
