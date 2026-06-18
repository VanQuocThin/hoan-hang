import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    merchantId, orderId, orderNumber, customerName, customerPhone, customerEmail,
    items, outcome, paymentMethod, paymentInfo, notes,
    refundAmount, storeCreditAmount, bonusCredit,
  } = body

  if (!merchantId || !orderId || !items?.length || !outcome) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  if (merchantId === 'demo-merchant-id') {
    const randomCode = Math.floor(10000 + Math.random() * 90000)
    return NextResponse.json({ return_code: `RT-DEMO-${randomCode}` })
  }

  try {
    const supabase = await createClient()

    // Check for duplicate
    const { data: existing } = await supabase
      .from('returns')
      .select('id')
      .eq('merchant_id', merchantId)
      .eq('order_id', orderId)
      .in('status', ['pending', 'approved', 'shipped'])
      .limit(1)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Đơn hàng này đã có yêu cầu đổi trả đang xử lý.' }, { status: 409 })
    }

    // Get policy for auto-approve
    const { data: policy } = await supabase
      .from('return_policies')
      .select('auto_approve')
      .eq('merchant_id', merchantId)
      .single()

    const { data: ret, error } = await supabase
      .from('returns')
      .insert({
        merchant_id: merchantId,
        order_id: orderId,
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        items,
        outcome,
        payment_method: paymentMethod,
        payment_info: paymentInfo,
        notes,
        refund_amount: refundAmount,
        store_credit_amount: storeCreditAmount,
        bonus_credit: bonusCredit,
        status: policy?.auto_approve ? 'approved' : 'pending',
      })
      .select('return_code')
      .single()

    if (error || !ret) {
      return NextResponse.json({ error: 'Không thể tạo yêu cầu' }, { status: 500 })
    }

    return NextResponse.json({ return_code: ret.return_code })
  } catch (error) {
    console.error('Submit API database error:', error)
    return NextResponse.json({ error: 'Lỗi kết nối cơ sở dữ liệu' }, { status: 500 })
  }
}
