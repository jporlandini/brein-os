"use client";

/**
 * Brain OS — Operator Dashboard (standalone demo)
 * Self-contained: no server imports, no auth, no fetch.
 * Used as the v0 entry point and as a design reference.
 * The production version lives in operator-dashboard.tsx.
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Zap,
  Shield,
  Clock,
  User,
  CalendarDays,
  ChevronRight,
  LogOut,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────

type QuestPriority = "main" | "side";
type QuestStatus = "pendiente" | "en_progreso" | "bloqueada" | "entregada";

interface Quest {
  id: string;
  title: string;
  client: string;
  description: string;
  assignee: string;
  dateIn: string;
  dateDue: string;
  status: QuestStatus;
  priority: QuestPriority;
  tags?: string[];
}

// ── Mock data ─────────────────────────────────────────────────

const MOCK_QUESTS: Quest[] = [
  {
    id: "MQ-001",
    priority: "main",
    status: "en_progreso",
    title: "Rediseño Home — Fase 2",
    client: "Acme Corp",
    assignee: "Ana Torres",
    description:
      "Implementar nuevo sistema de grilla responsive con animaciones CSS. Incluye versión mobile y tablet.",
    dateIn: "2026-06-01",
    dateDue: "2026-06-15",
    tags: ["UI", "React", "CSS"],
  },
  {
    id: "MQ-002",
    priority: "main",
    status: "pendiente",
    title: "Campaña Meta Ads Q3",
    client: "Nación Independiente",
    assignee: "Carlos Vega",
    description:
      "Creación de 12 creativos para campaña de awareness. Brief aprobado. Entrega en dos tandas de 6.",
    dateIn: "2026-06-08",
    dateDue: "2026-06-14",
    tags: ["Diseño", "Ads"],
  },
  {
    id: "MQ-003",
    priority: "main",
    status: "bloqueada",
    title: "Integración API Pagos",
    client: "StartupXYZ",
    assignee: "Ana Torres",
    description:
      "Esperando credenciales de sandbox de Transbank. Bloqueada hasta que el cliente entregue accesos.",
    dateIn: "2026-06-03",
    dateDue: "2026-06-13",
    tags: ["Backend", "API"],
  },
  {
    id: "SQ-001",
    priority: "side",
    status: "pendiente",
    title: "Actualizar brand guidelines",
    client: "StartupXYZ",
    assignee: "María López",
    description:
      "Versionar el manual de marca con los nuevos colores aprobados en reunión del 5 de junio.",
    dateIn: "2026-06-05",
    dateDue: "2026-06-30",
    tags: ["Branding"],
  },
  {
    id: "SQ-002",
    priority: "side",
    status: "pendiente",
    title: "Video testimonial — edición",
    client: "Acme Corp",
    assignee: "Ana Torres",
    description:
      "Esperando material de cliente. En espera de grabaciones originales para iniciar edición.",
    dateIn: "2026-06-03",
    dateDue: "2026-06-28",
    tags: ["Video"],
  },
  {
    id: "SQ-003",
    priority: "side",
    status: "entregada",
    title: "Copy newsletter junio",
    client: "Nación Independiente",
    assignee: "Carlos Vega",
    description: "Redacción y diseño del newsletter mensual. Enviado y aprobado por el cliente.",
    dateIn: "2026-05-28",
    dateDue: "2026-06-10",
    tags: ["Copy", "Email"],
  },
];

// ── Config ────────────────────────────────────────────────────

const STATUS_CFG: Record<
  QuestStatus,
  { label: string; color: string; dot: string }
> = {
  pendiente: {
    label: "Pendiente",
    color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    dot: "bg-yellow-400",
  },
  en_progreso: {
    label: "En progreso",
    color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
    dot: "bg-cyan-400 animate-pulse",
  },
  bloqueada: {
    label: "Bloqueada",
    color: "text-rose-400 border-rose-400/30 bg-rose-400/10",
    dot: "bg-rose-400",
  },
  entregada: {
    label: "Entregada",
    color: "text-green-400 border-green-400/30 bg-green-400/10",
    dot: "bg-green-400",
  },
};

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });
}

// ── Quest Card ────────────────────────────────────────────────

function QuestCard({ quest }: { quest: Quest }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[quest.status];
  const days = daysUntil(quest.dateDue);
  const urgent = days <= 2 && quest.status !== "entregada";

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
      {/* Accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px] rounded-l",
          quest.priority === "main" ? "bg-fuchsia-500" : "bg-cyan-500"
        )}
      />

      <CardHeader className="pl-5 pr-4 py-3 flex flex-row items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "font-mono text-xs font-bold",
                quest.priority === "main" ? "text-fuchsia-400" : "text-cyan-400"
              )}
            >
              {quest.id}
            </span>
            <ChevronRight
              size={12}
              className={cn(
                "text-slate-500 transition-transform duration-200",
                open && "rotate-90"
              )}
            />
          </div>
          <p className="text-sm font-semibold text-slate-100 truncate">
            {quest.title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{quest.client}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("text-[10px] shrink-0 border font-mono", cfg.color)}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
              cfg.dot
            )}
          />
          {cfg.label}
        </Badge>
      </CardHeader>

      {open && (
        <CardContent className="pl-5 pr-4 pb-4 pt-0 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            {quest.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <User size={11} className="text-slate-600" />
              <span className="text-slate-300">{quest.assignee}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CalendarDays size={11} className="text-slate-600" />
              <span>Inicio: {fmt(quest.dateIn)}</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 col-span-2",
                urgent ? "text-rose-400" : "text-slate-400"
              )}
            >
              <Clock size={11} />
              <span>
                Entrega: {fmt(quest.dateDue)}
                <span
                  className={cn(
                    "ml-2 font-mono text-[10px]",
                    urgent ? "text-rose-400" : "text-slate-500"
                  )}
                >
                  (
                  {quest.status === "entregada"
                    ? "completada"
                    : days > 0
                    ? `${days}d`
                    : days === 0
                    ? "HOY"
                    : "VENCIDA"}
                  )
                </span>
              </span>
            </div>
          </div>

          {quest.tags && quest.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap pt-1">
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

// ── Section ───────────────────────────────────────────────────

function QuestSection({
  title,
  icon: Icon,
  quests,
  accent,
}: {
  title: string;
  icon: React.ElementType;
  quests: Quest[];
  accent: "fuchsia" | "cyan";
}) {
  const colors = {
    fuchsia: {
      text: "text-fuchsia-400",
      bar: "bg-fuchsia-500",
      badge: "border-fuchsia-500/30 text-fuchsia-300 bg-fuchsia-500/10",
    },
    cyan: {
      text: "text-cyan-400",
      bar: "bg-cyan-500",
      badge: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
    },
  }[accent];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon size={15} className={colors.text} />
          <h2
            className={cn(
              "font-mono text-sm font-bold tracking-widest uppercase",
              colors.text
            )}
          >
            {title}
          </h2>
        </div>
        <span
          className={cn(
            "font-mono text-xs font-bold px-2 py-0.5 rounded border",
            colors.badge
          )}
        >
          {quests.length}
        </span>
      </div>

      <div className={cn("h-px w-full opacity-20", colors.bar)} />

      <div className="flex flex-col gap-2">
        {quests.length === 0 ? (
          <p className="text-center text-xs text-slate-600 py-8 font-mono">
            — SIN MISIONES —
          </p>
        ) : (
          quests.map((q) => <QuestCard key={q.id} quest={q} />)
        )}
      </div>
    </div>
  );
}

// ── Guardian Input ────────────────────────────────────────────

function GuardianInput() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!value.trim()) return;
    setSent(true);
    setValue("");
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#0d0d1a] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Terminal size={13} className="text-fuchsia-400" />
        <span className="font-mono text-xs text-fuchsia-400 tracking-widest uppercase">
          Guardian Agent
        </span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ej: Crea una tarea de diseño para Acme, entrega el viernes..."
          className="flex-1 h-9 rounded-lg border border-slate-700/60 bg-slate-900 px-3 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-fuchsia-500/40 font-mono transition-colors"
        />
        <button
          onClick={handleSend}
          className="h-9 px-4 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-mono font-bold hover:bg-fuchsia-500/20 transition-colors"
        >
          {sent ? "Enviado ✓" : "Enviar"}
        </button>
      </div>
      {sent && (
        <p className="text-[11px] font-mono text-green-400">
          → El Agente Guardián está procesando tu solicitud...
        </p>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────

export default function OperatorDashboardDemo() {
  const [quests] = useState<Quest[]>(MOCK_QUESTS);

  const main = quests.filter((q) => q.priority === "main");
  const side = quests.filter((q) => q.priority === "side");
  const inProgress = quests.filter((q) => q.status === "en_progreso").length;
  const urgent = quests.filter(
    (q) => daysUntil(q.dateDue) <= 2 && q.status !== "entregada"
  ).length;

  const today = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-[#07070f] text-slate-100 font-sans">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
        }}
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
            <span className="hidden md:block text-[10px] font-mono text-slate-600 border border-slate-800 px-2 py-0.5 rounded">
              DEMO
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono hidden md:block">
              {today}
            </span>
            <button className="p-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors">
              <RefreshCw size={13} />
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7 border border-fuchsia-500/30">
                <AvatarFallback className="bg-fuchsia-900/50 text-fuchsia-300 text-[10px] font-bold">
                  OP
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-300 hidden md:block">
                Operador Demo
              </span>
            </div>
            <button className="p-1.5 rounded border border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500/40 transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-8 pb-6">
        <div className="relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 via-[#0d0d1a] to-cyan-950/20 p-6">
          {/* Glows */}
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono text-fuchsia-400/60 tracking-[0.3em] uppercase mb-1.5">
                SISTEMA OPERATIVO
              </p>
              <h1 className="text-2xl font-bold text-white leading-tight">
                Bienvenido,{" "}
                <span className="text-fuchsia-300">Operador</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1.5">
                Tienes{" "}
                <span className="text-fuchsia-300 font-semibold">
                  {main.length} misiones críticas
                </span>{" "}
                y{" "}
                <span className="text-cyan-300 font-semibold">
                  {side.length} secundarias
                </span>{" "}
                activas.
              </p>
            </div>
            <Shield size={36} className="text-fuchsia-500/25 shrink-0 mt-1" />
          </div>

          {/* Stats */}
          <div className="relative z-10 mt-5 grid grid-cols-4 gap-3">
            {[
              { label: "Total",       value: quests.length, color: "text-white" },
              { label: "En progreso", value: inProgress,    color: "text-cyan-300" },
              { label: "Urgentes",    value: urgent,        color: "text-rose-400" },
              { label: "Entregadas",  value: quests.filter((q) => q.status === "entregada").length, color: "text-green-400" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="text-center p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80"
              >
                <p className={cn("text-xl font-mono font-bold", color)}>
                  {value}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guardian input */}
      <section className="max-w-5xl mx-auto px-6 pb-6">
        <GuardianInput />
      </section>

      {/* Quest Board */}
      <main className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <QuestSection
            title="Main Quests"
            icon={Zap}
            quests={main}
            accent="fuchsia"
          />
          <QuestSection
            title="Side Quests"
            icon={Shield}
            quests={side}
            accent="cyan"
          />
        </div>
      </main>
    </div>
  );
}
