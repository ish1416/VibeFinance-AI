import { RISK_PROFILES } from "../agents/synthesisEngine.js";

/**
 * Profile guardrails that the synthesis engine did not carry, added without
 * touching the existing weights/stop-loss definitions in synthesisEngine.js.
 *
 * sectorCap / perEquityCap are fractions of total portfolio value.
 * maxTradeInr is the largest single trade the profile permits.
 */
export const PROFILE_LIMITS = {
  CONSERVATIVE: { sectorCap: 0.2, perEquityCap: 0.12, maxTradeInr: 50000, allowsDerivatives: false },
  BALANCED: { sectorCap: 0.28, perEquityCap: 0.2, maxTradeInr: 100000, allowsDerivatives: false },
  AGGRESSIVE: { sectorCap: 0.45, perEquityCap: 0.35, maxTradeInr: 250000, allowsDerivatives: true }
};

export function getProfile(profileId) {
  const base = RISK_PROFILES[profileId] || RISK_PROFILES.BALANCED;
  const limits = PROFILE_LIMITS[base.id] || PROFILE_LIMITS.BALANCED;
  return {
    id: base.id,
    name: base.name,
    description: base.description,
    weights: base.weights,
    stopLossPercent: base.stopLossPercent,
    targetHorizon: base.targetHorizon,
    volatilityTolerance: base.volatilityTolerance,
    sectorCap: limits.sectorCap,
    perEquityCap: limits.perEquityCap,
    maxTradeInr: limits.maxTradeInr,
    allowsDerivatives: limits.allowsDerivatives
  };
}

export const PROFILE_IDS = Object.keys(RISK_PROFILES);

/**
 * Continuous risk appetite (1–10) interpolates between the Conservative and
 * Aggressive weight vectors, so personalization is demonstrably continuous
 * rather than three hard buckets. 4 ≈ Conservative, 6 ≈ Balanced, 9 ≈ Aggressive.
 */
export function profileForAppetite(appetite) {
  const t = Math.min(1, Math.max(0, (appetite - 1) / 9));
  const c = RISK_PROFILES.CONSERVATIVE.weights;
  const a = RISK_PROFILES.AGGRESSIVE.weights;
  const lerp = (x, y) => Number((x + (y - x) * t).toFixed(3));

  let id = "BALANCED";
  if (appetite <= 4) id = "CONSERVATIVE";
  else if (appetite >= 8) id = "AGGRESSIVE";

  const profile = getProfile(id);
  return {
    ...profile,
    id,
    name: `${profile.name} (appetite ${appetite}/10)`,
    baseId: id,
    appetite,
    weights: {
      technical: lerp(c.technical, a.technical),
      fundamental: lerp(c.fundamental, a.fundamental),
      sentiment: lerp(c.sentiment, a.sentiment)
    }
  };
}
