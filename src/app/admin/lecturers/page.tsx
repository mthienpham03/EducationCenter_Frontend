"use client";

import React, { useEffect, useState } from "react";
import { axiosClient } from "@/lib/api/axios";
import { specializationApi, Specialization } from "@/lib/api/specialization.api";
import SpecializationSelector from "@/components/admin/SpecializationSelector";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import DeleteUserInfoModal from "@/components/ui/DeleteUserInfoModal";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl?: string | null;
  role: "lecturer";
  status: "active" | "inactive" | "locked" | "pending";
  createdAt: string;
  lastLoginAt: string | null;
  lockedUntil: string | null;
  lockReason: string | null;
  lecturerProfile?: {
    specializations?: Array<{ id: string; name: string; code: string }> | null;
    experienceYears?: number | null;
  } | null;
}

export default function LecturerManagement() {
  const [tutors, setTutors] = useState<UserProfile[]>([]);
  const [availableSpecs, setAvailableSpecs] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination (5 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form states for Create Lecturer
  const [createEmail, setCreateEmail] = useState("");
  const [createFullName, setCreateFullName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [specializationIds, setSpecializationIds] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [createAvatarUrl, setCreateAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form states for Lock User
  const [lockReason, setLockReason] = useState("");
  const [lockType, setLockType] = useState<"permanent" | "temporary">("permanent");
  const [lockDurationDays, setLockDurationDays] = useState("1");
  const [customLockDate, setCustomLockDate] = useState("");

  useEffect(() => {
    fetchTutors();
    fetchAvailableSpecs();
  }, []);

  const fetchAvailableSpecs = async () => {
    try {
      const data = await specializationApi.getSpecializations();
      setAvailableSpecs(data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chuyên ngành:", err);
    }
  };

  const fetchTutors = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await axiosClient.get("/users/lecturers");
      if (response.data && response.data.success) {
        setTutors(response.data.data || []);
      } else {
        setErrorMsg("Không thể lấy danh sách giảng viên.");
      }
    } catch (err: any) {
      console.error("Fetch tutors error:", err);
      setErrorMsg(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu giảng viên.");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredTutors = tutors.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      (u.lecturerProfile?.specializations &&
        u.lecturerProfile.specializations.some((spec) =>
          spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.code.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.status === "active") ||
      (statusFilter === "locked" && u.status === "locked") ||
      (statusFilter === "pending" && u.status === "pending") ||
      (statusFilter === "inactive" && u.status === "inactive");

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalTutors = tutors.length;
  const activeCount = tutors.filter((u) => u.status === "active").length;
  const lockedCount = tutors.filter((u) => u.status === "locked").length;
  const pendingCount = tutors.filter((u) => u.status === "pending").length;

  // Pagination calculation
  const totalPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE) || 1;
  const paginatedTutors = filteredTutors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset pagination on filter change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle Create Lecturer Submit
  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await axiosClient.post("/users/lecturers", {
        email: createEmail,
        fullName: createFullName,
        phone: createPhone || undefined,
        specializationIds: specializationIds,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        avatarUrl: createAvatarUrl || undefined,
      });

      if (response.data && response.data.success) {
        setSuccessMsg(response.data.message || "Tạo tài khoản giảng viên thành công!");
        setIsCreateOpen(false);
        // Clear inputs
        setCreateEmail("");
        setCreateFullName("");
        setCreatePhone("");
        setSpecializationIds([]);
        setExperienceYears("");
        setCreateAvatarUrl("");
        fetchTutors();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Lỗi khi tạo tài khoản giảng viên mới.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosClient.post("/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.success) {
        setCreateAvatarUrl(response.data.data.url);
      }
    } catch (err) {
      console.error("Lỗi khi upload avatar giảng viên mới:", err);
      alert("Không thể tải ảnh đại diện lên.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Open Lock Modal
  const handleOpenLock = (user: UserProfile) => {
    setSelectedUser(user);
    setLockReason("");
    setLockType("permanent");
    setLockDurationDays("1");
    setCustomLockDate("");
    setIsLockOpen(true);
  };

  // Handle Lock Lecturer Submit
  const handleLockLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");
    setSuccessMsg("");

    let lockedUntil: string | null = null;
    if (lockType === "temporary") {
      if (customLockDate) {
        lockedUntil = new Date(customLockDate).toISOString();
      } else {
        const days = parseInt(lockDurationDays) || 1;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        lockedUntil = targetDate.toISOString();
      }
    }

    try {
      const response = await axiosClient.post(`/users/${selectedUser.id}/lock`, {
        reason: lockReason,
        lockedUntil,
      });

      if (response.data && response.data.success) {
        setSuccessMsg(response.data.message || `Đã khóa tài khoản của GV. ${selectedUser.fullName}.`);
        setIsLockOpen(false);
        fetchTutors();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Lỗi khi thực hiện khóa tài khoản giảng viên.");
    }
  };

  // Handle Unlock Lecturer
  const handleUnlockLecturer = async (user: UserProfile) => {
    if (!confirm(`Bạn có chắc chắn muốn mở khóa tài khoản của GV. ${user.fullName}?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await axiosClient.post(`/users/${user.id}/unlock`);
      if (response.data && response.data.success) {
        setSuccessMsg(response.data.message || `Đã mở khóa tài khoản của GV. ${user.fullName}.`);
        fetchTutors();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Lỗi khi mở khóa tài khoản giảng viên.");
    }
  };

  // Handle Delete Lecturer - mở modal xác nhận bước 1
  const handleDeleteLecturer = (user: UserProfile) => {
    setDeleteTarget(user);
    setShowInfoModal(true);
  };

  // Tiến hành sang bước 2
  const handleProceedToDeleteConfirm = () => {
    setShowInfoModal(false);
    setShowConfirmModal(true);
  };

  // Hủy tiến trình xóa ở bất kỳ bước nào
  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setShowInfoModal(false);
    setShowConfirmModal(false);
  };

  // Xác nhận xóa sau khi modal confirm (bước 2)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await axiosClient.delete(`/users/${deleteTarget.id}`);
      if (response.data && response.data.success) {
        setSuccessMsg(response.data.message || `Đã xóa tài khoản giảng viên ${deleteTarget.fullName} thành công.`);
        setDeleteTarget(null);
        setShowConfirmModal(false);
        fetchTutors();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Lỗi khi xóa tài khoản giảng viên.");
      setDeleteTarget(null);
      setShowConfirmModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-stack-lg w-full">
      {/* Alert Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-body-md font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600">error</span>
            <span className="text-body-md font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-rose-500 hover:text-rose-700">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* Header and Add button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Quản lý Giảng viên (Tutors)</h2>
          <p className="text-on-surface-variant font-body-md">Danh sách, chuyên ngành và quyền giảng dạy của giảng viên.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-primary/15 hover:shadow-xl hover:-translate-y-0.5 transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
          Thêm giảng viên mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-5 group hover:border-primary/20 transition-all">
          <div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Tổng số giảng viên</p>
            <h3 className="text-headline-md font-bold text-on-surface">{totalTutors}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-5 group hover:border-primary/20 transition-all">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Đang hoạt động</p>
            <h3 className="text-headline-md font-bold text-on-surface">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-5 group hover:border-primary/20 transition-all">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Đang khóa</p>
            <h3 className="text-headline-md font-bold text-on-surface">{lockedCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-5 group hover:border-primary/20 transition-all">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Chờ duyệt</p>
            <h3 className="text-headline-md font-bold text-on-surface">{pendingCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-body-md"
              placeholder="Tìm theo tên, email, chuyên ngành..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 border border-outline-variant rounded-lg px-3 py-2 bg-surface hover:bg-surface-container transition-colors cursor-pointer group">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">verified_user</span>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="bg-transparent border-none focus:ring-0 text-label-md font-label-md p-0 pr-6 text-on-surface cursor-pointer focus:outline-none"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Đang khóa</option>
                <option value="pending">Chờ duyệt</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>

            <button
              onClick={fetchTutors}
              className="flex items-center gap-2 text-primary font-bold px-3 py-2 hover:bg-primary/5 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined">refresh</span>
              Làm mới
            </button>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant font-medium">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Đang tải danh sách giảng viên...
            </div>
          ) : paginatedTutors.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant font-medium">
              Không tìm thấy giảng viên nào phù hợp.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Họ và Tên</th>
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Chuyên ngành</th>
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider text-center">Kinh nghiệm (Năm)</th>
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Số điện thoại</th>
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {paginatedTutors.map((u) => (
                  <tr key={u.id} className={`hover:bg-surface-bright transition-colors group ${u.status === "locked" ? "bg-rose-50/20" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg overflow-hidden border border-teal-100">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" />
                          ) : (
                            u.fullName.split(" ").pop()?.charAt(0).toUpperCase() || "T"
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{u.fullName}</p>
                          <p className="text-caption text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.lecturerProfile?.specializations && u.lecturerProfile.specializations.length > 0 ? (
                          u.lecturerProfile.specializations.map((spec) => (
                            <span key={spec.id} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/20" title={spec.name}>
                              {spec.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-on-surface-variant text-xs font-semibold">Chưa cập nhật</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-body-md text-on-surface-variant">
                      {u.lecturerProfile?.experienceYears !== undefined && u.lecturerProfile?.experienceYears !== null
                        ? `${u.lecturerProfile.experienceYears} năm`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">
                      {u.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {u.status === "active" && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-label-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          Hoạt động
                        </div>
                      )}
                      {u.status === "locked" && (
                        <div className="flex flex-col text-rose-600 font-bold text-label-md">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                            Đang khóa
                          </div>
                          {u.lockReason && (
                            <span className="text-[10px] text-rose-500 font-normal mt-0.5 max-w-[150px] truncate" title={u.lockReason}>
                              Lý do: {u.lockReason}
                            </span>
                          )}
                        </div>
                      )}
                      {u.status === "pending" && (
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-label-md">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Chờ duyệt
                        </div>
                      )}
                      {u.status === "inactive" && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-label-md">
                          <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                          Không hoạt động
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {u.status === "locked" ? (
                          <button
                            onClick={() => handleUnlockLecturer(u)}
                            className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-all"
                            title="Mở khóa giảng viên"
                          >
                            <span className="material-symbols-outlined text-xl">lock_open</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenLock(u)}
                            className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-all"
                            title="Khóa giảng viên"
                          >
                            <span className="material-symbols-outlined text-xl">block</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteLecturer(u)}
                          className="p-2 hover:bg-rose-100 rounded-lg text-rose-600 transition-all"
                          title="Xóa giảng viên"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-6 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-caption text-on-surface-variant">
            Hiển thị {filteredTutors.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredTutors.length)} trong tổng số {filteredTutors.length} giảng viên
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold border transition-all ${
                  currentPage === page
                    ? "bg-primary text-white border-primary"
                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* CREATE LECTURER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-headline-md font-bold text-on-surface">Thêm giảng viên mới</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateLecturer} className="space-y-4">
              <div className="flex flex-col items-center gap-2 pb-2 border-b border-outline-variant/20">
                <div className="relative w-20 h-20 rounded-full border border-outline-variant bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                  {createAvatarUrl ? (
                    <img src={createAvatarUrl} alt="New Lecturer Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-outline-variant">person</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="lecturer-avatar-file"
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("lecturer-avatar-file")?.click()}
                  className="px-3 py-1 border border-outline-variant hover:bg-surface-container rounded-lg text-xs font-bold transition-all text-on-surface-variant cursor-pointer"
                >
                  Chọn ảnh đại diện
                </button>
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="tutor@educenter.edu.vn"
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Họ và Tên giảng viên *</label>
                <input
                  type="text"
                  required
                  value={createFullName}
                  onChange={(e) => setCreateFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="Nguyễn Thành Nam"
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="0912345678"
                />
              </div>

              <SpecializationSelector
                availableSpecs={availableSpecs}
                selectedIds={specializationIds}
                onSelectionChange={setSpecializationIds}
              />

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Số năm kinh nghiệm</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  step="1"
                  value={experienceYears}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Chỉ cho phép số
                    if (value === "" || /^\d+$/.test(value)) {
                      const num = value === "" ? "" : parseInt(value, 10);
                      if (num === "" || num <= 60) {
                        setExperienceYears(value);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Chỉ cho phép: số, backspace, delete, tab, arrow keys
                    const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"];
                    if (!allowedKeys.includes(e.key) && !/\d/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="5"
                />
                <p className="text-xs text-on-surface-variant mt-1">Nhập giá trị từ 0 đến 60</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-bold hover:bg-surface-container text-on-surface-variant text-sm transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 text-sm transition-all shadow-md shadow-primary/10"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCK TUTOR MODAL */}
      {isLockOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-headline-md font-bold text-on-surface">Khóa giảng viên</h3>
              <button onClick={() => setIsLockOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-body-md text-on-surface-variant">
              Bạn đang thực hiện khóa tài khoản của <strong>GV. {selectedUser.fullName}</strong> ({selectedUser.email}).
            </p>

            <form onSubmit={handleLockLecturer} className="space-y-4">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Lý do khóa tài khoản *</label>
                <textarea
                  required
                  rows={3}
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="Nhập lý do chi tiết..."
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Hình thức khóa</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLockType("permanent")}
                    className={`py-2 px-4 rounded-lg font-bold text-sm border transition-all ${
                      lockType === "permanent"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Vô thời hạn
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockType("temporary")}
                    className={`py-2 px-4 rounded-lg font-bold text-sm border transition-all ${
                      lockType === "temporary"
                        ? "bg-primary text-white border-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Có thời hạn
                  </button>
                </div>
              </div>

              {lockType === "temporary" && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Chọn nhanh thời gian khóa</label>
                    <select
                      value={lockDurationDays}
                      onChange={(e) => {
                        setLockDurationDays(e.target.value);
                        setCustomLockDate("");
                      }}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg text-sm bg-white"
                    >
                      <option value="1">1 Ngày (24 giờ)</option>
                      <option value="7">7 Ngày (1 tuần)</option>
                      <option value="30">30 Ngày (1 tháng)</option>
                      <option value="custom">Chọn ngày giờ tùy chỉnh...</option>
                    </select>
                  </div>

                  {lockDurationDays === "custom" && (
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Mốc thời gian mở khóa</label>
                      <input
                        type="datetime-local"
                        required
                        value={customLockDate}
                        onChange={(e) => setCustomLockDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-outline-variant rounded-lg text-sm bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsLockOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-bold hover:bg-surface-container text-on-surface-variant text-sm transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 text-sm transition-all shadow-md shadow-rose-600/10"
                >
                  Xác nhận khóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE INFO MODAL (BƯỚC 1) */}
      {deleteTarget && showInfoModal && (
        <DeleteUserInfoModal
          user={{
            id: deleteTarget.id,
            fullName: deleteTarget.fullName,
            email: deleteTarget.email,
            status: deleteTarget.status,
            role: "lecturer",
            extraInfo: deleteTarget.lecturerProfile?.specializations?.map((s) => s.name).join(", ") || "Chưa cập nhật",
            avatarUrl: deleteTarget.avatarUrl,
          }}
          onProceed={handleProceedToDeleteConfirm}
          onCancel={handleCancelDelete}
        />
      )}

      {/* DELETE CONFIRM MODAL (BƯỚC 2) */}
      {deleteTarget && showConfirmModal && (
        <DeleteConfirmModal
          targetName={deleteTarget.fullName}
          targetType="giảng viên"
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
