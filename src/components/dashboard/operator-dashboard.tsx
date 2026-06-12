"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Zap, Shield, Clock, User, CalendarDays, ChevronRight,
  LogOut, RefreshCw, Terminal, Send, CheckCircle2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Quest } from "@/types";

// ── Mock fallback data ─────────────────────────────────────────────────────

const MOCK_QUESTS: Quest[] = [
  {
    id: "MQ-001", priority: "main", status: "en_progreso",
    title: "Rediseño Home — Fase 2", client: "Acme Corp", assignee: "Ana Torres",
    description: "Implementar sistema de grilla responsive con animaciones CSS. Incluye versión mobile y tablet.",
    dateIn: "2026-06-01", dateDue: "2026-06-15", tags: ["UI", "React", "CSS"],
    notionId: "mq-001", assigneeId: "",
  },
  {
    id: "MQ-002", priority: "main", status: "pendiente",
    title: "Campaña Meta Ads Q3", client: "Nación Independiente", assignee: "Carlos Vega",
    description: "12 creativos para campaña de awareness. Brief aprobado. Entrega en dos tandas de 6.",
    dateIn: "2026-06-08", dateDue: "2026-06-14", tags: ["Diseño", "Ads"],
    notionId: "mq-002", assigneeId: "",
  },
  {
    id: "MQ-003", priority: "main", status: "bloqueada",
    title: "Integración API Pagos", client: "StartupXYZ", assignee: "Ana Torres",
    description: "Esperando credenciales sandbox de Transbank. Bloqueada hasta que el cliente entregue accesos.",
    dateIn: "2026-06-03", dateDue: "2026-06-13", tags: ["Backend", "API"],
    notionId: "mq-003", assigneeId: "",
  },
  {
    id: "SQ-001", priority: "side", status: "pendiente",
    title: "Actualizar brand guidelines", client: "StartupXYZ", assignee: "María López",
    description: "Versionar manual de marca con nuevos colores aprobados en reunión del 5 de junio.",
    dateIn: "2026-06-05", dateDue: "2026-06-30", tags: ["Branding"],
    notionId: "sq-001", assigneeId: "",
  },
  {
    id: "SQ-002", priority: "side", status: "bloqueada",
    title: "Video testimonial — edición", client: "Acme Corp", assignee: "Ana Torres",
    description: "Esperando grabaciones originales del cliente para iniciar edición.",
    dateIn: "2026-06-03", dateDue: "2026-06-28", tags: ["Video"],
    notionId: "sq-002", assigneeId: "",
  },
  {
    id: "SQ-003", priority: "side", status: "entregada",
    title: "Copy newsletter junio", client: "Nación Independiente", assignee: "Carlos Vega",
    description: "Redacción y diseño del newsletter mensual. Enviado y aprobado por el cliente.",
    dateIn: "2026-05-28", dateDue: "2026-06-10", tags: ["Copy", "Email"],
    notionId: "sq-003", assigneeId: "",
  },
];

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CFG: Record<Quest["status"], { label: string; color: string; dot: string }> = {
  pendiente:   { label: "Pendiente",   color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/8",  dot: "bg-yellow-400" },
  en_progreso: { label: "En progreso", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/8",        dot: "bg-cyan-400 animate-pulse" },
  bloqueada:   { label: "Bloqueada",   color: "text-rose-400 border-rose-400/30 bg-rose-400/8",        dot: "bg-rose-400" },
  entregada:   { label: "Entregada",   color: "text-green-400 border-green-400/30 bg-green-400/8",     dot: "bg-green-400" },
};

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}
function fmt(d: string) {
  return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
}
function dueSuffix(quest: Quest): string {
  if (quest.status === "entregada") return "completada";
  const d = daysUntil(quest.dateDue);
  if (d < 0) return "VENCIDA";
  if (d === 0) return "HOY";
  return `${d}d`;
}

// ── QuestCard ──────────────────────────────────────────────────────────────

function QuestCard({ quest }: { quest: Quest }) {
  const [open, setOpen] = useState(false);
  const cfg    = STATUS_CFG[quest.status];
  const days   = daysUntil(quest.dateDue);
  const urgent = days <= 2 && quest.status !== "entregada";
  const isMain = quest.priority === "main";

  return (
    <Card
      onClick={() => setOpen(!open)}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(!open)}
      className={cn(
        "relative cursor-pointer border transition-all duration-200 select-none",
        "bg-[#0d0d1a] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fuchsia-500/50",
        isMain
          ? "border-fuchsia-500/25 hover:border-fuchsia-400/55 hover:bg-[#111128] hover:shadow-[0_0_24px_rgba(217,70,239,0.10)]"
          : "border-cyan-500/20 hover:border-cyan-400/40 hover:bg-[#0e1020] hover:shadow-[0_0_18px_rgba(6,182,212,0.07)]"
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg",
        isMain ? "bg-fuchsia-500" : "bg-cyan-500"
      )} />

      <CardHeader className="pl-5 pr-4 py-3 flex flex-row items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={cn("font-mono text-[11px] font-bold tracking-wider",
              isMain ? "text-fuchsia-400" : "text-cyan-400"
            )}>
              {quest.id}
            </span>
            <ChevronRight
              size={11}
              className={cn("text-slate-600 transition-transform duration-200 shrink-0", open && "rotate-90")}
            />
          </div>
          <p className="text-sm font-semibold text-slate-100 truncate leading-snug">{quest.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{quest.client}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("text-[10px] shrink-0 border font-mono gap-1 px-2 py-0.5", cfg.color)}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full inline-block shrink-0", cfg.dot)} />
          {cfg.label}
        </Badge>
      </CardHeader>

      {open && (
        <CardContent className="pl-5 pr-4 pb-4 pt-0 space-y-3 border-t border-slate-800/50">
          <p className="text-xs text-slate-400 leading-relaxed mt-3">{quest.description}</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <User size={10} className="text-slate-600 shrink-0" />
              <span className="text-slate-300 truncate">{quest.assignee}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <CalendarDays size={10} className="text-slate-600 shrink-0" />
              <span>Inicio: {fmt(quest.dateIn)}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 col-span-2", urgent ? "text-rose-400" : "text-slate-400")}>
              <Clock size={10} className="shrink-0" />
              <span>
                Entrega: {fmt(quest.dateDue)}
                <span className={cn("ml-2 font-mono text-[10px]",
                  urgent ? "text-rose-400" : quest.status === "entregada" ? "text-green-400" : "text-slate-600"
                )}>
                  ({dueSuffix(quest)})
                </span>
              </span>
            </div>
          </div>

          {quest.tags && quest.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {quest.tags.map((tag) => (
                <span key={tag}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-500 border border-slate-700/60"
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

// ── QuestSection ───────────────────────────────────────────────────────────

function QuestSection({
  title, icon: Icon, quests, accent,
}: {
  title: string;
  icon: React.ElementType;
  quests: Quest[];
  accent: "fuchsia" | "cyan";
}) {
  const c = {
    fuchsia: { text: "text-fuchsia-400", sep: "bg-fuchsia-500/15", badge: "border-fuchsia-500/30 text-fuchsia-300 bg-fuchsia-500/8" },
    cyan:    { text: "text-cyan-400",    sep: "bg-cyan-500/15",    badge: "border-cyan-500/30 text-cyan-300 bg-cyan-500/8" },
  }[accent];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Icon size={14} className={c.text} />
          <h2 className={cn("font-mono text-xs font-bold tracking-[0.2em] uppercase", c.text)}>
            {title}
          </h2>
        </div>
        <span className={cn("font-mono text-[11px] font-bold px-2 py-0.5 rounded border", c.badge)}>
          {quests.length}
        </span>
      </div>
      <div className={cn("h-px w-full", c.sep)} />
      <div className="flex flex-col gap-2">
        {quests.length === 0 ? (
          <p className="text-center text-xs text-slate-700 py-8 font-mono tracking-widest">— SIN MISIONES —</p>
        ) : (
          quests.map((q) => <QuestCard key={q.notionId || q.id} quest={q} />)
        )}
      </div>
    </div>
  );
}

// ── GuardianBar ────────────────────────────────────────────────────────────

function GuardianBar({ onReply }: { onReply?: (msg: string) => void }) {
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [reply,   setReply]   = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setReply(null);

    try {
      const res  = await fetch("/api/guardian", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ input }),
      });
      const data = await res.json();
      const msg  = data.response ?? "Solicitud procesada.";
      setReply(msg);
      onReply?.(msg);
      setInput("");
    } catch {
      setReply("Error de conexión con el agente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-700/40 bg-[#0d0d1a] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Terminal size={13} className="text-fuchsia-400" />
        <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-fuchsia-400">
          Guardian Agent
        </span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-label="Online" />
        <span className="text-[10px] font-mono text-slate-600">ONLINE</span>
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ej: Crea tarea de diseño para Acme, entrega el viernes...'
          disabled={loading}
          className="flex-1 h-9 rounded-lg border border-slate-700/50 bg-slate-900/80 px-3 text-xs font-mono text-slate-200 placeholder:text-slate-700 outline-none focus:border-fuchsia-500/40 transition-colors disabled:opacity-50"
          aria-label="Comando para el Guardian Agent"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-9 px-4 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/8 text-fuchsia-300 text-xs font-mono font-bold hover:bg-fuchsia-500/18 hover:border-fuchsia-400/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
        >
          {loading
            ? <span className="w-3 h-3 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" />
            : <Send size={11} />
          }
          Enviar
        </button>
      </form>
      {reply && (
        <div className="flex items-start gap-2">
          <CheckCircle2 size={11} className="text-green-400 mt-0.5 shrink-0" />
          <p className="text-[11px] font-mono text-green-400 leading-relaxed whitespace-pre-wrap">{reply}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function OperatorDashboard({
  operatorName  = "Operador",
  initialQuests = [],
}: {
  operatorName?:  string;
  initialQuests?: Quest[];
}) {
  const [quests,  setQuests]  = useState<Quest[]>(initialQuests.length > 0 ? initialQuests : MOCK_QUESTS);
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
      // silently keep current quests
    } finally {
      setLoading(false);
    }
  };

  const main       = quests.filter((q) => q.priority === "main");
  const side       = quests.filter((q) => q.priority === "side");
  const inProgress = quests.filter((q) => q.status === "en_progreso").length;
  const urgent     = quests.filter((q) => daysUntil(q.dateDue) <= 2 && q.status !== "entregada").length;
  const delivered  = quests.filter((q) => q.status === "entregada").length;

  const today = new Date().toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long",
  });

  const stats = [
    { label: "Total Quests", value: quests.length, color: "text-white" },
    { label: "En progreso",  value: inProgress,    color: "text-cyan-400" },
    { label: "Urgentes",     value: urgent,        color: "text-rose-400" },
    { label: "Entregadas",   value: delivered,     color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen bg-[#07070f] text-slate-100">
      {/* Scanlines */}
      <div className="scanlines" aria-hidden="true" />

      {/* Sticky nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-[#07070f]/92 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-fuchsia-500/15 border border-fuchsia-500/35 flex items-center justify-center shrink-0">
              <Zap size={13} className="text-fuchsia-400" />
            </div>
            <span className="font-mono text-sm font-bold tracking-[0.18em]">
              <span className="text-fuchsia-300">BRAIN</span>
              <span className="text-white">OS</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-600 font-mono hidden lg:block capitalize">{today}</span>
            <button
              onClick={refresh}
              disabled={loading}
              title="Refrescar tareas"
              className="p-1.5 rounded-md border border-slate-800 text-slate-600 hover:text-slate-300 hover:border-slate-600 transition-colors"
              aria-label="Refrescar tareas"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
            <Avatar className="w-7 h-7 border border-fuchsia-500/25">
              <AvatarFallback className="bg-fuchsia-900/40 text-fuchsia-300 text-[10px] font-mono font-bold">
                {operatorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Cerrar sesión"
              className="p-1.5 rounded-md border border-slate-800 text-slate-600 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero card */}
      <section className="max-w-5xl mx-auto px-5 pt-7 pb-5">
        <div className="relative overflow-hidden rounded-xl border border-fuchsia-500/18 bg-[#0d0d1a] p-5 md:p-6">
          <div className="absolute -top-14 -right-14 w-52 h-52 bg-fuchsia-600/8 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-600/6 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono text-fuchsia-400/50 tracking-[0.3em] uppercase mb-1.5">
                Sistema Operativo
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight text-balance">
                Bienvenido, <span className="text-fuchsia-300">{operatorName}</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                <span className="text-fuchsia-300 font-semibold">{main.length} misiones críticas</span>
                {" "}y{" "}
                <span className="text-cyan-300 font-semibold">{side.length} secundarias</span>
                {" "}activas.
              </p>
            </div>
            <Shield size={32} className="text-fuchsia-500/20 shrink-0 mt-1 hidden sm:block" aria-hidden="true" />
          </div>

          <div className="relative z-10 mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stats.map(({ label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
                <p className={cn("text-2xl font-mono font-bold tabular-nums leading-none", color)}>{value}</p>
                <p className="text-[10px] text-slate-600 font-mono mt-1.5 tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guardian bar */}
      <section className="max-w-5xl mx-auto px-5 pb-6">
        <GuardianBar />
      </section>

      {/* Quest Board */}
      <main className="max-w-5xl mx-auto px-5 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <QuestSection title="Main Quests" icon={Zap}    quests={main} accent="fuchsia" />
          <QuestSection title="Side Quests" icon={Shield} quests={side} accent="cyan"    />
        </div>
      </main>
    </div>
  );
}
