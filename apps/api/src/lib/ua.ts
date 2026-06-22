import UAParser from "ua-parser-js";

const BOT_PATTERNS = [
  "bot", "crawl", "spider", "scrape", "uptime", "pingdom",
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "facebookexternalhit", "facebot", "twitterbot",
  "whatsapp", "linkedinbot", "slack", "discord", "telegrambot",
  "applebot", "semrush", "ahrefs", "majestic",
];

const BOT_REGEX = new RegExp(BOT_PATTERNS.join("|"), "i");

export type ParsedUA = {
  browser: string | null;
  os: string | null;
  device: string | null;
  bot: boolean;
};

export function parseUA(userAgent: string | null): ParsedUA {
  if (!userAgent) {
    return { browser: null, os: null, device: null, bot: false };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const bot = BOT_REGEX.test(userAgent);

  let device: string | null = "desktop";
  if (result.device.type === "mobile") device = "mobile";
  else if (result.device.type === "tablet") device = "tablet";

  return {
    browser: result.browser.name ?? null,
    os: result.os.name ?? null,
    device,
    bot,
  };
}
