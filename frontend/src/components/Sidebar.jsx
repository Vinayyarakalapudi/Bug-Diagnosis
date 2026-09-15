import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, UploadCloud, MessageSquareText, BookOpen,
  History, ShieldCheck, Settings as SettingsIcon, LogOut, Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload & Diagnose", icon: UploadCloud },
  { to: "/chat", label: "AI Assistant", icon: MessageSquareText },
  { to: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/history", label: "History", icon: History },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-5">
        <Activity size={20} className="text-[var(--color-signal)]" />
        <span className="font-mono text-sm font-semibold tracking-wide text-[var(--color-text)]">
          DIAGNOSTIX
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-signal-soft)] text-[var(--color-signal)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-panel-raised)] hover:text-[var(--color-text)]"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-signal-soft)] text-[var(--color-signal)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-panel-raised)] hover:text-[var(--color-text)]"
              }`
            }
          >
            <ShieldCheck size={17} />
            Admin
          </NavLink>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive
                ? "bg-[var(--color-signal-soft)] text-[var(--color-signal)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-panel-raised)] hover:text-[var(--color-text)]"
            }`
          }
        >
          <SettingsIcon size={17} />
          Settings
        </NavLink>
      </nav>

      <div className="border-t border-[var(--color-border)] p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-signal-soft)] font-mono text-xs font-semibold text-[var(--color-signal)]">
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-[var(--color-text)]">{user?.full_name}</p>
            <p className="truncate text-xs text-[var(--color-text-faint)]">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-panel-raised)] hover:text-[var(--color-critical)]"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
