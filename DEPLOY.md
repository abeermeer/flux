# Flux Deploy Guide

## DNS Architecture

Two domains required:

```
flux.app          → App domain (dashboard, API)
go.flux.app       → Redirect domain (short links)
```

### Why separate domains?

Redirect domain reputation is critical. If `go.flux.app` gets blacklisted,
`flux.app` stays accessible so you can manage links and fix issues.

### DNS Records

| Record | Type | Target |
|---|---|---|
| `flux.app` | A | App server IP |
| `api.flux.app` | CNAME | `flux.app` |
| `go.flux.app` | A | Redirect server IP (separate) |

### Custom Domains (customer-owned)

Customer adds CNAME record:

```
links.acmecorp.com → go.flux.app
```

SSL cert auto-provisioned via Let's Encrypt DNS-01 challenge.

## Infrastructure (Production)

```
Cloudflare CDN → App Servers → Postgres + Redis
                    ↓
              Redirect Servers (cached)
```

Tech: Railway / Fly.io / AWS ECS with Docker.

## Environment Variables

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
REDIRECT_DOMAIN=go.flux.app
APP_DOMAIN=flux.app
JWT_SECRET=...
WEB_RISK_API_KEY=...   # optional
```
