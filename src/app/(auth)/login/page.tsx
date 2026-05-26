import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Cột trái: Form đăng nhập */}
      <div className="flex items-center justify-center bg-[#FFFFFF] p-4 md:p-8">
        <LoginForm />
      </div>

      {/* Cột phải: Hình ảnh, slogan (Ẩn trên mobile) */}
      <div className="hidden md:flex flex-col items-center justify-center bg-[#87CEFA] p-12 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[20%] w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
            EduCenter
          </h1>
          <p className="text-xl font-medium leading-relaxed opacity-90">
            Hệ thống quản lý học tập thông minh. 
            Đồng hành cùng học viên và giảng viên trên chặng đường chinh phục tri thức.
          </p>
          
          <div className="mt-12 bg-white/20 p-6 rounded-2xl backdrop-blur-md border border-white/30 text-left">
            <h3 className="text-lg font-bold mb-2"> Bạn biết không?</h3>
            <p className="text-sm opacity-90">
              Việc sử dụng nền tảng trực tuyến giúp học viên tăng hiệu quả tiếp thu kiến thức lên đến 40% nhờ vào hệ thống theo dõi tiến độ tự động.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}