import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/dashboard/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user!.id).single()
  const { data: policy } = await supabase.from('return_policies').select('*').eq('merchant_id', merchant!.id).single()
  const { data: workflowsRaw } = await supabase
    .from('workflows').select('*').eq('merchant_id', merchant!.id).order('priority', { ascending: false })
  const workflows = (workflowsRaw ?? []) as import('@/types').Workflow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý chính sách đổi trả và workflow tự động</p>
      </div>
      <SettingsForm merchant={merchant} policy={policy} workflows={workflows} />
    </div>
  )
}
