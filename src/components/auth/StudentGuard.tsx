"use client";

import { useAuthStore, useAuthHydration } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const hydrated = useAuthHydration();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!user || user.role?.toLowerCase() !== "student") {
      router.replace("/login");
    } else {
      setIsAuthorized(true);
      
      // Sync profile in background to ensure auth store is up to date
      import("@/lib/api").then(({ api }) => {
        api.profile.getProfile().then((res) => {
          if (res.data) {
            useAuthStore.getState().updateUser({
              fullName: res.data.fullName,
              phone: res.data.phone,
              avatarUrl: res.data.avatarUrl,
            });
          }
        }).catch((err) => {
          console.error("Failed to sync profile:", err);
        });
      });
    }
  }, [hydrated, user?.id, router]);

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
