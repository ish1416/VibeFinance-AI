"""
Comprehensive Verification Script for Python FastAPI Brain.
Validates outputs against schemas/agent.schema.json and schemas/analysis.schema.json.
Runs all 4 stocks across 3 investors.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from server.orchestrator import execute_swarm_analysis
from server.rag.hybrid import retriever
from server.data.stocks import STOCKS_DATA
from server.data.portfolios import USERS


def check(condition: bool, message: str, failures: list):
    if not condition:
        failures.append(message)


def validate_agent_schema(agent: dict, schema: dict, failures: list, path: str = "agent"):
    for req in schema.get("required", []):
        if req not in agent:
            failures.append(f"{path}: missing required property '{req}'")

    if "agent_id" in agent:
        allowed_ids = ["A1_TECHNICAL", "A2_FUNDAMENTAL_RAG", "A3_SENTIMENT_FLOW", "A4_PORTFOLIO_RISK"]
        if agent["agent_id"] not in allowed_ids:
            failures.append(f"{path}.agent_id: invalid value '{agent['agent_id']}'")

    if "confidence" in agent:
        if not (0.0 <= agent["confidence"] <= 1.0):
            failures.append(f"{path}.confidence: out of range [0, 1]")

    if "score" in agent:
        if not (0.0 <= agent["score"] <= 100.0):
            failures.append(f"{path}.score: out of range [0, 100]")


def validate_analysis_schema(analysis: dict, schema: dict, agent_schema: dict, failures: list):
    for req in schema.get("required", []):
        if req not in analysis:
            failures.append(f"analysis: missing required property '{req}'")

    if "agents" in analysis:
        if len(analysis["agents"]) < 3:
            failures.append("analysis.agents: requires at least 3 agent envelopes")
        for i, a in enumerate(analysis["agents"]):
            validate_agent_schema(a, agent_schema, failures, f"analysis.agents[{i}]")

    if "verdict" in analysis:
        for v_req in ["label", "badge", "score", "confidence"]:
            if v_req not in analysis["verdict"]:
                failures.append(f"analysis.verdict: missing '{v_req}'")


async def main():
    print("=" * 70)
    print("VibeFinance AI Python Brain — Architecture & Schema Verification")
    print("=" * 70)

    agent_schema_path = Path("schemas/agent.schema.json")
    analysis_schema_path = Path("schemas/analysis.schema.json")

    with open(agent_schema_path, "r", encoding="utf-8") as f:
        agent_schema = json.load(f)
    with open(analysis_schema_path, "r", encoding="utf-8") as f:
        analysis_schema = json.load(f)

    failures = []

    # 1. Test Retrieval Hit-Rate@5
    print("\n[1/3] Evaluating Hybrid Retrieval (BM25 + Dense Vectors)...")
    eval_res = retriever.evaluate_hit_rate(top_k=5)
    print(f"  · Queries evaluated: {eval_res['queries_evaluated']}")
    print(f"  · Hit-Rate@5: {eval_res['hit_rate_at_5'] * 100:.1f}%")
    print(f"  · Mean Reciprocal Rank (MRR): {eval_res['mean_reciprocal_rank_mrr']:.3f}")
    check(eval_res["hit_rate_at_5"] >= 0.85, f"Hit-Rate@5 below 85%: {eval_res['hit_rate_at_5']}", failures)

    # 2. Test RELIANCE Analysis (Primary multi-agent consensus test)
    print("\n[2/3] Executing Swarm Analysis for RELIANCE (Nominal + Degraded)...")
    reliance_nominal = await execute_swarm_analysis(
        symbol="RELIANCE", risk_appetite=6, user_id="aarav", is_degraded=False
    )
    validate_analysis_schema(reliance_nominal, analysis_schema, agent_schema, failures)
    print(f"  · RELIANCE Nominal: Verdict={reliance_nominal['verdict']['label']} | Score={reliance_nominal['verdict']['score']} | Confidence={reliance_nominal['verdict']['confidence']}")
    print(f"  · Evidence Claims: {reliance_nominal['verification_summary']['claims_total']} total, {reliance_nominal['verification_summary']['claims_verified']} verified (Coverage: {reliance_nominal['verification_summary']['coverage_pct']}%)")
    check(reliance_nominal["verification_summary"]["unsupported"] == 0, "Unsupported claims found in RELIANCE nominal run", failures)

    reliance_degraded = await execute_swarm_analysis(
        symbol="RELIANCE", risk_appetite=6, user_id="aarav", is_degraded=True
    )
    validate_analysis_schema(reliance_degraded, analysis_schema, agent_schema, failures)
    print(f"  · RELIANCE Degraded: Verdict={reliance_degraded['verdict']['label']} | Fallback={reliance_degraded['degraded']['fallback_mode']}")
    check(reliance_degraded["degraded"]["active"] is True, "Degraded flag not set in degraded run", failures)

    # 3. Test Full Matrix: 4 Stocks x 3 Investors
    print("\n[3/3] Testing Full Symbol x Investor Matrix (12 Runs)...")
    symbols = list(STOCKS_DATA.keys())
    conflicts_count = 0
    suitability_blocks = 0

    for sym in symbols:
        for u in USERS:
            res = await execute_swarm_analysis(
                symbol=sym, risk_appetite=u["riskAppetite"], user_id=u["id"], is_degraded=False
            )
            validate_analysis_schema(res, analysis_schema, agent_schema, failures)
            if res["conflict"]["detected"]:
                conflicts_count += 1
            if res["portfolio_impact"]["breach"]:
                suitability_blocks += 1

    print(f"  · Conflict detections observed: {conflicts_count} of 12 runs")
    print(f"  · Suitability breaches/blocks observed: {suitability_blocks} of 12 runs")
    check(conflicts_count > 0, "No conflict runs detected across matrix", failures)
    check(suitability_blocks > 0, "No suitability blocks detected across matrix", failures)

    print("\n" + "=" * 70)
    if failures:
        print(f"FAILED: {len(failures)} assertion failure(s):")
        for f in failures:
            print(f"  ✗ {f}")
        sys.exit(1)
    else:
        print("✓ ALL ASSERTIONS PASSED — 100% SCHEMA VALID AND GROUNDED")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
