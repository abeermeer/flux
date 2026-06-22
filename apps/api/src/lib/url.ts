import { URL } from "node:url";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export function mergeParams(destination: string, requestQuery: Record<string, string>): string {
  const dest = new URL(destination);

  for (const param of UTM_PARAMS) {
    const val = requestQuery[param];
    if (val && !dest.searchParams.has(param)) {
      dest.searchParams.set(param, val);
    }
  }

  return dest.toString();
}

const BOT_PATTERNS = [
  "bot", "crawl", "spider", "scrape", "uptime", "pingdom",
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "facebookexternalhit", "facebot", "twitterbot",
  "whatsapp", "linkedinbot", "slack", "discord", "telegrambot",
  "applebot", "semrush", "ahrefs", "majestic",
];

const BOT_REGEX = new RegExp(BOT_PATTERNS.join("|"), "i");

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_REGEX.test(userAgent);
}
