"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  label,
  name,
  value,
  placeholder,
  readOnly = false,
  onChange,
}: InputFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-black">{label}</label>
    <input
      name={name}
      value={value}
      onChange={readOnly ? undefined : onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-all text-black ${readOnly
          ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500"
          : "border-gray-300 focus:ring-2 focus:ring-black/20 focus:border-black"
        }`}
    />
  </div>
);

export default function LecturerProfileForm() {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "Nguyễn Văn A",
    email: "lecturer@educenter.com",
    phone: "0901234567",
    specialization: "Lập trình Web",
    degree: "Thạc sĩ CNTT",
    experienceYears: "5",
    skills: "ReactJS, NextJS, NodeJS",
    bio: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    try {
      const res = await api.profile.uploadAvatarImage(file);

      if (res.success && res.data?.url) {
        setAvatarUrl(res.data.url);

        await api.profile.updateProfile({
          avatarUrl: res.data.url,
        });

        useAuthStore.getState().updateUser({
          avatarUrl: res.data.url,
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Không thể upload ảnh đại diện");
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await api.profile.updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: avatarUrl || undefined,
        experienceYears: form.experienceYears
          ? parseInt(form.experienceYears, 10)
          : undefined,
        degree: form.degree,
        skills: form.skills,
        bio: form.bio,
      } as any);

      if (res.success) {
        useAuthStore.getState().updateUser({
          fullName: form.fullName,
          phone: form.phone,
          avatarUrl: avatarUrl || undefined,
        });

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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm h-fit">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-md cursor-pointer hover:opacity-80 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                "👨‍🏫"
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />

            <p
              className="text-xs text-gray-500 mb-4 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              Thay đổi ảnh
            </p>

            <h2 className="text-xl font-bold text-black">{form.fullName}</h2>
            <p className="text-sm text-black">{form.email}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-200 pb-4">
            Thông tin cá nhân
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Họ và tên"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />

            <InputField
              label="Số điện thoại"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <InputField label="Email" name="email" value={form.email} readOnly />

            <InputField
              label="Học vị"
              name="degree"
              value={form.degree}
              readOnly
            />

            <InputField
              label="Chuyên ngành"
              name="specialization"
              value={form.specialization}
              readOnly
            />

            <InputField
              label="Số năm kinh nghiệm"
              name="experienceYears"
              value={form.experienceYears}
              readOnly
            />
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-black">
              Kỹ năng chuyên môn
            </label>
            <input
              name="skills"
              value={form.skills}
              readOnly
              className="w-full border bg-gray-100 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-black">
              Giới thiệu bản thân
            </label>
            <textarea
              rows={4}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Chia sẻ về bản thân..."
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-black"
            />
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}