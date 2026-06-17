import type { Order, ReturnItem } from '@/types'

export async function fetchWooOrder(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  orderNumber: string,
  customerContact: string
): Promise<Order | null> {
  const base = storeUrl.replace(/\/$/, '')
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const res = await fetch(
    `${base}/wp-json/wc/v3/orders?number=${orderNumber}&per_page=5`,
    { headers: { Authorization: `Basic ${auth}` } }
  )

  if (!res.ok) return null
  const orders = await res.json() as WooOrder[]

  const order = orders.find(o =>
    o.billing?.email?.toLowerCase() === customerContact.toLowerCase() ||
    o.billing?.phone?.replace(/\D/g, '') === customerContact.replace(/\D/g, '')
  )

  if (!order) return null
  return mapWooOrder(order)
}

interface WooOrder {
  id: number
  number: string
  billing?: { first_name?: string; last_name?: string; email?: string; phone?: string }
  total: string
  date_created: string
  line_items: Array<{
    product_id: number
    variation_id?: number
    name: string
    sku?: string
    quantity: number
    price: number
    image?: { src: string }
  }>
}

function mapWooOrder(o: WooOrder): Order {
  return {
    id: String(o.id),
    order_number: `#${o.number}`,
    customer_name: [o.billing?.first_name, o.billing?.last_name].filter(Boolean).join(' '),
    customer_email: o.billing?.email ?? '',
    customer_phone: o.billing?.phone,
    total: parseFloat(o.total),
    created_at: o.date_created,
    line_items: o.line_items.map(item => ({
      product_id: String(item.product_id),
      variant_id: item.variation_id ? String(item.variation_id) : undefined,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image?.src,
    } satisfies ReturnItem)),
  }
}
