import { redirect } from "next/navigation";

export default function ResetPasswordRootPage() {
  redirect("/forgot-password");
}
