// Shared by the client-side estimator and the server action that re-checks it.
import type { EngagementType, ScopeOption, TimelineOption } from "@/db/schema";

type Config = { engagementTypes: EngagementType[]; scopeOptions: ScopeOption[]; timelineOptions: TimelineOption[] };

export function estimateRange(config: Config, engagementKey: string, scopeKey: string, timelineKey: string) {
  const engagement = config.engagementTypes.find((e) => e.key === engagementKey);
  const scope = config.scopeOptions.find((s) => s.key === scopeKey);
  const timeline = config.timelineOptions.find((t) => t.key === timelineKey);
  if (!engagement || !scope || !timeline) return null;
  // Round to the nearest 500 so the output reads as a range, not a quote.
  const round = (n: number) => Math.round(n / 500) * 500;
  return {
    low: round(engagement.weeklyLow * scope.multiplier * timeline.weeks),
    high: round(engagement.weeklyHigh * scope.multiplier * timeline.weeks),
  };
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
