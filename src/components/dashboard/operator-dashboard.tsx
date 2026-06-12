"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Zap, Shield, Clock, User, CalendarDays, ChevronRight,
  LogOut, RefreshCw, Terminal, Send,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Quest } from "@/types";

// ── Mock data (used when no real data available yet) ──────────

const MOCK_QUESTS: Quest[] = [
  {
    id: "MQ-001", priority: "main", status: "en_progreso",
    title: "Rediseño Home — Fase 2", client: "Acme Corp",
    assignee: "Ana Torres",
    description: "Implementar sistema de grilla responsive con animaciones CSS. Incluye versión mobile y tablet.",
    dateIn: "2026-06-01", dateDue: "2026-06-15",
    tags: ["UI", "React", "CSS"],
    notionId: "mq-001", assigneeId: "",
  },
  {
    id: "MQ-002", priority: "main", status: "pendiente",
    title: "Campaña Meta Ads Q3", client: "Nación Independiente",
    assignee: "Carlos Vega",
    description: "12 creativos para campaña de awareness. Brief aprobado. Entrega en dos tandas de 6.",
    dateIn: "2026-06-08", dateDue: "2026-06-14",
    tags: ["Diseño", "Ads"],
    notionId: "mq-002", assigneeId: "",
  },
  {
    id: "MQ-003", priority: "main", status: "bloqueada",
    title: "Integración API Pagos", client: "StartupXYZ",
    assignee: "Ana Torres",
    description: "Esperando credenciales sandbox de Transbank. Bloqueada hasta que el cliente entregue accesos.",
    dateIn: "2026-06-03", dateDue: "2026-06-13",
    tags: ["Backend", "API"],
    notionId: "mq-003", assigneeId: "",
  },
  {
    id: "SQ-001", priority: "side", status: "pendiente",
    title: "Actualizar brand guidelines", client: "StartupXYZ",
    assignee: "María López",
    description: "Versionar manual de marca con nuevos colores aprobados en reunión del 5 de junio.",
    dateIn: "2026-06-05", dateDue: "2026-06-30",
    tags: ["Branding"],
    notionId: "sq-001", assigneeId: "",
  },
  {
    id: "SQ-002", priority: "side", status: "bloqueada",
    title: "Video testimonial — edición", client: "Acme Corp",
    assignee: "Ana Torres",
    description: "Esperando grabaciones originales del cliente para iniciar edición.",
    dateIn: "2026-06-03", dateDue: "2026-06-28",
    tags: ["Video"],
    notionId: "sq-002", assigneeId: "",
  },
  {
    id: "SQ-003", priority: "side", status: "entregada",
    title: "Copy newsletter junio", client: "Nación Independiente",
    assignee: "Carlos Vega",
    description: "Redacción y diseño del newsletter mensual. Enviado y aprobado por el cliente.",
    dateIn: "2026-05-28", dateDue: "2026-06-10",
    tags: ["Copy", "Email"],
    notionId: "sq-003", assigneeId: "",
  },
];

