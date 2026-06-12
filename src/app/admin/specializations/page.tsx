"use client";

import React, { useEffect, useState } from "react";
import { specializationApi, Specialization } from "@/lib/api/specialization.api";

export default function SpecializationsManagement() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination (5 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null);

  // Form states for Create/Edit
  const [specCode, setSpecCode] = useState("");
  const [specName, setSpecName] = useState("");
  const [specDesc, setSpecDesc] = useState("");

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await specializationApi.getSpecializations();
      setSpecializations(data || []);
    } catch (err: any) {
      console.error("Fetch specializations error:", err);
      setErrorMsg(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu chuyên ngành.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 3500);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 3500);
    }
  };

  // Create Specialization
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specCode.trim() || !specName.trim()) {
      showToast("error", "Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      const res = await specializationApi.createSpecialization({
        code: specCode.toUpperCase().trim(),
        name: specName.trim(),
        description: specDesc.trim() || undefined,
      });

      if (res.success) {
        showToast("success", res.message || "Tạo chuyên ngành thành công!");
        setIsCreateOpen(false);
        setSpecCode("");
        setSpecName("");
        setSpecDesc("");
        fetchSpecializations();
      }
    } catch (err: any) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Lỗi khi tạo chuyên ngành mới.");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (spec: Specialization) => {
    setSelectedSpec(spec);
    setSpecCode(spec.code);
    setSpecName(spec.name);
    setSpecDesc(spec.description || "");
    setIsEditOpen(true);
  };

  // Update Specialization
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpec) return;

    try {
      const res = await specializationApi.updateSpecialization(selectedSpec.id, {
        code: specCode.toUpperCase().trim(),
        name: specName.trim(),
        description: specDesc.trim(),
      });

      if (res.success) {
        showToast("success", res.message || "Cập nhật chuyên ngành thành công!");
        setIsEditOpen(false);
        setSelectedSpec(null);
        setSpecCode("");
        setSpecName("");
        setSpecDesc("");
        fetchSpecializations();
      }
    } catch (err: any) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Lỗi khi cập nhật chuyên ngành.");
    }
  };

  // Delete Specialization
  const handleDelete = async (spec: Specialization) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa chuyên ngành "${spec.name}" (${spec.code})? Hành động này sẽ hủy liên kết chuyên ngành này ở tất cả hồ sơ giảng viên!`
      )
    ) {
      return;
    }

    try {
      const res = await specializationApi.deleteSpecialization(spec.id);
      if (res.success) {
        showToast("success", res.message || "Xóa chuyên ngành thành công.");
        fetchSpecializations();
      }
    } catch (err: any) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Lỗi khi xóa chuyên ngành.");
    }
  };

  // Filtering
  const filteredSpecs = specializations.filter((s) => {
    const term = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      (s.description && s.description.toLowerCase().includes(term))
    );
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredSpecs.length / ITEMS_PER_PAGE) || 1;
  const paginatedSpecs = filteredSpecs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col gap-stack-lg w-full relative">
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl flex items-center gap-2 shadow-lg animate-fade-in">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span className="text-body-md font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl flex items-center gap-2 shadow-lg animate-fade-in">
          <span className="material-symbols-outlined text-rose-600">error</span>
          <span className="text-body-md font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Header and Add button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Quản lý Chuyên ngành</h2>
          <p className="text-on-surface-variant font-body-md">Thiết lập chuyên môn đồng bộ cho giảng viên, tránh trùng lặp dữ liệu nhập tự do.</p>
        </div>
        <button
          onClick={() => {
            setSpecCode("");
            setSpecName("");
            setSpecDesc("");
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-primary/15 hover:shadow-xl hover:-translate-y-0.5 transition-all self-start md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Thêm chuyên ngành mới
        </button>
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-body-md"
              placeholder="Tìm kiếm chuyên ngành..."
            />
          </div>

          <button
            onClick={fetchSpecializations}
            className="flex items-center gap-2 text-primary font-bold px-3 py-2 hover:bg-primary/5 rounded-lg transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">refresh</span>
            Làm mới
          </button>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant font-medium">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Đang tải danh sách chuyên ngành...
            </div>
          ) : paginatedSpecs.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant font-medium">
              Không tìm thấy chuyên ngành nào.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider w-32">Mã ngành</th>
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider w-64">Tên chuyên ngành</th>
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider text-right w-36">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {paginatedSpecs.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-bright transition-colors group">
                    <td className="px-6 py-4 font-bold text-primary">
                      <span className="bg-primary-fixed/50 text-primary-fixed-variant px-3 py-1 rounded-md text-xs font-mono tracking-wider">
                        {s.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant max-w-md truncate" title={s.description || ""}>
                      {s.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-primary transition-all cursor-pointer"
                          title="Sửa chuyên ngành"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-all cursor-pointer"
                          title="Xóa chuyên ngành"
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
            Hiển thị {filteredSpecs.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredSpecs.length)} trong tổng số {filteredSpecs.length} chuyên ngành
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

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-headline-md font-bold text-on-surface">Thêm chuyên ngành mới</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-outline hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Mã ngành (Viết tắt) *</label>
                <input
                  type="text"
                  required
                  value={specCode}
                  onChange={(e) => setSpecCode(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md uppercase font-mono"
                  placeholder="Ví dụ: CNTT, ENG, MKT"
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Tên chuyên ngành *</label>
                <input
                  type="text"
                  required
                  value={specName}
                  onChange={(e) => setSpecName(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="Ví dụ: Công nghệ thông tin"
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={specDesc}
                  onChange={(e) => setSpecDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="Nhập mô tả về chuyên ngành học này..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-bold hover:bg-surface-container text-on-surface-variant text-sm transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 text-sm transition-all shadow-md shadow-primary/10 cursor-pointer"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-headline-md font-bold text-on-surface">Chỉnh sửa chuyên ngành</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-outline hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Mã ngành (Viết tắt) *</label>
                <input
                  type="text"
                  required
                  value={specCode}
                  onChange={(e) => setSpecCode(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md uppercase font-mono"
                  placeholder="Ví dụ: CNTT"
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Tên chuyên ngành *</label>
                <input
                  type="text"
                  required
                  value={specName}
                  onChange={(e) => setSpecName(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="Ví dụ: Công nghệ thông tin"
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={specDesc}
                  onChange={(e) => setSpecDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md"
                  placeholder="Nhập mô tả..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-bold hover:bg-surface-container text-on-surface-variant text-sm transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 text-sm transition-all shadow-md shadow-primary/10 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
