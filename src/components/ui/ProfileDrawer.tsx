"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import dynamic from "next/dynamic";

const LecturerProfile = dynamic(
  () => import("@/app/lecturer/profile/page"),
  { ssr: false }
);

const StudentProfile = dynamic(
  () => import("@/app/student/profile/page"),
  { ssr: false }
);

const AdminProfile = dynamic(
  () => import("@/app/admin/profile/page"),
  { ssr: false }
);

export default function ProfileDrawer() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const handler = () => setOpen(true);

    window.addEventListener(
      "open-profile-panel",
      handler as EventListener
    );

    return () => {
      window.removeEventListener(
        "open-profile-panel",
        handler as EventListener
      );
    };
  }, []);

  if (!open) return null;

  const role = user?.role?.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setOpen(false)}
      />

      <div
        className="relative max-w-4xl w-full bg-surface-container-lowest rounded-2xl shadow-2xl overflow-auto"
        style={{ maxHeight: "90vh" }}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Hồ sơ</h3>

          <button
            className="p-2 rounded"
            onClick={() => setOpen(false)}
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <div className="p-4">
          {role === "admin" && <AdminProfile />}

          {role === "lecturer" && <LecturerProfile />}

          {role === "student" && <StudentProfile />}
        </div>
      </div>
    </div>
  );
}