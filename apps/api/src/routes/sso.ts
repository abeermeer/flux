import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { logAudit } from "../lib/audit.js";

const ssoSchema = z.object({
  provider: z.enum(["okta", "azure", "google", "custom"]),
  idpMetadataUrl: z.string().url(),
  entityId: z.string(),
  cert: z.string().optional(),
});

export async function ssoRoutes(app: FastifyInstance) {
  // Get SSO config
  app.get("/api/sso/config", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      select: { ssoConfig: true },
    });

    const config = workspace?.ssoConfig ? JSON.parse(workspace.ssoConfig) : null;
    return reply.send(config ?? { enabled: false });
  });

  // Update SSO config
  app.put("/api/sso/config", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const data = ssoSchema.parse(req.body);

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.status(404).send({ error: "No workspace" });

    const config = { ...data, enabled: true };
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { ssoConfig: JSON.stringify(config) },
    });

    logAudit({
      action: "update", entity: "sso", entityId: workspace.id,
      actorId: userId, workspaceId: workspace.id,
      metadata: { provider: data.provider },
    });

    return reply.send(config);
  });

  // Disable SSO
  app.delete("/api/sso/config", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.status(404).send({ error: "No workspace" });

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { ssoConfig: JSON.stringify({ enabled: false }) },
    });

    return reply.send({ enabled: false });
  });

  // SAML ACS (Assertion Consumer Service) — IdP posts here after login
  app.post("/api/auth/saml/callback", async (req, reply) => {
    // In production, validate SAML response here
    // This receives the SAML assertion from the IdP
    const body = req.body as any;
    const email = body?.email ?? "";

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    const token = app.jwt.sign({ id: user.id, email: user.email });
    return reply.send({ token, user: { id: user.id, email: user.email, name: user.name } });
  });

  // SAML SP metadata endpoint
  app.get("/api/auth/saml/metadata", async (req, reply) => {
    const baseUrl = `${req.protocol}://${req.hostname}`;
    const metadata = `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${baseUrl}/api/auth/saml/metadata">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${baseUrl}/api/auth/saml/callback" index="0"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
    reply.header("Content-Type", "application/samlmetadata+xml");
    return reply.send(metadata);
  });
}
