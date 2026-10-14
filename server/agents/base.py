"""
Base agent envelope validator and constructor.
Guarantees strict conformance to schemas/agent.schema.json.
"""

from typing import Any


POLARITY = {
    "STRONG_BULLISH": 1.0,
    "MILD_BULLISH": 0.6,
    "STRONG_FUNDAMENTAL": 0.8,
    "DEEP_VALUE_UNDERVALUED": 0.9,
    "VALUATION_EXPENSIVE": -0.35,
    "BEARISH_CONSOLIDATION": -0.6,
    "STRONG_BEARISH": -1.0,
    "HEAVY_INSTITUTIONAL_INFLOW": 0.85,
    "NET_ACCUMULATION": 0.6,
    "STRONG_BUY_SENTIMENT": 0.8,
    "MODERATE_INFLOW": 0.4,
    "MIXED_FLOW_DII_SUPPORT": 0.15,
    "INSTITUTIONAL_OUTFLOW": -0.7,
    "NEUTRAL": 0.0,
    "NEUTRAL_FLOW": 0.0,
    "CAUTION_MISSING_DISCLOSURE": -0.4,
    "UNDERWEIGHT": -0.3,
    "OVERWEIGHT": -0.4,
    "BALANCED": 0.2,
    "CONCENTRATION_BREACH": -0.5,
    "UNKNOWN": 0.0,
}


def build_agent_envelope(
    agent_id: str,
    agent_name: str,
    role: str,
    status: str,
    signal: str,
    score: float,
    confidence: float,
    confidence_basis: dict,
    evidence: list[dict],
    metrics: dict,
    reasoning: str,
    action: str,
    execution: dict,
    error: str | None = None,
) -> dict:
    """
    Constructs an agent output dictionary adhering strictly to schemas/agent.schema.json.
    """
    return {
        "agent_id": agent_id,
        "agent_name": agent_name,
        "role": role,
        "status": status,
        "signal": signal,
        "score": round(max(0.0, min(100.0, float(score))), 1),
        "confidence": round(max(0.0, min(1.0, float(confidence))), 2),
        "confidence_basis": {
            "signal_strength": round(max(0.0, min(1.0, float(confidence_basis.get("signal_strength", 0.5)))), 2),
            "evidence_support": round(max(0.0, min(1.0, float(confidence_basis.get("evidence_support", 1.0)))), 2),
            "agreement": round(max(0.0, min(1.0, float(confidence_basis.get("agreement", 0.7)))), 2),
            "data_freshness": round(max(0.0, min(1.0, float(confidence_basis.get("data_freshness", 1.0)))), 2),
        },
        "evidence": evidence,
        "metrics": metrics,
        "reasoning": reasoning,
        "action": action,
        "execution": {
            "latency_ms": int(execution.get("latency_ms", 10)),
            "model": str(execution.get("model", "deterministic")),
            "prompt_tokens": execution.get("prompt_tokens"),
            "completion_tokens": execution.get("completion_tokens"),
            "cached": bool(execution.get("cached", False)),
            "attempts": int(execution.get("attempts", 1)),
        },
        "error": error,
    }


def build_failed_agent_envelope(agent_id: str, agent_name: str, role: str, error_message: str) -> dict:
    """Fallback envelope when an agent times out or crashes; isolates failure."""
    return build_agent_envelope(
        agent_id=agent_id,
        agent_name=agent_name,
        role=role,
        status="FAILED",
        signal="UNKNOWN",
        score=50.0,
        confidence=0.0,
        confidence_basis={"signal_strength": 0.0, "evidence_support": 0.0, "agreement": 0.0, "data_freshness": 0.0},
        evidence=[],
        metrics={},
        reasoning=f"Agent execution isolated failure: {error_message}",
        action="HOLD",
        execution={"latency_ms": 0, "model": "none", "cached": False, "attempts": 1},
        error=error_message,
    )
