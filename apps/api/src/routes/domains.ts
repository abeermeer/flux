import { FastifyInstance } from "fastify";
import { z } from "zod";
import dns from "node:dns/promises";
import { prisma } from "../lib/db.js";

export async function domainRoutes(app: FastifyInstance) {
  // List domains
  app.get("/api/domains", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.send([]);

    const domains = await prisma.domain.findMany({
      where: { workspaceId: workspace.id },
    });

    return reply.send(domains);
  });

  // Add domain
  const addDomainSchema = z.object({ domain: z.string().domain() });

  app.post("/api/domains", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { domain } = addDomainSchema.parse(req.body);
    const { id: userId } = req.user as { id: string };

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.status(500).send({ error: "No workspace" });

    const existing = await prisma.domain.findUnique({ where: { domain } });
    if (existing) return reply.status(409).send({ error: "Domain already added" });

    const verificationToken = `flux-verify-${crypto.randomUUID().slice(0, 8)}`;

    await prisma.domain.create({
      data: {
        domain,
        workspaceId: workspace.id,
        verified: false,
      },
    });

    // Store verification token for checking
    await prisma.link.create({
      data: {
        shortCode: `verify-${domain.replace(/[^a-zA-Z0-9]/g, "-")}`,
        destination: `https://${domain}`,
        workspaceId: workspace.id,
      },
    });

    return reply.status(201).send({
      domain,
      verificationToken,
      instructions: `Add a TXT record: _flux-verify.${domain} → "${verificationToken}"`,
      dnsRecords: [
        { type: "CNAME", name: domain, value: process.env.REDIRECT_DOMAIN ?? "go.flux.app" },
        { type: "TXT", name: `_flux-verify.${domain}`, value: verificationToken },
      ],
    });
  });

  // Verify domain
  app.post("/api/domains/:domain/verify", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { domain } = req.params as { domain: string };

    try {
      const records = await dns.resolveTxt(`_flux-verify.${domain}`);
      const flat = records.flat().join("");

      if (!flat.startsWith("flux-verify-")) {
        return reply.send({ verified: false, message: "Verification record not found" });
      }

      await prisma.domain.update({
        where: { domain },
        data: { verified: true },
      });

      return reply.send({ verified: true });
    } catch {
      return reply.send({ verified: false, message: "Could not verify domain. Check DNS propagation." });
    }
  });

  // Delete domain
  app.delete("/api/domains/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.domain.delete({ where: { id } });
    return reply.status(204).send();
  });
}
