# Flux

**Enterprise-grade URL shortener** — built for teams that need custom domains, white-label branding, advanced routing, and audit-grade compliance.

Flux is a full-stack SaaS platform that replaces generic shorteners like Bitly with a self-hosted, privacy-first alternative. It ships with a Fastify 5 API, Next.js 15 dashboard, Redis-backed redirect engine (<5ms), and a complete enterprise feature set — all in a single monorepo.

---

## Features

- **Custom Domains** — Bring your own domain with DNS TXT verification
- **Team Workspaces** — Role-based access (admin, editor, viewer) with audit logging
- **White-Label Branding** — Logo, primary color, favicon per workspace
- **A/B Split Testing** — Percentage-based traffic routing to multiple destinations
- **Geo/Device Targeting** — Route users by country, device type, or browser
- **Password-Protected Links** — bcrypt-encrypted access control per link
- **QR Code Generation** — Instant SVG QR codes for every link
- **Webhooks** — Event-driven callbacks on every click
- **API Keys** — Scoped keys (read/write/admin) with expiry
- **SAML SSO** — Workspace-level IdP configuration (Okta, Azure AD, Google)
- **Click Analytics** — Async queue-based logging with bot filtering
- **Abuse Prevention** — URL validation, shortener loop detection, Google Web Risk API

---

## Architecture

```
flux/
├── apps/
│   ├── api/          # Fastify 5 backend — redirect engine, REST API, queue workers
│   └── web/          # Next.js 15 dashboard — link management, analytics, settings
├── packages/         # Shared libraries (future)
├── docker-compose.yml
└── AGENTS.md         # AI agent context for development
```

### Tech Stack

| Layer | Technology |
|---|---|
| API | Fastify 5, TypeScript |
| Dashboard | Next.js 15, React 19 |
| Database | PostgreSQL 17 via Prisma 6 |
| Cache | Redis 7 (ioredis + BullMQ) |
| Auth | JWT, bcryptjs, API keys |
| Queue | BullMQ for async click processing |
| Infra | Docker Compose (local), Fly.io / Railway (prod) |

### Data Model

- **User** — email + bcrypt password
- **Workspace** — name, branding (JSON), SSO config (JSON)
- **WorkspaceMember** — role (admin/editor/viewer)
- **Domain** — verified via DNS TXT
- **Link** — shortCode (NanoID 7-char Base62), rules (JSON for A/B + targeting)
- **Click** — timestamp, IP, UA, referer, location, device, bot flag
- **Webhook** — URL + event filter
- **AuditLog** — every mutation logged with actor

---

## Quick Start

```bash
# Prerequisites: Node.js 22+, Docker

git clone https://github.com/abeermeer/flux.git
cd flux

# Start Postgres + Redis
docker compose up -d

# Install dependencies
npm install

# Push database schema
npm run db:push -w apps/api

# Start development servers
npm run dev:api    # API → http://localhost:3001
npm run dev:web    # Dashboard → http://localhost:3000
```

---

## Deployment

### Frontend — Vercel

```bash
cd apps/web
npx vercel
```

Set `NEXT_PUBLIC_API_URL` to your deployed API URL.

### Backend — Railway / Fly.io

```bash
# From project root
npm run build -w apps/api
# Deploy via Railway CLI or flyctl
```

Required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret (change in production) |
| `PORT` | Server port (default: 3001) |

---

## DNS Architecture

Flux separates redirect traffic from your main application domain:

- **App domain** (`flux.app`) — dashboard, API, user management
- **Redirect domain** (`go.flux.app`) — handles 301 redirects, cache-first

This isolates reputation risk — if a link is flagged as spam, only the redirect domain is affected.

---

## License

[MIT](LICENSE)

---

Built with Fastify, Next.js, Prisma, and Redis.
