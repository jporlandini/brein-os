"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Credenciales inválidas. Intenta de nuevo.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session    = await sessionRes.json();
    const role       = session?.user?.role;

    if (role === "cliente") router.push("/portal");
    else router.push("/operator");
  }

  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Scanlines overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
        }}
      />

      {/* Glow blob */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-fuchsia-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[360px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="text-fuchsia-400" />
          </div>
          <h1 className="font-mono text-xl font-bold tracking-[0.3em]">
            <span className="text-fuchsia-300">BRAIN</span>
            <span className="text-white">OS</span>
          </h1>
          <p className="text-[10px] text-slate-500 mt-1.5 font-mono tracking-widest uppercase">
            Sistema de Agencia
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-10 rounded-lg border border-slate-700/60 bg-[#0d0d1a] px-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-fuchsia-500/50 transition-colors font-mono"
              placeholder="tu@email.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-10 rounded-lg border border-slate-700/60 bg-[#0d0d1a] px-3 pr-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-fuchsia-500/50 transition-colors font-mono"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg font-mono text-sm font-bold tracking-wider border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 hover:border-fuchsia-400/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" />
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
          <span className="text-[10px] font-mono text-slate-600 tracking-widest">DEMO</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Demo buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push("/operator")}
            className="h-9 rounded-lg font-mono text-xs text-slate-400 border border-slate-700/60 bg-transparent hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-600 transition-all"
          >
            Entrar como Operador
          </button>
          <button
            type="button"
            onClick={() => router.push("/portal")}
            className="h-9 rounded-lg font-mono text-xs text-slate-400 border border-slate-700/60 bg-transparent hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-600 transition-all"
          >
            Entrar como Cliente
          </button>
        </div>
      </div>
    </div>
  );
}
