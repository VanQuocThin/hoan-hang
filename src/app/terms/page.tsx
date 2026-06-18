import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Điều khoản dịch vụ</h1>
        <div className="prose prose-blue text-sm text-gray-600 space-y-6">
          <p>Chào mừng bạn đến với <strong>HoànHàng</strong>. Bằng việc đăng ký tài khoản và sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản dịch vụ dưới đây.</p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8">1. Tài khoản của bạn</h2>
          <p>Khi đăng ký tài khoản, bạn có trách nhiệm tự bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình. Vui lòng liên hệ với chúng tôi ngay lập tức nếu phát hiện hoạt động trái phép.</p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">2. Sử dụng dịch vụ</h2>
          <p>Bạn đồng ý chỉ sử dụng dịch vụ cho mục đích hợp pháp và tuân thủ các quy tắc quản lý đổi trả của các nền tảng tích hợp (Shopify, WooCommerce, v.v.). Chúng tôi có quyền tạm ngừng hoặc chấm dứt tài khoản nếu phát hiện hành vi lạm dụng hoặc vi phạm chính sách.</p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">3. Tích hợp bên thứ ba</h2>
          <p>HoànHàng tích hợp trực tiếp với các đơn vị vận chuyển và cổng thanh toán bên thứ ba tại Việt Nam (GHTK, GHN, MoMo, VNPay...). Bạn tự chịu trách nhiệm về tính chính xác của tài khoản kết nối và tuân thủ điều khoản riêng của các dịch vụ đó.</p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">4. Thay đổi điều khoản</h2>
          <p>Chúng tôi có thể cập nhật điều khoản này theo thời gian. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.</p>
        </div>
      </div>
    </div>
  )
}
