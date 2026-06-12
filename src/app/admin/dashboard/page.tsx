import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Calendar 
} from "lucide-react";

const adminFeatures = [
  {
    title: "Quản lý Giảng viên",
    icon: <Users className="w-8 h-8 text-blue-600 mb-3" />,
    description: "Tạo tài khoản, import file Excel, cập nhật hồ sơ, phân công giảng dạy, khóa/mở tài khoản, và xem lịch dạy.",
    link: "/admin/lecturers"
  },
  {
    title: "Quản lý Học viên",
    icon: <GraduationCap className="w-8 h-8 text-green-600 mb-3" />,
    description: "Tạo tài khoản, import từ file, gán vào khóa học, chuyển lớp, và theo dõi tiến độ.",
    link: "/admin/students"
  },
  {
    title: "Quản lý Khóa học",
    icon: <BookOpen className="w-8 h-8 text-purple-600 mb-3" />,
    description: "Tạo, cập nhật, gán giảng viên chủ nhiệm, và cấu hình chương trình bài học.",
    link: "/admin/courses"
  },
  {
    title: "Quản lý Tài liệu",
    icon: <FileText className="w-8 h-8 text-orange-600 mb-3" />,
    description: "Tải lên tài liệu, phân loại theo chương, quản lý phiên bản, và cấu hình quyền xem.",
    link: "/admin/documents"
  },
  {
    title: "Quản lý Bài thi (Quiz)",
    icon: <HelpCircle className="w-8 h-8 text-pink-600 mb-3" />,
    description: "Tạo ngân hàng câu hỏi, tạo bài thi, cấu hình số lần thi/thời gian, và xem kết quả.",
    link: "/admin/quizzes"
  },
  {
    title: "Quản lý Lịch học",
    icon: <Calendar className="w-8 h-8 text-teal-600 mb-3" />,
    description: "Tạo buổi học, gán giảng viên, dời lịch, và hủy lịch kèm thông báo.",
    link: "/admin/schedules"
  }
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#bbe7ff]">
        <h1 className="text-3xl font-bold text-slate-800">Tổng quan Admin</h1>
        <p className="text-slate-600 mt-2">
          Chào mừng quay trở lại. Vui lòng chọn một nghiệp vụ bên dưới để tiếp tục.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature, idx) => (
          <Link href={feature.link} key={idx}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#bbe7ff] h-full transition hover:shadow-md hover:scale-[1.02]">
              {feature.icon}
              <h2 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h2>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
