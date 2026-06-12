"use client";

import { useState } from "react";
import { Zap, Send, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ClientPortal() {
  const [input,   setInput]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setStatus("loading");
    try {
      const res  = await fetch("/api/guardian", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ input }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.error) {
        setStatus("error");
        setMessage(data.response ?? "Error al procesar tu solicitud.");
      } else {
        setStatus("success");
        setMessage(data.response ?? "Quest creada — El equipo fue notificado.");
        setInput("");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Intenta de nuevo.");
    }
  }

  return (
    <div className="min-h-screen bg-[#07070f] text-slate-100 flex flex-col">
      {/* Scanlines */}
      <div className="scanlines" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-[#07070f]/92 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center">
              <Zap size={12} className="text-fuchsia-400" />
            </div>
            <span className="font-mono text-sm font-bold tracking-[0.18em]">
              <span className="text-fuchsia-300">BRAIN</span>
              <span className="text-white">OS</span>
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-md border border-slate-800 text-slate-600 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut size={12} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-14 relative z-10">
        <div className="w-full max-w-lg space-y-8">
          {/* Heading */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center mx-auto mb-4">
              <Zap size={22} className="text-fuchsia-400" />
            </div>
            <h1 className="text-xl font-bold text-white text-balance mb-2">Nueva solicitud</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Describe lo que necesitas y nuestro equipo lo procesará de inmediato.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Necesito un banner para campaña de verano, entrega el 20 de julio, tamaño 1200×628px..."
              rows={5}
              disabled={status === "loading"}
              aria-label="Describe tu solicitud"
              className={[
                "w-full rounded-xl border bg-[#0d0d1a] text-sm text-slate-200",
                "placeholder:text-slate-700 resize-none p-4 outline-none font-mono leading-relaxed",
                "transition-colors duration-200",
                status === "error"
                  ? "border-rose-500/35 focus:border-rose-500/40"
                  : "border-slate-800 focus:border-fuchsia-500/40",
              ].join(" ")}
            />

            <button
              type="submit"
              disabled={status === "loading" || !input.trim()}
              className={[
                "w-full h-11 rounded-xl font-mono text-sm font-bold tracking-wider",
                "flex items-center justify-center gap-2 transition-all duration-200",
                "border border-fuchsia-500/35 bg-fuchsia-500/8 text-fuchsia-300",
                "hover:bg-fuchsia-500/18 hover:border-fuchsia-400/55",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {status === "loading" ? (
                <>
                  <span className="w-4 h-4 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" aria-hidden="true" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Enviar solicitud
                </>
              )}
            </button>
          </form>

          {/* Feedback */}
          {(status === "success" || status === "error") && message && (
            <div
              role="alert"
              className={[
                "rounded-xl border p-4 text-sm font-mono leading-relaxed",
                status === "success"
                  ? "border-green-500/25 bg-green-500/8 text-green-300"
                  : "border-rose-500/25 bg-rose-500/8 text-rose-300",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                {status === "success"
                  ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                  : <AlertCircle  size={14} className="mt-0.5 shrink-0" />
                }
                <span className="whitespace-pre-wrap">{message}</span>
              </div>
            </div>
          )}

          {/* Reset after success */}
          {status === "success" && (
            <button
              type="button"
              onClick={() => { setStatus("idle"); setMessage(""); }}
              className="w-full h-9 rounded-xl font-mono text-xs text-slate-600 border border-slate-800 hover:border-slate-700 hover:text-slate-400 transition-all"
            >
              Enviar otra solicitud
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
