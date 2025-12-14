import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import api from "../lib/api";
import { useAuthStore } from "../store/auth";

function LoginPage() {
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  // Dùng API thật mặc định; bật mock bằng cách đặt VITE_USE_MOCK_AUTH=true
  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (useMockAuth) {
        setAuth("mock-token", email || "john@example.com", "user");
        navigate("/chat");
        return;
      }

      const res = await api.post("/auth/login", { email, password });
      const token = res.data?.accessToken;
      if (!token) {
        throw new Error("Không nhận được token đăng nhập");
      }

      // Lấy role từ JWT để cho phép admin thấy trang kiến thức
      let normalizedRole: "user" | "admin" = "user";
      try {
        const payload = JSON.parse(atob(token.split(".")?.[1] ?? ""));
        const rawRole = (payload?.role as string | undefined)?.toLowerCase();
        if (rawRole === "admin" || rawRole === "user") {
          normalizedRole = rawRole;
        }
      } catch (err) {
        console.warn("Không decode được JWT role", err);
      }

      setAuth(token, email, normalizedRole);
      navigate("/chat");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Đăng nhập thất bại");
    }
  };

  return (
    <AuthLayout
      title="Trợ lý AI Pháp luật đầu tiên!"
      subtitle="Đăng nhập để bắt đầu khám phá kho tàng thông tin hữu ích và hỏi đáp pháp lý an toàn."
      highlight={
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-800">Tài khoản mẫu (có sẵn):</p>
          <p className="text-slate-700">Email: john@example.com</p>
          <p className="text-slate-700">Mật khẩu: Password123</p>
        </div>
      }
      footer={
        <>
          <span>Chưa có tài khoản? </span>
          <Link to="/signup" className="font-semibold text-primary underline">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <h2 className="text-xl font-semibold text-slate-900">Đăng nhập</h2>
      <p className="mt-1 text-sm text-slate-600">Sử dụng email và mật khẩu để tiếp tục.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white shadow hover:bg-primary/90"
        >
          Đăng nhập
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
