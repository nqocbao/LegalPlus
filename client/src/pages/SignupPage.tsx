import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../lib/api';
import { useAuthStore } from '../store/auth';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', { email, password, confirmPassword });
      setAuth(res.data.token, email, 'user');
      navigate('/chat');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Đăng ký thất bại');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white/5 p-6 shadow-lg">
      <h1 className="text-2xl font-semibold text-white">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-primary"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:bg-sky-600"
        >
          Đăng ký
        </button>
      </form>
      <p className="mt-3 text-sm text-gray-200">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default SignupPage;
