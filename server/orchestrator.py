"""
Async Multi-Agent Orchestrator.
Runs A1, A2, A3, and A4 concurrently using asyncio.gather with 12s timeout per agent
and independent failure isolation. Provides SSE generator for streaming telemetry.
"""

import asyncio
import json
import time
from server.agents.base import build_failed_agent_envelope
from server.agents.a1_technical import run_technical_agent
from server.agents.a2_fundamental_rag import run_fundamental_rag_agent
from server.agents.a3_sentiment_flow import run_sentiment_agent
from server.agents.a4_portfolio_risk import run_portfolio_agent
from server.domain.analysis import synthesize_analysis
from server.domain.profiles import profile_for_appetite
from server.data.portfolios import get_user
from server.data.stocks import STOCKS_DATA

AGENT_TIMEOUT = 12.0


async def _isolated_agent_run(coro, agent_id: str, agent_name: str, role: str) -> dict:
    try:
        return await asyncio.wait_for(coro, timeout=AGENT_TIMEOUT)
    except asyncio.TimeoutError:
        return build_failed_agent_envelope(
            agent_id=agent_id,
            agent_name=agent_name,
            role=role,
            error_message=f"Agent exceeded {AGENT_TIMEOUT}s timeout limit",
        )
    except Exception as exc:
        return build_failed_agent_envelope(
            agent_id=agent_id,
            agent_name=agent_name,
            role=role,
            error_message=f"Exception in agent execution: {str(exc)}",
        )


async def execute_swarm_analysis(
    symbol: str = "RELIANCE",
    risk_appetite: int = 6,
    user_id: str = "aarav",
    is_degraded: bool = False,
) -> dict:
    t0 = time.time()
    stock = STOCKS_DATA.get(symbol, STOCKS_DATA["RELIANCE"])
    user = get_user(user_id)
    profile = profile_for_appetite(risk_appetite)

    tasks = [
        _isolated_agent_run(
            run_technical_agent(stock, is_degraded),
            "A1_TECHNICAL",
            "Technical Momentum Agent",
            "Price Action & Volume Screener",
        ),
        _isolated_agent_run(
            run_fundamental_rag_agent(stock, is_degraded),
            "A2_FUNDAMENTAL_RAG",
            "Fundamental & SEBI RAG Agent",
            "Audited Filings & Regulatory Disclosure Auditor",
        ),
        _isolated_agent_run(
            run_sentiment_agent(stock, is_degraded),
            "A3_SENTIMENT_FLOW",
            "Sentiment & Flow Agent",
            "FII/DII Flows & News Sentiment NLP",
        ),
        _isolated_agent_run(
            run_portfolio_agent(user, stock, profile, is_degraded),
            "A4_PORTFOLIO_RISK",
            "Portfolio & Risk Agent",
            "Concentration, Exposure & Suitability Screener",
        ),
    ]

    envelopes = await asyncio.gather(*tasks, return_exceptions=False)
    total_ms = int((time.time() - t0) * 1000)

    analysis = synthesize_analysis(
        stock=stock,
        user=user,
        profile=profile,
        agent_envelopes=envelopes,
        is_degraded=is_degraded,
        total_ms=total_ms,
    )

    return analysis


async def stream_swarm_analysis(
    symbol: str = "RELIANCE",
    risk_appetite: int = 6,
    user_id: str = "aarav",
    is_degraded: bool = False,
):
    """
    Server-Sent Events (SSE) generator streaming real-time agent execution tokens.
    """
    stock = STOCKS_DATA.get(symbol, STOCKS_DATA["RELIANCE"])
    user = get_user(user_id)
    profile = profile_for_appetite(risk_appetite)

    yield f"event: agent_started\ndata: {json.dumps({'status': 'INITIALIZING', 'symbol': symbol, 'agents': ['A1_TECHNICAL', 'A2_FUNDAMENTAL_RAG', 'A3_SENTIMENT_FLOW', 'A4_PORTFOLIO_RISK']})}\n\n"
    await asyncio.sleep(0.05)

    # Execute agents
    analysis = await execute_swarm_analysis(symbol, risk_appetite, user_id, is_degraded)

    for agent in analysis["agents"]:
        yield f"event: agent_done\ndata: {json.dumps({'agent_id': agent['agent_id'], 'signal': agent['signal'], 'score': agent['score'], 'status': agent['status']})}\n\n"
        await asyncio.sleep(0.02)

    yield f"event: verification\ndata: {json.dumps(analysis['verification_summary'])}\n\n"
    await asyncio.sleep(0.02)

    yield f"event: synthesis\ndata: {json.dumps(analysis['verdict'])}\n\n"
    await asyncio.sleep(0.02)

    yield f"event: done\ndata: {json.dumps(analysis)}\n\n"
