"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: ForgotPasswordValues) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await authApi.forgotPassword(data);
      if (response.success) {
        setSuccessMsg("Mã OTP đã được gửi thành công đến email của bạn.");
        // Store email to sessionStorage for the next OTP verification page
        sessionStorage.setItem("reset_email", data.email);
        
        // Wait a short time to show success then redirect to Reset Password
        setTimeout(() => {
          router.push("/forgot-password/reset");
        }, 1500);
      } else {
        setErrorMsg(response.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Email không tồn tại trong hệ thống hoặc đã xảy ra lỗi.");
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#FFFFFF] shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-2xl border border-gray-100 relative overflow-hidden">
      {/* Decorative corner background blobs */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl"></div>

      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-[#e1f3ff] rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[#87CEFA] text-[36px]" style={{ fontVariationSettings: "'FILL' 0" }}>
            lock_reset
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">Quên mật khẩu?</h2>
        <p className="text-gray-500 text-sm text-center px-2">
          Vui lòng nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center border border-red-100 relative z-10">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center border border-green-100 relative z-10">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 flex justify-center items-center gap-2 text-white bg-gradient-to-r from-[#87CEFA] to-[#60bafb] font-semibold rounded-xl hover:shadow-[0_4px_15px_rgba(135,206,250,0.4)] transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
              Đang gửi yêu cầu...
            </span>
          ) : (
            <>
              Gửi mã xác nhận <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center relative z-10 border-t border-gray-100 pt-5">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#87CEFA] transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