// ── Status config ─────────────────────────────────────────────

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
  const urgent = days <= 2 && quest.status !== "entregada";

  let dueSuffix: string;
  if (quest.status === "entregada") dueSuffix = "completada";
  else if (days === 0) dueSuffix = "HOY";
  else if (days < 0) dueSuffix = "VENCIDA";
  else dueSuffix = `${days}d`;

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
      {/* Left accent bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl",
        quest.priority === "main" ? "bg-fuchsia-500" : "bg-cyan-500"
      )} />

      {/* Collapsed header */}
      <CardHeader className="pl-5 pr-4 py-3 flex flex-row items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-mono text-xs font-bold",
              quest.priority === "main" ? "text-fuchsia-400" : "text-cyan-400"
            )}>
              {quest.id}
            </span>
            <ChevronRight
              size={12}
              className={cn("text-slate-500 transition-transform duration-200", open && "rotate-90")}
            />
          </div>
          <p className="text-sm font-semibold text-slate-100 truncate">{quest.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{quest.client}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("text-[10px] shrink-0 border font-mono", cfg.color)}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", cfg.dot)} />
          {cfg.label}
        </Badge>
      </CardHeader>

      {/* Expanded content */}
      {open && (
        <CardContent className="pl-5 pr-4 pb-3 pt-0 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">{quest.description}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <User size={11} className="text-slate-600 shrink-0" />
              <span className="text-slate-300 truncate">{quest.assignee}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CalendarDays size={11} className="text-slate-600 shrink-0" />
              <span>Inicio: {fmt(quest.dateIn)}</span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 col-span-2",
              urgent ? "text-rose-400" : "text-slate-400"
            )}>
              <Clock size={11} className="shrink-0" />
              <span>
                Entrega: {fmt(quest.dateDue)}
                <span className={cn(
                  "ml-2 font-mono text-[10px]",
                  urgent ? "text-rose-400" : quest.status === "entregada" ? "text-green-400" : "text-slate-500"
                )}>
                  ({dueSuffix})
                </span>
              </span>
            </div>
          </div>

          {quest.tags && quest.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {quest.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700"
                >
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

// ── Quest Section ─────────────────────────────────────────────

function QuestSection({
  title, icon: Icon, quests, accentClass, countClass, separatorClass,
}: {
  title: string;
  icon: React.ElementType;
  quests: Quest[];
  accentClass: string;
  countClass: string;
  separatorClass: string;
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
      <div className={cn("h-px w-full", separatorClass)} />
      <div className="flex flex-col gap-2">
        {quests.length === 0 ? (
          <p className="text-center text-xs text-slate-600 py-6 font-mono">— SIN MISIONES —</p>
        ) : (
          quests.map((q) => <QuestCard key={q.notionId || q.id} quest={q} />)
        )}
      </div>
    </div>
  );
}

// ── Guardian Bar ──────────────────────────────────────────────

function GuardianBar({ onAgentResponse }: { onAgentResponse?: (msg: string) => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentReply, setAgentReply] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setAgentReply(null);

    try {
      const res = await fetch("/api/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      const reply = data.response ?? "Solicitud procesada.";
      setAgentReply(reply);
      onAgentResponse?.(reply);
      setInput("");
    } catch {
      setAgentReply("Error de conexión con el agente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#0d0d1a] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Terminal size={14} className="text-fuchsia-400" />
        <span className="font-mono text-xs font-bold tracking-widest uppercase text-fuchsia-400">
          Guardian Agent
        </span>
        <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-label="Online" />
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ej: Crea una tarea de diseño para Acme, entrega el viernes...'
          className="flex-1 h-9 rounded-lg bg-slate-900 border border-slate-700/60 px-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none focus:border-fuchsia-500/40 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-9 px-4 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-mono font-bold hover:bg-fuchsia-500/20 hover:border-fuchsia-400/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
        >
          {loading
            ? <span className="w-3 h-3 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" />
            : <Send size={12} />
          }
          Enviar
        </button>
      </form>

      {/* Agent reply */}
      {agentReply && (
        <p className="text-[11px] font-mono text-green-400">
          → {agentReply}
        </p>
      )}
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
  const [quests, setQuests]   = useState<Quest[]>(
    initialQuests.length > 0 ? initialQuests : MOCK_QUESTS
  );
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        setQuests(data.tasks);
      }
    } catch {
      // silently keep current quests on error
    } finally {
      setLoading(false);
    }
  };

  const main = quests.filter((q) => q.priority === "main");
  const side = quests.filter((q) => q.priority === "side");

  const totalInProgress = quests.filter((q) => q.status === "en_progreso").length;
  const totalUrgent     = quests.filter((q) => daysUntil(q.dateDue) <= 2 && q.status !== "entregada").length;
  const totalDelivered  = quests.filter((q) => q.status === "entregada").length;

  const today = new Date().toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long",
  });

  const stats = [
    { label: "Total Quests",  value: quests.length,   color: "text-white" },
    { label: "En Progreso",   value: totalInProgress,  color: "text-cyan-300" },
    { label: "Urgentes",      value: totalUrgent,      color: "text-rose-400" },
    { label: "Entregadas",    value: totalDelivered,   color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen bg-[#07070f] text-slate-100">
      {/* Scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
        }}
      />

      {/* Sticky nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#07070f]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Zap size={14} className="text-fuchsia-400" />
            </div>
            <span className="font-mono text-sm font-bold tracking-[0.2em]">
              <span className="text-fuchsia-300">BRAIN</span>
              <span className="text-white">OS</span>
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono hidden md:block capitalize">{today}</span>
            <button
              onClick={refresh}
              disabled={loading}
              title="Refrescar tareas"
              className="p-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
              aria-label="Refrescar tareas"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <Avatar className="w-7 h-7 border border-fuchsia-500/30">
              <AvatarFallback className="bg-fuchsia-900/50 text-fuchsia-300 text-[10px] font-bold">
                {operatorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Cerrar sesión"
              className="p-1.5 rounded border border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero card */}
      <section className="max-w-5xl mx-auto px-6 pt-8 pb-5">
        <div className="relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 via-[#0d0d1a] to-cyan-950/20 p-6">
          {/* Glow blobs */}
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono text-fuchsia-400/60 tracking-[0.3em] uppercase mb-1.5">
                Sistema Operativo
              </p>
              <h1 className="text-2xl font-bold text-white">
                Bienvenido, <span className="text-fuchsia-300">{operatorName}</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                <span className="text-fuchsia-300 font-semibold">{main.length} misiones críticas</span>
                {" "}y{" "}
                <span className="text-cyan-300 font-semibold">{side.length} secundarias</span>
                {" "}activas.
              </p>
            </div>
            <Shield size={36} className="text-fuchsia-500/25 shrink-0" />
          </div>

          {/* Stats 4-col grid */}
          <div className="relative z-10 mt-5 grid grid-cols-4 gap-3">
            {stats.map(({ label, value, color }) => (
              <div
                key={label}
                className="text-center p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80"
              >
                <p className={cn("text-xl font-mono font-bold", color)}>{value}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guardian Agent bar */}
      <section className="max-w-5xl mx-auto px-6 pb-6">
        <GuardianBar />
      </section>

      {/* Quest board */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <QuestSection
            title="Main Quests"
            icon={Zap}
            quests={main}
            accentClass="text-fuchsia-400"
            countClass="border-fuchsia-500/30 text-fuchsia-300 bg-fuchsia-500/10"
            separatorClass="bg-fuchsia-500/20"
          />
          <QuestSection
            title="Side Quests"
            icon={Shield}
            quests={side}
            accentClass="text-cyan-400"
            countClass="border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
            separatorClass="bg-cyan-500/20"
          />
        </div>
      </main>
    </div>
  );
}
