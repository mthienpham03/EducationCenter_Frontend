import LecturerGuard from "@/components/auth/LecturerGuard";
import SideNavBar from "@/components/ui/lecturer/SideNavBar";
import TopNavBar from "@/components/ui/lecturer/TopNavBar";

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LecturerGuard>
      <div className="bg-background text-on-surface flex h-screen overflow-hidden">
        <SideNavBar />
        <main className="ml-64 flex-1 flex flex-col h-screen overflow-y-auto relative">
          <TopNavBar />
          <div className="flex-1">
            {children}
          </div>
          {/* Background Decoration */}
          <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent blur-3xl pointer-events-none"></div>
        </main>
      </div>
    </LecturerGuard>
  );
}