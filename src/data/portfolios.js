/**
 * Seeded investor profiles, portfolios and decision history.
 *
 * Persistence note: this is the seeded fixture set the frontend renders in DEMO
 * mode. The FastAPI service stores the same shape in SQLite (users, portfolios,
 * holdings, watchlist, decisions) — see docs/01-TECH-PLAN.md §11. The fixture
 * exists so personalization and portfolio risk can be demonstrated without a
 * backend, and so the demo is reproducible.
 *
 * Holdings marked tracked:false are positions we do not yet run a live signal
 * on (no snapshot in data/stocksData.js). They still count toward portfolio
 * weight, sector concentration and beta — they just show "no live signal".
 */

/** Canonical sector buckets so concentration math groups correctly. */
export const SECTOR_BY_SYMBOL = {
  RELIANCE: "Energy",
  INFY: "IT",
  HDFCBANK: "Banking",
  TATAMOTORS: "Auto",
  TCS: "IT",
  WIPRO: "IT",
  SUNPHARMA: "Pharma",
  ITC: "FMCG",
  NTPC: "Power"
};

/** Quote/beta reference for holdings we hold but do not analyse live. */
export const REFERENCE_QUOTES = {
  TCS: { name: "Tata Consultancy Services Ltd", price: 3900.0, beta: 0.79, tracked: false },
  WIPRO: { name: "Wipro Limited", price: 245.0, beta: 1.05, tracked: false },
  SUNPHARMA: { name: "Sun Pharmaceutical Industries Ltd", price: 1450.0, beta: 0.71, tracked: false },
  ITC: { name: "ITC Limited", price: 430.0, beta: 0.62, tracked: false },
  NTPC: { name: "NTPC Limited", price: 410.0, beta: 0.95, tracked: false }
};

export const USERS = [
  {
    id: "aarav",
    name: "Aarav Mehta",
    initials: "AM",
    profileId: "BALANCED",
    riskAppetite: 6,
    subtitle: "Balanced Growth · 6 holdings",
    cashDebt: 0,
    watchlist: ["RELIANCE", "TATAMOTORS"],
    holdings: [
      { symbol: "RELIANCE", qty: 12, avgPrice: 2790.0 },
      { symbol: "INFY", qty: 25, avgPrice: 1720.0 },
      { symbol: "TCS", qty: 6, avgPrice: 3620.0 },
      { symbol: "HDFCBANK", qty: 40, avgPrice: 1610.0 },
      { symbol: "TATAMOTORS", qty: 60, avgPrice: 842.0 },
      { symbol: "SUNPHARMA", qty: 20, avgPrice: 1385.0 }
    ],
    decisions: [
      { ts: "2026-09-18", symbol: "INFY", profileId: "BALANCED", action: "accepted", sizeRatio: 1.0 },
      { ts: "2026-09-24", symbol: "HDFCBANK", profileId: "BALANCED", action: "accepted", sizeRatio: 0.85 },
      { ts: "2026-09-30", symbol: "TATAMOTORS", profileId: "BALANCED", action: "accepted", sizeRatio: 1.0 },
      { ts: "2026-10-06", symbol: "RELIANCE", profileId: "BALANCED", action: "accepted", sizeRatio: 0.6 },
      { ts: "2026-10-11", symbol: "INFY", profileId: "BALANCED", action: "ignored", sizeRatio: 0 }
    ]
  },
  {
    id: "meera",
    name: "Meera Iyer",
    initials: "MI",
    profileId: "CONSERVATIVE",
    riskAppetite: 3,
    subtitle: "Conservative Guardrail · 6 holdings + debt",
    cashDebt: 90000,
    watchlist: ["HDFCBANK", "ITC", "NTPC"],
    holdings: [
      { symbol: "HDFCBANK", qty: 30, avgPrice: 1580.0 },
      { symbol: "RELIANCE", qty: 20, avgPrice: 2705.0 },
      { symbol: "INFY", qty: 15, avgPrice: 1660.0 },
      { symbol: "SUNPHARMA", qty: 25, avgPrice: 1402.0 },
      { symbol: "ITC", qty: 120, avgPrice: 418.0 },
      { symbol: "NTPC", qty: 100, avgPrice: 372.0 }
    ],
    decisions: [
      { ts: "2026-08-29", symbol: "HDFCBANK", profileId: "CONSERVATIVE", action: "accepted", sizeRatio: 0.9 },
      { ts: "2026-09-12", symbol: "ITC", profileId: "CONSERVATIVE", action: "accepted", sizeRatio: 1.0 },
      { ts: "2026-09-21", symbol: "NTPC", profileId: "CONSERVATIVE", action: "accepted", sizeRatio: 1.0 },
      { ts: "2026-10-02", symbol: "RELIANCE", profileId: "CONSERVATIVE", action: "accepted", sizeRatio: 0.75 },
      { ts: "2026-10-09", symbol: "TATAMOTORS", profileId: "CONSERVATIVE", action: "skipped", sizeRatio: 0 }
    ]
  },
  {
    id: "rohan",
    name: "Rohan Desai",
    initials: "RD",
    profileId: "AGGRESSIVE",
    riskAppetite: 9,
    subtitle: "Aggressive Momentum · 4 holdings",
    cashDebt: 0,
    watchlist: ["TATAMOTORS", "RELIANCE", "INFY"],
    holdings: [
      { symbol: "TATAMOTORS", qty: 120, avgPrice: 905.0 },
      { symbol: "RELIANCE", qty: 40, avgPrice: 2880.0 },
      { symbol: "INFY", qty: 30, avgPrice: 1840.0 },
      { symbol: "HDFCBANK", qty: 30, avgPrice: 1690.0 }
    ],
    decisions: [
      { ts: "2026-09-15", symbol: "TATAMOTORS", profileId: "AGGRESSIVE", action: "accepted", sizeRatio: 2.6 },
      { ts: "2026-09-19", symbol: "INFY", profileId: "AGGRESSIVE", action: "ignored", sizeRatio: 0 },
      { ts: "2026-09-26", symbol: "TATAMOTORS", profileId: "AGGRESSIVE", action: "early_exit", sizeRatio: 2.4 },
      { ts: "2026-10-03", symbol: "HDFCBANK", profileId: "AGGRESSIVE", action: "ignored", sizeRatio: 0 },
      { ts: "2026-10-12", symbol: "RELIANCE", profileId: "AGGRESSIVE", action: "accepted", sizeRatio: 2.2 }
    ]
  }
];

export function getUser(userId) {
  return USERS.find((u) => u.id === userId) || USERS[0];
}

/** Price lookup: live snapshot when tracked, reference quote when not. */
export function priceFor(symbol, stocksData) {
  const live = stocksData?.[symbol];
  if (live) return { price: live.price, beta: live.beta, name: live.name, sector: SECTOR_BY_SYMBOL[symbol] || live.sector, tracked: true };
  const ref = REFERENCE_QUOTES[symbol];
  if (!ref) return { price: 0, beta: 1, name: symbol, sector: SECTOR_BY_SYMBOL[symbol] || "Other", tracked: false };
  return { ...ref, sector: SECTOR_BY_SYMBOL[symbol] || "Other" };
}
