import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { platform, storeUrl, apiKey, apiSecret } = await req.json()

  if (!platform || !storeUrl || !apiKey) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
  }

  try {
    if (platform === 'shopify') {
      const url = storeUrl.includes('://') ? storeUrl : `https://${storeUrl}`
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
      const res = await fetch(`${url}/admin/api/2024-01/shop.json`, {
        headers: { Authorization: `Basic ${auth}` },
      })
      if (!res.ok) throw new Error('Unauthorized')
    } else if (platform === 'woocommerce') {
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
      const res = await fetch(`${storeUrl}/wp-json/wc/v3/system_status`, {
        headers: { Authorization: `Basic ${auth}` },
      })
      if (!res.ok) throw new Error('Unauthorized')
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Kết nối thất bại' }, { status: 400 })
  }
}
