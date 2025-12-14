import { FormEvent, useEffect, useState } from "react";

import api from "../lib/api";
import { useAuthStore } from "../store/auth";

interface Profile {
  id: number;
  fullName: string | null;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

function ProfilePage() {
  const { email: cachedEmail, role: cachedRole } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get<Profile>("/users/me")
      .then((res) => {
        if (!mounted) return;
        setProfile(res.data);
        setFullName(res.data.fullName ?? "");
      })
      .catch((err) => {
        if (!mounted) return;
        // eslint-disable-next-line no-console
        console.error(err);
        setError(err?.response?.data?.message ?? "Không lấy được thông tin người dùng");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const displayEmail = profile?.email ?? cachedEmail ?? "";
  const displayRole = profile?.role ?? cachedRole ?? "";
  const displayName = profile?.fullName ?? "Chưa cập nhật";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await api.put<Profile>("/users/me", { fullName });
      setProfile(res.data);
      setSuccess("Cập nhật hồ sơ thành công");
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err?.response?.data?.message ?? "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg text-slate-900">
      <h2 className="text-xl font-semibold text-slate-900">Hồ sơ</h2>

      {loading ? (
        <p className="mt-4 text-sm text-slate-600">Đang tải thông tin...</p>
      ) : (
        <>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-emerald-600">{success}</p> : null}

          <div className="mt-4 space-y-3 text-sm text-slate-800">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase text-slate-500">Họ và tên</p>
              <p className="text-base font-semibold text-slate-900">{displayName}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase text-slate-500">Email</p>
              <p className="text-base font-semibold text-slate-900">{displayEmail}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase text-slate-500">Vai trò</p>
              <p className="text-base font-semibold text-slate-900">{displayRole}</p>
            </div>
            {profile?.createdAt ? (
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase text-slate-500">Ngày tạo</p>
                <p className="text-base font-semibold text-slate-900">
                  {new Date(profile.createdAt).toLocaleString()}
                </p>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 shadow-inner">
            <p className="text-sm font-semibold text-slate-900">Chỉnh sửa hồ sơ</p>
            <div className="space-y-1">
              <label className="text-xs uppercase text-slate-500">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Nhập họ tên"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ProfilePage;
