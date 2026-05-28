const users = [
  {
    id: "gv-001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "Giảng viên",
    status: "Hoạt động",
  },
  {
    id: "sv-002",
    name: "Lê Thị B",
    email: "lethib@example.com",
    role: "Học viên",
    status: "Đang chờ kích hoạt",
  },
  {
    id: "gv-003",
    name: "Trần Minh C",
    email: "tranminhc@example.com",
    role: "Giảng viên",
    status: "Khóa",
  },
  {
    id: "sv-004",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    role: "Học viên",
    status: "Hoạt động",
  },
];

const badgeClass = (status: string) => {
  if (status === "Hoạt động") {
    return "rounded-full bg-[#d6f1ff] px-3 py-1 text-xs font-semibold text-[#0369a1]";
  }

  if (status === "Đang chờ kích hoạt") {
    return "rounded-full bg-[#eaf6ff] px-3 py-1 text-xs font-semibold text-[#0369a1]";
  }

  return "rounded-full bg-[#f8feff] px-3 py-1 text-xs font-semibold text-[#0369a1]";
};

export default function AdminAccountsPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0288d1]">Quản lý tài khoản</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Giảng viên và học viên</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Giao diện admin để xem xét, tìm kiếm và điều chỉnh trạng thái tài khoản trong hệ thống.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/admin/students/create"
              className="inline-flex items-center justify-center rounded-2xl bg-[#87CEFA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6ec5f2]"
            >
              Thêm tài khoản
            </a>
            <button className="inline-flex items-center justify-center rounded-2xl border border-[#bbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#0369a1] transition hover:bg-[#f8feff]">
              Xuất CSV
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Giảng viên</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">142</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Học viên</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">1.238</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tài khoản mới</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">18</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Hoạt động</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">1.311</p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Tìm kiếm</span>
            <input
              type="search"
              placeholder="Tên, email hoặc mã"
              className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Vai trò</span>
            <select className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
              <option>Toàn bộ</option>
              <option>Giảng viên</option>
              <option>Học viên</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#0369a1]">Trạng thái</span>
            <select className="mt-2 w-full rounded-2xl border border-[#bbe7ff] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
              <option>Tất cả</option>
              <option>Hoạt động</option>
              <option>Đang chờ kích hoạt</option>
              <option>Khóa</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#bbe7ff] text-left text-sm leading-6">
            <thead className="bg-[#dcf4ff] text-[#0369a1]">
              <tr>
                <th className="px-4 py-3 font-semibold">Họ tên</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Vai trò</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbe7ff] bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#e5f6ff]">
                  <td className="px-4 py-4 text-slate-900">{user.name}</td>
                  <td className="px-4 py-4 text-slate-500">{user.email}</td>
                  <td className="px-4 py-4 text-slate-700">{user.role}</td>
                  <td className="px-4 py-4">
                    <span className={badgeClass(user.status)}>{user.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/admin/accounts/${user.id}`}
                        className="rounded-2xl bg-[#87CEFA] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6ec5f2]"
                      >
                        Xem
                      </a>
                      <button className="rounded-2xl border border-[#bbe7ff] bg-white px-3 py-2 text-xs font-semibold text-[#0369a1] transition hover:bg-[#f8feff]">
                        Sửa
                      </button>
                      <button className="rounded-2xl border border-[#bbe7ff] bg-[#f8feff] px-3 py-2 text-xs font-semibold text-[#0369a1] transition hover:bg-[#e5f6ff]">
                        Khóa
                      </button>
                    </div>
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
