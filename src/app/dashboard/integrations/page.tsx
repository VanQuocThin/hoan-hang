import { createClient } from '@/lib/supabase/server'
import IntegrationsForm from '@/components/dashboard/integrations-form'

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user!.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tích hợp</h1>
        <p className="mt-1 text-sm text-gray-500">Kết nối cửa hàng và đối tác vận chuyển</p>
      </div>
      <IntegrationsForm merchant={merchant} />
    </div>
  )
}
