# ⚡ Brain OS

**Sistema operativo para agencias creativas.** Una plataforma de gestión gamificada donde las tareas son quests, los operadores son jugadores y un agente de IA protege y orquesta todo lo que pasa entre la interfaz y los datos.

No es un project management tool más. Es la infraestructura interna que siempre quise tener: fast, opinionated, con estética cyberpunk y un agente guardián que entiende lenguaje natural.

---

## El problema que resuelve

Gestionar una agencia con Notion funciona, pero el gap entre "el cliente escribe algo por WhatsApp" y "eso aterriza correctamente en el workflow" siempre lo cierra un humano haciendo trabajo manual. Brain OS elimina ese gap.

El **Agente Guardián** intercepta cada input —ya sea desde la web app o desde Telegram—, lo parsea, valida que tenga todo lo necesario, y lo inserta en Notion de forma limpia y estructurada. Si falta la fecha de entrega, pregunta. Si el cliente no existe, avisa. Nadie toca Notion directamente.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 App Router + Tailwind CSS |
| Deploy | Vercel (Edge Functions + Cron Jobs) |
| Auth | NextAuth v5 + Neon (PostgreSQL serverless) |
| ORM | Drizzle ORM |
| Base de datos de negocio | Notion API |
| Agente IA | LangGraph + Google Vertex AI (Gemini) |
| Email transaccional | Resend |
| Bot omnicanal | Telegraf (Telegram) |
| Componentes UI | shadcn/ui |

---

## Cómo funciona

### El Dashboard del Operador

Interfaz oscura, neones fucsia y cián. Las tareas se dividen en dos carriles:

- **Main Quests** → tareas críticas, fecha de entrega próxima, alta prioridad. Las que no puedes dejar pasar.
- **Side Quests** → tareas secundarias, baja urgencia, pero que igual cuentan.

Cada quest muestra cliente, descripción, encargado, fecha de ingreso y fecha de entrega. Todo expandible con un click. Al levantarse en la mañana, el operador ya tiene un resumen esperándolo en Telegram.

### El Portal del Cliente

El cliente tiene un login restringido. No ve el dashboard, no ve las tareas de otros, no toca Notion. Solo ve un input: "¿qué necesitas?". Escribe en lenguaje natural, el Agente Guardián parsea el texto e inserta la tarea al workflow.

### El Agente Guardián

Es la capa de inteligencia que intermedia entre las interfaces y Notion. Implementado como un state machine con LangGraph:

```
Input → Parse Intent → Authorize (RBAC) → Validate Fields → Execute Action → Output
                                               ↓ (si faltan datos)
                                        Request Clarification → re-parse
```

Cuando una tarea cambia a estado `entregada`, el agente gatilla automáticamente un email al cliente con los entregables vía Resend. Sin intervención manual.

### Integración con Telegram

**Push mañanero (Cron):** Todos los días hábiles a las 8AM, un cron job en Vercel consulta las tareas pendientes de cada operador en Notion y les envía un resumen estructurado por Telegram.

**Pull (Comandos):** El operador puede cambiar el estado de una tarea directamente desde el chat:

```
/misiones          → Ver todas las tareas del día
/completar MQ-001  → Marcar como entregada (gatilla email al cliente)
/progreso MQ-002   → Marcar en progreso
/bloquear SQ-003   → Marcar como bloqueada
```

