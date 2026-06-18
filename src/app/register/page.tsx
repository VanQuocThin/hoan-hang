'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RefreshCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { slugify } from '@/lib/utils'
import { IS_DEV_MODE, setDevSession } from '@/lib/dev-auth'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', storeName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (IS_DEV_MODE) {
      const slug = slugify(form.storeName) || `store-${Date.now()}`
      setDevSession({ email: form.email, storeName: form.storeName, storeSlug: slug })
      router.push('/dashboard')
      return
    }

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Đăng ký thất bại')
      setLoading(false)
      return
    }

    const slug = slugify(form.storeName) || `store-${Date.now()}`
    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .insert({ user_id: data.user.id, store_name: form.storeName, store_slug: slug })
      .select('id')
      .single()

    if (merchantError || !merchantData) {
      setError('Tên cửa hàng đã tồn tại, hãy chọn tên khác')
      setLoading(false)
      return
    }

    await supabase.from('return_policies').insert({ merchant_id: merchantData.id })
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <RefreshCcw className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HoànHàng</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
          <p className="mt-2 text-sm text-gray-500">Miễn phí, cài đặt trong 5 phút</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên cửa hàng"
              value={form.storeName}
              onChange={e => set('storeName', e.target.value)}
              placeholder="VD: Thời Trang ABC"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="ten@cuahang.com"
              required
            />
            <Input
              label="Mật khẩu"
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              minLength={8}
              required
            />
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký miễn phí'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
