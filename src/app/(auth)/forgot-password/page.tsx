import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";

export const metadata = {
  title: "Quên mật khẩu - EduCenter",
  description: "Yêu cầu khôi phục mật khẩu tài khoản EduCenter",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left Column: Forgot Password Form */}
      <div className="flex items-center justify-center bg-[#FFFFFF] p-4 md:p-8">
        <ForgotPasswordForm />
      </div>

      {/* Right Column: Branding & Slogan (hidden on mobile) */}
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
            <h3 className="text-lg font-bold mb-2">Bảo mật thông tin</h3>
            <p className="text-sm opacity-90">
              Hệ thống EduCenter áp dụng các biện pháp bảo mật hiện đại nhất nhằm đảm bảo thông tin cá nhân và tài khoản học tập của bạn luôn an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
