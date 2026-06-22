import { URL } from "node:url";

const BLOCKED_DOMAINS = [
  "bit.ly", "tinyurl.com", "t.co", "shorturl.at",
  "rebrand.ly", "short.io", "shorte.st",
  "localhost", "127.0.0.1", "0.0.0.0",
];

const BLOCKED_EXTENSIONS = [
  ".exe", ".dll", ".bat", ".cmd", ".scr",
  ".jar", ".msi", ".vbs", ".ps1",
];

const SUSPICIOUS_PATTERNS = [
  /login\?.*redirect/i,
  /password-reset/i,
  /account.*verify/i,
  /secure.*update/i,
  /banking.*confirm/i,
];

const BLOCKED_IPS = [
  /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^127\./, /^0\./, /^169\.254\./,
];

export type AbuseCheckResult = {
  safe: boolean;
  reason?: string;
};

export function checkURL(rawUrl: string): AbuseCheckResult {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "Invalid URL format" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { safe: false, reason: "Only HTTP(S) URLs allowed" };
  }

  if (BLOCKED_IPS.some((ip) => ip.test(parsed.hostname))) {
    return { safe: false, reason: "Internal/private IP blocked" };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    return { safe: false, reason: "Shortener domains not allowed" };
  }

  const pathname = parsed.pathname.toLowerCase();
  if (BLOCKED_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return { safe: false, reason: "Executable file extension blocked" };
  }

  const fullUrl = rawUrl.toLowerCase();
  if (SUSPICIOUS_PATTERNS.some((p) => p.test(fullUrl))) {
    return { safe: false, reason: "Suspicious URL pattern detected" };
  }

  return { safe: true };
}

// Google Web Risk — enabled when WEB_RISK_API_KEY is set
const WEB_RISK_KEY = process.env.WEB_RISK_API_KEY;

export async function checkWebRisk(rawUrl: string): Promise<AbuseCheckResult> {
  if (!WEB_RISK_KEY) {
    return { safe: true };
  }

  try {
    const res = await fetch(
      `https://webrisk.googleapis.com/v1/uris:search?key=${WEB_RISK_KEY}&uri=${encodeURIComponent(rawUrl)}`
    );
    const data = await res.json() as { threat?: { threatTypes: string[] } };

    if (data.threat?.threatTypes?.length) {
      return { safe: false, reason: `Flagged by Google Web Risk: ${data.threat.threatTypes.join(", ")}` };
    }

    return { safe: true };
  } catch {
    return { safe: true };
  }
}
