import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { redirectRoutes } from "./routes/redirect.js";
import { createRoutes } from "./routes/create.js";
import { linkRoutes } from "./routes/links.js";
import { domainRoutes } from "./routes/domains.js";
import { workspaceRoutes } from "./routes/workspace.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { protectedRoutes } from "./routes/protect.js";
import { brandingRoutes } from "./routes/branding.js";
import { auditRoutes } from "./routes/audit.js";
import { ssoRoutes } from "./routes/sso.js";
import { authPlugin, authRoutes } from "./lib/auth.js";
import { redis } from "./lib/redis.js";
import "./workers/clickWorker.js";

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: true });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    redis,
  });

  // Auth must register before redirect routes to avoid /:code conflicts
  await app.register(authPlugin);
  await app.register(authRoutes);

  await app.register(createRoutes);
  await app.register(linkRoutes);
  await app.register(domainRoutes);
  await app.register(workspaceRoutes);
  await app.register(webhookRoutes);
  await app.register(protectedRoutes);
  await app.register(brandingRoutes);
  await app.register(auditRoutes);
  await app.register(ssoRoutes);
  await app.register(redirectRoutes);

  app.get("/health", async () => ({ status: "ok" }));

  const port = parseInt(process.env.PORT ?? "3001", 10);
  await app.listen({ port, host: "0.0.0.0" });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
