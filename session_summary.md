# Flux — Session Summary

## Current State
- **Frontend**: Deployed at `https://web-bay-tau-49.vercel.app` — now has a proper enterprise landing page
- **Backend**: Not deployed — Dockerfile + fly.toml ready, Fly.io blocked (high-risk flag)
- **GitHub**: `https://github.com/abeermeer/flux` — public, MIT license, `main` branch

## What's Done
1. Frontend deployed to Vercel with `NEXT_PUBLIC_API_URL` env var
2. Root `fly.toml` + `apps/api/Dockerfile` for backend deployment
3. GitHub repo with all source, README, LICENSE (MIT)
4. Facebook MCP configured in opencode.jsonc (needs env vars)
5. **Frontend overhaul**:
   - Tailwind CSS v4 with custom indigo brand palette
   - Enterprise landing page: nav header, hero with shorten form, 6-feature grid, stats section, CTA banner, footer
   - Updated pricing page with 3-tier cards matching brand
   - Updated /links page with functional link table (auth-gated)

## What's Blocked
- Backend deployment — Fly.io high-risk flag (verify at https://fly.io/high-risk-unlock or use Railway)
- Facebook MCP — needs `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` env vars
- API not deployed — shorten form on homepage will fail until backend is live

## Next Steps
1. Deploy backend (Railway or verify Fly.io)
2. Update `NEXT_PUBLIC_API_URL` on Vercel to point to live API
3. Set Facebook MCP env vars
4. Add login/signup pages
5. Build analytics charts, settings pages, workspace management UI
