import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppShell from "./AppShell";
import Loader from "./Loader";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-base)]">
        <Loader label="Verifying session" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <AppShell>{children}</AppShell>;
}
