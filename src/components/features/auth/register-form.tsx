"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Mail, Lock, User, UserPlus, ArrowLeft } from "lucide-react";
import { useState } from "react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [errorMsg, setErrorMsg] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMsg("");
    try {
      console.log("Dữ liệu đăng ký:", data);
      // Mô phỏng gọi API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // TODO: Thay bằng API call thực tế
      // const response = await registerApi(data);
      // alert("Đăng ký thành công!");
    } catch (error) {
      setErrorMsg("Đăng ký thất bại. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#FFFFFF] shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-2xl border border-gray-100 relative overflow-hidden">
      {/* Trang trí góc trên Form */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl"></div>

      <div className="relative z-10 text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Tạo Tài Khoản</h2>
        <p className="text-gray-500 text-sm">
          Đăng ký để trải nghiệm hệ thống học tập tuyệt vời của chúng tôi.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center border border-red-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Họ và tên</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input
              {...register("name")}
              type="text"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-[#87CEFA] ${
                errors.name ? "border-red-500 focus:ring-red-200" : "border-gray-200"
              }`}
              placeholder="Vd: Nguyễn Văn A"
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              {...register("email")}
              type="email"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-[#87CEFA] ${
                errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-200"
              }`}
              placeholder="nhap@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              {...register("password")}
              type="password"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-[#87CEFA] ${
                errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-200"
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Xác nhận mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              {...register("confirmPassword")}
              type="password"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-[#87CEFA] ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-200" : "border-gray-200"
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 flex justify-center items-center gap-2 text-white bg-gradient-to-r from-[#87CEFA] to-[#60bafb] font-semibold rounded-xl hover:shadow-[0_4px_15px_rgba(135,206,250,0.4)] transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
              Đang xử lý...
            </span>
          ) : (
            <>
              Đăng Ký <UserPlus size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center relative z-10">
        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
          <Link
            href="/login"
            className="font-bold text-[#87CEFA] hover:text-[#5eb7f7] transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}