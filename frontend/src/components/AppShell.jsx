import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-base)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
