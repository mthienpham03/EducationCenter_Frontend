import Link from "next/link";

// Dữ liệu mẫu cho Thông báo (Mock data)
const NOTIFICATIONS_DATA = [
  {
    id: "NOTIF001",
    title: "Cập nhật hệ thống bảo trì kỳ I",
    message: "Hệ thống sẽ bảo trì từ 22:00 đến 04:00 sáng mai để nâng cấp server. Vui lòng lưu lại công việc của bạn.",
    type: "Hệ thống",
    status: "Chưa đọc",
    date: "28/05/2026 14:30",
  },
  {
    id: "NOTIF002",
    title: "Có 5 học viên mới đăng ký khóa Lập trình Web",
    message: "Khóa học Lập trình Web cơ bản (L002) vừa có thêm 5 học viên mới đăng ký thành công. Vui lòng sắp xếp lớp học.",
    type: "Tự động",
    status: "Đã đọc",
    date: "27/05/2026 09:15",
  },
  {
    id: "NOTIF003",
    title: "Giảng viên Trần Thị B xin nghỉ phép",
    message: "Giảng viên Trần Thị B báo nghỉ ốm 3 ngày từ ngày 30/05 đến 01/06. Vui lòng cập nhật lớp học thay thế tạm thời.",
    type: "Nhân sự",
    status: "Chưa đọc",
    date: "26/05/2026 16:45",
  },
  {
    id: "NOTIF004",
    title: "Báo cáo: Hoàn thành kỳ thi cuối khóa (Khóa AI-01)",
    message: "Điểm kiểm tra của khóa AI-01 đã được giảng viên cập nhật đủ trên hệ thống lúc 10:00 sáng nay.",
    type: "Đào tạo",
    status: "Đã đọc",
    date: "25/05/2026 10:05",
  },
];

const badgeClass = (status: string) => {
  if (status === "Chưa đọc") {
    return "rounded-full bg-[#eaf6ff] px-3 py-1 text-xs font-semibold text-[#0288d1]";
  }
  return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500";
};

const typeBadgeClass = (type: string) => {
  switch (type) {
    case "Hệ thống":
      return "text-red-600 bg-red-50";
    case "Nhân sự":
      return "text-orange-600 bg-orange-50";
    case "Đào tạo":
      return "text-green-600 bg-green-50";
    default:
      return "text-blue-600 bg-blue-50";
  }
};

export default function AdminNotificationsPage() {
  const unreadCount = NOTIFICATIONS_DATA.filter((n) => n.status === "Chưa đọc").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0288d1]">Thông tin chung</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Quản lý Thông báo</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Gửi thông báo mới đến toàn hệ thống, hoặc xem các thông báo được tự động khởi tạo.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex items-center justify-center rounded-2xl bg-[#87CEFA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6ec5f2]">
              Gửi thông báo mới
            </button>
            <button className="inline-flex items-center justify-center rounded-2xl border border-[#bbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#0369a1] transition hover:bg-[#f8feff]">
              Đánh dấu đọc tất cả
            </button>
          </div>
        </div>
      </header>

      {/* Thống kê */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng thông báo</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{NOTIFICATIONS_DATA.length}</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Chưa đọc</p>
          <p className="mt-4 text-3xl font-semibold text-[#0288d1]">{unreadCount}</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Đã gửi trong tuần</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">12</p>
        </div>
      </section>

      {/* Bộ lọc và Tìm kiếm */}
      <section className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Tìm kiếm</span>
            <input
              type="search"
              placeholder="Tìm theo tiêu đề..."
              className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Loại thông báo</span>
            <select className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
              <option value="">Tất cả</option>
              <option value="Hệ thống">Hệ thống</option>
              <option value="Tự động">Tự động báo cáo</option>
              <option value="Nhân sự">Nhân sự/Giảng viên</option>
              <option value="Đào tạo">Đào tạo</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Trạng thái</span>
            <select className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
              <option value="">Tất cả</option>
              <option value="Chưa đọc">Chưa đọc</option>
              <option value="Đã đọc">Đã đọc</option>
            </select>
          </label>
        </div>

        {/* Danh sách thông báo (Dạng list dọc thay vì table cho dễ đọc tin nhắn) */}
        <div className="flex flex-col gap-4">
          {NOTIFICATIONS_DATA.map((notif) => (
            <div 
              key={notif.id} 
              className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-5 rounded-2xl border transition ${
                notif.status === "Chưa đọc" ? "border-[#87CEFA] bg-[#f8feff]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${typeBadgeClass(notif.type)}`}>
                    {notif.type}
                  </span>
                  <span className="text-xs text-slate-500">{notif.date}</span>
                  {notif.status === "Chưa đọc" && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-[#0288d1]"></span>
                  )}
                </div>
                <h3 className={`text-lg transition ${notif.status === "Chưa đọc" ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                  {notif.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {notif.message}
                </p>
              </div>

              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                 {notif.status === "Chưa đọc" && (
                   <button className="flex-1 sm:flex-none whitespace-nowrap rounded-xl border border-[#bbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0369a1] transition hover:bg-[#d6f1ff]">
                     Đánh dấu đọc
                   </button>
                 )}
                 <button className="flex-1 sm:flex-none whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
                   Xem chi tiết
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}