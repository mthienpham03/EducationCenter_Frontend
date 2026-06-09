"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user || user.role?.toLowerCase() !== "student") {
      router.replace("/login");
    }
  }, [user, router]);

  // Avoid hydration errors
  if (!mounted) return null;

  // If user is not student, render nothing while redirecting
  if (!user || user.role?.toLowerCase() !== "student") {
    return null;
  }

  return <>{children}</>;
}
