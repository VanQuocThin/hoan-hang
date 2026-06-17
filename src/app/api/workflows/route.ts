import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single()
  if (!merchant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await supabase
    .from('workflows').select('*').eq('merchant_id', merchant.id).order('priority', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single()
  if (!merchant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { data, error } = await supabase.from('workflows').insert({
    merchant_id: merchant.id,
    name: body.name,
    enabled: body.enabled ?? true,
    priority: body.priority ?? 0,
    conditions: body.conditions ?? [],
    actions: body.actions ?? [],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
