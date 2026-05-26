import Link from "next/link";
import { Users, Star, BookOpen, GraduationCap, Compass, Headset } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-20">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 shadow-sm bg-white border-b border-gray-100">
        <div className="flex justify-between items-center h-20 px-6 md:px-10 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold text-[#60bafb]">
            EduCenter
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link className="text-gray-600 hover:text-[#60bafb] hover:bg-blue-50 transition-colors duration-200 px-3 py-2 rounded-lg font-medium" href="#">Khóa học</Link>
            <Link className="text-gray-600 hover:text-[#60bafb] hover:bg-blue-50 transition-colors duration-200 px-3 py-2 rounded-lg font-medium" href="#">Gia sư</Link>
            <Link className="text-gray-600 hover:text-[#60bafb] hover:bg-blue-50 transition-colors duration-200 px-3 py-2 rounded-lg font-medium" href="#">Về chúng tôi</Link>
            <Link className="text-gray-600 hover:text-[#60bafb] hover:bg-blue-50 transition-colors duration-200 px-3 py-2 rounded-lg font-medium" href="#">Tin tức</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="hidden md:block font-semibold text-[#60bafb] px-4 py-2 hover:bg-blue-50 transition-colors duration-200 rounded-xl"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="font-semibold bg-gradient-to-r from-[#87CEFA] to-[#60bafb] text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-blue-50/50">
          <img 
            alt="Students learning" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
          />
          <div className="relative z-10 text-center max-w-3xl px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Nâng tầm tri thức, vững bước tương lai
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Hệ thống quản lý học tập chuyên nghiệp, kết nối học viên và những gia sư tâm huyết nhất.
            </p>
            <button className="font-semibold bg-gradient-to-r from-[#87CEFA] to-[#60bafb] text-white px-8 py-4 rounded-full hover:shadow-[0_4px_15px_rgba(135,206,250,0.4)] transition-all transform hover:-translate-y-0.5">
              Khám phá ngay
            </button>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 -mt-16 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#60bafb] mb-2">10,000+</div>
              <div className="font-medium text-gray-500">Học viên</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#60bafb] mb-2">500+</div>
              <div className="font-medium text-gray-500">Gia sư</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#60bafb] mb-2">200+</div>
              <div className="font-medium text-gray-500">Khóa học</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#60bafb] mb-2">98%</div>
              <div className="font-medium text-gray-500">Hài lòng</div>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Khóa học tiêu biểu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col cursor-pointer">
              <div className="h-48 overflow-hidden relative">
                <img alt="Math course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop" />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-[#60bafb] shadow-sm">Tiểu học</div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#60bafb] transition-colors">Toán tư duy lớp 5</h3>
                <p className="text-gray-500 mb-4 text-sm font-medium">GV. Nguyễn Văn A</p>
                <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Users size={16} /> 120 học viên</span>
                  <span className="flex items-center gap-1.5 text-amber-500"><Star size={16} fill="currentColor" /> 4.9</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-[#60bafb]">500.000đ</span>
                  <button className="text-sm font-semibold text-[#60bafb] hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors border border-[#60bafb]">Đăng ký</button>
                </div>
              </div>
            </div>
            
            {/* Course Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col cursor-pointer">
              <div className="h-48 overflow-hidden relative">
                <img alt="English course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop" />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-[#60bafb] shadow-sm">Ngoại ngữ</div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#60bafb] transition-colors">Tiếng Anh giao tiếp</h3>
                <p className="text-gray-500 mb-4 text-sm font-medium">GV. Trần Thị B</p>
                <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Users size={16} /> 85 học viên</span>
                  <span className="flex items-center gap-1.5 text-amber-500"><Star size={16} fill="currentColor" /> 4.8</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-[#60bafb]">800.000đ</span>
                  <button className="text-sm font-semibold text-[#60bafb] hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors border border-[#60bafb]">Đăng ký</button>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col cursor-pointer">
              <div className="h-48 overflow-hidden relative">
                <img alt="Exam prep course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop" />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-[#60bafb] shadow-sm">THPT</div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#60bafb] transition-colors">Luyện thi đại học khối A</h3>
                <p className="text-gray-500 mb-4 text-sm font-medium">GV. Lê Văn C</p>
                <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Users size={16} /> 210 học viên</span>
                  <span className="flex items-center gap-1.5 text-amber-500"><Star size={16} fill="currentColor" /> 5.0</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-[#60bafb]">1.200.000đ</span>
                  <button className="text-sm font-semibold text-[#60bafb] hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors border border-[#60bafb]">Đăng ký</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-20 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Tại sao chọn chúng tôi?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center p-6 rounded-2xl hover:bg-blue-50/50 transition-colors">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="text-[#60bafb]" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Học liệu phong phú</h3>
                <p className="text-gray-600 leading-relaxed">Kho tài liệu đa dạng, cập nhật liên tục theo chuẩn mới nhất.</p>
              </div>
              <div className="text-center p-6 rounded-2xl hover:bg-blue-50/50 transition-colors">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <GraduationCap className="text-[#60bafb]" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Giáo viên tận tâm</h3>
                <p className="text-gray-600 leading-relaxed">Đội ngũ giảng viên giàu kinh nghiệm, nhiệt huyết với nghề.</p>
              </div>
              <div className="text-center p-6 rounded-2xl hover:bg-blue-50/50 transition-colors">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Compass className="text-[#60bafb]" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Lộ trình cá nhân hóa</h3>
                <p className="text-gray-600 leading-relaxed">Phát triển năng lực từng học viên với kế hoạch học tập riêng.</p>
              </div>
              <div className="text-center p-6 rounded-2xl hover:bg-blue-50/50 transition-colors">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Headset className="text-[#60bafb]" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Hỗ trợ 24/7</h3>
                <p className="text-gray-600 leading-relaxed">Luôn sẵn sàng giải đáp thắc mắc và đồng hành cùng học viên.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-20">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Khách hàng nói gì về chúng tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
              <img alt="Avatar" className="w-16 h-16 rounded-full object-cover shrink-0 ring-4 ring-blue-50" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" />
              <div>
                <p className="text-gray-600 italic mb-4 leading-relaxed tracking-wide">
                  "Chất lượng giảng dạy tuyệt vời. Con tôi đã tiến bộ rõ rệt môn Toán chỉ sau 2 tháng theo học. Rất cảm ơn trung tâm."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-[#60bafb] rounded-full"></div>
                  <h4 className="font-bold text-gray-900">Phụ huynh em Minh</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
              <img alt="Avatar" className="w-16 h-16 rounded-full object-cover shrink-0 ring-4 ring-blue-50" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" />
              <div>
                <p className="text-gray-600 italic mb-4 leading-relaxed tracking-wide">
                  "Các thầy cô hướng dẫn rất tận tình, bài giảng dễ hiểu. Nhờ có khóa Luyện thi, em đã tự tin hơn rất nhiều."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-[#60bafb] rounded-full"></div>
                  <h4 className="font-bold text-gray-900">Học sinh Tuấn Anh</h4>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300">
        <div className="py-16 px-6 md:px-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-white mb-6">
              EduCenter
            </div>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              Đồng hành cùng bạn trên con đường chinh phục tri thức và xây dựng tương lai.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Liên kết</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="hover:text-[#60bafb] transition-colors">Điều khoản</Link>
              <Link href="#" className="hover:text-[#60bafb] transition-colors">Bảo mật</Link>
              <Link href="#" className="hover:text-[#60bafb] transition-colors">Liên hệ</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Học viên</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="hover:text-[#60bafb] transition-colors">Khóa học</Link>
              <Link href="#" className="hover:text-[#60bafb] transition-colors">Thư viện</Link>
              <Link href="#" className="hover:text-[#60bafb] transition-colors">Hỏi đáp</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
           © 2024 Trung tâm Gia sư EduCenter. Bảo lưu mọi quyền.
        </div>
      </footer>
    </div>
  );
}
