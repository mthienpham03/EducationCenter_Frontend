"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/store/auth.store";

export default function LecturerGuard({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const hydrated = useAuthHydration();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!token || !user) {
      router.replace("/login");
    } else {
      const role = user.role?.toLowerCase();
      if (role !== "lecturer" && role !== "admin") {
        router.replace("/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [hydrated, user, token, router]);

  if (!hydrated || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-body-md text-sm">Đang xác thực thông tin...</p>
      </div>
    );
  }

  return <>{children}</>;
}
