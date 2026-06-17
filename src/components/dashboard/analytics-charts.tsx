'use client'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444']

export default function AnalyticsCharts({
  outcomeBreakdown,
  topReasons,
  returns,
}: {
  outcomeBreakdown: { name: string; value: number }[]
  topReasons: { reason: string; count: number }[]
  returns: Array<{ created_at: string; outcome?: string }>
}) {
  // Build daily trend (last 30 days)
  const now = new Date()
  const trend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (13 - i))
    const label = `${d.getDate()}/${d.getMonth() + 1}`
    const dayReturns = returns.filter(r => {
      const rd = new Date(r.created_at)
      return rd.toDateString() === d.toDateString()
    })
    return {
      date: label,
      total: dayReturns.length,
      exchange: dayReturns.filter(r => r.outcome === 'exchange').length,
    }
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Outcome pie */}
      <Card>
        <CardHeader><CardTitle>Phân bổ kết quả</CardTitle></CardHeader>
        <CardContent>
          {outcomeBreakdown.every(o => o.value === 0) ? (
            <div className="flex h-48 items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={outcomeBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {outcomeBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {outcomeBreakdown.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-semibold ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top reasons */}
      <Card>
        <CardHeader><CardTitle>Lý do trả hàng hàng đầu</CardTitle></CardHeader>
        <CardContent>
          {topReasons.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topReasons} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="reason" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Trend */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Xu hướng 14 ngày qua</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" name="Tổng" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="exchange" name="Đổi hàng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
