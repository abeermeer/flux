import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db.js";

export async function protectedRoutes(app: FastifyInstance) {
  // Verify password for protected links
  app.post("/api/protect/:shortCode", async (req, reply) => {
    const { shortCode } = req.params as { shortCode: string };
    const { password } = req.body as { password: string };

    const link = await prisma.link.findUnique({
      where: { shortCode, isActive: true },
      select: { id: true, destination: true, password: true },
    });

    if (!link || !link.password) {
      return reply.status(404).send({ error: "Link not found or not password protected" });
    }

    const valid = await bcrypt.compare(password, link.password);
    if (!valid) {
      return reply.status(403).send({ error: "Invalid password" });
    }

    return reply.send({ destination: link.destination });
  });
}
