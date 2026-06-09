"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function LecturerGuard({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
    } else {
      const role = user.role?.toLowerCase();
      if (role !== "lecturer" && role !== "admin") {
        // Cho phép cả Admin vào, hoặc chỉ LECTURER tùy yêu cầu
        router.replace("/login"); // Hoặc trang unauthorized
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, token, router]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Có thể làm spinner đẹp hơn sau
  }

  return <>{children}</>;
}