También funciona con lenguaje natural: *"marca la tarea del banner de Acme como completada"*.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/              ← Login con RBAC redirect automático
│   ├── (dashboard)/operator/      ← Dashboard SSR del operador
│   ├── (client)/portal/           ← Portal input del cliente
│   └── api/
│       ├── guardian/              ← POST: corre el agente guardián
│       ├── tasks/                 ← GET: tareas desde Notion
│       ├── telegram/webhook/      ← Webhook del bot
│       └── cron/morning-briefing/ ← Cron 8AM weekdays
├── components/
│   └── dashboard/
│       └── operator-dashboard.tsx ← Quest board (compatible v0)
├── lib/
│   ├── agent/guardian.ts          ← LangGraph state machine
│   ├── db/schema.ts               ← Schema Neon con Drizzle
│   ├── notion/client.ts           ← Tools de Notion API
│   ├── email/resend.ts            ← Email trigger
│   └── telegram/bot.ts            ← Bot + morning push
├── middleware.ts                   ← RBAC routing por rol
└── types/index.ts
```

---

## Roles del sistema

| Rol | Puede hacer |
|---|---|
| `admin` | Todo: crear tareas, cambiar estados, consultar cualquier operador |
| `operador` | Cambiar estados de sus tareas, consultar su queue |
| `cliente` | Solo crear solicitudes nuevas (via Guardian) |

El middleware de Next.js protege las rutas automáticamente y redirige según rol.

---

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/jporlandini/brein-os.git
cd brein-os
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Completar con:

- **`DATABASE_URL`** → Neon connection string (formato `postgresql://...`)
- **`NEXTAUTH_SECRET`** → `openssl rand -base64 32`
- **`NOTION_TOKEN`** → Integration token de Notion (Internal Integration)
- **`NOTION_DB_TASKS`**, **`NOTION_DB_CLIENTS`**, **`NOTION_DB_OPERATORS`** → IDs de las tres bases de datos en Notion
- **`GOOGLE_APPLICATION_CREDENTIALS`** → Path al service account JSON de GCP
- **`RESEND_API_KEY`** → API key de Resend
- **`TELEGRAM_BOT_TOKEN`** → Token del bot vía @BotFather
- **`TELEGRAM_WEBHOOK_SECRET`** → String random para validar el webhook

### 3. Base de datos

```bash
# Genera y aplica el schema en Neon
npm run db:push

# O con migraciones versionadas
npm run db:generate
npm run db:migrate
```

### 4. Levantar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El login redirige automáticamente según el rol del usuario.

---

## Setup de Notion

Las tres bases de datos necesitan estas propiedades mínimas:

**DB Tareas:**

| Propiedad | Tipo |
|---|---|
| Nombre | Title |
| Descripción | Rich Text |
| Estado | Select (`pendiente`, `en_progreso`, `bloqueada`, `entregada`) |
| Prioridad | Select (`main`, `side`) |
| Fecha Ingreso | Date |
| Fecha Entrega | Date |
| Cliente | Relation → DB Clientes |
| Operador | Relation → DB Operadores |
| Fuente | Select (`web`, `telegram`, `cron`) |

**DB Clientes:**

| Propiedad | Tipo |
|---|---|
| Nombre | Title |
| Email | Email |

**DB Operadores:**

| Propiedad | Tipo |
|---|---|
| Nombre | Title |
| Email | Email |

### Vincular usuarios con Notion

Después de crear un usuario en Neon, actualizar `notion_client_id` o `notion_operator_id` con el ID del registro correspondiente en Notion. El Agente Guardián usa ese vínculo para saber qué tareas mostrar y a qué cliente asociar cada solicitud.

---

## Setup del Bot de Telegram

```bash
# 1. Crear bot con @BotFather y obtener el token

# 2. Registrar el webhook (reemplazar con el dominio en Vercel)
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://tu-dominio.vercel.app/api/telegram/webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"
  }'

# 3. Vincular operadores: actualizar telegram_chat_id en Neon
# El chat ID se obtiene enviándole /start al bot y leyendo los logs
```

---

## Deploy en Vercel

```bash
vercel --prod
```

El `vercel.json` ya tiene configurado el cron para el briefing mañanero (lunes a viernes, 8AM hora Chile = 11AM UTC):

```json
{
  "crons": [{
    "path": "/api/cron/morning-briefing",
    "schedule": "0 11 * * 1-5"
  }]
}
```

Agregar `CRON_SECRET` en las variables de entorno de Vercel para proteger el endpoint.

---

## Importar en v0

El componente `src/components/dashboard/operator-dashboard.tsx` está diseñado para ser compatible con v0 de Vercel. Para iterarlo visualmente:

1. Ir a [v0.dev](https://v0.dev) → **Open with v0**
2. Conectar el repo `jporlandini/brein-os`
3. Abrir `src/components/dashboard/operator-dashboard.tsx`
4. Iterar el diseño desde v0 y hacer pull de los cambios al repo

---

## Roadmap

- [ ] Admin panel: gestión de usuarios y vinculación Notion
- [ ] Vista de cliente con historial de sus solicitudes
- [ ] Notificaciones en tiempo real (Pusher o Ably)
- [ ] Métricas de agencia: tiempo de entrega promedio, carga por operador
- [ ] Integración WhatsApp Business API como canal adicional
- [ ] Multi-agencia: soporte para workspaces separados

---

## Licencia

MIT
