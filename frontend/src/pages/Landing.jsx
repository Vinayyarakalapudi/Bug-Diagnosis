import { Link } from "react-router-dom";
import { ArrowRight, Search, GitBranch, MessagesSquare } from "lucide-react";
import PulseTrace from "../components/PulseTrace";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-base)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wide text-[var(--color-signal)]">
            DIAGNOSTIX
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-[var(--color-signal)] px-4 py-2 text-sm font-medium text-[var(--color-base)] hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-8 pb-16 pt-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-signal)]">
          Detect → Analyze → Retrieve → Fix
        </p>
        <h1 className="mt-5 font-mono text-4xl font-semibold leading-tight text-[var(--color-text)] sm:text-5xl">
          Paste the stack trace.
          <br />
          Skip the guessing.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-[var(--color-text-muted)]">
          Diagnostix runs four specialist AI agents against your code, logs, and internal docs
          to find the root cause and hand you a fix — grounded in your team's own knowledge base,
          not generic Stack Overflow guesses.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-lg bg-[var(--color-signal)] px-5 py-3 text-sm font-medium text-[var(--color-base)] hover:opacity-90"
          >
            Start diagnosing <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-panel)]"
          >
            Sign in
          </Link>
        </div>

        <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-8 py-10">
          <PulseTrace activeIndex={-1} size="lg" />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-8 pb-24 sm:grid-cols-3">
        {[
          {
            icon: Search,
            title: "Root cause, not symptoms",
            body: "Four agents work together — bug detection, code analysis, knowledge retrieval, and fix synthesis — to explain what actually broke.",
          },
          {
            icon: GitBranch,
            title: "Grounded in your docs",
            body: "Upload READMEs, runbooks, and architecture docs. The RAG pipeline retrieves relevant context before the model ever answers.",
          },
          {
            icon: MessagesSquare,
            title: "Ask follow-up questions",
            body: "Chat with the assistant about any analysis — \"why did this happen\", \"how do I optimize this\" — answered from real context.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
            <Icon size={20} className="text-[var(--color-signal)]" />
            <h3 className="mt-3 font-mono text-sm font-semibold text-[var(--color-text)]">{title}</h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
