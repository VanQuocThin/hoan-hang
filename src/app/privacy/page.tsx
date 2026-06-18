import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Chính sách bảo mật</h1>
        <div className="prose prose-blue text-sm text-gray-600 space-y-6">
          <p>Chính sách bảo mật này mô tả cách <strong>HoànHàng</strong> thu thập, sử dụng và bảo mật thông tin khi bạn và khách hàng của bạn sử dụng hệ thống của chúng tôi.</p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8">1. Thông tin chúng tôi thu thập</h2>
          <p>Chúng tôi thu thập thông tin tài khoản của bạn (tên cửa hàng, email, mật khẩu) và thông tin đơn hàng/đổi trả của khách hàng để xử lý yêu cầu đổi trả một cách tự động.</p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">2. Cách chúng tôi sử dụng thông tin</h2>
          <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Vận hành, duy trì và cải thiện cổng đổi trả sản phẩm.</li>
            <li>Đồng bộ đơn hàng với các đối tác vận chuyển (GHN, GHTK, ViettelPost) theo yêu cầu của bạn.</li>
            <li>Hỗ trợ phân tích tỷ lệ đổi trả hàng phục vụ mục đích báo cáo trong Dashboard của bạn.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">3. Chia sẻ dữ liệu</h2>
          <p>Chúng tôi không bán hoặc chia sẻ dữ liệu cá nhân của người dùng hay khách hàng của bạn cho bên thứ ba vì mục đích tiếp thị. Dữ liệu chỉ được chia sẻ với các bên đối tác do chính bạn tích hợp (đơn vị vận chuyển, cổng thanh toán) để hoàn thành quy trình đổi trả.</p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">4. An toàn dữ liệu</h2>
          <p>Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ dữ liệu khỏi truy cập trái phép, mất mát hoặc phá hủy.</p>
        </div>
      </div>
    </div>
  )
}
