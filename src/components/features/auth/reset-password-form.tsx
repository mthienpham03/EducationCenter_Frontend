"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất một chữ số" }),
    confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận lại mật khẩu" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword") || "";

  // Password rules validation for live check-circles
  const isMinLength = newPasswordValue.length >= 8;
  const hasNumber = /[0-9]/.test(newPasswordValue);

  // Retrieve email and OTP from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("reset_email");
    const storedOtp = sessionStorage.getItem("reset_otp");

    if (!storedEmail || !storedOtp) {
      setErrorMsg("Phiên xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
      setTimeout(() => {
        router.push("/forgot-password");
      }, 3000);
    } else {
      setEmail(storedEmail);
      setOtp(storedOtp);
    }
  }, [router]);

  const onSubmit = async (data: ResetPasswordValues) => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !otp) {
      setErrorMsg("Thông tin email hoặc mã OTP bị thiếu. Vui lòng quay lại bước đầu.");
      return;
    }

    try {
      const response = await authApi.resetPassword({
        email,
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (response.success) {
        setSuccessMsg("Mật khẩu của bạn đã được cập nhật thành công!");
        
        // Clear reset details from sessionStorage
        sessionStorage.removeItem("reset_email");
        sessionStorage.removeItem("reset_otp");

        // Redirect to login after showing success state
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrorMsg(response.message || "Đặt lại mật khẩu không thành công.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng kiểm tra lại mã OTP.");
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#FFFFFF] shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-2xl border border-gray-100 relative overflow-hidden">
      {/* Decorative corner background blobs */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl"></div>

      <div className="relative z-10 flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-[#e1f3ff] rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[#87CEFA] text-[36px]" style={{ fontVariationSettings: "'FILL' 0" }}>
            lock_open
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">Đặt lại mật khẩu</h2>
        <p className="text-gray-500 text-sm text-center px-4 leading-relaxed">
          Vui lòng nhập mật khẩu mới. Mật khẩu phải có ít nhất 8 ký tự bao gồm chữ và số.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center border border-red-100 relative z-10 flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center border border-green-100 relative z-10">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
        {/* New Password Input */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Mật khẩu mới</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              {...register("newPassword")}
              type={showNewPassword ? "text" : "password"}
              className={`w-full pl-10 pr-10 py-2.5 border rounded-xl outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-[#87CEFA] ${
                errors.newPassword ? "border-red-500 focus:ring-red-200" : "border-gray-200"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Xác nhận mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full pl-10 pr-10 py-2.5 border rounded-xl outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-[#87CEFA] ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-200" : "border-gray-200"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Security Rule Indicators */}
        <div className="flex flex-col gap-2 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={16}
              className={`transition-colors duration-200 ${
                isMinLength ? "text-green-500 fill-green-50" : "text-gray-300"
              }`}
            />
            <span className={isMinLength ? "text-green-600 font-medium" : "text-gray-500"}>
              Tối thiểu 8 ký tự
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={16}
              className={`transition-colors duration-200 ${
                hasNumber ? "text-green-500 fill-green-50" : "text-gray-300"
              }`}
            />
            <span className={hasNumber ? "text-green-600 font-medium" : "text-gray-500"}>
              Chứa ít nhất một chữ số
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !email || !otp}
          className="w-full py-3 flex justify-center items-center gap-2 text-white bg-gradient-to-r from-[#87CEFA] to-[#60bafb] font-semibold rounded-xl hover:shadow-[0_4px_15px_rgba(135,206,250,0.4)] transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              Đang cập nhật mật khẩu...
            </span>
          ) : (
            "Cập nhật mật khẩu"
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
