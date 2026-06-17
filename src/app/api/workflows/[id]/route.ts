import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getMerchantId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('merchants').select('id').eq('user_id', user.id).single()
  return { supabase, merchantId: data?.id }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getMerchantId()
  if (!ctx?.merchantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await ctx.supabase
    .from('workflows')
    .update({ name: body.name, enabled: body.enabled, priority: body.priority, conditions: body.conditions, actions: body.actions })
    .eq('id', id)
    .eq('merchant_id', ctx.merchantId)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getMerchantId()
  if (!ctx?.merchantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ctx.supabase.from('workflows').delete().eq('id', id).eq('merchant_id', ctx.merchantId)
  return NextResponse.json({ ok: true })
}
