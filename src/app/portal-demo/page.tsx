"use client";

import { useState } from "react";
import { Zap, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClientPortalDemo() {
  const [input,  setInput]  = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setStatus("sent");
    setInput("");
  }

  return (
    <div className="min-h-screen bg-[#07070f] text-slate-100 flex flex-col">
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
            <span className="text-[9px] font-mono text-slate-600 border border-slate-800 px-1.5 py-0.5 rounded tracking-widest uppercase ml-1">
              Demo cliente
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
          >
            <ArrowLeft size={11} />
            Volver
          </Link>
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

          {/* Form / Success */}
          {status === "idle" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ej: Necesito un banner para campaña de verano, entrega el 20 de julio, tamaño 1200×628px..."
                rows={5}
                aria-label="Describe tu solicitud"
                className="w-full rounded-xl border border-slate-800 bg-[#0d0d1a] text-sm text-slate-200 placeholder:text-slate-700 resize-none p-4 outline-none font-mono leading-relaxed focus:border-fuchsia-500/40 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-full h-11 rounded-xl font-mono text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-all duration-200 border border-fuchsia-500/35 bg-fuchsia-500/8 text-fuchsia-300 hover:bg-fuchsia-500/18 hover:border-fuchsia-400/55 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={13} />
                Enviar solicitud
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-500/25 bg-green-500/8 text-green-300 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-mono text-sm font-bold mb-1">Solicitud recibida</p>
                    <p className="text-xs text-green-400/70 leading-relaxed font-mono">
                      El equipo fue notificado y procesará tu quest en breve.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="w-full h-9 rounded-xl font-mono text-xs text-slate-600 border border-slate-800 hover:border-slate-700 hover:text-slate-400 transition-all"
              >
                Enviar otra solicitud
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Watermark */}
      <div className="fixed bottom-4 right-5 z-30 pointer-events-none" aria-hidden="true">
        <span className="text-[9px] font-mono text-slate-800 tracking-widest uppercase">
          BRAIN OS v0.1 · DEMO
        </span>
      </div>
    </div>
  );
}
