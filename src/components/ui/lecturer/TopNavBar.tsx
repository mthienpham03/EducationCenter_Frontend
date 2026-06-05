"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function TopNavBar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="w-full h-16 sticky top-0 bg-surface-container-lowest dark:bg-surface-container-high shadow-sm dark:border-b dark:border-outline-variant flex justify-between items-center px-margin-desktop max-w-container-max mx-auto z-40">
      <div className="flex items-center gap-stack-sm overflow-hidden">
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
          <span>{/* Breadcrumbs có thể động sau */} Dashboard</span>
        </div>
      </div>
      <div className="flex items-center gap-stack-md">
        <div className="flex items-center gap-stack-sm ml-stack-sm border-l pl-stack-md border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 rounded-full hover:bg-surface-container-low">notifications</span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 rounded-full hover:bg-surface-container-low">help</span>
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div className="hidden absolute right-0 top-10 w-48 bg-white shadow-md border border-outline-variant rounded-lg group-hover:flex flex-col overflow-hidden">
               <div className="p-3 border-b border-outline-variant">
                 <p className="font-bold text-sm truncate">{user?.fullName}</p>
                 <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
               </div>
               <button onClick={handleLogout} className="flex items-center gap-2 p-3 text-error hover:bg-error-container/20 text-sm text-left">
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Logout
               </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
