import { createClient } from '@/lib/supabase/server'
import WorkflowBuilder from '@/components/dashboard/workflow-builder'
import type { Workflow } from '@/types'

export default async function WorkflowsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user!.id).single()

  const { data: workflowsRaw } = await supabase
    .from('workflows').select('*').eq('merchant_id', merchant!.id).order('priority', { ascending: false })
  const workflows = (workflowsRaw ?? []) as Workflow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workflow tự động</h1>
        <p className="mt-1 text-sm text-gray-500">
          Thiết lập quy tắc thông minh: tặng bonus cho VIP, chặn gian lận, tự động duyệt
        </p>
      </div>
      <WorkflowBuilder initialWorkflows={workflows} />
    </div>
  )
}
