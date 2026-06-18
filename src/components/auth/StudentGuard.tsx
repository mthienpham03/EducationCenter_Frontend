"use client";

import { useAuthStore, useAuthHydration } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const hydrated = useAuthHydration();
  const router = useRouter();
  
  // 1. Thêm biến mounted để chắc chắn component đã render ở Client
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true); // Đánh dấu là đã mount xong ở client
    if (!hydrated) return;

    if (!user || user.role?.toLowerCase() !== "student") {
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [hydrated, user, router]);

  // 2. Nếu chưa mounted, return null hoặc loading cực kỳ đơn giản để tránh Hydration Mismatch
  if (!mounted || !hydrated || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-body-md text-sm">Đang xác thực thông tin...</p>
      </div>
    );
  }

  return <>{children}</>;
}