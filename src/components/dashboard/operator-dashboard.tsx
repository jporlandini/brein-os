"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Zap, Shield, Clock, User, CalendarDays, ChevronRight, LogOut, RefreshCw } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Quest } from "@/types";

// ── Config ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pendiente:   { label: "Pendiente",   color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10", dot: "bg-yellow-400" },
  en_progreso: { label: "En progreso", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",       dot: "bg-cyan-400 animate-pulse" },
  bloqueada:   { label: "Bloqueada",   color: "text-rose-400 border-rose-400/30 bg-rose-400/10",       dot: "bg-rose-400" },
  entregada:   { label: "Entregada",   color: "text-green-400 border-green-400/30 bg-green-400/10",    dot: "bg-green-400" },
} as const;

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
}

// ── Quest Card ────────────────────────────────────────────────

function QuestCard({ quest }: { quest: Quest }) {
  const [open, setOpen] = useState(false);
  const cfg    = STATUS_CONFIG[quest.status];
  const days   = daysUntil(quest.dateDue);
  const urgent = days <= 2;

  return (
    <Card
      onClick={() => setOpen(!open)}
      className={cn(
        "relative cursor-pointer border transition-all duration-200",
        "bg-[#0d0d1a] hover:bg-[#111128]",
        quest.priority === "main"
          ? "border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:shadow-[0_0_20px_rgba(217,70,239,0.12)]"
          : "border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_16px_rgba(6,182,212,0.08)]"
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-[3px] rounded-l",
        quest.priority === "main" ? "bg-fuchsia-500" : "bg-cyan-500"
      )} />

      <CardHeader className="pl-5 pr-4 py-3 flex flex-row items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-mono text-xs font-bold",
              quest.priority === "main" ? "text-fuchsia-400" : "text-cyan-400"
            )}>
              {quest.id}
            </span>
            <ChevronRight size={12} className={cn("text-slate-500 transition-transform duration-200", open && "rotate-90")} />
          </div>
          <p className="text-sm font-semibold text-slate-100 truncate">{quest.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{quest.client}</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] shrink-0 border font-mono", cfg.color)}>
          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", cfg.dot)} />
          {cfg.label}
        </Badge>
      </CardHeader>

      {open && (
        <CardContent className="pl-5 pr-4 pb-3 pt-0 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">{quest.description}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <User size={11} className="text-slate-600" />
              <span className="text-slate-300">{quest.assignee}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CalendarDays size={11} className="text-slate-600" />
              <span>Inicio: {fmt(quest.dateIn)}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 col-span-2", urgent ? "text-rose-400" : "text-slate-400")}>
              <Clock size={11} />
              <span>
                Entrega: {fmt(quest.dateDue)}
                <span className={cn("ml-2 font-mono text-[10px]", urgent ? "text-rose-400" : "text-slate-500")}>
                  ({days > 0 ? `${days}d` : days === 0 ? "HOY" : "VENCIDA"})
                </span>
              </span>
            </div>
          </div>
          {quest.tags && quest.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {quest.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Section ───────────────────────────────────────────────────

function QuestSection({
  title, icon: Icon, quests, accentClass, countClass,
}: {
  title: string;
  icon: React.ElementType;
  quests: Quest[];
  accentClass: string;
  countClass: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon size={16} className={accentClass} />
          <h2 className={cn("font-mono text-sm font-bold tracking-widest uppercase", accentClass)}>
            {title}
          </h2>
        </div>
        <span className={cn("font-mono text-xs font-bold px-2 py-0.5 rounded border", countClass)}>
          {quests.length}
        </span>
      </div>
      <div className={cn("h-px w-full opacity-30", accentClass.includes("fuchsia") ? "bg-fuchsia-500" : "bg-cyan-500")} />
      <div className="flex flex-col gap-2">
        {quests.length === 0 ? (
          <p className="text-center text-xs text-slate-600 py-6 font-mono">— SIN MISIONES —</p>
        ) : (
          quests.map((q) => <QuestCard key={q.notionId} quest={q} />)
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────

export default function OperatorDashboard({
  operatorName = "Operador",
  initialQuests = [],
}: {
  operatorName?: string;
  initialQuests?: Quest[];
}) {
  const [quests, setQuests]     = useState<Quest[]>(initialQuests);
  const [loading, setLoading]   = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setQuests(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  };

  const main = quests.filter((q) => q.priority === "main");
  const side = quests.filter((q) => q.priority === "side");
  const today = new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-[#07070f] text-slate-100">
      {/* Scanline */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)" }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#07070f]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Zap size={14} className="text-fuchsia-400" />
            </div>
            <span className="font-mono text-sm font-bold tracking-[0.2em] text-fuchsia-300">
              BRAIN<span className="text-white">OS</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono hidden md:block">{today}</span>
            <button
              onClick={refresh}
              disabled={loading}
              className="p-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <Avatar className="w-7 h-7 border border-fuchsia-500/30">
              <AvatarFallback className="bg-fuchsia-900/50 text-fuchsia-300 text-[10px] font-bold">
                {operatorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded border border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-8 pb-6">
        <div className="relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 via-[#0d0d1a] to-cyan-950/20 p-6">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-fuchsia-400/70 tracking-widest uppercase mb-1">SISTEMA OPERATIVO</p>
              <h1 className="text-2xl font-bold text-white">
                Bienvenido, <span className="text-fuchsia-300">{operatorName}</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Tienes{" "}
                <span className="text-fuchsia-300 font-semibold">{main.length} misiones críticas</span>
                {" "}y{" "}
                <span className="text-cyan-300 font-semibold">{side.length} secundarias</span>
                {" "}activas.
              </p>
            </div>
            <Shield size={40} className="text-fuchsia-500/30" />
          </div>
          <div className="relative z-10 mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Total Quests",  value: quests.length,                                              color: "text-white" },
              { label: "En Progreso",   value: quests.filter((q) => q.status === "en_progreso").length,    color: "text-cyan-300" },
              { label: "Vencen pronto", value: quests.filter((q) => daysUntil(q.dateDue) <= 2).length,    color: "text-rose-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className={cn("text-xl font-mono font-bold", color)}>{value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quest Board */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <QuestSection
            title="Main Quests" icon={Zap} quests={main}
            accentClass="text-fuchsia-400"
            countClass="border-fuchsia-500/30 text-fuchsia-300 bg-fuchsia-500/10"
          />
          <QuestSection
            title="Side Quests" icon={Shield} quests={side}
            accentClass="text-cyan-400"
            countClass="border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
          />
        </div>
      </main>
    </div>
  );
}
