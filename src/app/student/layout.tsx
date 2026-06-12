import StudentGuard from "@/components/auth/StudentGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentGuard>{children}</StudentGuard>;
}
