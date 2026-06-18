import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/nav'
import { IS_DEV_MODE, DEV_COOKIE, parseDevSession, buildMockMerchant } from '@/lib/dev-auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (IS_DEV_MODE) {
    const cookieStore = await cookies()
    const raw = cookieStore.get(DEV_COOKIE)?.value
    const session = raw ? parseDevSession(raw) : null
    if (!session) redirect('/login')
    const merchant = buildMockMerchant(session)
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardNav merchant={merchant} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </main>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/register')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav merchant={merchant} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
