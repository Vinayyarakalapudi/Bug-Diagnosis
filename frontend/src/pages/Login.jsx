import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success("Signed in.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-base)] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Activity size={20} className="text-[var(--color-signal)]" />
          <span className="font-mono text-sm font-semibold tracking-wide text-[var(--color-text)]">
            DIAGNOSTIX
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-7">
          <h1 className="font-mono text-lg font-semibold text-[var(--color-text)]">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Welcome back to your diagnosis workspace.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-mono uppercase tracking-wide text-[var(--color-text-faint)]">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-signal)]"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-mono uppercase tracking-wide text-[var(--color-text-faint)]">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-signal)]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[var(--color-signal)] py-2.5 text-sm font-medium text-[var(--color-base)] hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--color-text-muted)]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[var(--color-signal)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
