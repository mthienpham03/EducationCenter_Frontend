"use client";

import { useState, useRef, useEffect } from "react";
import { profileService } from "@/lib/api/service";
import { useAuthStore } from "@/store/auth.store";

export default function LecturerProfileForm() {
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

  // State cho avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý thay đổi Avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarUrl(URL.createObjectURL(file));
      (async () => {
        try {
          setLoading(true);
          const res = await profileService.uploadAvatarImage(file);
          if (res?.data?.url) {
            const baseUrl = res.data.url;
            // Lưu vào database ngay lập tức
            await profileService.updateProfile({ avatarUrl: baseUrl });
            
            const freshUrl = `${baseUrl.split('?')[0]}?t=${Date.now()}`;
            setAvatarUrl(freshUrl);
            try { useAuthStore.getState().updateUser({ avatarUrl: freshUrl }); } catch {}
            alert("Cập nhật ảnh đại diện thành công!");
          }
        } catch (err: any) {
          console.error('Upload avatar failed', err);
          alert('Không thể tải ảnh lên: ' + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
      })();
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await profileService.getProfile();
        if (!mounted) return;
        if (res?.data) {
          const p = res.data;
          setForm((prev) => ({
            ...prev,
            fullName: p.fullName || prev.fullName,
            email: p.email || prev.email,
            phone: p.phone || prev.phone,
            bio: p.lecturerProfile?.bio || prev.bio,
            degree: p.lecturerProfile?.degree || prev.degree,
            specialization: p.lecturerProfile?.specializations?.[0]?.name || prev.specialization,
            experienceYears: p.lecturerProfile?.experienceYears?.toString() || prev.experienceYears,
          }));
          const freshAvatar = p.avatarUrl ? `${p.avatarUrl.split('?')[0]}?t=${Date.now()}` : null;
          if (freshAvatar) setAvatarUrl(freshAvatar);
          try {
            useAuthStore.getState().updateUser({
              fullName: p.fullName,
              avatarUrl: freshAvatar,
            });
          } catch {}
        }
      } catch (err) { console.error('Load profile failed', err); }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const cleanAvatarUrl = avatarUrl ? avatarUrl.split('?')[0] : null;
      const payload: any = {
        fullName: form.fullName,
        phone: form.phone,
        bio: form.bio,
        degree: form.degree || null,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        skills: form.skills || null,
      };
      if (cleanAvatarUrl) payload.avatarUrl = cleanAvatarUrl;
      const res = await profileService.updateProfile(payload);
      if (res?.success) {
        alert('Lưu thông tin thành công');
        useAuthStore.getState().updateUser({ fullName: form.fullName, avatarUrl: cleanAvatarUrl });
      } else {
        alert(res?.message || 'Lỗi khi lưu');
      }
    } catch (err: any) {
      console.error('Save failed', err);
      const apiErr = err?.response?.data || err?.message || err;
      alert('Lỗi: ' + JSON.stringify(apiErr));
    } finally { setLoading(false); }
  };

  // Input Field có thể thêm props 'readOnly' để khóa
  const InputField = ({ label, name, value, placeholder, readOnly = false, type = "text" }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-black">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={readOnly ? undefined : handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-all text-black ${
          readOnly ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500" : "border-gray-300 focus:ring-2 focus:ring-black/20 focus:border-black"
        }`}
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm h-fit">
          <div className="flex flex-col items-center">
            {/* Click vào avatar để chọn ảnh */}
            <div 
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-md cursor-pointer hover:opacity-80 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : "👨‍🏫"}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            <p className="text-xs text-gray-500 mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>Thay đổi ảnh</p>
            
            <h2 className="text-xl font-bold text-black">{form.fullName}</h2>
            <p className="text-sm text-black">{form.email}</p>
          </div>
          {/* ... giữ nguyên phần grid thống kê ... */}
        </div>

        {/* RIGHT FORM */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-200 pb-4">Thông tin cá nhân</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Họ và tên" name="fullName" value={form.fullName} />
            <InputField label="Số điện thoại" name="phone" value={form.phone} />
            
            {/* Các trường bị khóa */}
            <InputField label="Email" name="email" value={form.email} readOnly />
            <InputField label="Học vị" name="degree" value={form.degree} />
            <InputField label="Chuyên ngành" name="specialization" value={form.specialization} readOnly />
            <InputField label="Số năm kinh nghiệm" name="experienceYears" value={form.experienceYears} type="number" />
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
            <InputField label="Kỹ năng chuyên môn" name="skills" value={form.skills} placeholder="Ví dụ: ReactJS, NodeJS..." />
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-black">Giới thiệu bản thân</label>
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
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-all"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}