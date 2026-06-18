import Link from 'next/link'
import { ArrowRight, BarChart3, RefreshCcw, Shield, Zap, Package, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-[var(--font-inter)]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <RefreshCcw className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">HoànHàng</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">Tính năng</a>
            <a href="#pricing" className="hover:text-gray-900">Bảng giá</a>
            <a href="#integrations" className="hover:text-gray-900">Tích hợp</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Dùng thử miễn phí
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Zap className="h-3.5 w-3.5" />
          Tích hợp Shopify & WooCommerce
        </div>
        <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          Biến đổi trả hàng thành{' '}
          <span className="text-blue-600">doanh thu giữ lại</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-gray-500">
          Tự động hóa quy trình hoàn hàng, khuyến khích đổi hàng thay vì hoàn tiền.
          Trung bình giữ lại <strong className="text-gray-900">40% doanh thu</strong> từ returns.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Bắt đầu miễn phí <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/portal/demo"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Xem demo portal
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">Không cần thẻ tín dụng · Cài đặt trong 5 phút</p>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {[
            { value: '40%', label: 'Doanh thu giữ lại' },
            { value: '76%', label: 'Giảm ticket support' },
            { value: '10h', label: 'Tiết kiệm/tuần' },
            { value: '5 phút', label: 'Cài đặt xong' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Tất cả trong một nền tảng</h2>
          <p className="mt-3 text-gray-500">Mọi thứ bạn cần để quản lý đổi trả chuyên nghiệp</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Package,
              title: 'Returns Portal tự phục vụ',
              desc: 'Khách hàng tự tạo yêu cầu trả hàng 24/7. Không cần liên hệ support. Branded theo màu cửa hàng của bạn.',
            },
            {
              icon: RefreshCcw,
              title: 'Đổi hàng tức thì',
              desc: 'Khách nhận hàng mới ngay, không cần chờ hàng cũ về. Giữ doanh thu, tăng hài lòng khách hàng.',
            },
            {
              icon: Zap,
              title: 'Workflow tự động',
              desc: 'Thiết lập quy tắc thông minh: bonus credit cho VIP, chặn returner lặp lại, auto-approve đơn nhỏ.',
            },
            {
              icon: Shield,
              title: 'Phát hiện gian lận',
              desc: 'AI tự nhận diện serial returner, "mặc xong trả", và các hành vi bất thường. Bảo vệ revenue của bạn.',
            },
            {
              icon: BarChart3,
              title: 'Analytics chi tiết',
              desc: 'Dashboard realtime: return rate theo SKU, outcome breakdown, doanh thu giữ lại, top lý do trả hàng.',
            },
            {
              icon: CheckCircle,
              title: 'Shopify & WooCommerce',
              desc: 'Tích hợp native với Shopify và WooCommerce. Đồng bộ đơn hàng tự động, không cần code.',
            },
          ].map(f => (
            <div key={f.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <f.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Cách hoạt động</h2>
            <p className="mt-3 text-gray-500">3 bước đơn giản, khách hàng tự hoàn thành</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Khách nhập đơn hàng', desc: 'Nhập mã đơn + SĐT/email. Portal tự kéo thông tin sản phẩm.' },
              { step: '02', title: 'Chọn sản phẩm & lý do', desc: 'Chọn item muốn trả, lý do, upload ảnh nếu cần.' },
              { step: '03', title: 'Chọn cách giải quyết', desc: 'Hoàn tiền / Đổi hàng (+bonus) / Store credit (+bonus). Portal gợi ý outcome tốt hơn.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Tích hợp với hệ sinh thái Việt Nam</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { name: 'Shopify', cat: 'E-commerce', color: 'bg-green-50 text-green-700 border-green-100' },
            { name: 'WooCommerce', cat: 'E-commerce', color: 'bg-purple-50 text-purple-700 border-purple-100' },
            { name: 'GHN', cat: 'Vận chuyển', color: 'bg-orange-50 text-orange-700 border-orange-100' },
            { name: 'GHTK', cat: 'Vận chuyển', color: 'bg-red-50 text-red-700 border-red-100' },
            { name: 'ViettelPost', cat: 'Vận chuyển', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { name: 'MoMo', cat: 'Thanh toán', color: 'bg-pink-50 text-pink-700 border-pink-100' },
            { name: 'VNPay', cat: 'Thanh toán', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            { name: 'ZaloPay', cat: 'Thanh toán', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
          ].map(i => (
            <div key={i.name} className={`rounded-xl border p-4 text-center ${i.color}`}>
              <div className="font-semibold">{i.name}</div>
              <div className="text-xs opacity-75 mt-0.5">{i.cat}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Bảng giá</h2>
            <p className="mt-3 text-gray-500">Bắt đầu miễn phí, nâng cấp khi cần</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Free',
                price: '0',
                desc: 'Cho cửa hàng mới bắt đầu',
                features: ['50 returns/tháng', 'Returns portal cơ bản', 'Hỗ trợ 1 nền tảng', 'Email notification'],
                cta: 'Bắt đầu miễn phí',
                highlight: false,
              },
              {
                name: 'Essential',
                price: '790.000',
                desc: 'Cho cửa hàng đang tăng trưởng',
                features: ['500 returns/tháng', 'Instant Exchange', 'Store Credit & Bonus', 'Shopify + WooCommerce', 'Analytics dashboard', 'GHN/GHTK tích hợp'],
                cta: 'Dùng thử 14 ngày',
                highlight: true,
              },
              {
                name: 'Advanced',
                price: '1.990.000',
                desc: 'Cho thương hiệu lớn',
                features: ['Unlimited returns', 'Workflow automation', 'AI Fraud Detection', 'Multi-store', 'MoMo/VNPay/ZaloPay', 'API access', 'Priority support'],
                cta: 'Liên hệ tư vấn',
                highlight: false,
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 ${plan.highlight ? 'border-blue-500 bg-blue-600 text-white shadow-xl' : 'border-gray-200 bg-white'}`}
              >
                <div className={`text-sm font-medium ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{plan.desc}</div>
                <div className="mt-2 text-2xl font-bold">{plan.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price === '0' ? 'Miễn phí' : `${plan.price}₫`}</span>
                  {plan.price !== '0' && <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>/tháng</span>}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-blue-600'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Sẵn sàng giữ lại doanh thu?</h2>
        <p className="mt-4 text-gray-500">Cài đặt trong 5 phút. Không cần thẻ tín dụng.</p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Bắt đầu miễn phí <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <RefreshCcw className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium text-gray-600">HoànHàng</span>
          </div>
          <div className="flex gap-6 text-xs">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Điều khoản dịch vụ</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Chính sách bảo mật</Link>
          </div>
          <span>© 2025 HoànHàng. Made in Vietnam.</span>
        </div>
      </footer>
    </div>
  )
}
