'use client'
import { useState } from 'react'
import type { ReturnPolicy, ReturnItem, ReturnOutcome } from '@/types'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Package, ArrowRight, CheckCircle, RefreshCcw, Wallet, ArrowLeft } from 'lucide-react'

type Step = 'lookup' | 'items' | 'outcome' | 'details' | 'confirm' | 'done'
const ACTIVE_STEPS = ['lookup', 'items', 'outcome', 'details', 'confirm'] as const

interface SelectedItem extends ReturnItem {
  selected: boolean
  reason: string
}

interface Merchant {
  id: string
  store_name: string
  store_slug: string
  primary_color: string
  platform?: string
}

export default function PortalFlow({
  merchant,
  policy,
}: {
  merchant: Merchant
  policy: ReturnPolicy | null
}) {
  const [step, setStep] = useState<Step>('lookup')
  const [orderNumber, setOrderNumber] = useState('')
  const [contact, setContact] = useState('')
  const [order, setOrder] = useState<{ id: string; order_number: string; customer_name: string; line_items: ReturnItem[] } | null>(null)
  const [items, setItems] = useState<SelectedItem[]>([])
  const [outcome, setOutcome] = useState<ReturnOutcome | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentInfo, setPaymentInfo] = useState('')
  const [notes, setNotes] = useState('')
  const [returnCode, setReturnCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const color = merchant.primary_color
  const selectedItems = items.filter(i => i.selected)
  const totalValue = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const exchangeBonus = policy?.exchange_bonus_vnd ?? 0
  const creditBonus = policy?.store_credit_bonus_vnd ?? 0

  async function lookupOrder() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/portal/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId: merchant.id, orderNumber, contact }),
    })
    const data = await res.json()
    if (!res.ok || !data.order) {
      setError(data.error ?? 'Không tìm thấy đơn hàng. Kiểm tra lại số đơn và SĐT/email.')
      setLoading(false)
      return
    }
    setOrder(data.order)
    setItems(data.order.line_items.map((item: ReturnItem) => ({ ...item, selected: false, reason: '' })))
    setStep('items')
    setLoading(false)
  }

  async function submitReturn() {
    setLoading(true)
    const res = await fetch('/api/portal/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantId: merchant.id,
        orderId: order!.id,
        orderNumber: order!.order_number,
        customerName: order!.customer_name,
        customerPhone: contact.includes('@') ? undefined : contact,
        customerEmail: contact.includes('@') ? contact : undefined,
        items: selectedItems,
        outcome,
        paymentMethod: outcome === 'refund' ? paymentMethod : undefined,
        paymentInfo: outcome === 'refund' ? { info: paymentInfo } : undefined,
        notes,
        refundAmount: totalValue,
        storeCreditAmount: outcome === 'store_credit' ? totalValue + creditBonus : 0,
        bonusCredit: outcome === 'exchange' ? exchangeBonus : outcome === 'store_credit' ? creditBonus : 0,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setReturnCode(data.return_code)
      setStep('done')
    } else {
      setError(data.error ?? 'Gửi yêu cầu thất bại')
    }
    setLoading(false)
  }

  const stepLabels = ['Tra cứu', 'Chọn hàng', 'Kết quả', 'Chi tiết', 'Xác nhận']
  const stepIndex = (ACTIVE_STEPS as readonly string[]).indexOf(step)

  if (step === 'done') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Đã nhận yêu cầu!</h2>
        <p className="mt-2 text-gray-500">Mã yêu cầu của bạn:</p>
        <div className="mt-3 rounded-xl bg-gray-50 px-6 py-4 font-mono text-2xl font-bold tracking-widest text-gray-900">
          {returnCode}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Lưu mã này để theo dõi trạng thái. Chúng tôi sẽ liên hệ bạn trong vòng 24h.
        </p>
        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
          {outcome === 'exchange' && '🔄 Bạn chọn đổi hàng. Chúng tôi sẽ liên hệ để xác nhận sản phẩm mới.'}
          {outcome === 'store_credit' && `💳 Tín dụng ${formatVND(totalValue + creditBonus)} sẽ được cộng vào tài khoản sau khi xử lý.`}
          {outcome === 'refund' && `💰 Hoàn tiền ${formatVND(totalValue)} sẽ được xử lý trong 3-5 ngày làm việc.`}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      {(ACTIVE_STEPS as readonly string[]).includes(step) && (
        <div className="flex items-center gap-1">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < stepIndex ? 'bg-green-500 text-white' :
                    i === stepIndex ? 'text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                  style={i === stepIndex ? { backgroundColor: color } : {}}
                >
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${i === stepIndex ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`mx-1 h-px flex-1 ${i < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Step 1: Lookup */}
        {step === 'lookup' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
                <Package className="h-6 w-6" style={{ color }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Tra cứu đơn hàng</h2>
              <p className="mt-1 text-sm text-gray-500">Nhập mã đơn hàng và thông tin liên hệ</p>
            </div>
            <Input
              label="Mã đơn hàng"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="VD: #1234 hoặc DH12345"
            />
            <Input
              label="Số điện thoại hoặc Email"
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="VD: 0901234567 hoặc email@gmail.com"
            />
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Button
              className="w-full"
              size="lg"
              style={{ backgroundColor: color }}
              onClick={lookupOrder}
              disabled={loading || !orderNumber || !contact}
            >
              {loading ? 'Đang tra cứu...' : 'Tra cứu đơn hàng'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Select items */}
        {step === 'items' && order && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Chọn sản phẩm cần trả</h2>
            <p className="text-sm text-gray-500">Đơn hàng {order.order_number} · {order.customer_name}</p>
            <div className="space-y-3">
              {items.map((item, i) => (
                <label key={i} className={`flex cursor-pointer gap-4 rounded-xl border-2 p-4 transition-colors ${item.selected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, selected: e.target.checked } : it))}
                    className="mt-1 h-4 w-4 rounded"
                  />
                  {item.image_url && <img src={item.image_url} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">SL: {item.quantity} · {formatVND(item.price)}</p>
                    {item.selected && (
                      <select
                        value={item.reason}
                        onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, reason: e.target.value } : it))}
                        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="">Chọn lý do...</option>
                        {(policy?.allowed_reasons ?? ['Sản phẩm lỗi', 'Sai kích thước', 'Không như mô tả', 'Khác']).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('lookup')}>
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </Button>
              <Button
                style={{ backgroundColor: color }}
                onClick={() => setStep('outcome')}
                disabled={selectedItems.length === 0 || selectedItems.some(i => !i.reason)}
              >
                Tiếp theo <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Choose outcome */}
        {step === 'outcome' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Bạn muốn làm gì?</h2>
            <p className="text-sm text-gray-500">
              {selectedItems.length} sản phẩm · Tổng giá trị: <strong>{formatVND(totalValue)}</strong>
            </p>

            <div className="space-y-3">
              {policy?.exchange_enabled !== false && (
                <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors ${outcome === 'exchange' ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="outcome" value="exchange" checked={outcome === 'exchange'} onChange={() => setOutcome('exchange')} className="mt-1 h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Đổi hàng</span>
                      {exchangeBonus > 0 && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          +{formatVND(exchangeBonus)} bonus
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Nhận sản phẩm mới thay thế. Được tặng thêm {formatVND(exchangeBonus)} khi đổi.</p>
                  </div>
                </label>
              )}

              {policy?.store_credit_enabled !== false && (
                <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors ${outcome === 'store_credit' ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="outcome" value="store_credit" checked={outcome === 'store_credit'} onChange={() => setOutcome('store_credit')} className="mt-1 h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">Tín dụng cửa hàng</span>
                      {creditBonus > 0 && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          +{formatVND(creditBonus)} bonus
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Nhận <strong>{formatVND(totalValue + creditBonus)}</strong> dùng mua hàng lần sau.
                    </p>
                  </div>
                </label>
              )}

              {policy?.refund_enabled !== false && (
                <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors ${outcome === 'refund' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="outcome" value="refund" checked={outcome === 'refund'} onChange={() => setOutcome('refund')} className="mt-1 h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-gray-500" />
                      <span className="font-semibold text-gray-900">Hoàn tiền</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Hoàn <strong>{formatVND(totalValue)}</strong> về tài khoản ngân hàng. Mất 3-5 ngày làm việc.</p>
                  </div>
                </label>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('items')}><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
              <Button style={{ backgroundColor: color }} onClick={() => setStep('details')} disabled={!outcome}>
                Tiếp theo <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Thông tin thêm</h2>

            {outcome === 'refund' && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Phương thức nhận tiền</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['bank_transfer', 'momo', 'vnpay', 'zalopay'].map(pm => (
                      <label key={pm} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${paymentMethod === pm ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
                        <input type="radio" name="payment" value={pm} checked={paymentMethod === pm} onChange={() => setPaymentMethod(pm)} className="h-3.5 w-3.5" />
                        {pm === 'bank_transfer' ? 'Chuyển khoản' : pm === 'momo' ? 'MoMo' : pm === 'vnpay' ? 'VNPay' : 'ZaloPay'}
                      </label>
                    ))}
                  </div>
                </div>
                {paymentMethod && (
                  <Input
                    label={paymentMethod === 'bank_transfer' ? 'Số tài khoản & tên ngân hàng' : `Số điện thoại ${paymentMethod.toUpperCase()}`}
                    value={paymentInfo}
                    onChange={e => setPaymentInfo(e.target.value)}
                    placeholder={paymentMethod === 'bank_transfer' ? '0123456789 - Vietcombank' : '0901234567'}
                  />
                )}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Ghi chú thêm <span className="text-gray-400">(tùy chọn)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mô tả thêm về vấn đề..."
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('outcome')}><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
              <Button
                style={{ backgroundColor: color }}
                onClick={() => setStep('confirm')}
                disabled={outcome === 'refund' && (!paymentMethod || !paymentInfo)}
              >
                Xem lại <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Xác nhận yêu cầu</h2>

            <div className="rounded-xl bg-gray-50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Đơn hàng</span>
                <span className="font-medium">{order?.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số sản phẩm</span>
                <span className="font-medium">{selectedItems.length} sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kết quả</span>
                <span className="font-medium">
                  {outcome === 'exchange' ? '🔄 Đổi hàng' : outcome === 'store_credit' ? '💳 Tín dụng cửa hàng' : '💰 Hoàn tiền'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span>
                  {outcome === 'exchange' ? 'Tổng giá trị + Bonus' :
                   outcome === 'store_credit' ? 'Tín dụng nhận được' : 'Số tiền hoàn'}
                </span>
                <span style={{ color }}>
                  {outcome === 'exchange' ? `${formatVND(totalValue)} + ${formatVND(exchangeBonus)} bonus` :
                   outcome === 'store_credit' ? formatVND(totalValue + creditBonus) :
                   formatVND(totalValue)}
                </span>
              </div>
            </div>

            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('details')}><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
              <Button style={{ backgroundColor: color }} onClick={submitReturn} disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'} <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
