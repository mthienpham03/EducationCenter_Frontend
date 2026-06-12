import { RegisterForm } from "@/components/features/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Cột trái: Hình ảnh, slogan (Ẩn trên mobile) */}
      {/* Tính năng đảo ngược vị trí so với trang login để tạo sự mới mẻ */}
      <div className="hidden md:flex flex-col items-center justify-center bg-[#87CEFA] p-12 text-white relative overflow-hidden order-2 md:order-1">
        {/* Decorative elements */}
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[20%] w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
            Gia Nhập Cộng Đồng
          </h1>
          <p className="text-xl font-medium leading-relaxed opacity-90">
            Khơi dậy tiềm năng, phát triển kỹ năng và mở ra vô số cơ hội mới với thư viện khóa học khổng lồ và chất lượng.
          </p>
          
          <div className="mt-12 bg-white/20 p-6 rounded-2xl backdrop-blur-md border border-white/30 text-left">
            <h3 className="text-lg font-bold mb-2">Lợi ích khi tham gia</h3>
            <ul className="text-sm opacity-90 space-y-2 list-disc list-inside px-2">
              <li>Truy cập hàng trăm tài liệu và bài giảng.</li>
              <li>Theo dõi lộ trình học tập cá nhân hóa.</li>
              <li>Hỗ trợ 24/7 từ đội ngũ giảng viên tận tình.</li>
              <li>Kết nối, giao lưu cùng cộng đồng học viện thân thiện.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cột phải: Form đăng ký */}
      <div className="flex items-center justify-center bg-[#FFFFFF] p-4 md:p-8 order-1 md:order-2">
        <RegisterForm />
      </div>
    </div>
  );
}