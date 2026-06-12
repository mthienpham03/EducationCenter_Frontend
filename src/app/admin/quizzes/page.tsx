import Link from "next/link";

// Dữ liệu mẫu (Mock data) dành cho trang Quản lý Bài thi
const QUIZZES_DATA = [
  {
    id: "QZ-001",
    title: "Kiểm tra giữa kỳ Front-End",
    course: "Lập trình Web Cơ bản",
    duration: "45 phút",
    questions: 30,
    status: "Đang mở",
    createdBy: "Nguyễn Văn A",
    participants: 120,
  },
  {
    id: "QZ-002",
    title: "Test nhỏ HTML/CSS",
    course: "Frontend Master",
    duration: "15 phút",
    questions: 10,
    status: "Đã đóng",
    createdBy: "Trần Thị B",
    participants: 45,
  },
  {
    id: "QZ-003",
    title: "Thi cuối kỳ ReactJS",
    course: "ReactJS Advanced",
    duration: "90 phút",
    questions: 50,
    status: "Sắp mở",
    createdBy: "Lê Minh C",
    participants: 0,
  },
  {
    id: "QZ-004",
    title: "Trắc nghiệm UI/UX",
    course: "Thiết kế Giao diện",
    duration: "20 phút",
    questions: 15,
    status: "Đang mở",
    createdBy: "Nguyễn Văn A",
    participants: 18,
  },
];

const badgeClass = (status: string) => {
  switch (status) {
    case "Đang mở":
      return "rounded-full bg-[#d6f1ff] px-3 py-1 text-xs font-semibold text-[#0369a1]";
    case "Sắp mở":
      return "rounded-full bg-[#fff4e5] px-3 py-1 text-xs font-semibold text-[#d97706]";
    case "Đã đóng":
      return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500";
    default:
      return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500";
  }
};

export default function AdminQuizzesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0288d1]">Đánh giá năng lực</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Quản lý Bài thi / Quizzes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Kiểm soát tất cả các bài thi trắc nghiệm, bài kiểm tra trên hệ thống thuộc các khóa học khác nhau.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/quizzes/create"
              className="inline-flex items-center justify-center rounded-2xl bg-[#87CEFA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6ec5f2]"
            >
              Tạo Quiz mới
            </Link>
            <button className="inline-flex items-center justify-center rounded-2xl border border-[#bbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#0369a1] transition hover:bg-[#f8feff]">
              Xem kho câu hỏi
            </button>
          </div>
        </div>
      </header>

      {/* Thống kê */}
      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng số đề thi</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{QUIZZES_DATA.length}</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Đang diễn ra</p>
          <p className="mt-4 text-3xl font-semibold text-green-600">
            {QUIZZES_DATA.filter((q) => q.status === "Đang mở").length}
          </p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Sắp xuất bản</p>
          <p className="mt-4 text-3xl font-semibold text-amber-500">
            {QUIZZES_DATA.filter((q) => q.status === "Sắp mở").length}
          </p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Lượt làm bài h.nay</p>
          <p className="mt-4 text-3xl font-semibold text-[#0288d1]">452</p>
        </div>
      </section>

      {/* Bộ lọc và Tìm kiếm */}
      <section className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Tìm bài thi</span>
            <input
              type="search"
              placeholder="Nhập tên bài thi, mã..."
              className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Thuộc khóa học</span>
            <select className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
               <option value="">Tất cả khóa học</option>
               <option value="web">Lập trình Web Cơ bản</option>
               <option value="react">ReactJS Advanced</option>
               <option value="ui">Thiết kế Giao diện</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Trạng thái</span>
            <select className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang mở</option>
              <option value="upcoming">Sắp mở</option>
              <option value="closed">Đã đóng</option>
            </select>
          </label>
        </div>

        {/* Bảng dữ liệu Bài Thi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-[#bbe7ff] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Mã Quiz</th>
                <th scope="col" className="px-4 py-3 font-medium">Tiêu đề & Khóa học</th>
                <th scope="col" className="px-4 py-3 font-medium">Chi tiết</th>
                <th scope="col" className="px-4 py-3 font-medium">Lượt thi</th>
                <th scope="col" className="px-4 py-3 font-medium text-center">Trạng thái</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbe7ff]/50">
              {QUIZZES_DATA.map((quiz) => (
                <tr key={quiz.id} className="transition hover:bg-[#f8feff]">
                  <td className="px-4 py-4 text-slate-900 font-medium">{quiz.id}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{quiz.title}</div>
                    <div className="text-xs text-[#0369a1] mt-1">{quiz.course}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-700">⏱ {quiz.duration}</div>
                    <div className="text-xs text-slate-500 mt-1">🏷 {quiz.questions} câu hỏi</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{quiz.participants} học viên</td>
                  <td className="px-4 py-4 text-center">
                    <span className={badgeClass(quiz.status)}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/quizzes/${quiz.id}`}
                      className="inline-block rounded-xl border border-[#bbe7ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#0369a1] transition hover:bg-[#d6f1ff] mr-2"
                    >
                      Kết quả
                    </Link>
                    <button className="inline-block rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                      Tùy chỉnh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}