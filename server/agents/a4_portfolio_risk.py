"""
Agent A4: Portfolio & Risk Analyst.
Evaluates portfolio Herfindahl-Hirschman Index (HHI), sector concentration caps,
beta-weighted market exposure, and suitability restrictions.
"""

import asyncio
from server.agents.base import build_agent_envelope, POLARITY
from server.domain.finance import analyse_portfolio, behavioural_tilt, pct, inr
from server.llm.client import llm_client


async def run_portfolio_agent(user: dict, stock: dict, profile: dict, is_degraded: bool = False) -> dict:
    t0 = asyncio.get_event_loop().time()
    agent_id = "A4_PORTFOLIO_RISK"
    agent_name = "Portfolio & Risk Agent"
    role = "Concentration, Exposure & Suitability Screener"

    portfolio = analyse_portfolio(user)
    behaviour = behavioural_tilt(user)

    hhi = round(portfolio["hhi"], 3)
    beta_w = round(portfolio["betaWeighted"], 2)
    max_sec = portfolio["maxSector"]

    signal = "CONCENTRATION_BREACH" if hhi > 0.25 else "BALANCED"
    score = round(max(0.0, 100.0 - hhi * 100.0), 1)
    confidence = 0.95

    pf_quote = (
        f"portfolio snapshot {user['name']} | positions={len(portfolio['positions'])} | "
        f"hhi={hhi:.3f} | betaWeighted={beta_w:.2f} | totalValue={int(round(portfolio['totalValue']))} | "
        f"equityValue={int(round(portfolio['equityValue']))} | cashDebt={int(round(portfolio['cashDebt']))}"
    )

    claim_text = (
        f"Portfolio HHI {hhi:.3f} ({portfolio['hhiLabel']}); largest sector {max_sec['name']} "
        f"{pct(max_sec['weight'])}; beta-weighted exposure {beta_w:.2f}."
    )

    evidence = [
        {
            "claim_id": "c_pf_1",
            "claim": claim_text,
            "claim_type": "FACT",
            "source": {
                "doc_id": f"PORTFOLIO_{user['id']}",
                "chunk_id": f"SNAPSHOT_{user['id']}_HOLDINGS",
                "title": f"Portfolio snapshot · {user['name']}",
                "regulator": "SEBI Investor Suitability Standard",
                "section": "Client Position Sizing & Concentration",
                "page": None,
                "filed_at": None,
                "url": None,
                "quote": pf_quote,
                "span": [0, 35],
            },
            "verification": {
                "method": "COMPUTED",
                "passed": True,
                "detail": f"HHI {hhi} and beta-weighted exposure {beta_w} computed from active holdings",
            },
        }
    ]

    metrics = {
        "hhi": hhi,
        "hhiLabel": portfolio["hhiLabel"],
        "maxSector": f"{max_sec['name']} {pct(max_sec['weight'])}",
        "betaWeighted": beta_w,
        "positions": len(portfolio["positions"]),
        "totalValue": int(round(portfolio["totalValue"])),
    }

    action = "REVIEW_GUARDRAILS" if behaviour.get("realizedAggressive") else "MAINTAIN_ALLOCATION"

    # Complete reasoning through LLM client
    llm_res = await llm_client.complete_reasoning(
        agent_id=agent_id,
        stock_symbol=stock["symbol"],
        metrics=metrics,
        evidence=evidence,
        context={"user": user["name"], "tilt": behaviour.get("tilt")},
    )

    latency_ms = int((asyncio.get_event_loop().time() - t0) * 1000) + llm_res.get("latency_ms", 5)

    return build_agent_envelope(
        agent_id=agent_id,
        agent_name=agent_name,
        role=role,
        status="HEALTHY",
        signal=signal,
        score=score,
        confidence=confidence,
        confidence_basis={"signal_strength": 0.95, "evidence_support": 1.0, "agreement": 0.90, "data_freshness": 1.0},
        evidence=evidence,
        metrics=metrics,
        reasoning=llm_res["reasoning"],
        action=action,
        execution={
            "latency_ms": latency_ms,
            "model": llm_res["model"],
            "cached": llm_res.get("cached", False),
            "attempts": llm_res.get("attempts", 1),
        },
    )
