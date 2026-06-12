import ProfileForm from "@/components/profile/ProfileForm";

export default function AdminProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hồ sơ Quản trị viên</h1>
      {/* Nhét cái "ruột" vào đây */}
      <ProfileForm /> 
    </div>
  );
}