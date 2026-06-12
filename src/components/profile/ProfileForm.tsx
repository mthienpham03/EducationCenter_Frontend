"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

export default function ProfileForm() {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
    });

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("Dữ liệu chuẩn bị gửi API:", formData);
    };

    return (
        // Bo góc lớn rounded-3xl và đổ bóng mềm mại
        <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-gray-100 border border-gray-50">
            <form onSubmit={handleSubmit}>

                {/* Phần 1: Avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        {/* Kích thước w-32 h-32 (128px) - Cân bằng nhất */}
                        {avatarPreview ? (
                            <div className="relative w-32 h-32 rounded-full p-1 bg-white shadow-lg shadow-sky-100 ring-2 ring-sky-100">
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-50 to-sky-100 border-4 border-white shadow-lg shadow-sky-100 flex items-center justify-center text-sky-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                        )}

                        {/* Nút Upload đặt ở góc nhìn rất vừa vặn */}
                        <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full cursor-pointer border border-sky-100 shadow-md hover:bg-sky-50 transition-all duration-300 hover:scale-110"
                            title="Đổi ảnh đại diện"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                   
                </div>

                {/* Phần 2: Thông tin chi tiết */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email (Không thể thay đổi)</label>
                        <input
                            type="email"
                            value="student@example.com"
                            disabled
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed outline-none font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Nhập họ và tên..."
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none text-gray-700 font-medium transition-all placeholder:text-gray-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Nhập số điện thoại..."
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none text-gray-700 font-medium transition-all placeholder:text-gray-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Nhập địa chỉ..."
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none text-gray-700 font-medium transition-all placeholder:text-gray-300"
                        />
                    </div>
                </div>

                {/* Nút Submit đã bo tròn hoàn toàn và dài hết cỡ */}
                <div className="mt-10">
                    <button
                        type="submit"
                        className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-lg rounded-full shadow-lg shadow-sky-200 transition-all duration-300 transform hover:scale-[1.01] active:scale-95"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    );
}