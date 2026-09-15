import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form.full_name, form.email, form.password);
      toast.success("Account created.");
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
          <h1 className="font-mono text-lg font-semibold text-[var(--color-text)]">Create your account</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Start diagnosing bugs with AI.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-mono uppercase tracking-wide text-[var(--color-text-faint)]">
                Full name
              </label>
              <input
                required
                minLength={2}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-signal)]"
                placeholder="Jane Doe"
              />
            </div>
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
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-signal)]"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[var(--color-signal)] py-2.5 text-sm font-medium text-[var(--color-base)] hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-signal)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
