"use client";

import React, { useState } from "react";
import Link from "next/link";
import { axiosClient } from "@/lib/api/axios";

interface ImportRowResult {
  row: number;
  email?: string;
  fullName?: string;
  studentCode?: string;
  success: boolean;
  message?: string;
}

interface ImportSummary {
  successCount: number;
  errorCount: number;
  details: ImportRowResult[];
}

export default function AdminStudentImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // Download template from backend
  const handleDownloadTemplate = async () => {
    try {
      setErrorMsg("");
      const response = await axiosClient.get("/users/import-students/template", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template-import-students.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download template error:", err);
      setErrorMsg("Không thể tải file mẫu. Vui lòng kiểm tra kết nối với Backend.");
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx" || ext === "xls") {
        setSelectedFile(file);
        setErrorMsg("");
        setSummary(null);
      } else {
        setErrorMsg("Vui lòng chỉ tải lên file Excel (.xlsx hoặc .xls)");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMsg("");
      setSummary(null);
    }
  };

  // Submit file for import
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Vui lòng chọn một file Excel trước khi tiến hành.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setSummary(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axiosClient.post("/users/import-students", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        const data = response.data.data as ImportSummary;
        setSummary(data);
        setSuccessMsg(
          `Xử lý hoàn tất. Import thành công ${data.successCount}/${data.successCount + data.errorCount} học viên.`
        );
        setSelectedFile(null); // Clear selected file after upload
      } else {
        setErrorMsg("Không thể thực hiện import dữ liệu.");
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setErrorMsg(
        err.response?.data?.message || "Có lỗi xảy ra trong quá trình upload file."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-stack-lg w-full max-w-4xl mx-auto pb-10">
      {/* Header and Back Link */}
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/students"
          className="flex items-center gap-1.5 text-primary font-bold text-label-md hover:underline self-start"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Quay lại danh sách học viên
        </Link>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mt-2">
          Nhập danh sách học viên từ file Excel
        </h2>
        <p className="text-on-surface-variant font-body-md">
          Hệ thống hỗ trợ nhập tự động thông tin học viên. Mỗi tài khoản tạo mới sẽ tự sinh mật khẩu ngẫu nhiên và gửi về email.
        </p>
      </div>

      {/* Main Form and Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Upload form container */}
        <div className="md:col-span-2 flex flex-col gap-base">
          <form
            onSubmit={handleImportSubmit}
            className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-6"
          >
            {/* Drag Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragActive
                ? "border-primary bg-primary/5 scale-[0.99]"
                : selectedFile
                  ? "border-emerald-500 bg-emerald-50/10"
                  : "border-outline-variant hover:border-primary/50 hover:bg-slate-50/50"
                }`}
            >
              <input
                type="file"
                id="excel-file-input"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label
                htmlFor="excel-file-input"
                className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-3"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${selectedFile ? "bg-emerald-50 text-emerald-600" : "bg-primary-fixed text-primary"
                  }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {selectedFile ? "task" : "upload_file"}
                  </span>
                </div>
                {selectedFile ? (
                  <div>
                    <p className="font-bold text-on-surface text-body-md truncate max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-caption text-on-surface-variant mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; Sẵn sàng import
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-on-surface text-body-md">
                      Kéo thả file Excel vào đây hoặc nhấp để chọn tệp
                    </p>
                    <p className="text-caption text-on-surface-variant mt-1">
                      Hỗ trợ tệp định dạng .xlsx, .xls
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div className="bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-lg flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-rose-600 text-lg">error</span>
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-lg flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setErrorMsg("");
                  setSuccessMsg("");
                  setSummary(null);
                }}
                disabled={uploading || !selectedFile}
                className="px-4 py-2.5 border border-outline-variant text-on-surface-variant font-bold text-sm rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Hủy chọn
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/15 transition-all"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý dữ liệu...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">upload</span>
                    Bắt đầu Import
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Support panel */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-5 h-fit">
          <h3 className="font-bold text-on-surface text-body-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">info</span>
            Tài liệu biểu mẫu
          </h3>
          <p className="text-body-md text-on-surface-variant">
            Hãy tải file Excel biểu mẫu quy định chuẩn của trung tâm để nhập đúng định dạng cột dữ liệu và giảm thiểu sai sót.
          </p>

          <button
            onClick={handleDownloadTemplate}
            className="w-full py-3 px-4 border border-primary text-primary hover:bg-primary/5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-xl">download</span>
            Tải File Excel Mẫu
          </button>

          <div className="border-t border-outline-variant/50 pt-4 mt-2">
            <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider mb-2">Quy tắc định dạng:</h4>
            <ul className="space-y-2 text-xs text-on-surface-variant list-disc pl-4">
              <li><strong>Email:</strong> Phải đúng định dạng email, không trùng lặp trong hệ thống.</li>
              <li><strong>Họ và tên:</strong> Bắt buộc, độ dài từ 2 đến 100 ký tự.</li>
              <li><strong>Mã học viên:</strong> Bắt buộc, viết liền không dấu, duy nhất.</li>
              <li><strong>Số điện thoại, Ngày sinh, Địa chỉ:</strong> Có thể để trống.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary Report Result List */}
      {summary && (
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
            <h3 className="font-bold text-on-surface text-body-lg">
              Chi tiết báo cáo kết quả Import
            </h3>
            <div className="flex gap-4 text-xs font-bold">
              <span className="text-on-surface-variant">Tổng số: {summary.successCount + summary.errorCount}</span>
              <span className="text-emerald-600">Thành công: {summary.successCount}</span>
              <span className="text-rose-600">Thất bại: {summary.errorCount}</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-on-surface-variant font-bold border-b border-outline-variant/50">
                  <th className="px-4 py-3">Dòng</th>
                  <th className="px-4 py-3">Mã học viên</th>
                  <th className="px-4 py-3">Họ và Tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Chi tiết thông báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {summary.details.map((rowResult, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-on-surface-variant">
                      {rowResult.row}
                    </td>
                    <td className="px-4 py-3 text-on-surface">
                      {rowResult.studentCode || "—"}
                    </td>
                    <td className="px-4 py-3 text-on-surface">
                      {rowResult.fullName || "—"}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {rowResult.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {rowResult.success ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-100">
                          Thành công
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-full border border-rose-100">
                          Thất bại
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${rowResult.success ? "text-emerald-600 font-medium" : "text-rose-600 font-semibold"}`}>
                      {rowResult.message || (rowResult.success ? "Đã tạo tài khoản và gửi mail." : "Lỗi không xác định.")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
