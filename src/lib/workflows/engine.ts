import type { Workflow, WorkflowCondition, WorkflowAction, Return, ReturnPolicy } from '@/types'

function evaluateCondition(condition: WorkflowCondition, ctx: Return & { order_value?: number }): boolean {
  const { field, operator, value } = condition
  let actual: string | number | undefined

  if (field === 'order_value') actual = ctx.order_value ?? 0
  else if (field === 'return_reason') actual = ctx.items[0]?.reason ?? ''
  else if (field === 'customer_email') actual = ctx.customer_email ?? ''
  else if (field === 'item_count') actual = ctx.items.length
  else if (field === 'product_tag') actual = ''

  if (actual === undefined) return false

  switch (operator) {
    case 'equals': return String(actual) === String(value)
    case 'not_equals': return String(actual) !== String(value)
    case 'greater_than': return Number(actual) > Number(value)
    case 'less_than': return Number(actual) < Number(value)
    case 'contains': return String(actual).toLowerCase().includes(String(value).toLowerCase())
    case 'not_contains': return !String(actual).toLowerCase().includes(String(value).toLowerCase())
    default: return false
  }
}

export interface AppliedWorkflow {
  workflow_id: string
  name: string
  actions: WorkflowAction[]
}

export function applyWorkflows(
  workflows: Workflow[],
  ret: Return & { order_value?: number },
  policy: ReturnPolicy
): { policy: ReturnPolicy; applied: AppliedWorkflow[] } {
  let modifiedPolicy = { ...policy }
  const applied: AppliedWorkflow[] = []

  const sorted = [...workflows].filter(w => w.enabled).sort((a, b) => b.priority - a.priority)

  for (const workflow of sorted) {
    const allMatch = workflow.conditions.every(c => evaluateCondition(c, ret))
    if (!allMatch) continue

    for (const action of workflow.actions) {
      if (action.type === 'set_exchange_bonus') modifiedPolicy.exchange_bonus_vnd = Number(action.value)
      else if (action.type === 'set_store_credit_bonus') modifiedPolicy.store_credit_bonus_vnd = Number(action.value)
      else if (action.type === 'block_bonus') {
        modifiedPolicy.exchange_bonus_vnd = 0
        modifiedPolicy.store_credit_bonus_vnd = 0
      }
      else if (action.type === 'auto_approve') modifiedPolicy.auto_approve = true
      else if (action.type === 'extend_window') modifiedPolicy.return_window_days += Number(action.value)
    }

    applied.push({ workflow_id: workflow.id, name: workflow.name, actions: workflow.actions })
  }

  return { policy: modifiedPolicy, applied }
}
