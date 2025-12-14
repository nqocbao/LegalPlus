import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  highlight?: ReactNode;
}

function AuthLayout({ title, subtitle, children, footer, highlight }: AuthLayoutProps) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 px-6 py-10 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_45%)]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_40%)]" aria-hidden />

      <div className="relative grid w-full max-w-6xl gap-10 lg:grid-cols-2">
        <div className="space-y-6 rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            AI Tra cứu Luật
          </Link>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 lg:text-4xl">{title}</h1>
            <p className="text-base text-slate-600">{subtitle}</p>
          </div>
          {highlight ? <div className="rounded-2xl bg-sky-50/80 p-4 text-sm text-slate-700 shadow-inner">{highlight}</div> : null}
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Tra cứu điều luật nhanh, rõ ràng.</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Gợi ý căn cứ pháp lý liên quan.</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" />Lưu lịch sử hội thoại để xem lại.</li>
          </ul>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-white px-3 py-1 shadow">Bảo mật</span>
            <span className="rounded-full bg-white px-3 py-1 shadow">Pháp lý Việt Nam</span>
            <span className="rounded-full bg-white px-3 py-1 shadow">Hỗ trợ 24/7</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" aria-hidden />
          <div className="relative rounded-3xl bg-white/80 p-6 shadow-2xl backdrop-blur">
            {children}
            {footer ? <div className="mt-4 text-center text-sm text-slate-600">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
