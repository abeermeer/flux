import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { prisma } from "../lib/db.js";
import type { ClickJobData } from "../lib/queue.js";

async function fireWebhooks(linkId: string, clickData: ClickJobData) {
  try {
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { workspaceId: true, shortCode: true, destination: true },
    });
    if (!link) return;

    const webhooks = await prisma.webhook.findMany({
      where: { workspaceId: link.workspaceId, isActive: true },
    });

    const payload = {
      event: "click",
      timestamp: new Date().toISOString(),
      link: {
        shortCode: link.shortCode,
        destination: link.destination,
      },
      click: {
        ip: clickData.ip,
        userAgent: clickData.userAgent,
        referer: clickData.referer,
        country: clickData.country,
        device: clickData.device,
        browser: clickData.browser,
        os: clickData.os,
        bot: clickData.bot,
      },
    };

    for (const wh of webhooks) {
      fetch(wh.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {}); // fire-and-forget
    }
  } catch {
    // webhook errors must not crash the worker
  }
}

const worker = new Worker<ClickJobData>(
  "clicks",
  async (job) => {
    const { linkId, ip, userAgent, referer, country, city, device, browser, os, bot } = job.data;

    await prisma.click.create({
      data: { linkId, ip, userAgent, referer, country, city, device, browser, os, bot },
    });

    await prisma.link.update({
      where: { id: linkId },
      data: { clickCount: { increment: 1 } },
    });

    // Fire webhooks asynchronously — don't block
    fireWebhooks(linkId, job.data);
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

worker.on("error", (err) => {
  console.error("Click worker error:", err);
});

export { worker };
