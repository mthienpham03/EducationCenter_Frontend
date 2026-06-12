"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";

export function OtpVerificationForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load email from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("reset_email");
    if (!storedEmail) {
      setErrorMsg("Không tìm thấy thông tin email. Vui lòng bắt đầu lại.");
      setTimeout(() => {
        router.push("/forgot-password");
      }, 3000);
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Mask email for display: e.g., admin@gmail.com -> ad***@gmail.com
  const getMaskedEmail = (emailStr: string) => {
    if (!emailStr) return "";
    const [localPart, domain] = emailStr.split("@");
    if (localPart.length <= 2) {
      return `${localPart}***@${domain}`;
    }
    return `${localPart.substring(0, 2)}***@${domain}`;
  };

  // OTP inputs handlers
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Keep only last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasteData)) return; // check if pasteData is digits only

    const digits = pasteData.slice(0, 6).split("");
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or the 6th input
    const focusIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setErrorMsg("Vui lòng nhập đầy đủ mã OTP 6 chữ số.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      // Simulate verification load to give the user high quality feedback
      setTimeout(() => {
        sessionStorage.setItem("reset_otp", otpCode);
        setSuccessMsg("Mã OTP đã được ghi nhận. Chuyển sang thiết lập mật khẩu mới.");
        setTimeout(() => {
          router.push("/forgot-password/reset");
        }, 1200);
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return;

    setErrorMsg("");
    setSuccessMsg("");
    setIsResending(true);

    try {
      const response = await authApi.forgotPassword({ email });
      if (response.success) {
        setSuccessMsg("Đã gửi mã OTP mới. Vui lòng kiểm tra hộp thư của bạn.");
        setTimeLeft(60); // reset timer
      } else {
        setErrorMsg(response.message || "Gửi lại mã OTP thất bại.");
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg("Không thể gửi lại mã OTP. Vui lòng kiểm tra lại kết nối.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#FFFFFF] shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-2xl border border-gray-100 relative overflow-hidden">
      {/* Decorative corner background blobs */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl"></div>

      <div className="relative z-10 flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-[#e1f3ff] rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[#87CEFA] text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_lock
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">Xác thực mã OTP</h2>
        <p className="text-gray-500 text-sm text-center px-2">
          Nhập mã xác thực OTP 6 số đã được gửi đến email
        </p>
        {email && (
          <span className="mt-1 font-semibold text-gray-700">{getMaskedEmail(email)}</span>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center border border-red-100 relative z-10 flex items-center justify-center gap-2">
          <ShieldAlert size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center border border-green-100 relative z-10">
          {successMsg}
        </div>
      )}

      <div className="space-y-6 relative z-10">
        {/* OTP Input Boxes */}
        <div className="flex justify-between gap-2 md:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border border-gray-200 rounded-xl focus:border-[#87CEFA] focus:ring-4 focus:ring-[#87CEFA]/20 transition-all outline-none bg-gray-50 text-gray-800 focus:bg-white"
            />
          ))}
        </div>

        {/* Verification Button */}
        <button
          onClick={handleVerify}
          disabled={isSubmitting || !email}
          className="w-full py-3 flex justify-center items-center gap-2 text-white bg-gradient-to-r from-[#87CEFA] to-[#60bafb] font-semibold rounded-xl hover:shadow-[0_4px_15px_rgba(135,206,250,0.4)] transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              Đang xác thực...
            </span>
          ) : (
            "Xác nhận mã OTP"
          )}
        </button>

        {/* Resend link block */}
        <div className="text-center pt-4 border-t border-gray-100 text-sm text-gray-500">
          Bạn không nhận được mã?{" "}
          {timeLeft > 0 ? (
            <span className="font-bold text-[#87CEFA]">
              Gửi lại mã ({timeLeft < 10 ? `00:0${timeLeft}` : `00:${timeLeft}`})
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-[#87CEFA] hover:text-[#5eb7f7] transition-colors hover:underline"
            >
              {isResending ? "Đang gửi..." : "Gửi lại mã ngay"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 text-center relative z-10">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#87CEFA] transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại bước trước
        </Link>
      </div>
    </div>
  );
}
