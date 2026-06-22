# Flux — Agent Context

## Overview
Enterprise URL shortener SaaS. Built as npm workspaces monorepo: Fastify 5 API + Next.js 15 dashboard.

## Tech Stack
- **Backend**: Fastify 5, Prisma 6, PostgreSQL 17, Redis 7 (ioredis + BullMQ)
- **Frontend**: Next.js 15, React 19
- **Auth**: @fastify/jwt, bcryptjs, API keys prefixed `fx_`
- **Queue**: BullMQ for async click processing
- **Infra**: Docker Compose (local), Railway/Fly.io (prod)
- **Deployment**: Frontend → Vercel (`NEXT_PUBLIC_API_URL`), Backend → TBD (Fly blocked, Railway pending)

## Architecture
- Separate redirect domain (`go.flux.app`) from app domain (`flux.app`)
- Redis cache-first for redirects (<5ms target), Postgres fallback
- Async click logging via BullMQ queue (10 concurrent workers)
- Bot detection via UA regex
- Rules engine for A/B split testing + geo/device targeting
- Audit logging on all mutations

## Data Model (8 models)
- **User** — email, password (bcrypt), owned workspaces
- **ApiKey** — scoped (read/write/admin), with expiry
- **Workspace** — name, slug, branding (JSON: logo/color/favicon), ssoConfig (JSON)
- **WorkspaceMember** — role-based (admin/editor/viewer)
- **Domain** — verified via DNS TXT, linked to workspace
- **Link** — shortCode (unique), destination, rules (JSON for A/B + geo/device), password (bcrypt), expiresAt, maxClicks, clickCount
- **Click** — timestamp, ip, ua, referer, country, device, browser, os, bot flag
- **Webhook** — URL + events, fires on click
- **AuditLog** — action, entity, entityId, metadata (JSON), actor, workspace

## Key Features Built
| Feature | File | Detail |
|---|---|---|
| Redirect engine | `routes/redirect.ts` | Redis cache → Postgres, <5ms |
| Click worker | `workers/clickWorker.ts` | Async queue, creates Click + increments count + fires webhooks |
| Abuse prevention | `lib/abuse.ts` | Blocks shorteners, internal IPs, executables, suspicious patterns + Google Web Risk |
| UTM preservation | `lib/url.ts` | Merges utm_* params on redirect |
| Custom domains | `routes/domains.ts` | DNS TXT verification, CNAME instructions |
| White-label | `routes/branding.ts` | Logo, primary color, favicon per workspace |
| A/B testing | `lib/rules.ts` | Percentage-based split routing + geo/device filters |
| SAML SSO | `routes/sso.ts` | Configurable IdP, ACS endpoint, SP metadata |
| Audit logs | `lib/audit.ts` | Logs every create/update/delete with actor |
| Pricing | `web/src/app/pricing/page.tsx` | 3 tiers: $29, $99, Custom |

## Deployments
- **Frontend**: `https://web-bay-tau-49.vercel.app` (Vercel, abeermeer1 account)
  - `NEXT_PUBLIC_API_URL` set to `http://localhost:3001` (update when backend deployed)
- **Backend API**: Not deployed — Fly.io account high-risk after card add, needs verification at https://fly.io/high-risk-unlock or switch to Railway

## Remaining Gaps
- **GeoIP**: Click `country`/`city` is null. Needs MaxMind GeoIP DB lookup in redirect
- **SSL auto-provisioning**: Domain routes give DNS instructions but cert provisioning via Let's Encrypt not automated
- **Email**: No password reset, email verification, or transactional emails
- **Full SAML validation**: ACS endpoint just trusts email — needs proper SAML assertion verification
- **Rate limit tiers**: Currently global 100/min — needs per-plan limits
- **Backend deployment**: Dockerfile + fly.toml created at root, but Fly.io blocked by high-risk flag

## Session Log (2026-06-22)
- Deployed frontend to Vercel at `https://web-bay-tau-49.vercel.app`
- Set `NEXT_PUBLIC_API_URL` env on Vercel project
- Updated layout.tsx to use `${API}` instead of hardcoded localhost:3001
- Created root `fly.toml` + `apps/api/Dockerfile` for backend deployment
- Fly.io deploy blocked — account marked high-risk after adding card
- Backup plan: Railway (no card needed, $5 free credit)

## Running Locally
```bash
docker compose up -d                    # Postgres + Redis
npm run db:push -w apps/api             # Push schema
npm run dev:api                         # API on :3001
npm run dev:web                         # Dashboard on :3000
```
