import { Queue, Worker } from "bullmq";
import { redis } from "./redis.js";

const CLICK_QUEUE = "clicks";

export const clickQueue = new Queue(CLICK_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: 100,
  },
});

export type ClickJobData = {
  linkId: string;
  shortCode: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  bot: boolean;
};
