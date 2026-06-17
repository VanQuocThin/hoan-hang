import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PortalFlow from '@/components/portal/portal-flow'

export default async function PortalPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params
  const supabase = await createClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, store_name, store_slug, logo_url, primary_color, platform')
    .eq('store_slug', storeSlug)
    .single()

  if (!merchant) notFound()

  const { data: policy } = await supabase
    .from('return_policies')
    .select('*')
    .eq('merchant_id', merchant.id)
    .single()

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ '--brand': merchant.primary_color } as React.CSSProperties}
    >
      {/* Portal Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {merchant.logo_url ? (
              <img src={merchant.logo_url} alt={merchant.store_name} className="h-8 w-auto" />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: merchant.primary_color }}
              >
                {merchant.store_name[0].toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-gray-900">{merchant.store_name}</span>
          </div>
          <span className="text-sm text-gray-400">Đổi trả hàng</span>
        </div>
      </header>

      {/* Portal Flow */}
      <main className="mx-auto max-w-2xl px-6 py-10">
        <PortalFlow merchant={merchant} policy={policy} />
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        Powered by <span className="font-medium text-gray-600">HoànHàng</span>
      </footer>
    </div>
  )
}
