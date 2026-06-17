import type { Order, ReturnItem } from '@/types'

export async function fetchShopifyOrder(
  storeUrl: string,
  apiKey: string,
  apiSecret: string,
  orderNumber: string,
  customerContact: string
): Promise<Order | null> {
  const baseUrl = storeUrl.replace(/\/$/, '')
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  const res = await fetch(
    `${baseUrl}/admin/api/2024-01/orders.json?name=%23${encodeURIComponent(orderNumber)}&status=any`,
    { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }
  )

  if (!res.ok) return null
  const data = await res.json()
  const orders = data.orders as ShopifyOrder[]

  const order = orders.find(o =>
    o.email?.toLowerCase() === customerContact.toLowerCase() ||
    o.phone?.replace(/\D/g, '') === customerContact.replace(/\D/g, '')
  )

  if (!order) return null
  return mapShopifyOrder(order)
}

interface ShopifyOrder {
  id: number
  name: string
  email?: string
  phone?: string
  customer?: { first_name?: string; last_name?: string }
  total_price: string
  created_at: string
  line_items: Array<{
    id: number
    product_id: number
    variant_id: number
    title: string
    sku?: string
    quantity: number
    price: string
    image?: { src: string }
  }>
}

function mapShopifyOrder(o: ShopifyOrder): Order {
  return {
    id: String(o.id),
    order_number: o.name,
    customer_name: [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' '),
    customer_email: o.email ?? '',
    customer_phone: o.phone ?? undefined,
    total: parseFloat(o.total_price),
    created_at: o.created_at,
    line_items: o.line_items.map(item => ({
      product_id: String(item.product_id),
      variant_id: String(item.variant_id),
      name: item.title,
      sku: item.sku,
      quantity: item.quantity,
      price: parseFloat(item.price),
      image_url: item.image?.src,
    } satisfies ReturnItem)),
  }
}
