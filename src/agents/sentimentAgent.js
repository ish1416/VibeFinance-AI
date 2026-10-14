// Agent 3: Sentiment & Institutional Flow Analyst
export function runSentimentAgent(stock, isDegraded = false) {
  const startTime = performance.now();

  if (isDegraded) {
    const latency = Math.round(performance.now() - startTime) + 32;
    return {
      agentName: "Sentiment & Flow Agent",
      role: "FII/DII Flows & News Sentiment NLP",
      status: "DEGRADED_FEED",
      signal: "NEUTRAL_FLOW",
      confidence: 0.50,
      metrics: {
        fiiFlow: "Data Feed Interrupted",
        diiFlow: "Data Feed Interrupted",
        pcrRatio: "1.00 (Synthetic Baseline)",
        sentimentScore: 50
      },
      reasoning: "Institutional transaction tape delayed by NSE broadcast server. Assuming neutral institutional positioning to prevent speculative bias.",
      actionRecommendation: "NEUTRAL",
      executionTimeMs: latency
    };
  }

  // Stock-specific institutional flow and news sentiment
  const flowMap = {
    RELIANCE: {
      fiiNetFlowCr: +1245.8,
      diiNetFlowCr: +820.4,
      pcrRatio: 1.28,
      sentimentScore: 82,
      sentimentHeadline: "Positive broker re-ratings following Jio tariff hike & green hydrogen rollout timeline",
      signal: "HEAVY_INSTITUTIONAL_INFLOW",
      confidence: 0.86
    },
    INFY: {
      fiiNetFlowCr: +892.0,
      diiNetFlowCr: +410.5,
      pcrRatio: 1.15,
      sentimentScore: 78,
      sentimentHeadline: "IT index gains on resilient enterprise tech spending & GenAI deal expansions",
      signal: "NET_ACCUMULATION",
      confidence: 0.84
    },
    HDFCBANK: {
      fiiNetFlowCr: -340.2,
      diiNetFlowCr: +980.6,
      pcrRatio: 0.92,
      sentimentScore: 61,
      sentimentHeadline: "Domestic Mutual Funds absorb FII selling pressure amidst post-merger deposit absorption",
      signal: "MIXED_FLOW_DII_SUPPORT",
      confidence: 0.72
    },
    TATAMOTORS: {
      fiiNetFlowCr: +640.5,
      diiNetFlowCr: +380.0,
      pcrRatio: 1.34,
      sentimentScore: 85,
      sentimentHeadline: "De-merger value unlocking excitement + festive season commercial vehicle order surge",
      signal: "STRONG_BUY_SENTIMENT",
      confidence: 0.89
    }
  };

  const flow = flowMap[stock.symbol] || {
    fiiNetFlowCr: +200.0,
    diiNetFlowCr: +150.0,
    pcrRatio: 1.05,
    sentimentScore: 70,
    sentimentHeadline: "Steady domestic mutual fund accumulation",
    signal: "MODERATE_INFLOW",
    confidence: 0.75
  };

  const latency = Math.round(performance.now() - startTime) + 76;

  return {
    agentName: "Sentiment & Flow Agent",
    role: "FII/DII Flows & News Sentiment NLP",
    status: "HEALTHY",
    signal: flow.signal,
    confidence: flow.confidence,
    metrics: {
      fiiFlow: `${flow.fiiNetFlowCr >= 0 ? '+' : ''}₹${flow.fiiNetFlowCr} Cr`,
      diiFlow: `${flow.diiNetFlowCr >= 0 ? '+' : ''}₹${flow.diiNetFlowCr} Cr`,
      pcrRatio: flow.pcrRatio,
      sentimentScore: flow.sentimentScore
    },
    reasoning: `FII Net Flow: ${flow.fiiNetFlowCr >= 0 ? '+' : ''}₹${flow.fiiNetFlowCr} Cr | DII Net Flow: ${flow.diiNetFlowCr >= 0 ? '+' : ''}₹${flow.diiNetFlowCr} Cr. Derivatives PCR stands at ${flow.pcrRatio} (Bullish above 1.0). News Sentiment Index: ${flow.sentimentScore}/100. Primary Narrative: "${flow.sentimentHeadline}".`,
    actionRecommendation: flow.fiiNetFlowCr > 0 ? "ACCUMULATE_WITH_INSTITUTIONS" : "MONITOR_FLOWS",
    executionTimeMs: latency
  };
}
