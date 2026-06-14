"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({ label, name, value, placeholder, readOnly = false, onChange }: InputFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-black">{label}</label>
    <input
      name={name}
      value={value}
      onChange={readOnly ? undefined : onChange}
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

export default function StudentProfileForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentCode: "",
    school: "",
    major: "",
    learningGoal: "",
    bio: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.profile.getProfile();
        if (res.success && res.data) {
          const user = res.data;
          setForm({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            studentCode: user.studentProfile?.studentCode || "",
            school: (user.studentProfile as any)?.school || "",
            major: (user.studentProfile as any)?.major || "",
            learningGoal: (user.studentProfile as any)?.learningGoal || "",
            bio: (user.studentProfile as any)?.bio || "",
          });
          setAvatarUrl(user.avatarUrl || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
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
        if (res.success && res.data?.url) {
          setAvatarUrl(res.data.url);
          // Auto save avatarUrl to profile
          await api.profile.updateProfile({
            avatarUrl: res.data.url
          });
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        alert("Không thể upload ảnh đại diện");
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.profile.updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: avatarUrl || undefined,
        school: form.school,
        major: form.major,
        learningGoal: form.learningGoal,
        bio: form.bio,
      } as any);
      if (res.success) {
        alert("Lưu thông tin thành công!");
      } else {
        alert("Lưu thông tin thất bại: " + res.message);
      }
    } catch (error: any) {
      alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm h-fit">
          <div className="flex flex-col items-center">
            <div 
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-md cursor-pointer hover:opacity-80 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : "👨‍🎓"}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            <p className="text-xs text-gray-500 mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>Thay đổi ảnh</p>
            
            <h2 className="text-xl font-bold text-black">{form.fullName}</h2>
            <p className="text-sm text-black">{form.email}</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-200 pb-4">Thông tin học viên</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Họ và tên" name="fullName" value={form.fullName} onChange={handleChange} />
            <InputField label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} />
            
            <InputField label="Email" name="email" value={form.email} readOnly />
            <InputField label="Mã sinh viên" name="studentCode" value={form.studentCode} readOnly />
            <InputField label="Trường học" name="school" value={form.school} onChange={handleChange} />
            <InputField label="Chuyên ngành" name="major" value={form.major} onChange={handleChange} />
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-black">Mục tiêu học tập</label>
            <textarea 
              name="learningGoal" 
              value={form.learningGoal} 
              onChange={handleChange} 
              rows={3} 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-black" 
            />
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-black">Giới thiệu bản thân</label>
            <textarea 
              name="bio" 
              value={form.bio} 
              onChange={handleChange} 
              rows={4} 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-black" 
            />
          </div>

          <div className="flex justify-end mt-8">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-black/20 disabled:bg-gray-400"
            >
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}