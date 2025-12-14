import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthStore } from "./store/auth";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import KnowledgePage from "./pages/KnowledgePage";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import Layout from "./components/Layout";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/chat" replace />;
  return children;
};

function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <div className="min-h-screen gradient-bg">
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/chat" : "/login"} replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/chat"
          element={
            <Layout>
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/knowledge"
          element={
            <Layout>
              <AdminRoute>
                <KnowledgePage />
              </AdminRoute>
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            </Layout>
          }
        />
        <Route
          path="/history"
          element={
            <Layout>
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            </Layout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
