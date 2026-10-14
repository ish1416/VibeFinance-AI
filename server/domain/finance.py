"""
Portfolio and risk mathematics. Every figure computed deterministically from holdings.
Mirrors src/domain/finance.js.
"""

from server.data.stocks import STOCKS_DATA
from server.data.portfolios import price_for
from server.domain.profiles import get_profile

HHI_BANDS = [
    {"max": 0.10, "label": "Diversified"},
    {"max": 0.18, "label": "Moderate"},
    {"max": 0.25, "label": "Concentrated"},
    {"max": float("inf"), "label": "Highly concentrated"},
]


def hhi_label(hhi):
    for b in HHI_BANDS:
        if hhi < b["max"]:
            return b["label"]
    return HHI_BANDS[-1]["label"]


def inr(value, decimals=0):
    if value is None:
        return "—"
    try:
        val = float(value)
        if decimals == 0:
            return f"₹{int(round(val)):,}"
        return f"₹{val:,.{decimals}f}"
    except (ValueError, TypeError):
        return "—"


def pct(fraction, decimals=1):
    if fraction is None:
        return "—"
    try:
        return f"{float(fraction) * 100:.{decimals}f}%"
    except (ValueError, TypeError):
        return "—"


def value_holdings(holdings, stocks_data=STOCKS_DATA):
    positions = []
    for h in holdings:
        q = price_for(h["symbol"], stocks_data)
        qty = h["qty"]
        avg_price = h["avgPrice"]
        current_price = q["price"]
        val = current_price * qty
        cost = avg_price * qty
        pnl = val - cost
        pnl_pct = (val - cost) / cost if cost > 0 else 0.0
        positions.append({
            "symbol": h["symbol"],
            "name": q["name"],
            "sector": q["sector"],
            "qty": qty,
            "avgPrice": avg_price,
            "price": current_price,
            "value": val,
            "cost": cost,
            "pnl": pnl,
            "pnlPct": pnl_pct,
            "beta": q["beta"],
            "tracked": q["tracked"],
        })
    return positions


def analyse_portfolio(user, trade_symbol=None, trade_amount=0):
    positions = value_holdings(user["holdings"])
    equity_value = sum(p["value"] for p in positions)
    cash_debt = user.get("cashDebt", 0)
    total_value = equity_value + cash_debt + (trade_amount if trade_symbol else 0)

    with_trade = []
    for p in positions:
        if trade_symbol and p["symbol"] == trade_symbol:
            with_trade.append({**p, "value": p["value"] + trade_amount})
        else:
            with_trade.append(p)

    weighted = []
    for p in with_trade:
        w = p["value"] / total_value if total_value > 0 else 0.0
        weighted.append({**p, "weight": w})

    hhi = sum(p["weight"] ** 2 for p in weighted)
    beta_weighted = sum(p["weight"] * p["beta"] for p in weighted)

    sectors = {}
    for p in weighted:
        sec = p["sector"]
        sectors[sec] = sectors.get(sec, 0.0) + p["weight"]
    if cash_debt > 0 and total_value > 0:
        sectors["Debt / Cash"] = cash_debt / total_value

    sector_entries = sorted(sectors.items(), key=lambda x: x[1], reverse=True)
    max_sector = sector_entries[0] if sector_entries else ("—", 0.0)

    def sector_of(sym):
        for p in weighted:
            if p["symbol"] == sym:
                return p["sector"]
        return None

    def weight_of(sym):
        for p in weighted:
            if p["symbol"] == sym:
                return p["weight"]
        return 0.0

    return {
        "positions": weighted,
        "equityValue": equity_value,
        "cashDebt": cash_debt,
        "totalValue": total_value,
        "hhi": hhi,
        "hhiLabel": hhi_label(hhi),
        "betaWeighted": beta_weighted,
        "sectors": sectors,
        "sectorEntries": sector_entries,
        "maxSector": {"name": max_sector[0], "weight": max_sector[1]},
        "sector_of": sector_of,
        "weight_of": weight_of,
    }


STRESS_SCENARIOS = [
    {"id": "nifty_down", "label": "NIFTY 50 −3% day", "shock": -0.03, "note": "Broad-market shock, portfolio beta applied"},
    {"id": "fii_outflow", "label": "FII net sell ₹8,000 Cr", "shock": -0.022, "note": "High-beta names absorb the outflow first"},
    {"id": "sector_shock", "label": "Largest sector −5%", "shock": -0.05, "note": "Idiosyncratic shock to the top sector exposure"},
]


def stress_test(portfolio):
    results = {}
    for s in STRESS_SCENARIOS:
        multiplier = portfolio["maxSector"]["weight"] if s["id"] == "sector_shock" else portfolio["betaWeighted"]
        impact_pct = s["shock"] * multiplier
        results[s["id"]] = {
            **s,
            "impactPct": impact_pct,
            "impactInr": impact_pct * portfolio["totalValue"],
        }
    return results


