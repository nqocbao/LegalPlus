import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import api from "../lib/api";
import { useAuthStore } from "../store/auth";

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      const res = await api.post("/auth/register", { fullName, email, password });
      const token = res.data?.accessToken;
      if (!token) {
        throw new Error("Không nhận được token đăng ký");
      }
      setAuth(token, email, "user");
      navigate("/chat");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Đăng ký thất bại");
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản AI Tra cứu Luật"
      subtitle="Miễn phí bắt đầu. Lưu lịch sử hội thoại và nhận gợi ý pháp lý chính xác."
      footer={
        <>
          <span>Đã có tài khoản? </span>
          <Link to="/login" className="font-semibold text-primary underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <h2 className="text-xl font-semibold text-slate-900">Đăng ký</h2>
      <p className="mt-1 text-sm text-slate-600">Điền thông tin để bắt đầu sử dụng trợ lý pháp luật.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Họ và tên</label>
          <input
            type="text"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white shadow hover:bg-primary/90"
        >
          Đăng ký
        </button>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;
