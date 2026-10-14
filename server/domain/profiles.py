"""
Risk profiles and continuous appetite interpolation.
Mirrors src/domain/profiles.js.
"""

RISK_PROFILES = {
    "CONSERVATIVE": {
        "id": "CONSERVATIVE",
        "name": "Capital Preservation",
        "description": "Risk-averse, prioritizes capital preservation with tight stop-loss guardrails.",
        "weights": {"technical": 0.20, "fundamental": 0.60, "sentiment": 0.20},
        "stopLossPercent": 2.0,
        "targetHorizon": "12-18 Months",
        "volatilityTolerance": "Low",
    },
    "BALANCED": {
        "id": "BALANCED",
        "name": "Balanced Growth",
        "description": "Equal-weight approach balancing price momentum against audited balance sheet strength.",
        "weights": {"technical": 0.35, "fundamental": 0.40, "sentiment": 0.25},
        "stopLossPercent": 4.5,
        "targetHorizon": "6-12 Months",
        "volatilityTolerance": "Moderate",
    },
    "AGGRESSIVE": {
        "id": "AGGRESSIVE",
        "name": "High Beta Breakout",
        "description": "Momentum-driven, higher risk tolerance with wider trailing stops to capture explosive moves.",
        "weights": {"technical": 0.50, "fundamental": 0.20, "sentiment": 0.30},
        "stopLossPercent": 7.0,
        "targetHorizon": "1-3 Months",
        "volatilityTolerance": "High",
    },
}

PROFILE_LIMITS = {
    "CONSERVATIVE": {"sectorCap": 0.20, "perEquityCap": 0.12, "maxTradeInr": 50000, "allowsDerivatives": False},
    "BALANCED": {"sectorCap": 0.28, "perEquityCap": 0.20, "maxTradeInr": 100000, "allowsDerivatives": False},
    "AGGRESSIVE": {"sectorCap": 0.45, "perEquityCap": 0.35, "maxTradeInr": 250000, "allowsDerivatives": True},
}

PROFILE_IDS = list(RISK_PROFILES.keys())


def get_profile(profile_id):
    base = RISK_PROFILES.get(profile_id, RISK_PROFILES["BALANCED"])
    limits = PROFILE_LIMITS.get(base["id"], PROFILE_LIMITS["BALANCED"])
    return {
        "id": base["id"],
        "name": base["name"],
        "description": base["description"],
        "weights": base["weights"],
        "stopLossPercent": base["stopLossPercent"],
        "targetHorizon": base["targetHorizon"],
        "volatilityTolerance": base["volatilityTolerance"],
        "sectorCap": limits["sectorCap"],
        "perEquityCap": limits["perEquityCap"],
        "maxTradeInr": limits["maxTradeInr"],
        "allowsDerivatives": limits["allowsDerivatives"],
    }


def profile_for_appetite(appetite):
    """
    Continuous risk appetite (1-10) interpolating between Conservative and Aggressive weight vectors.
    """
    t = min(1.0, max(0.0, (appetite - 1) / 9.0))
    c = RISK_PROFILES["CONSERVATIVE"]["weights"]
    a = RISK_PROFILES["AGGRESSIVE"]["weights"]

    def lerp(x, y):
        return round(x + (y - x) * t, 3)

    if appetite <= 4:
        pid = "CONSERVATIVE"
    elif appetite >= 8:
        pid = "AGGRESSIVE"
    else:
        pid = "BALANCED"

    base_profile = get_profile(pid)
    return {
        **base_profile,
        "id": pid,
        "name": f"{base_profile['name']} (appetite {appetite}/10)",
        "baseId": pid,
        "appetite": appetite,
        "weights": {
            "technical": lerp(c["technical"], a["technical"]),
            "fundamental": lerp(c["fundamental"], a["fundamental"]),
            "sentiment": lerp(c["sentiment"], a["sentiment"]),
        },
    }