def evaluate_trade(user, symbol, amount, profile_id=None):
    profile = get_profile(profile_id or user.get("profileId", "BALANCED"))
    before = analyse_portfolio(user)
    after = analyse_portfolio(user, trade_symbol=symbol, trade_amount=amount)

    sec = before["sector_of"](symbol) or after["sector_of"](symbol) or "Other"
    sec_before = before["sectors"].get(sec, 0.0)
    sec_after = after["sectors"].get(sec, 0.0)

    suitability = "APPROVED"
    reason = None

    if amount > profile["maxTradeInr"]:
        suitability = "BLOCKED_BY_TRADE_CAP"
        reason = f"{inr(amount)} exceeds the {profile['name']} single-trade cap of {inr(profile['maxTradeInr'])}."
    elif sec_after > profile["sectorCap"]:
        suitability = "BLOCKED_BY_SECTOR_CAP"
        reason = f"{sec} exposure rises from {pct(sec_before)} to {pct(sec_after)}, above the {pct(profile['sectorCap'], 0)} sector cap."
    elif after["weight_of"](symbol) > profile["perEquityCap"]:
        suitability = "WARN_CONCENTRATION"
        reason = f"{symbol} would be {pct(after['weight_of'](symbol))} of the portfolio, above the {pct(profile['perEquityCap'], 0)} per-equity guide."

    candidates = []
    for s in STOCKS_DATA.values():
        if s["symbol"] != symbol:
            c_sec = price_for(s["symbol"], STOCKS_DATA)["sector"]
            sec_weight = after["sectors"].get(c_sec, 0.0)
            delta = (amount / after["totalValue"]) if after["totalValue"] > 0 else 0.0
            headroom = profile["sectorCap"] - (sec_weight + delta)
            candidates.append({"symbol": s["symbol"], "sector": c_sec, "headroom": headroom})
    candidates.sort(key=lambda x: x["headroom"], reverse=True)

    alternative = candidates[0]["symbol"] if (suitability == "BLOCKED_BY_SECTOR_CAP" and candidates) else None

    return {
        "amount": amount,
        "sector": sec,
        "sectorBefore": sec_before,
        "sectorAfter": sec_after,
        "sectorCap": profile["sectorCap"],
        "hhiBefore": before["hhi"],
        "hhiAfter": after["hhi"],
        "hhiLabelBefore": before["hhiLabel"],
        "hhiLabelAfter": after["hhiLabel"],
        "weightBefore": before["weight_of"](symbol),
        "weightAfter": after["weight_of"](symbol),
        "breach": suitability != "APPROVED",
        "suitability": suitability,
        "reason": reason,
        "alternative": alternative,
        "stress": stress_test(after),
    }


def behavioural_tilt(user):
    decisions = user.get("decisions", [])
    total = len(decisions)
    accepted = [d for d in decisions if d.get("action") == "accepted"]
    ignored = [d for d in decisions if d.get("action") in ("ignored", "skipped")]
    early_exit = [d for d in decisions if d.get("action") == "early_exit"]

    sizes = sorted([d["sizeRatio"] for d in accepted if d.get("sizeRatio", 0) > 0])
    median_size = sizes[len(sizes) // 2] if sizes else 1.0
    accept_rate = (len(accepted) / total) if total else 0.0
    early_exit_rate = (len(early_exit) / total) if total else 0.0

    declared = get_profile(user.get("profileId", "BALANCED"))

    if median_size >= 1.75:
        tilt = "SIZE_OVERRIDE"
    elif accept_rate < 0.5:
        tilt = "GUARDRAIL_SKEPTIC"
    elif early_exit_rate >= 0.4:
        tilt = "EARLY_EXIT"
    else:
        tilt = "ALIGNED"

    realized_aggressive = (tilt == "SIZE_OVERRIDE" or accept_rate < 0.5)

    if tilt == "SIZE_OVERRIDE":
        headline = "Realized behaviour is more aggressive than declared"
    elif tilt == "GUARDRAIL_SKEPTIC":
        headline = "Realized behaviour questions the declared guardrails"
    elif tilt == "EARLY_EXIT":
        headline = "Realized behaviour shows repeated early exits"
    else:
        headline = "Realized behaviour matches the declared profile"

    justifications = [
        f"{len(accepted)} of {total} past recommendations accepted ({pct(accept_rate, 0)}), {len(ignored)} not acted on.",
        f"Position size used was {median_size:.2f}× the suggested size on accepted trades." if sizes else "No sized positions recorded yet.",
    ]
    if early_exit_rate > 0:
        justifications.append(f"{len(early_exit)} early exit(s) recorded ({pct(early_exit_rate, 0)} of decisions).")

    return {
        "tilt": tilt,
        "headline": headline,
        "justifications": justifications,
        "realizedAggressive": realized_aggressive,
        "declaredProfile": declared["id"],
        "suggestProfileId": "AGGRESSIVE" if (realized_aggressive and declared["id"] == "CONSERVATIVE") else None,
        "stats": {
            "total": total,
            "accepted": len(accepted),
            "ignored": len(ignored),
            "earlyExit": len(early_exit),
            "acceptRate": accept_rate,
            "medianSize": median_size,
            "earlyExitRate": early_exit_rate,
        },
    }
