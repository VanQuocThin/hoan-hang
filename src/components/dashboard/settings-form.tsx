'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Merchant, ReturnPolicy, Workflow } from '@/types'
import { Plus, Check } from 'lucide-react'

export default function SettingsForm({
  merchant: initialMerchant,
  policy: initialPolicy,
  workflows,
}: {
  merchant: Merchant
  policy: ReturnPolicy | null
  workflows: Workflow[]
}) {
  const [merchant, setMerchant] = useState(initialMerchant)
  const [policy, setPolicy] = useState(initialPolicy ?? {
    return_window_days: 30, refund_enabled: true, exchange_enabled: true,
    store_credit_enabled: true, exchange_bonus_vnd: 0, store_credit_bonus_vnd: 0,
    auto_approve: false, require_photo: false,
    allowed_reasons: ['Sản phẩm lỗi', 'Sai kích thước', 'Không như mô tả', 'Thay đổi quyết định', 'Khác'],
    shipping_carriers: ['GHN', 'GHTK', 'ViettelPost'],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newReason, setNewReason] = useState('')

  async function saveSettings() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('merchants').update({
      store_name: merchant.store_name,
      primary_color: merchant.primary_color,
    }).eq('id', merchant.id)

    if (initialPolicy) {
      await supabase.from('return_policies').update(policy).eq('merchant_id', merchant.id)
    } else {
      await supabase.from('return_policies').insert({ ...policy, merchant_id: merchant.id })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addReason() {
    if (!newReason.trim()) return
    setPolicy(p => ({ ...p, allowed_reasons: [...(p.allowed_reasons ?? []), newReason.trim()] }))
    setNewReason('')
  }

  function removeReason(r: string) {
    setPolicy(p => ({ ...p, allowed_reasons: p.allowed_reasons?.filter(x => x !== r) ?? [] }))
  }

  return (
    <div className="space-y-6">
      {/* Store info */}
      <Card>
        <CardHeader><CardTitle>Thông tin cửa hàng</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Tên cửa hàng"
            value={merchant.store_name}
            onChange={e => setMerchant(m => ({ ...m, store_name: e.target.value }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">URL Portal</label>
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
              hoan-hang.vn/portal/<strong>{merchant.store_slug}</strong>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Màu thương hiệu</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={merchant.primary_color}
                onChange={e => setMerchant(m => ({ ...m, primary_color: e.target.value }))}
                className="h-10 w-16 cursor-pointer rounded border border-gray-200 p-1"
              />
              <span className="text-sm text-gray-500">{merchant.primary_color}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return policy */}
      <Card>
        <CardHeader><CardTitle>Chính sách đổi trả</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <Input
            label="Thời hạn đổi trả (ngày)"
            type="number"
            value={policy.return_window_days}
            onChange={e => setPolicy(p => ({ ...p, return_window_days: parseInt(e.target.value) }))}
            min={1} max={365}
          />

          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'refund_enabled', label: 'Hoàn tiền' },
              { key: 'exchange_enabled', label: 'Đổi hàng' },
              { key: 'store_credit_enabled', label: 'Tín dụng cửa hàng' },
            ].map(opt => (
              <label key={opt.key} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={(policy as Record<string, unknown>)[opt.key] as boolean}
                  onChange={e => setPolicy(p => ({ ...p, [opt.key]: e.target.checked }))}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Bonus đổi hàng (VNĐ)"
              type="number"
              value={policy.exchange_bonus_vnd}
              onChange={e => setPolicy(p => ({ ...p, exchange_bonus_vnd: parseInt(e.target.value) || 0 }))}
              min={0}
            />
            <Input
              label="Bonus tín dụng cửa hàng (VNĐ)"
              type="number"
              value={policy.store_credit_bonus_vnd}
              onChange={e => setPolicy(p => ({ ...p, store_credit_bonus_vnd: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>

          <div className="flex gap-4">
            {[
              { key: 'auto_approve', label: 'Tự động duyệt' },
              { key: 'require_photo', label: 'Yêu cầu ảnh' },
            ].map(opt => (
              <label key={opt.key} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={(policy as Record<string, unknown>)[opt.key] as boolean}
                  onChange={e => setPolicy(p => ({ ...p, [opt.key]: e.target.checked }))}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Reasons */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Lý do trả hàng</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {policy.allowed_reasons?.map(r => (
                <span key={r} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {r}
                  <button onClick={() => removeReason(r)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newReason}
                onChange={e => setNewReason(e.target.value)}
                placeholder="Thêm lý do..."
                onKeyDown={e => e.key === 'Enter' && addReason()}
              />
              <Button variant="outline" onClick={addReason} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings} disabled={saving}>
            {saved ? <><Check className="h-4 w-4" /> Đã lưu</> : saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </CardFooter>
      </Card>

      {/* Workflow link */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-900">Workflow tự động</p>
          <p className="text-sm text-blue-600 mt-0.5">
            {workflows.length === 0 ? 'Chưa có workflow nào' : `${workflows.filter(w => w.enabled).length}/${workflows.length} workflow đang bật`}
          </p>
        </div>
        <a
          href="/dashboard/workflows"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Quản lý Workflows →
        </a>
      </div>
    </div>
  )
}
