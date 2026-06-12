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

    // Redirect based on role — server sets the session,
    // we fetch it and redirect accordingly
    const sessionRes = await fetch("/api/auth/session");
    const session    = await sessionRes.json();
    const role       = session?.user?.role;

    if (role === "cliente") router.push("/portal");
    else router.push("/operator");
  }

  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-6">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="text-fuchsia-400" />
          </div>
          <h1 className="font-mono text-xl font-bold tracking-[0.3em] text-white">
            BRAIN<span className="text-fuchsia-400">OS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono tracking-widest">SISTEMA DE AGENCIA</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 rounded-lg border border-slate-700/60 bg-[#0d0d1a] px-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-fuchsia-500/50 transition-colors font-mono"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-slate-700/60 bg-[#0d0d1a] px-3 pr-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-fuchsia-500/50 transition-colors font-mono"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg font-mono text-sm font-bold tracking-wider border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 hover:border-fuchsia-400/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" />
                Accediendo...
              </span>
            ) : (
              "Acceder al sistema"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
