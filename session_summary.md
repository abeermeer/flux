# Flux — Session Summary

## Current State
- **Frontend**: Deployed to Vercel at `https://web-bay-tau-49.vercel.app` (abeermeer1 account)
- **Backend**: Not deployed — Dockerfile + fly.toml ready, Fly.io blocked (high-risk flag)
- **GitHub**: `https://github.com/abeermeer/flux` — public, MIT license, professional README
- **MCP**: Facebook MCP (`meta-ads-mcp-server`) configured in opencode.jsonc — 54 tools (35 read + 19 write)

## What's Done
1. Frontend deployed to Vercel with `NEXT_PUBLIC_API_URL` env var
2. Root `fly.toml` + `apps/api/Dockerfile` created for backend deployment
3. GitHub repo created with all source code, README, AGENTS.md, LICENSE (MIT)
4. Facebook MCP configured — needs `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` env vars

## What's Blocked
- Backend deployment — Fly.io flagged account as high-risk after card add (needs verification at https://fly.io/high-risk-unlock or use Railway)
- Facebook MCP — connection error -32000 (needs env vars set)

## Next Steps
1. Deploy backend (Railway or verify Fly.io account)
2. Set `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` env vars for MCP
3. Set `NEXT_PUBLIC_API_URL` on Vercel to point to deployed backend
