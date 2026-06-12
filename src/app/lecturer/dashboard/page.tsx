import Link from "next/link";
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  CalendarDays 
} from "lucide-react";

const lecturerFeatures = [
  {
    title: "Khóa học",
    icon: <BookOpen className="w-8 h-8 text-blue-600 mb-3" />,
    description: "Xem khóa học đang dạy, danh sách học viên, thêm/chỉnh sửa nội dung giảng dạy.",
    link: "/lecturer/courses"
  },
  {
    title: "Tài liệu",
    icon: <FileText className="w-8 h-8 text-orange-600 mb-3" />,
    description: "Upload tài liệu phục vụ giảng dạy, quản lý tài liệu cá nhân đã tải lên.",
    link: "/lecturer/documents"
  },
  {
    title: "Bài thi (Quiz)",
    icon: <HelpCircle className="w-8 h-8 text-pink-600 mb-3" />,
    description: "Thêm câu hỏi, tạo bài thi, và xem kết quả của học viên trong khóa.",
    link: "/lecturer/quizzes"
  },
  {
    title: "Lịch dạy",
    icon: <CalendarDays className="w-8 h-8 text-teal-600 mb-3" />,
    description: "Xem lịch dạy theo tuần/tháng, chi tiết buổi học và thông tin học viên.",
    link: "/lecturer/schedules"
  }
];

export default function LecturerDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#bbe7ff]">
        <h1 className="text-3xl font-bold text-slate-800">Trang chủ Giảng viên</h1>
        <p className="text-slate-600 mt-2">
          Chào mừng quay trở lại. Dưới đây là các chức năng hỗ trợ giảng dạy của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lecturerFeatures.map((feature, idx) => (
          <Link href={feature.link} key={idx}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#bbe7ff] h-full transition hover:shadow-md hover:scale-[1.02] hover:bg-[#ebf8ff]">
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
