"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "react-toastify";

export default function AdminProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    employeeCode: "",
    department: "",
    role: "",
    bio: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.profile.getProfile();
        const profile = response.data;
        if (profile) {
          setForm({
            fullName: profile.fullName || "",
            email: profile.email || "",
            phone: profile.phone || "",
            employeeCode: profile.adminProfile?.employeeCode || "",
            department: profile.adminProfile?.department || "",
            role: profile.role || "admin",
            bio: profile.adminProfile?.note || "",
          });
          setAvatarUrl(profile.avatarUrl || null);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const res = await api.profile.uploadAvatarImage(file);
        const url = res.data?.url;
        if (url) {
          setAvatarUrl(url);
          await api.profile.updateProfile({ avatarUrl: url });
          useAuthStore.getState().updateUser({ avatarUrl: url });
          toast.success("Cập nhật ảnh đại diện thành công!");
        }
      } catch (error) {
        console.error("Failed to upload avatar:", error);
        toast.error("Không thể tải lên ảnh đại diện.");
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.profile.updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: avatarUrl || undefined,
        employeeCode: form.employeeCode,
        department: form.department,
      } as any);

      useAuthStore.getState().updateUser({
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: avatarUrl || undefined,
      });

      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Cập nhật thông tin thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, name, value, placeholder, readOnly = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-black">{label}</label>
      <input
        name={name}
        value={value}
        onChange={readOnly ? undefined : handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-all text-black ${
          readOnly 
            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500" 
            : "border-gray-300 focus:ring-2 focus:ring-black/20 focus:border-black"
        }`}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm h-fit">
          <div className="flex flex-col items-center">
            <div 
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-md cursor-pointer hover:opacity-80 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : "👨‍💼"}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            <p className="text-xs text-gray-500 mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>Thay đổi ảnh</p>
            
            <h2 className="text-xl font-bold text-black">{form.fullName}</h2>
            <p className="text-sm text-black">{form.email}</p>
            <span className="mt-3 px-4 py-1 rounded-full bg-black text-white text-xs font-semibold uppercase tracking-wider">
              {form.role}
            </span>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-200 pb-4">Thông tin quản trị viên</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Họ và tên" name="fullName" value={form.fullName} />
            <InputField label="Số điện thoại" name="phone" value={form.phone} />
            
            {/* Các trường bị khóa */}
            <InputField label="Email" name="email" value={form.email} readOnly />
            <InputField label="Mã quản trị viên" name="employeeCode" value={form.employeeCode} readOnly />
            <InputField label="Phòng ban" name="department" value={form.department} readOnly />
            <InputField label="Vai trò" name="role" value={form.role} readOnly />
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-black">Mô tả vai trò</label>
            <textarea
              rows={5}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Mô tả vai trò và trách nhiệm của quản trị viên..."
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-black"
            />
          </div>

          <div className="flex justify-end mt-8">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-black/20"
            >
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}