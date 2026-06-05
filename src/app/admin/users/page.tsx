"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api/users.api";
import { Search, UserPlus, ShieldAlert, Trash2, Edit3, CheckCircle, XCircle, UserCheck } from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createRole, setCreateRole] = useState<"lecturer" | "student">("student");
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    specialization: "",
    experienceYears: 0,
    studentCode: "",
    dateOfBirth: "",
    address: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getUsers(search, roleFilter, statusFilter);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "locked" : "active";
    try {
      const response = await usersApi.updateUserStatus(userId, newStatus);
      if (response.success) {
        setSuccessMsg("Cập nhật trạng thái tài khoản thành công!");
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Không thể cập nhật trạng thái tài khoản.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      const response = await usersApi.deleteUser(userId);
      if (response.success) {
        setSuccessMsg("Xóa tài khoản thành công!");
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Không thể xóa tài khoản người dùng.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let response;
      if (createRole === "lecturer") {
        response = await usersApi.createLecturer({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone || undefined,
          specialization: formData.specialization || undefined,
          experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
        });
      } else {
        response = await usersApi.createStudent({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone || undefined,
          studentCode: formData.studentCode,
          dateOfBirth: formData.dateOfBirth || undefined,
          address: formData.address || undefined,
        });
      }

      if (response.success) {
        setSuccessMsg(
          `Tạo tài khoản ${createRole === "lecturer" ? "Giảng viên" : "Học viên"} thành công!`
        );
        setIsCreateOpen(false);
        fetchUsers();
        setFormData({
          email: "",
          fullName: "",
          phone: "",
          specialization: "",
          experienceYears: 0,
          studentCode: "",
          dateOfBirth: "",
          address: "",
        });
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Có lỗi xảy ra khi tạo tài khoản.");
      }
    }
  };

  // Metrics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const lockedUsers = users.filter((u) => u.status === "locked").length;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <header className="mb-8 rounded-4xl bg-white/90 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0288d1]">Quản trị</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-950">Quản lý người dùng</h1>
            <p className="mt-2 text-sm text-slate-600">
              Quản lý tài khoản Admin, Giảng viên và Học viên trong hệ thống Giáo dục.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#87CEFA] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#6ec5f2] transition-colors"
          >
            <UserPlus size={18} /> Thêm tài khoản mới
          </button>
        </header>

        {/* System Message */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-center font-medium">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Metrics Row */}
        <section className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/50">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Tổng tài khoản</p>
            <p className="mt-4 text-4xl font-bold text-slate-950">{totalUsers}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/50">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-600">Đang hoạt động</p>
            <p className="mt-4 text-4xl font-bold text-emerald-700">{activeUsers}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/50">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-600">Đang bị khóa</p>
            <p className="mt-4 text-4xl font-bold text-rose-700">{lockedUsers}</p>
          </div>
        </section>

        {/* Filter controls */}
        <section className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, Email hoặc SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] transition-all text-sm"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 md:flex-none border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 text-sm bg-white"
            >
              <option value="">Tất cả Vai trò</option>
              <option value="admin">Admin</option>
              <option value="lecturer">Giảng viên</option>
              <option value="student">Học viên</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:flex-none border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 text-sm bg-white"
            >
              <option value="">Tất cả Trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Bị khóa</option>
              <option value="pending">Chờ kích hoạt</option>
            </select>
          </div>
        </section>

        {/* Users Table */}
        <section className="bg-white rounded-4xl shadow-md overflow-hidden border border-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              <div className="w-10 h-10 border-4 border-[#87CEFA]/30 border-t-[#87CEFA] rounded-full animate-spin mx-auto mb-4"></div>
              Đang tải danh sách người dùng...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Không tìm thấy tài khoản người dùng nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-5">Họ và Tên / Email</th>
                    <th className="p-5">Số điện thoại</th>
                    <th className="p-5">Vai trò</th>
                    <th className="p-5">Trạng thái</th>
                    <th className="p-5">Ngày tạo</th>
                    <th className="p-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <div className="font-semibold text-slate-900">{user.fullName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                      </td>
                      <td className="p-5 text-slate-600">{user.phone || "—"}</td>
                      <td className="p-5">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            user.role === "admin"
                              ? "bg-rose-100 text-rose-700"
                              : user.role === "lecturer"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "lecturer"
                            ? "Giảng viên"
                            : "Học viên"}
                        </span>
                      </td>
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {user.status === "active" ? (
                            <>
                              <CheckCircle size={12} /> Hoạt động
                            </>
                          ) : (
                            <>
                              <XCircle size={12} /> Bị khóa
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-5 text-slate-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-5 text-right space-x-2">
                        {user.role !== "admin" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(user.id, user.status)}
                              title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              className={`p-2 rounded-xl border transition-colors inline-flex items-center ${
                                user.status === "active"
                                  ? "border-rose-100 hover:bg-rose-50 text-rose-600"
                                  : "border-emerald-100 hover:bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {user.status === "active" ? <XCircle size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              title="Xóa người dùng"
                              className="p-2 rounded-xl border border-red-100 hover:bg-red-50 text-red-600 transition-colors inline-flex items-center"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-8">
            <header className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950">Tạo tài khoản mới</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[70vh]">
              {/* Select Role */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Vai trò</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateRole("student")}
                    className={`py-3 rounded-2xl border text-center font-bold text-sm transition-all ${
                      createRole === "student"
                        ? "border-[#87CEFA] bg-[#87CEFA]/10 text-[#0288d1]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Học viên
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateRole("lecturer")}
                    className={`py-3 rounded-2xl border text-center font-bold text-sm transition-all ${
                      createRole === "lecturer"
                        ? "border-[#87CEFA] bg-[#87CEFA]/10 text-[#0288d1]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Giảng viên
                  </button>
                </div>
              </div>

              {/* Common Fields */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] text-sm bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Email đăng nhập</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@domain.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] text-sm bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09XXXXXXXX"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] text-sm bg-slate-50"
                />
              </div>

              {/* Student Specific Fields */}
              {createRole === "student" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Mã học viên (STU_code)</label>
                    <input
                      type="text"
                      required
                      value={formData.studentCode}
                      onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                      placeholder="STU002"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] text-sm bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Ngày sinh</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] text-sm bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Địa chỉ</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Hà Nội, Việt Nam"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] text-sm bg-slate-50"
                    />
                  </div>
                </>
              )}

              {/* Lecturer Specific Fields */}
              {createRole === "lecturer" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Chuyên ngành</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="Khoa học Máy tính"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] text-sm bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700">Số năm kinh nghiệm</label>
                    <input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/40 focus:border-[#87CEFA] text-sm bg-slate-50"
                    />
                  </div>
                </>
              )}

              <footer className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-2xl font-semibold text-slate-600 hover:bg-slate-50 text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#87CEFA] text-white rounded-2xl font-semibold hover:bg-[#6ec5f2] text-sm transition-colors shadow-md"
                >
                  Tạo tài khoản
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
