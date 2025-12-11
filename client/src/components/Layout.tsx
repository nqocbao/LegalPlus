import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/auth";
import { Button } from "./ui/button";

const navItems = [
  { path: "/chat", label: "Chat" },
  { path: "/history", label: "Lịch sử" },
  { path: "/admin/knowledge", label: "Kiến thức" },
  { path: "/profile", label: "Hồ sơ" },
];

function Layout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 text-slate-900">
      <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
        <Link to="/" className="text-xl font-semibold text-primary">
          LegalPlus AI
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-full px-3 py-2 transition ${
                location.pathname.startsWith(item.path)
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {token ? (
            <Button
              onClick={handleLogout}
              className="bg-accent px-4 text-sm font-semibold text-white hover:bg-orange-500"
            >
              Đăng xuất
            </Button>
          ) : (
            <Button asChild className="px-4 text-sm font-semibold">
              <Link to="/login">Đăng nhập</Link>
            </Button>
          )}
        </nav>
      </header>
      <main className="mt-6">{children}</main>
    </div>
  );
}

export default Layout;
