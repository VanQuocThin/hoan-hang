import { createClient } from '@/lib/supabase/server'
import { formatVND, getStatusColor, getStatusLabel, getOutcomeLabel, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReturnsTable from '@/components/dashboard/returns-table'

export default async function ReturnsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: merchant } = await supabase
    .from('merchants').select('id').eq('user_id', user!.id).single()

  const { data: returnsRaw } = await supabase
    .from('returns')
    .select('*')
    .eq('merchant_id', merchant!.id)
    .order('created_at', { ascending: false })
  const returns = (returnsRaw ?? []) as import('@/types').Return[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu đổi trả</h1>
          <p className="mt-1 text-sm text-gray-500">{returns.length} yêu cầu tổng cộng</p>
        </div>
      </div>
      <ReturnsTable returns={returns} merchantId={merchant!.id} />
    </div>
  )
}
