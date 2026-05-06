import { ProgramResult, ChatMessage } from "../types";
"use client";
import { useState, useRef, useEffect } from "react";

interface AIChatProps { results: ProgramResult[] | null; originalQuery: string; }
export default function AIChat({ results, originalQuery }: AIChatProps) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // Reset chat when new search results come in
  useEffect(() => {
    setMessages([]);
  }, [results]);

  async function sendMessage(text) {
    const q = (text || input).trim();
    if (!q || loading) return;

    const userMsg = { role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          context: {
            original_query: originalQuery,
            results: results.map((r) => ({
              program_name: r.program_name,
              institution: r.institution,
              credential: r.credential,
              tuition_domestic: r.tuition_domestic,
              tuition_international: r.tuition_international,
              duration: r.duration,
              intake: r.intake,
            })),
          },
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer || "Sorry, I couldn't find an answer." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  // Changed: now always shows the floating button
  const hasResults = results && results.length > 0;

  const suggestions = hasResults
    ? ["Which one is cheapest?", "Which is shortest?", "Any with co-op?", "Compare top 2"]
    : ["What programs are in Calgary?", "Cheapest nursing diploma?", "Best trade programs?", "How to apply in Alberta?"];

  return (
    <>
      {/* ── Floating Chat Button ──────────────────────────── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl group"
          style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#0D9488" }} />
          {/* Tooltip */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-body font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ask about results
          </span>
        </button>
      )}

      {/* ── Chat Panel ────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[340px] sm:w-[380px] animate-fade-slide-up"
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-surface-200"
            style={{ maxHeight: "calc(100vh - 100px)", boxShadow: "0 12px 48px rgba(0,0,0,0.15)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <span className="font-display font-bold text-sm text-white block leading-tight">AI Assistant</span>
                  <span className="text-[10px] font-body text-white/60">Ask about your results</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5" style={{ maxHeight: "320px", minHeight: "180px" }}>
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F0FDFA, #CCFBF1)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-body text-slate-400 mb-3">Ask me anything about your search results</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="text-[11px] font-body text-primary bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-full transition-colors border border-primary/10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] font-body leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-surface-100 text-slate-700 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface-100 px-4 py-2.5 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-surface-200 bg-surface-50 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && sendMessage("")}
                placeholder="Ask a question..."
                className="flex-1 text-sm font-body text-slate-700 bg-white border border-surface-200 rounded-lg px-3 py-1.5 outline-none focus:border-primary/30"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage("")}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}