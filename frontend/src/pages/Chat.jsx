import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Send, Bot, User as UserIcon, FileText } from "lucide-react";
import { sendChatMessage } from "../api/chat";
import { getErrorMessage } from "../api/client";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysis_id") || undefined;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: text, id: `local-${Date.now()}` }]);
    setInput("");
    setSending(true);

    try {
      const data = await sendChatMessage({ message: text, session_id: sessionId, analysis_id: analysisId });
      setSessionId(data.session_id);
      setMessages((prev) => [...prev, data.reply]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4">
        <h1 className="font-mono text-2xl font-semibold text-[var(--color-text)]">AI Assistant</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Ask about error causes, tracebacks, or how to optimize your code. Answers are grounded
          in your knowledge base and analysis history.
        </p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot size={28} className="text-[var(--color-signal)]" />
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                Try: "Why did this error happen?" or "How can I optimize this code?"
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-soft)]">
                  <Bot size={14} className="text-[var(--color-signal)]" />
                </div>
              )}
              <div
                className={`max-w-lg rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[var(--color-signal)] text-[var(--color-base)]"
                    : "bg-[var(--color-panel-raised)] text-[var(--color-text)]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.sources?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[var(--color-border)] pt-2">
                    {m.sources.map((s, i) => (
                      <span key={i} className="flex items-center gap-1 font-mono text-[10px] text-[var(--color-text-faint)]">
                        <FileText size={10} /> {s.filename}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-panel-raised)]">
                  <UserIcon size={14} className="text-[var(--color-text-muted)]" />
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-faint)]">
              <Bot size={14} className="text-[var(--color-signal)]" /> thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-[var(--color-border)] p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about an error, a fix, or a best practice..."
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-signal)]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex items-center justify-center rounded-lg bg-[var(--color-signal)] p-2.5 text-[var(--color-base)] hover:opacity-90 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
