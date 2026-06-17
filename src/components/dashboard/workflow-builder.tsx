'use client'
import { useState } from 'react'
import type { Workflow, WorkflowCondition, WorkflowAction } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Zap, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Pencil } from 'lucide-react'
import { formatVND } from '@/lib/utils'

// ─── Config ────────────────────────────────────────────────────────────────

const CONDITION_FIELDS = [
  { value: 'order_value', label: 'Giá trị đơn hàng (VNĐ)', type: 'number' },
  { value: 'return_reason', label: 'Lý do trả hàng', type: 'text' },
  { value: 'customer_email', label: 'Email khách hàng', type: 'text' },
  { value: 'item_count', label: 'Số sản phẩm trả', type: 'number' },
  { value: 'days_since_order', label: 'Số ngày từ khi đặt hàng', type: 'number' },
  { value: 'product_tag', label: 'Tag sản phẩm', type: 'text' },
] as const

const OPERATORS_NUMBER = [
  { value: 'greater_than', label: 'Lớn hơn (>)' },
  { value: 'less_than', label: 'Nhỏ hơn (<)' },
  { value: 'equals', label: 'Bằng (=)' },
]

const OPERATORS_TEXT = [
  { value: 'equals', label: 'Bằng' },
  { value: 'not_equals', label: 'Khác' },
  { value: 'contains', label: 'Chứa' },
  { value: 'not_contains', label: 'Không chứa' },
]

const ACTION_TYPES = [
  { value: 'set_exchange_bonus', label: 'Tặng bonus khi đổi hàng (VNĐ)', hasValue: true, placeholder: 'VD: 50000' },
  { value: 'set_store_credit_bonus', label: 'Tặng bonus tín dụng (VNĐ)', hasValue: true, placeholder: 'VD: 30000' },
  { value: 'block_bonus', label: 'Chặn tất cả bonus', hasValue: false, placeholder: '' },
  { value: 'auto_approve', label: 'Tự động duyệt', hasValue: false, placeholder: '' },
  { value: 'auto_reject', label: 'Tự động từ chối', hasValue: false, placeholder: '' },
  { value: 'extend_window', label: 'Gia hạn thêm (ngày)', hasValue: true, placeholder: 'VD: 15' },
  { value: 'add_note', label: 'Thêm ghi chú nội bộ', hasValue: true, placeholder: 'VD: Khách VIP - ưu tiên' },
] as const

// ─── Preset templates ───────────────────────────────────────────────────────

const PRESETS = [
  {
    name: 'VIP: Đơn > 1.000.000đ',
    conditions: [{ field: 'order_value', operator: 'greater_than', value: 1000000 }],
    actions: [{ type: 'set_exchange_bonus', value: 100000 }, { type: 'set_store_credit_bonus', value: 50000 }],
  },
  {
    name: 'Chặn serial returner',
    conditions: [{ field: 'item_count', operator: 'greater_than', value: 3 }],
    actions: [{ type: 'block_bonus' }, { type: 'add_note', value: 'Serial returner - kiểm tra thủ công' }],
  },
  {
    name: 'Auto-approve đơn nhỏ',
    conditions: [{ field: 'order_value', operator: 'less_than', value: 300000 }],
    actions: [{ type: 'auto_approve' }],
  },
  {
    name: 'Gia hạn cho sản phẩm lỗi',
    conditions: [{ field: 'return_reason', operator: 'equals', value: 'Sản phẩm lỗi' }],
    actions: [{ type: 'extend_window', value: 30 }, { type: 'auto_approve' }],
  },
]

// ─── Empty state helpers ─────────────────────────────────────────────────────

function emptyCondition(): WorkflowCondition {
  return { field: 'order_value', operator: 'greater_than', value: 0 }
}

function emptyAction(): WorkflowAction {
  return { type: 'set_exchange_bonus', value: 0 }
}

