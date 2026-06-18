export const IS_DEV_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key'

export const DEV_COOKIE = 'dev_session'

export interface DevSession {
  email: string
  storeName: string
  storeSlug: string
}

export function buildMockMerchant(session: DevSession) {
  return {
    id: 'dev-merchant-id',
    user_id: 'dev-user-id',
    store_name: session.storeName,
    store_slug: session.storeSlug,
    platform: undefined as undefined,
    logo_url: undefined as undefined,
    primary_color: '#2563eb',
    plan: 'free' as const,
    created_at: new Date().toISOString(),
  }
}

export function setDevSession(session: DevSession) {
  document.cookie = `${DEV_COOKIE}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400`
}

export function clearDevSession() {
  document.cookie = `${DEV_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export function parseDevSession(cookieValue: string): DevSession | null {
  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as DevSession
  } catch {
    return null
  }
}
