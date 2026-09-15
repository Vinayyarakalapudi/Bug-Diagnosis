import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-mono text-2xl font-semibold text-[var(--color-text)]">Settings</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Your account details.</p>

      <div className="mt-8 max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <div className="space-y-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Full name</p>
            <p className="mt-1 text-sm text-[var(--color-text)]">{user?.full_name}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Email</p>
            <p className="mt-1 text-sm text-[var(--color-text)]">{user?.email}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Role</p>
            <p className="mt-1 text-sm capitalize text-[var(--color-text)]">{user?.role}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Member since</p>
            <p className="mt-1 text-sm text-[var(--color-text)]">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
