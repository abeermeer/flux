type RedirectRule = {
  url: string;
  percentage?: number;
  country?: string[];
  device?: ("mobile" | "desktop" | "tablet")[];
};

type RulesConfig = {
  rules: RedirectRule[];
};

type ClickContext = {
  country: string | null;
  device: string | null;
};

export function evaluateRules(raw: string, ctx: ClickContext): string | null {
  let config: RulesConfig;
  try {
    config = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!config.rules || config.rules.length === 0) return null;

  // Filter by geo/device
  let matched = config.rules.filter((r) => {
    if (r.country && r.country.length > 0 && ctx.country) {
      if (!r.country.includes(ctx.country)) return false;
    }
    if (r.device && r.device.length > 0 && ctx.device) {
      if (!r.device.includes(ctx.device as any)) return false;
    }
    return true;
  });

  if (matched.length === 0) return null;

  // Check for percentage-based A/B split
  const hasPercentage = matched.some((r) => r.percentage !== undefined);
  if (hasPercentage) {
    const totalPct = matched.reduce((sum, r) => sum + (r.percentage ?? 0), 0);
    if (totalPct <= 0) return matched[0].url;

    const roll = Math.random() * totalPct;
    let cumulative = 0;
    for (const rule of matched) {
      cumulative += rule.percentage ?? 0;
      if (roll < cumulative) return rule.url;
    }
  }

  // Default: first matched rule
  return matched[0].url;
}
