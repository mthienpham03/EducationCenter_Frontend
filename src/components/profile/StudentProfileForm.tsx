"use client";

import { useState, useRef, useEffect } from "react";
import { profileService } from "@/lib/api/service";
import { useAuthStore } from "@/store/auth.store";

export default function StudentProfileForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentCode: "",
    school: "",
    major: "",
    dateOfBirth: "",
    address: "",
    learningGoal: "",
    bio: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 1. ĐÃ THÊM LẠI HÀM UPLOAD ẢNH BỊ THIẾU
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        setLoading(true);
        const res = await profileService.uploadAvatarImage(file);
        
        if (res?.data) {
          const baseUrl = typeof res.data === 'string' ? res.data : (res.data as any).url;
          
          // Gửi request cập nhật avatarUrl vào database ngay lập tức
          await profileService.updateProfile({ avatarUrl: baseUrl });

          // Tạo link ảnh mới ép trình duyệt tải lại
          const freshUrl = `${baseUrl.split('?')[0]}?t=${Date.now()}`;
          
          setAvatarUrl(freshUrl);
          
          // Cập nhật lên Store ngay để TopNavBar đổi ảnh ngay lập tức!
          useAuthStore.getState().updateUser({ avatarUrl: freshUrl });
          alert("Cập nhật ảnh đại diện thành công!");
        }
      } catch (err: any) {
        console.error("Upload avatar failed", err);
        alert("Không thể tải ảnh lên: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      if (res?.data) {
        const p = res.data;
        setForm({
          fullName: p.fullName || "",
          email: p.email || "",
          phone: p.phone || "",
          studentCode: p.studentProfile?.studentCode || "Chưa cập nhật",
          school: p.studentProfile?.school || "",
          major: p.studentProfile?.major || "",
          dateOfBirth: p.studentProfile?.dateOfBirth ? p.studentProfile.dateOfBirth.split('T')[0] : "",
          address: p.studentProfile?.address || "",
          learningGoal: p.studentProfile?.learningGoal || "",
          bio: p.studentProfile?.bio || "",
        });

        // Xử lý link ảnh chống cache
        const freshAvatar = p.avatarUrl ? `${p.avatarUrl.split('?')[0]}?t=${Date.now()}` : null;

        if (freshAvatar) {
          setAvatarUrl(freshAvatar);
        }

        // Bắt buộc đồng bộ vào Store
        useAuthStore.getState().updateUser({
          fullName: p.fullName,
          avatarUrl: freshAvatar
        });

        setIsDataLoaded(true);
      }
    } catch (err) {
      console.error("Load profile failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 2. CHỈ GIỮ LẠI ĐÚNG 1 HÀM HANDLESAVE VÀ ĐÃ BỎ LỆNH LOAD PROFILE LẠI
  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        bio: form.bio || null,
        learningGoal: form.learningGoal || null,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address || null,
        school: form.school || null,
        major: form.major || null,
        avatarUrl: avatarUrl ? avatarUrl.split('?')[0] : null,
      };

      const res = await profileService.updateProfile(payload);
      if (res?.success) {
        alert("Lưu thông tin thành công!");
        
        // Chỉ cập nhật tên vào store, KHÔNG TẢI LẠI ẢNH TỪ SERVER NỮA
        useAuthStore.getState().updateUser({ fullName: form.fullName });
        
      } else {
        throw new Error(res?.message || "Lỗi cập nhật");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Không thể lưu: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, value, readOnly = false, type = "text" }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-black">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={readOnly ? undefined : handleChange}
        readOnly={readOnly}
        className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-all text-black ${
          readOnly 
            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500" 
            : "border-gray-300 focus:ring-2 focus:ring-black/20 focus:border-black"
        }`}
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm h-fit">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-md cursor-pointer hover:opacity-80 overflow-hidden relative"
              onClick={() => fileInputRef.current?.click()}
            >
              {loading && <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs">...</div>}
              {avatarUrl ? (
                <img key={avatarUrl} src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : "🎓"}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            <p className="text-xs text-gray-500 mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>Thay đổi ảnh</p>
            <h2 className="text-xl font-bold text-black">{form.fullName || "Học viên"}</h2>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-200 pb-4">Thông tin học viên</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Họ và tên" name="fullName" value={form.fullName} />
            <InputField label="Số điện thoại" name="phone" value={form.phone} />
            <InputField label="Email" name="email" value={form.email} readOnly />
            <InputField label="Mã sinh viên" name="studentCode" value={form.studentCode} readOnly />
            <InputField label="Ngày sinh" name="dateOfBirth" value={form.dateOfBirth} type="date" />
            <InputField label="Địa chỉ" name="address" value={form.address} />
            <InputField label="Trường học" name="school" value={form.school} />
            <InputField label="Chuyên ngành" name="major" value={form.major} />
          </div>
          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-black">Mục tiêu học tập</label>
            <textarea name="learningGoal" value={form.learningGoal} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-black" />
          </div>
          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-black">Giới thiệu bản thân</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-black" />
          </div>
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}