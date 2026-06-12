"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { profileApi, UserProfile, Certificate } from "@/lib/api/profile.api";
import { specializationApi, Specialization } from "@/lib/api/specialization.api";

export default function LecturerProfilePage() {
  const { user: authUser, updateUser: updateAuthUser } = useAuthStore();
  
  // Loading & State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSpecializationIds, setSelectedSpecializationIds] = useState<string[]>([]);
  const [allSpecializations, setAllSpecializations] = useState<Specialization[]>([]);
  const [specSearchQuery, setSpecSearchQuery] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [bio, setBio] = useState("");

  // Certificates State
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [newCertName, setNewCertName] = useState("");
  
  // New Certificate Upload States
  const [frontImage, setFrontImage] = useState<{ url: string; publicId: string } | null>(null);
  const [backImage, setBackImage] = useState<{ url: string; publicId: string } | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // File Inputs Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile on load
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Tải danh sách chuyên ngành hệ thống
      const specs = await specializationApi.getSpecializations();
      setAllSpecializations(specs);

      const data = await profileApi.getProfile();
      setProfile(data);
      
      // Initialize form fields
      setFullName(data.fullName || "");
      setPhone(data.phone || "");
      
      if (data.lecturerProfile) {
        const specIds = data.lecturerProfile.specializations?.map((s) => s.id) || [];
        setSelectedSpecializationIds(specIds);
        setExperienceYears(data.lecturerProfile.experienceYears || 0);
        setBio(data.lecturerProfile.bio || "");
        setCertificates(data.lecturerProfile.certificates || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin hồ sơ:", error);
      showToast("error", "Không thể tải thông tin hồ sơ của bạn.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  // Handle Profile Submit (Basic & Professional info)
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await profileApi.updateProfile({
        fullName,
        phone,
        specializationIds: selectedSpecializationIds,
        experienceYears,
        bio,
      });

      if (res.success) {
        showToast("success", "Cập nhật hồ sơ thành công!");
        // Update local auth store so layout displays the new name
        updateAuthUser({ fullName });
        // Refresh profile data
        if (res.data) {
          setProfile(res.data);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Lỗi khi cập nhật hồ sơ.";
      showToast("error", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const result = await profileApi.uploadAvatarImage(file);
      
      // Update profile with the new avatar url
      const res = await profileApi.updateProfile({
        avatarUrl: result.url,
      });

      if (res.success) {
        showToast("success", "Cập nhật ảnh đại diện thành công!");
        updateAuthUser({ avatarUrl: result.url });
        if (res.data) {
          setProfile(res.data);
        }
      }
    } catch (error) {
      console.error("Lỗi khi upload avatar:", error);
      showToast("error", "Upload ảnh đại diện thất bại.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Front Certificate Image Upload Handler
  const handleFrontImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFront(true);
      const result = await profileApi.uploadCertificateImage(file);
      setFrontImage({ url: result.url, publicId: result.publicId });
    } catch (error) {
      console.error("Lỗi khi upload ảnh mặt trước:", error);
      showToast("error", "Upload ảnh mặt trước thất bại.");
    } finally {
      setUploadingFront(false);
    }
  };

  // Back Certificate Image Upload Handler
  const handleBackImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBack(true);
      const result = await profileApi.uploadCertificateImage(file);
      setBackImage({ url: result.url, publicId: result.publicId });
    } catch (error) {
      console.error("Lỗi khi upload ảnh mặt sau:", error);
      showToast("error", "Upload ảnh mặt sau thất bại.");
    } finally {
      setUploadingBack(false);
    }
  };

  // Add a new Certificate to the list and save
  const handleAddCertificate = async () => {
    if (!newCertName.trim()) {
      showToast("error", "Vui lòng nhập tên chứng chỉ.");
      return;
    }
    if (!frontImage) {
      showToast("error", "Vui lòng upload hình ảnh mặt trước của chứng chỉ.");
      return;
    }

    const newCert: Certificate = {
      id: Date.now().toString(),
      name: newCertName.trim(),
      frontImageUrl: frontImage.url,
      frontImagePublicId: frontImage.publicId,
      backImageUrl: backImage?.url || undefined,
      backImagePublicId: backImage?.publicId || undefined,
    };

    const updatedCerts = [...certificates, newCert];

    try {
      setSaving(true);
      const res = await profileApi.updateProfile({
        certificates: updatedCerts,
      });

      if (res.success) {
        showToast("success", "Đã thêm chứng chỉ mới thành công!");
        setCertificates(updatedCerts);
        // Clear form
        setNewCertName("");
        setFrontImage(null);
        setBackImage(null);
        if (frontInputRef.current) frontInputRef.current.value = "";
        if (backInputRef.current) backInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Lỗi khi thêm chứng chỉ:", error);
      showToast("error", "Không thể thêm chứng chỉ.");
    } finally {
      setSaving(false);
    }
  };

  // Delete a Certificate
  const handleDeleteCertificate = async (certId: string) => {
    const certToDelete = certificates.find((c) => c.id === certId);
    if (!certToDelete) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa chứng chỉ "${certToDelete.name}"? Ảnh liên quan sẽ bị xóa khỏi hệ thống.`)) {
      return;
    }

    const updatedCerts = certificates.filter((c) => c.id !== certId);

    try {
      setSaving(true);
      const res = await profileApi.updateProfile({
        certificates: updatedCerts,
      });

      if (res.success) {
        showToast("success", "Đã xóa chứng chỉ thành công.");
        setCertificates(updatedCerts);
      }
    } catch (error) {
      console.error("Lỗi khi xóa chứng chỉ:", error);
      showToast("error", "Không thể xóa chứng chỉ.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-stack-md max-w-container-max mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-body-md">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md relative">
      {/* Toast Alert */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3.5 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in transition-all ${
            message.type === "success"
              ? "bg-green-500/10 text-green-700 border-green-500/20"
              : "bg-error/10 text-error border-error/20"
          }`}
        >
          <span className="material-symbols-outlined">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-label-md">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md pb-2 border-b border-outline-variant/30">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Cài đặt Hồ sơ</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Cập nhật thông tin cá nhân, tiểu sử chuyên môn và quản lý các bằng cấp, chứng chỉ của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        {/* Left Column: Avatar & Profile summary */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col items-center text-center space-y-6">
          {/* Avatar Container */}
          <div className="relative group w-36 h-36 rounded-full overflow-hidden border-4 border-primary-container shadow-inner">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />
            ) : (
              <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl">person</span>
              </div>
            )}
            
            {/* Upload Overlay */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity duration-200"
            >
              {uploadingAvatar ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined mb-1">photo_camera</span>
                  Thay ảnh đại diện
                </>
              )}
            </button>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface">{fullName || "Chưa thiết lập tên"}</h2>
            <p className="text-caption text-primary font-semibold uppercase tracking-wider mt-1">{profile?.role}</p>
            {profile?.lecturerProfile?.specializations && profile.lecturerProfile.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {profile.lecturerProfile.specializations.map((spec) => (
                  <span
                    key={spec.id}
                    className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {spec.name}
                  </span>
                ))}
              </div>
            )}
            <p className="text-body-md text-on-surface-variant mt-3 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-base">mail</span>
              {profile?.email}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-outline-variant/30 grid grid-cols-2 gap-4 text-center">
            <div className="bg-surface-container-low p-3.5 rounded-xl">
              <p className="text-caption text-on-surface-variant font-semibold">Kinh nghiệm</p>
              <p className="text-headline-md font-bold mt-1 text-primary">{experienceYears} năm</p>
            </div>
            <div className="bg-surface-container-low p-3.5 rounded-xl">
              <p className="text-caption text-on-surface-variant font-semibold">Chứng chỉ</p>
              <p className="text-headline-md font-bold mt-1 text-secondary-container">{certificates.length}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form & Certificates management */}
        <div className="lg:col-span-2 space-y-gutter">
          {/* Section: Profile Information Form */}
          <form
            onSubmit={handleSubmitProfile}
            className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 space-y-6"
          >
            <h3 className="font-headline-md text-lg font-bold text-on-surface pb-3 border-b border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">badge</span>
              Thông tin cá nhân & Chuyên môn
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant font-medium">Họ và Tên</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-body-md text-on-surface outline-none focus:border-primary transition-all shadow-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant font-medium">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-body-md text-on-surface outline-none focus:border-primary transition-all shadow-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Specialization Selection */}
              <div className="space-y-3 col-span-1 md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-label-md text-on-surface-variant font-medium">Chuyên ngành giảng dạy</label>
                  <div className="flex items-center gap-3">
                    {/* Small Search Box */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
                      <input
                        type="text"
                        placeholder="Tìm chuyên ngành..."
                        value={specSearchQuery}
                        onChange={(e) => setSpecSearchQuery(e.target.value)}
                        className="pl-7 pr-3 py-1 bg-surface-container border border-outline-variant/60 rounded-full text-xs outline-none focus:border-primary transition-all max-w-[160px]"
                      />
                      {specSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSpecSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      )}
                    </div>
                    <span className="text-caption text-primary font-semibold">
                      Đã chọn {selectedSpecializationIds.length} chuyên ngành
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5 p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low/30 shadow-inner min-h-[80px]">
                  {(() => {
                    const filteredSpecs = allSpecializations.filter(
                      (spec) =>
                        spec.name.toLowerCase().includes(specSearchQuery.toLowerCase()) ||
                        spec.code.toLowerCase().includes(specSearchQuery.toLowerCase())
                    );
                    if (filteredSpecs.length === 0) {
                      return (
                        <p className="text-caption text-on-surface-variant font-medium self-center mx-auto">
                          {specSearchQuery ? "Không tìm thấy chuyên ngành phù hợp." : "Không tìm thấy chuyên ngành nào trong hệ thống."}
                        </p>
                      );
                    }
                    return filteredSpecs.map((spec) => {
                      const isSelected = selectedSpecializationIds.includes(spec.id);
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSpecializationIds(selectedSpecializationIds.filter((id) => id !== spec.id));
                            } else {
                              setSelectedSpecializationIds([...selectedSpecializationIds, spec.id]);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all duration-200 select-none shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                              : "bg-surface-container-lowest border-outline-variant/60 text-on-surface-variant hover:border-primary/50 hover:text-on-surface"
                          }`}
                        >
                          {isSelected && (
                            <span className="material-symbols-outlined text-sm font-bold animate-scale-up">check</span>
                          )}
                          <span className="opacity-75 font-mono text-[10px] bg-outline-variant/30 px-1 py-0.25 rounded">
                            {spec.code}
                          </span>
                          <span>{spec.name}</span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Experience Years */}
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant font-medium">Số năm kinh nghiệm</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  placeholder="Nhập số năm..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-body-md text-on-surface outline-none focus:border-primary transition-all shadow-sm"
                  value={experienceYears || ""}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-on-surface-variant font-medium">Tiểu sử & Giới thiệu bản thân</label>
                <span className="text-caption text-on-surface-variant">{bio.length}/500 ký tự</span>
              </div>
              <textarea
                maxLength={500}
                rows={4}
                placeholder="Viết một đoạn giới thiệu ngắn về kỹ năng, kinh nghiệm giảng dạy của bạn..."
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-body-md text-on-surface outline-none focus:border-primary transition-all shadow-sm resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-on-primary font-label-md px-stack-md py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                {saving && (
                  <div className="w-5 h-5 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                )}
                Lưu Thông Tin
              </button>
            </div>
          </form>

          {/* Section: Certificate Management */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 space-y-6">
            <h3 className="font-headline-md text-lg font-bold text-on-surface pb-3 border-b border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">military_tech</span>
              Bằng cấp & Chứng chỉ giảng dạy
            </h3>

            {/* List of existing certificates */}
            {certificates.length === 0 ? (
              <div className="bg-surface-container-low border border-dashed border-outline-variant/50 rounded-xl p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">military_tech</span>
                <p className="font-body-md">Chưa có chứng chỉ nào được lưu.</p>
                <p className="text-caption mt-1">Hãy sử dụng mẫu phía dưới để đăng ký chứng chỉ của bạn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-outline-variant/40 rounded-2xl overflow-hidden bg-surface-container-lowest shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all flex flex-col group relative"
                  >
                    {/* Header */}
                    <div className="p-4 bg-surface-container-low flex justify-between items-start border-b border-outline-variant/30">
                      <div>
                        <h4 className="font-headline-md text-sm font-bold text-on-surface line-clamp-1">{cert.name}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteCertificate(cert.id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container/20"
                        title="Xóa chứng chỉ"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>

                    {/* Previews (2 sides) */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-surface-container-lowest flex-1">
                      {/* Front Image preview */}
                      <div className="relative group/img aspect-[4/3] rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-container flex items-center justify-center">
                        <img
                          src={cert.frontImageUrl}
                          alt={`${cert.name} - Mặt trước`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setLightboxImage({ url: cert.frontImageUrl, title: `${cert.name} (Mặt trước)` })}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                        >
                          <span className="material-symbols-outlined">zoom_in</span>
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded">Trước</span>
                      </div>

                      {/* Back Image preview */}
                      <div className="relative group/img aspect-[4/3] rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-container flex items-center justify-center">
                        {cert.backImageUrl ? (
                          <>
                            <img
                              src={cert.backImageUrl}
                              alt={`${cert.name} - Mặt sau`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => setLightboxImage({ url: cert.backImageUrl!, title: `${cert.name} (Mặt sau)` })}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                            >
                              <span className="material-symbols-outlined">zoom_in</span>
                            </button>
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded">Sau</span>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-on-surface-variant text-center p-2">
                            <span className="material-symbols-outlined text-xl mb-1 opacity-50">crop_original</span>
                            <span className="text-[10px] text-on-surface-variant/70">Không có ảnh mặt sau</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form to Add New Certificate */}
            <div className="border border-outline-variant/50 p-6 rounded-2xl bg-surface-container-low/40 space-y-5">
              <h4 className="font-headline-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">add_circle</span>
                Thêm chứng chỉ mới
              </h4>

              {/* Certificate Name Input */}
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant font-medium">Tên chứng chỉ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: TOEFL iBT 110, Microsoft Certified Trainer..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary transition-all shadow-sm"
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                />
              </div>

              {/* 2-Side Image Upload Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Mặt Trước */}
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant font-medium flex items-center gap-1">
                    Hình ảnh Mặt trước <span className="text-error">*</span>
                  </label>
                  <div
                    onClick={() => !uploadingFront && frontInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all aspect-[4/3] relative bg-surface-container-lowest overflow-hidden hover:bg-surface-container-low ${
                      frontImage ? "border-primary/50" : "border-outline-variant/60 hover:border-primary/50"
                    }`}
                  >
                    {uploadingFront ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-caption text-on-surface-variant">Đang tải lên...</span>
                      </div>
                    ) : frontImage ? (
                      <>
                        <img src={frontImage.url} alt="Mặt trước" className="w-full h-full object-cover absolute inset-0" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <span className="material-symbols-outlined">refresh</span>
                          <span className="text-xs font-semibold ml-1">Thay ảnh</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-1">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant">cloud_upload</span>
                        <p className="text-caption text-on-surface-variant font-medium">Chọn hoặc Kéo thả ảnh mặt trước</p>
                        <p className="text-[10px] text-on-surface-variant/60">Định dạng JPG, PNG...</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={frontInputRef}
                      onChange={handleFrontImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Upload Mặt Sau */}
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant font-medium">
                    Hình ảnh Mặt sau (Không bắt buộc)
                  </label>
                  <div
                    onClick={() => !uploadingBack && backInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all aspect-[4/3] relative bg-surface-container-lowest overflow-hidden hover:bg-surface-container-low ${
                      backImage ? "border-primary/50" : "border-outline-variant/60 hover:border-primary/50"
                    }`}
                  >
                    {uploadingBack ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-caption text-on-surface-variant">Đang tải lên...</span>
                      </div>
                    ) : backImage ? (
                      <>
                        <img src={backImage.url} alt="Mặt sau" className="w-full h-full object-cover absolute inset-0" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <span className="material-symbols-outlined">refresh</span>
                          <span className="text-xs font-semibold ml-1">Thay ảnh</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-1">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant">cloud_upload</span>
                        <p className="text-caption text-on-surface-variant font-medium">Chọn hoặc Kéo thả ảnh mặt sau</p>
                        <p className="text-[10px] text-on-surface-variant/60">Tải lên nếu chứng chỉ có 2 mặt</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={backInputRef}
                      onChange={handleBackImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3">
                {(frontImage || backImage || newCertName) && (
                  <button
                    onClick={() => {
                      setNewCertName("");
                      setFrontImage(null);
                      setBackImage(null);
                      if (frontInputRef.current) frontInputRef.current.value = "";
                      if (backInputRef.current) backInputRef.current.value = "";
                    }}
                    className="border border-outline-variant text-on-surface-variant font-label-md px-4 py-2.5 rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    Hủy bỏ
                  </button>
                )}
                <button
                  onClick={handleAddCertificate}
                  disabled={saving || uploadingFront || uploadingBack || !frontImage || !newCertName.trim()}
                  className="bg-primary text-on-primary font-label-md px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Thêm chứng chỉ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Modal View Image full screen */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-outline-variant p-2 rounded-full hover:bg-white/10 transition-colors z-50"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          
          {/* Main Image */}
          <div
            className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-scale-up"
            />
          </div>
          
          {/* Title */}
          <p className="text-white text-sm font-semibold mt-4 text-center px-4 select-none">
            {lightboxImage.title}
          </p>
        </div>
      )}
    </div>
  );
}
