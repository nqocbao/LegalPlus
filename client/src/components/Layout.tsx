import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/auth';

const navItems = [
  { path: '/chat', label: 'Chat' },
  { path: '/history', label: 'Lịch sử' },
  { path: '/admin/knowledge', label: 'Kiến thức' },
  { path: '/profile', label: 'Hồ sơ' },
];

function Layout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 text-white">
      <header className="flex items-center justify-between rounded-2xl bg-muted/70 px-4 py-3 shadow-lg backdrop-blur">
        <Link to="/" className="text-xl font-semibold text-white">
          LegalPlus AI
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-full px-3 py-2 transition hover:bg-white/10 ${
                location.pathname.startsWith(item.path) ? 'bg-white/10 text-white' : 'text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {token ? (
            <button
              onClick={handleLogout}
              className="rounded-full bg-accent px-3 py-2 text-sm font-medium text-white shadow hover:bg-orange-500"
            >
              Đăng xuất
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-3 py-2 text-sm font-medium text-white shadow hover:bg-sky-600"
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </header>
      <main className="mt-6">{children}</main>
    </div>
  );
}

export default Layout;
