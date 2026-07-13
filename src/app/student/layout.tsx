import StudentGuard from "@/components/auth/StudentGuard";
import SideNavBar from "@/components/ui/student/SideNavBar";
import TopNavBar from "@/components/ui/student/TopNavBar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentGuard>
      <div className="bg-surface-bright text-on-surface min-h-screen flex font-body-md">
        <SideNavBar />
        <div className="flex-1 ml-72 flex flex-col">
          <TopNavBar />
          <main className="p-margin-desktop bg-surface-bright flex-1">
            <div className="max-w-container-max mx-auto h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </StudentGuard>
  );
}
