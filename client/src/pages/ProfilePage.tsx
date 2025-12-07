import { useAuthStore } from '../store/auth';

function ProfilePage() {
  const { email, role } = useAuthStore();

  return (
    <div className="rounded-2xl bg-white/5 p-4 shadow-lg">
      <h2 className="text-lg font-semibold">Hồ sơ</h2>
      <p className="mt-2 text-sm text-gray-200">Email: {email}</p>
      <p className="text-sm text-gray-200">Vai trò: {role}</p>
    </div>
  );
}

export default ProfilePage;