function emptyWorkflow(): Omit<Workflow, 'id' | 'merchant_id' | 'created_at'> {
  return { name: '', enabled: true, priority: 0, conditions: [emptyCondition()], actions: [emptyAction()] }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConditionRow({
  cond,
  onChange,
  onRemove,
  canRemove,
}: {
  cond: WorkflowCondition
  onChange: (c: WorkflowCondition) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const fieldMeta = CONDITION_FIELDS.find(f => f.value === cond.field)
  const operators = fieldMeta?.type === 'number' ? OPERATORS_NUMBER : OPERATORS_TEXT

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-1 flex-wrap gap-2">
        <select
          value={cond.field}
          onChange={e => onChange({ ...cond, field: e.target.value as WorkflowCondition['field'], operator: 'equals', value: '' })}
          className="min-w-[180px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={cond.operator}
          onChange={e => onChange({ ...cond, operator: e.target.value as WorkflowCondition['operator'] })}
          className="w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type={fieldMeta?.type === 'number' ? 'number' : 'text'}
          value={cond.value}
          onChange={e => onChange({ ...cond, value: fieldMeta?.type === 'number' ? Number(e.target.value) : e.target.value })}
          placeholder={fieldMeta?.type === 'number' ? '0' : 'Nhập giá trị...'}
          className="w-36 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      {canRemove && (
        <button onClick={onRemove} className="mt-1.5 rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function ActionRow({
  action,
  onChange,
  onRemove,
  canRemove,
}: {
  action: WorkflowAction
  onChange: (a: WorkflowAction) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const meta = ACTION_TYPES.find(a => a.value === action.type)

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-1 flex-wrap gap-2">
        <select
          value={action.type}
          onChange={e => onChange({ type: e.target.value as WorkflowAction['type'], value: undefined })}
          className="min-w-[220px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        {meta?.hasValue && (
          <input
            type={action.type === 'add_note' ? 'text' : 'number'}
            value={action.value ?? ''}
            onChange={e => onChange({ ...action, value: action.type === 'add_note' ? e.target.value : Number(e.target.value) })}
            placeholder={meta.placeholder}
            className="w-44 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        )}
      </div>
      {canRemove && (
        <button onClick={onRemove} className="mt-1.5 rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// ─── Workflow Modal ───────────────────────────────────────────────────────────

function WorkflowModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Omit<Workflow, 'id' | 'merchant_id' | 'created_at'> & { id?: string }
  onSave: (wf: typeof initial) => Promise<void>
  onClose: () => void
}) {
  const [wf, setWf] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  function setCondition(i: number, c: WorkflowCondition) {
    setWf(w => { const cs = [...w.conditions]; cs[i] = c; return { ...w, conditions: cs } })
  }
  function removeCondition(i: number) {
    setWf(w => ({ ...w, conditions: w.conditions.filter((_, idx) => idx !== i) }))
  }
  function addCondition() {
    setWf(w => ({ ...w, conditions: [...w.conditions, emptyCondition()] }))
  }

  function setAction(i: number, a: WorkflowAction) {
    setWf(w => { const as_ = [...w.actions]; as_[i] = a; return { ...w, actions: as_ } })
  }
  function removeAction(i: number) {
    setWf(w => ({ ...w, actions: w.actions.filter((_, idx) => idx !== i) }))
  }
  function addAction() {
    setWf(w => ({ ...w, actions: [...w.actions, emptyAction()] }))
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setWf(w => ({
      ...w,
      name: w.name || p.name,
      conditions: p.conditions as WorkflowCondition[],
      actions: p.actions as WorkflowAction[],
    }))
    setShowPresets(false)
  }

  async function handleSave() {
    if (!wf.name.trim() || wf.conditions.length === 0 || wf.actions.length === 0) return
    setSaving(true)
    await onSave(wf)
    setSaving(false)
  }

  const valid = wf.name.trim() && wf.conditions.length > 0 && wf.actions.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {initial.id ? 'Chỉnh sửa Workflow' : 'Tạo Workflow mới'}
            </h2>
            <p className="text-sm text-gray-500">Nếu <span className="font-medium">tất cả</span> điều kiện đúng → thực hiện hành động</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name + Presets */}
          <div className="space-y-3">
            <Input
              label="Tên workflow"
              value={wf.name}
              onChange={e => setWf(w => ({ ...w, name: e.target.value }))}
              placeholder="VD: Khách VIP - Đơn lớn"
            />
            <div className="relative">
              <button
                onClick={() => setShowPresets(s => !s)}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Zap className="h-3.5 w-3.5" />
                Dùng template có sẵn
                {showPresets ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showPresets && (
                <div className="absolute left-0 top-8 z-20 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
                  {PRESETS.map(p => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className="flex w-full flex-col items-start px-4 py-3 text-left hover:bg-blue-50 first:rounded-t-xl last:rounded-b-xl border-b border-gray-50 last:border-0"
                    >
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <span className="text-xs text-gray-400 mt-0.5">
                        {p.conditions.length} điều kiện · {p.actions.length} hành động
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Điều kiện</h3>
                <p className="text-xs text-gray-400">Workflow chạy khi tất cả điều kiện đều đúng</p>
              </div>
              <button
                onClick={addCondition}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm điều kiện
              </button>
            </div>
            <div className="space-y-2.5 rounded-xl bg-gray-50 p-3">
              {wf.conditions.map((c, i) => (
                <div key={i}>
                  {i > 0 && <div className="mb-2.5 text-center text-xs font-semibold uppercase text-gray-400">VÀ</div>}
                  <ConditionRow
                    cond={c}
                    onChange={c => setCondition(i, c)}
                    onRemove={() => removeCondition(i)}
                    canRemove={wf.conditions.length > 1}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Hành động</h3>
                <p className="text-xs text-gray-400">Tất cả hành động sẽ được thực hiện khi điều kiện thỏa</p>
              </div>
              <button
                onClick={addAction}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-green-300 px-3 py-1.5 text-xs font-medium text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm hành động
              </button>
            </div>
            <div className="space-y-2.5 rounded-xl bg-green-50/50 p-3">
              {wf.actions.map((a, i) => (
                <ActionRow
                  key={i}
                  action={a}
                  onChange={a => setAction(i, a)}
                  onRemove={() => removeAction(i)}
                  canRemove={wf.actions.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Độ ưu tiên</label>
              <p className="text-xs text-gray-400">Số càng cao → chạy trước. Workflow đầu tiên thỏa sẽ được áp dụng.</p>
            </div>
            <input
              type="number"
              value={wf.priority}
              onChange={e => setWf(w => ({ ...w, priority: Number(e.target.value) }))}
              min={0} max={100}
              className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} disabled={!valid || saving}>
            {saving ? 'Đang lưu...' : initial.id ? 'Cập nhật' : 'Tạo Workflow'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Workflow Preview Card ────────────────────────────────────────────────────

function WorkflowCard({
  wf,
  onEdit,
  onToggle,
  onDelete,
}: {
  wf: Workflow
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const fieldLabel = (f: string) => CONDITION_FIELDS.find(x => x.value === f)?.label ?? f
  const actionLabel = (a: WorkflowAction) => {
    const meta = ACTION_TYPES.find(x => x.value === a.type)
    if (!meta) return a.type
    if (!meta.hasValue || a.value === undefined) return meta.label
    const val = a.type.includes('bonus') || a.type === 'set_exchange_bonus' || a.type === 'set_store_credit_bonus'
      ? formatVND(Number(a.value))
      : a.value
    return `${meta.label}: ${val}`
  }

  return (
    <div className={`rounded-xl border transition-all ${wf.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${wf.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Zap className={`h-4 w-4 ${wf.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{wf.name}</span>
            {wf.priority > 0 && (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">P{wf.priority}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
            <span>{wf.conditions.length} điều kiện</span>
            <span>{wf.actions.length} hành động</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={onToggle} className="rounded-lg p-1.5 transition-colors hover:bg-gray-100">
            {wf.enabled
              ? <ToggleRight className="h-5 w-5 text-blue-600" />
              : <ToggleLeft className="h-5 w-5 text-gray-300" />}
          </button>
          <button onClick={onDelete} className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Condition + Action pills */}
      <div className="border-t border-gray-50 px-4 pb-3 pt-2.5 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs font-medium text-gray-400 mr-1">NẾU</span>
          {wf.conditions.map((c, i) => (
            <span key={i} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-700">
              {fieldLabel(c.field)} {c.operator === 'greater_than' ? '>' : c.operator === 'less_than' ? '<' : '='} {c.value}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs font-medium text-gray-400 mr-1">THÌ</span>
          {wf.actions.map((a, i) => (
            <span key={i} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
              {actionLabel(a)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkflowBuilder({ initialWorkflows }: { initialWorkflows: Workflow[] }) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)
  const [modal, setModal] = useState<null | (Omit<Workflow, 'id' | 'merchant_id' | 'created_at'> & { id?: string })>(null)

  function openCreate() {
    setModal(emptyWorkflow())
  }

  function openEdit(wf: Workflow) {
    setModal({ id: wf.id, name: wf.name, enabled: wf.enabled, priority: wf.priority, conditions: wf.conditions, actions: wf.actions })
  }

  async function handleSave(wf: typeof modal) {
    if (!wf) return
    if (wf.id) {
      const res = await fetch(`/api/workflows/${wf.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wf),
      })
      const updated = await res.json()
      setWorkflows(ws => ws.map(w => w.id === wf.id ? updated : w))
    } else {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wf),
      })
      const created = await res.json()
      setWorkflows(ws => [created, ...ws])
    }
    setModal(null)
  }

  async function handleToggle(wf: Workflow) {
    const res = await fetch(`/api/workflows/${wf.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...wf, enabled: !wf.enabled }),
    })
    const updated = await res.json()
    setWorkflows(ws => ws.map(w => w.id === wf.id ? updated : w))
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa workflow này?')) return
    await fetch(`/api/workflows/${id}`, { method: 'DELETE' })
    setWorkflows(ws => ws.filter(w => w.id !== id))
  }

  const activeCount = workflows.filter(w => w.enabled).length

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Workflow tự động</CardTitle>
            <p className="mt-0.5 text-sm text-gray-500">
              {workflows.length === 0 ? 'Chưa có workflow nào' : `${activeCount}/${workflows.length} đang bật`}
            </p>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" /> Tạo Workflow
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {workflows.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <p className="font-medium text-gray-700">Chưa có workflow nào</p>
              <p className="mt-1 text-sm text-gray-400">Tạo quy tắc tự động để tăng doanh thu giữ lại</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                {PRESETS.map(p => (
                  <span key={p.name} className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1">{p.name}</span>
                ))}
              </div>
              <Button className="mt-5" onClick={openCreate} size="sm">
                <Plus className="h-4 w-4" /> Tạo Workflow đầu tiên
              </Button>
            </div>
          ) : (
            <>
              {workflows
                .sort((a, b) => b.priority - a.priority)
                .map(wf => (
                  <WorkflowCard
                    key={wf.id}
                    wf={wf}
                    onEdit={() => openEdit(wf)}
                    onToggle={() => handleToggle(wf)}
                    onDelete={() => handleDelete(wf.id)}
                  />
                ))}
              <div className="rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700">
                <strong>Cách hoạt động:</strong> Mỗi khi khách gửi yêu cầu, hệ thống chạy các workflow theo thứ tự ưu tiên. Workflow đầu tiên thỏa điều kiện sẽ được áp dụng lên chính sách của khách đó.
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {modal && (
        <WorkflowModal
          initial={modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
