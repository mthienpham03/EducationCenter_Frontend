import { redirect } from "next/navigation";

export default function OtpPage() {
  redirect("/forgot-password/reset");
}
