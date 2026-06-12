"use client";

import { useState } from "react";
import { Zap, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ClientPortal() {
  const [input, setValue]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();

      if (data.error) {
        setStatus("error");
        setMessage(data.response ?? "Error al procesar tu solicitud.");
      } else {
        setStatus("success");
        setMessage(data.response);
        setValue("");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Intenta de nuevo.");
    }
  }

  return (
    <div className="min-h-screen bg-[#07070f] text-slate-100 flex flex-col">
      {/* Nav */}
      <header className="border-b border-slate-800/60 bg-[#07070f]/90 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-fuchsia-400" />
            <span className="font-mono text-sm font-bold tracking-widest text-fuchsia-300">
              BRAIN<span className="text-white">OS</span>
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors"
          >
            salir
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mx-auto mb-4">
              <Zap size={28} className="text-fuchsia-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Nueva solicitud</h1>
            <p className="text-sm text-slate-400">
              Describe lo que necesitas y nuestro equipo lo procesará de inmediato.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ej: Necesito un diseño de banner para campaña de verano, con fecha de entrega el 20 de julio..."
                rows={5}
                className={[
                  "w-full rounded-xl border bg-[#0d0d1a] text-sm text-slate-200",
                  "placeholder:text-slate-600 resize-none p-4 outline-none",
                  "transition-colors duration-200 font-mono leading-relaxed",
                  "focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20",
                  status === "error" ? "border-rose-500/40" : "border-slate-700/60",
                ].join(" ")}
                disabled={status === "loading"}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || !input.trim()}
              className={[
                "w-full h-11 rounded-xl font-mono text-sm font-bold tracking-wider",
                "flex items-center justify-center gap-2 transition-all duration-200",
                "border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300",
                "hover:bg-fuchsia-500/20 hover:border-fuchsia-400/60",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Enviar solicitud
                </>
              )}
            </button>
          </form>

          {/* Feedback */}
          {status !== "idle" && status !== "loading" && message && (
            <div className={[
              "rounded-xl border p-4 text-sm font-mono",
              status === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300",
            ].join(" ")}>
              <div className="flex items-start gap-2">
                {status === "success"
                  ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                  : <AlertCircle size={15} className="mt-0.5 shrink-0" />
                }
                <span className="whitespace-pre-wrap">{message}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
