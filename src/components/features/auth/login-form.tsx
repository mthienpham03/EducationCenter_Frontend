"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Mail, Lock, LogIn, ArrowRight, Cloud, Star,
  Sparkles, Feather, Loader2, BookOpen, GraduationCap,
  Sun, Compass
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Be_Vietnam_Pro } from "next/font/google";

// Cấu hình font Be Vietnam Pro
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Component xử lý icon bay lơ lửng và né chuột
const FloatingIcon = ({ Icon, top, left, delay, hoverX, hoverY, size = 28 }: any) => (
  <motion.div
    className="absolute text-[#87CEFA] pointer-events-auto cursor-default"
    style={{ top, left, zIndex: 0 }}
    initial={{ y: 0, opacity: 0.15 }}
    animate={{
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    whileHover={{
      x: hoverX,
      y: hoverY,
      opacity: 0.8,
      scale: 1.4,
      rotate: 15,
      transition: { type: "spring", stiffness: 300, damping: 10 },
    }}
  >
    <Icon size={size} />
  </motion.div>
);

export function LoginForm() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Giả lập thời gian load trang (hoặc chờ component mount)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000); // Thời gian chờ 1 giây
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg("");
    try {
      const response = await authApi.login(data);
      if (response.success) {
        const user = response.data.user;
        setAuth(user, response.data.accessToken);

        const role = user.role?.toLowerCase();
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "lecturer") {
          router.push("/lecturer/courses");
        } else if (role === "student") {
          router.push("/student/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  // Màn hình chờ load trang
  if (isPageLoading) {
    return (
      <div className={`w-full max-w-md h-[500px] flex flex-col justify-center items-center ${beVietnamPro.className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="text-[#87CEFA] mb-4"
        >
          <Loader2 size={48} />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[#87CEFA] font-medium"
        >
          Đang tải dữ liệu...
        </motion.p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`w-full max-w-md p-8 bg-[#FFFFFF]/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-2xl border border-gray-100 relative overflow-hidden ${beVietnamPro.className}`}
    >
      {/* Trang trí góc Form */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-[#87CEFA] rounded-full opacity-20 blur-2xl pointer-events-none"></div>

      {/* Các Icon bay lơ lửng ngoài Background lấp đầy khoảng trắng */}
      <FloatingIcon Icon={Cloud} top="8%" left="6%" delay={0} hoverX={-40} hoverY={-30} size={24} />
      <FloatingIcon Icon={Sun} top="5%" left="45%" delay={0.3} hoverX={0} hoverY={-40} size={26} />
      <FloatingIcon Icon={Star} top="12%" left="82%" delay={1} hoverX={40} hoverY={-40} size={20} />

      <FloatingIcon Icon={BookOpen} top="35%" left="4%" delay={0.8} hoverX={-35} hoverY={20} size={22} />
      <FloatingIcon Icon={GraduationCap} top="40%" left="86%" delay={1.2} hoverX={35} hoverY={-20} size={26} />

      <FloatingIcon Icon={Sparkles} top="75%" left="8%" delay={0.5} hoverX={-50} hoverY={40} size={20} />
      <FloatingIcon Icon={Compass} top="85%" left="45%" delay={1.8} hoverX={0} hoverY={45} size={24} />
      <FloatingIcon Icon={Feather} top="70%" left="84%" delay={1.5} hoverX={50} hoverY={30} size={22} />

      <motion.div variants={itemVariants} className="relative z-10 text-center mb-8 mt-2">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">Đăng Nhập</h2>
        <p className="text-gray-500 text-sm">Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.</p>
      </motion.div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center border border-red-100 relative z-10 font-medium"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
        <motion.div variants={itemVariants} className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              {...register("email")}
              type="email"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all duration-200 bg-gray-50/50 placeholder-gray-400 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-[#87CEFA] ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-200"
                }`}
              placeholder="nhap@email.com"
            />
          </div>
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
            <Link href="/forgot-password" className="text-sm font-medium text-[#87CEFA] hover:text-[#5eb7f7] transition-colors">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              {...register("password")}
              type="password"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all duration-200 bg-gray-50/50 placeholder-gray-400 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-[#87CEFA] ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-200"
                }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0px 5px 20px rgba(135,206,250,0.4)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 flex justify-center items-center gap-2 text-white bg-gradient-to-r from-[#87CEFA] to-[#60bafb] font-semibold rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="inline-block w-5 h-5 border-2 border-white/50 border-t-white rounded-full"
                  />
                Đang xử lý...
              </span>
            ) : (
              <>
                Đăng Nhập <LogIn size={18} />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="mt-8 text-center relative z-10">
        <div className="text-sm text-gray-600">
          Bạn chưa có tài khoản?{' '}
          <Link href="/register" className="font-bold text-[#87CEFA] hover:text-[#5eb7f7] transition-colors inline-flex items-center gap-1">
            Đăng ký ngay
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-flex"
            >
              <ArrowRight size={14} />
            </motion.span>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}