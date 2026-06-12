import Link from 'next/link';

// Dữ liệu mẫu (Mock data)
const LECTURERS_DATA = [
  {
    id: "GV001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    department: "Công nghệ thông tin",
    status: "Hoạt động",
    joinDate: "12/05/2021",
  },
  {
    id: "GV002",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    department: "Toán học",
    status: "Hoạt động",
    joinDate: "20/08/2022",
  },
  {
    id: "GV003",
    name: "Lê Minh C",
    email: "leminhc@example.com",
    department: "Ngoại ngữ",
    status: "Tạm nghỉ",
    joinDate: "15/01/2023",
  },
];

const badgeClass = (status: string) => {
  if (status === "Hoạt động") {
    return "rounded-full bg-[#d6f1ff] px-3 py-1 text-xs font-semibold text-[#0369a1]";
  }
  return "rounded-full bg-[#fff4e5] px-3 py-1 text-xs font-semibold text-[#d97706]";
};

export default function LecturersPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0288d1]">Quản lý nhân sự</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Danh sách Giảng viên</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Quản lý thông tin, phòng ban và tài khoản của các giảng viên trong hệ thống.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/lecturers/create"
              className="inline-flex items-center justify-center rounded-2xl bg-[#87CEFA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6ec5f2]"
            >
              Thêm giảng viên
            </Link>
            <button className="inline-flex items-center justify-center rounded-2xl border border-[#bbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#0369a1] transition hover:bg-[#f8feff]">
              Xuất CSV
            </button>
          </div>
        </div>
      </header>

      {/* Thống kê */}
      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng số Giảng viên</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{LECTURERS_DATA.length}</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Đang hoạt động</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">
            {LECTURERS_DATA.filter((l) => l.status === "Hoạt động").length}
          </p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tạm nghỉ</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">
            {LECTURERS_DATA.filter((l) => l.status === "Tạm nghỉ").length}
          </p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Khoa công nghệ</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">84</p>
        </div>
      </section>

      {/* Bộ lọc và Tìm kiếm */}
      <section className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Tìm kiếm</span>
            <input
              type="search"
              placeholder="Tên, email hoặc mã GV"
              className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Phòng ban / Khoa</span>
            <select className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
              <option value="">Tất cả</option>
              <option value="cntt">Công nghệ thông tin</option>
              <option value="toan">Toán học</option>
              <option value="nn">Ngoại ngữ</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Trạng thái</span>
            <select className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm nghỉ</option>
            </select>
          </label>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-[#bbe7ff] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Mã GV</th>
                <th scope="col" className="px-4 py-3 font-medium">Giảng viên</th>
                <th scope="col" className="px-4 py-3 font-medium">Phòng ban/Khoa</th>
                <th scope="col" className="px-4 py-3 font-medium">Ngày tham gia</th>
                <th scope="col" className="px-4 py-3 font-medium text-center">Trạng thái</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbe7ff]/50">
              {LECTURERS_DATA.map((lecturer) => (
                <tr key={lecturer.id} className="transition hover:bg-[#f8feff]">
                  <td className="px-4 py-4 text-slate-900 font-medium">{lecturer.id}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{lecturer.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{lecturer.email}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{lecturer.department}</td>
                  <td className="px-4 py-4 text-slate-600">{lecturer.joinDate}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={badgeClass(lecturer.status)}>
                      {lecturer.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/lecturers/${lecturer.id}`}
                      className="inline-block rounded-xl border border-[#bbe7ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#0369a1] transition hover:bg-[#d6f1ff] mr-2"
                    >
                      Sửa
                    </Link>
                    <button className="inline-block rounded-xl border border-[#ffcdd2] bg-white px-3 py-1.5 text-xs font-semibold text-[#d32f2f] transition hover:bg-[#ffebee]">
                      Xóa
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