import Fastify, { FastifyInstance } from "fastify";
import fjwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";
import { nanoid } from "nanoid";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";

export async function authPlugin(app: FastifyInstance) {
  await app.register(fjwt, { secret: JWT_SECRET });

  app.decorate("authenticate", async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }
  });

  app.decorate("authenticateApiKey", async (req, reply) => {
    const apiKey = req.headers["x-api-key"] as string | undefined;
    if (!apiKey) {
      return reply.status(401).send({ error: "API key required" });
    }

    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!key || (key.expiresAt && key.expiresAt < new Date())) {
      return reply.status(401).send({ error: "Invalid or expired API key" });
    }

    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsed: new Date() },
    });

    (req as any).user = key.user;
    (req as any).apiKeyScopes = key.scopes;
  });
}

// Auth routes
export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/register", async (req, reply) => {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name?: string;
    };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    // Create default workspace
    await prisma.workspace.create({
      data: {
        name: `${name ?? email}'s workspace`,
        slug: `ws-${nanoid(10)}`,
        ownerId: user.id,
      },
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });

    return reply.status(201).send({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  });

  app.post("/api/auth/login", async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = app.jwt.sign({ id: user.id, email: user.email });

    return reply.send({ token, user: { id: user.id, email: user.email, name: user.name } });
  });

  app.get("/api/auth/me", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.user as { id: string };
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return reply.send(user);
  });

  // API key management
  app.post("/api/api-keys", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.user as { id: string };
    const { name, scopes } = req.body as { name: string; scopes?: string };

    const key = `fx_${nanoid(32)}`;
    await prisma.apiKey.create({
      data: { name, key, scopes: scopes ?? "read", userId: id },
    });

    return reply.status(201).send({ key, name, scopes: scopes ?? "read" });
  });

  app.get("/api/api-keys", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.user as { id: string };
    const keys = await prisma.apiKey.findMany({
      where: { userId: id },
      select: { id: true, name: true, scopes: true, lastUsed: true, createdAt: true },
    });
    return reply.send(keys);
  });
}

// Type augmentation
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: any, reply: any) => Promise<any>;
    authenticateApiKey: (req: any, reply: any) => Promise<any>;
  }
}
