import Link from "next/link";
import { 
  BookOpen, 
  FileDown, 
  CheckCircle, 
  Calendar 
} from "lucide-react";

const studentFeatures = [
  {
    title: "Khóa học của tôi",
    icon: <BookOpen className="w-8 h-8 text-blue-600 mb-3" />,
    description: "Nhấn vào xem các khóa học bạn đã tham gia và nội dung chương trình học.",
    link: "/student/courses"
  },
  {
    title: "Tài liệu",
    icon: <FileDown className="w-8 h-8 text-orange-600 mb-3" />,
    description: "Xem và tải xuống các tài liệu học tập (PDF, Video, PPT) của khóa học.",
    link: "/student/courses" // Can point to course details or documents section
  },
  {
    title: "Bài thi & Đánh giá",
    icon: <CheckCircle className="w-8 h-8 text-green-600 mb-3" />,
    description: "Làm bài kiểm tra, xem điểm số và kiểm tra lịch sử các bài đã làm.",
    link: "/student/courses" // Often inside courses
  },
  {
    title: "Lịch học",
    icon: <Calendar className="w-8 h-8 text-purple-600 mb-3" />,
    description: "Bao gồm lịch học theo tuần/tháng và chi tiết nội dung của từng buổi học.",
    link: "/student/schedules"
  }
];

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#bbe7ff]">
        <h1 className="text-3xl font-bold text-slate-800">Trang chủ Học viên</h1>
        <p className="text-slate-600 mt-2">
          Chào mừng quay trở lại. Hãy bắt đầu việc học của bạn ngay bây giờ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studentFeatures.map((feature, idx) => (
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
