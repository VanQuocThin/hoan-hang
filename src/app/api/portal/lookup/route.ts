import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchShopifyOrder } from '@/lib/shopify/client'
import { fetchWooOrder } from '@/lib/woocommerce/client'

export async function POST(req: NextRequest) {
  const { merchantId, orderNumber, contact } = await req.json()

  if (!merchantId || !orderNumber || !contact) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, platform, platform_store_url, platform_api_key, platform_api_secret')
    .eq('id', merchantId)
    .single()

  if (!merchant) {
    return NextResponse.json({ error: 'Không tìm thấy cửa hàng' }, { status: 404 })
  }

  // Check return policy window
  const { data: policy } = await supabase
    .from('return_policies')
    .select('return_window_days')
    .eq('merchant_id', merchantId)
    .single()

  let order = null

  if (merchant.platform === 'shopify' && merchant.platform_store_url && merchant.platform_api_key) {
    order = await fetchShopifyOrder(
      merchant.platform_store_url,
      merchant.platform_api_key,
      merchant.platform_api_secret ?? '',
      orderNumber,
      contact
    )
  } else if (merchant.platform === 'woocommerce' && merchant.platform_store_url && merchant.platform_api_key) {
    order = await fetchWooOrder(
      merchant.platform_store_url,
      merchant.platform_api_key,
      merchant.platform_api_secret ?? '',
      orderNumber,
      contact
    )
  } else {
    // Demo mode: return mock order
    order = {
      id: `demo-${Date.now()}`,
      order_number: orderNumber,
      customer_name: 'Khách hàng Demo',
      customer_email: contact.includes('@') ? contact : undefined,
      customer_phone: !contact.includes('@') ? contact : undefined,
      total: 850000,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      line_items: [
        { product_id: '1', name: 'Áo thun cotton nam', sku: 'AT-001', quantity: 1, price: 350000, image_url: null },
        { product_id: '2', name: 'Quần jeans slim fit', sku: 'QJ-002', quantity: 1, price: 500000, image_url: null },
      ],
    }
  }

  if (!order) {
    return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 })
  }

  // Check return window
  if (policy) {
    const orderDate = new Date(order.created_at)
    const daysSince = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > policy.return_window_days) {
      return NextResponse.json(
        { error: `Đơn hàng đã quá ${policy.return_window_days} ngày, không còn trong thời hạn đổi trả.` },
        { status: 400 }
      )
    }
  }

  return NextResponse.json({ order })
}
