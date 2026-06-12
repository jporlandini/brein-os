"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router  = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError("Credenciales inválidas. Intenta de nuevo.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session    = await sessionRes.json();
    const role       = (session?.user as { role?: string })?.role;

    router.push(role === "cliente" ? "/portal" : "/operator");
  }

  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-5 relative overflow-hidden">
      {/* Scanlines */}
      <div className="scanlines" aria-hidden="true" />

      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(217,70,239,0.05) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="w-full max-w-[340px] relative z-10">
        {/* Logo block */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-fuchsia-400" />
          </div>
          <h1 className="font-mono text-lg font-bold tracking-[0.3em]">
            <span className="text-fuchsia-300">BRAIN</span>
            <span className="text-white">OS</span>
          </h1>
          <p className="text-[10px] text-slate-600 mt-1.5 font-mono tracking-[0.2em] uppercase">
            Sistema de Agencia
          </p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-mono text-slate-600 tracking-[0.15em] uppercase block">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-10 rounded-lg border border-slate-800 bg-[#0d0d1a] px-3 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-fuchsia-500/45 transition-colors font-mono"
              placeholder="tu@email.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-mono text-slate-600 tracking-[0.15em] uppercase block">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-10 rounded-lg border border-slate-800 bg-[#0d0d1a] px-3 pr-10 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-fuchsia-500/45 transition-colors font-mono"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p role="alert" className="text-xs text-rose-400 font-mono bg-rose-500/8 border border-rose-500/20 rounded-lg px-3 py-2.5 leading-relaxed">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg font-mono text-sm font-bold tracking-wider border border-fuchsia-500/35 bg-fuchsia-500/8 text-fuchsia-300 hover:bg-fuchsia-500/18 hover:border-fuchsia-400/55 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" aria-hidden="true" />
                Accediendo...
              </span>
            ) : (
              "Acceder al sistema"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-mono text-slate-700 tracking-[0.2em] uppercase">Demo</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Demo shortcuts */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="h-9 rounded-lg font-mono text-[11px] text-slate-500 border border-slate-800 bg-transparent hover:bg-slate-900 hover:text-slate-300 hover:border-slate-700 transition-all"
          >
            Ver Operador
          </button>
          <button
            type="button"
            onClick={() => router.push("/portal-demo")}
            className="h-9 rounded-lg font-mono text-[11px] text-slate-500 border border-slate-800 bg-transparent hover:bg-slate-900 hover:text-slate-300 hover:border-slate-700 transition-all"
          >
            Ver Cliente
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-mono text-slate-700 mt-8 tracking-widest">
          BRAIN OS v0.1
        </p>
      </div>
    </div>
  );
}
