'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Merchant } from '@/types'
import { Check, ExternalLink } from 'lucide-react'

export default function IntegrationsForm({ merchant: initial }: { merchant: Merchant }) {
  const [merchant, setMerchant] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('merchants').update({
      platform: merchant.platform,
      platform_store_url: merchant.platform_store_url,
      platform_api_key: merchant.platform_api_key,
      platform_api_secret: merchant.platform_api_secret,
    }).eq('id', merchant.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function testConnection() {
    setTesting(true)
    setTestResult(null)
    const res = await fetch('/api/integrations/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: merchant.platform,
        storeUrl: merchant.platform_store_url,
        apiKey: merchant.platform_api_key,
        apiSecret: merchant.platform_api_secret,
      }),
    })
    setTestResult(res.ok ? 'success' : 'error')
    setTesting(false)
  }

  return (
    <div className="space-y-6">
      {/* Platform */}
      <Card>
        <CardHeader>
          <CardTitle>Nền tảng thương mại điện tử</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['shopify', 'woocommerce'] as const).map(p => (
              <label
                key={p}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                  merchant.platform === p ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="platform"
                  value={p}
                  checked={merchant.platform === p}
                  onChange={() => setMerchant(m => ({ ...m, platform: p }))}
                  className="sr-only"
                />
                <div>
                  <div className="font-semibold text-gray-900 capitalize">{p}</div>
                  <div className="text-xs text-gray-500">
                    {p === 'shopify' ? 'Admin API · OAuth' : 'REST API · Consumer Key'}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {merchant.platform && (
            <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Input
                label={merchant.platform === 'shopify' ? 'Store URL (VD: mystore.myshopify.com)' : 'Store URL (VD: https://mystore.vn)'}
                value={merchant.platform_store_url ?? ''}
                onChange={e => setMerchant(m => ({ ...m, platform_store_url: e.target.value }))}
                placeholder={merchant.platform === 'shopify' ? 'mystore.myshopify.com' : 'https://mystore.vn'}
              />
              <Input
                label={merchant.platform === 'shopify' ? 'Admin API Key' : 'Consumer Key'}
                value={merchant.platform_api_key ?? ''}
                onChange={e => setMerchant(m => ({ ...m, platform_api_key: e.target.value }))}
                type="password"
                placeholder="••••••••••••"
              />
              <Input
                label={merchant.platform === 'shopify' ? 'Admin API Secret' : 'Consumer Secret'}
                value={merchant.platform_api_secret ?? ''}
                onChange={e => setMerchant(m => ({ ...m, platform_api_secret: e.target.value }))}
                type="password"
                placeholder="••••••••••••"
              />

              {merchant.platform === 'shopify' && (
                <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                  Vào <strong>Shopify Admin → Apps → Develop apps</strong> để lấy API credentials.
                  Cần quyền: <code>read_orders</code>, <code>write_orders</code>.
                </div>
              )}
              {merchant.platform === 'woocommerce' && (
                <div className="rounded-lg bg-purple-50 p-3 text-xs text-purple-700">
                  Vào <strong>WooCommerce → Settings → Advanced → REST API</strong> để tạo API Key.
                  Cần quyền: Read/Write.
                </div>
              )}

              {testResult === 'success' && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  ✓ Kết nối thành công!
                </div>
              )}
              {testResult === 'error' && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  ✗ Kết nối thất bại. Kiểm tra lại URL và API credentials.
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={testConnection} disabled={testing}>
                  {testing ? 'Đang kiểm tra...' : 'Test kết nối'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={save} disabled={saving}>
            {saved ? <><Check className="h-4 w-4" /> Đã lưu</> : saving ? 'Đang lưu...' : 'Lưu tích hợp'}
          </Button>
        </CardFooter>
      </Card>

      {/* Shipping carriers */}
      <Card>
        <CardHeader><CardTitle>Đối tác vận chuyển</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: 'GHN', desc: 'Giao Hàng Nhanh', color: 'border-orange-200 bg-orange-50' },
              { name: 'GHTK', desc: 'Giao Hàng Tiết Kiệm', color: 'border-red-200 bg-red-50' },
              { name: 'ViettelPost', desc: 'Viettel Post', color: 'border-blue-200 bg-blue-50' },
              { name: 'J&T Express', desc: 'J&T Express VN', color: 'border-yellow-200 bg-yellow-50' },
            ].map(carrier => (
              <div key={carrier.name} className={`flex items-center justify-between rounded-xl border p-4 ${carrier.color}`}>
                <div>
                  <div className="font-semibold text-gray-900">{carrier.name}</div>
                  <div className="text-xs text-gray-500">{carrier.desc}</div>
                </div>
                <span className="text-xs text-gray-400">Sắp có</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Tích hợp trực tiếp với GHN, GHTK sẽ được ra mắt trong phiên bản tiếp theo.
            Hiện tại merchant gửi tracking number thủ công.
          </p>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader><CardTitle>Cổng thanh toán hoàn tiền</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: 'MoMo', color: 'border-pink-200 bg-pink-50 text-pink-700' },
              { name: 'VNPay', color: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
              { name: 'ZaloPay', color: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
            ].map(p => (
              <div key={p.name} className={`rounded-xl border p-4 text-center ${p.color}`}>
                <div className="font-semibold">{p.name}</div>
                <div className="mt-1 text-xs opacity-70">Sắp có</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Hiện tại hỗ trợ hoàn tiền qua chuyển khoản ngân hàng thủ công.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
