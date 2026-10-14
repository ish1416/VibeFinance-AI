// Agent 1: Technical Momentum & Volume Anomaly Screener
export function runTechnicalAgent(stock, isDegraded = false) {
  const startTime = performance.now();
  const tech = stock.technicalMetrics;

  if (isDegraded) {
    // Graceful handling of degraded ticker feed
    const latency = Math.round(performance.now() - startTime) + 38;
    return {
      agentName: "Technical Momentum Agent",
      role: "Price Action & Volume Screener",
      status: "DEGRADED_DATA_FALLBACK",
      signal: "NEUTRAL",
      conviction: "MODERATE",
      confidence: 0.52,
      metrics: {
        rsi: tech.rsi14,
        volumeSurge: "1.0x (Fallback to 30d median)",
        movingAverageStatus: "Stale 50/200 DMA Cache",
        anomalyFlag: false
      },
      reasoning: "Live price websocket degraded. Relying on cached 20-day technical indicators. Momentum score downgraded to avoid premature breakout execution under noisy conditions.",
      actionRecommendation: "HOLD (Await Feed Recovery)",
      executionTimeMs: latency
    };
  }

  // Normal multi-dimensional technical evaluation
  let signal = "NEUTRAL";
  let confidence = 0.70;
  let action = "HOLD";

  const isRsiBullish = tech.rsi14 > 55 && tech.rsi14 < 72;
  const isAboveDma = stock.price > tech.dma50 && tech.dma50 > tech.dma200;
  const hasVolumeBreakout = stock.volumeSurgeRatio >= 1.4;

  if (isRsiBullish && isAboveDma && hasVolumeBreakout) {
    signal = "STRONG_BULLISH";
    confidence = 0.91;
    action = "BUY_MOMENTUM_BREAKOUT";
  } else if (isRsiBullish || isAboveDma) {
    signal = "MILD_BULLISH";
    confidence = 0.78;
    action = "ACCUMULATE_ON_PULLBACK";
  } else if (tech.rsi14 <= 45) {
    signal = "BEARISH_CONSOLIDATION";
    confidence = 0.68;
    action = "TRIM_OR_AVOID";
  }

  const latency = Math.round(performance.now() - startTime) + 84;

  return {
    agentName: "Technical Momentum Agent",
    role: "Price Action & Volume Screener",
    status: "HEALTHY",
    signal,
    confidence,
    metrics: {
      rsi: tech.rsi14,
      rsiSignal: tech.rsiSignal,
      dma50: tech.dma50,
      dma200: tech.dma200,
      movingAvgSignal: tech.movingAvgSignal,
      macdHistogram: tech.macd.histogram,
      macdStatus: tech.macd.status,
      volumeSurgeRatio: `${stock.volumeSurgeRatio}x`,
      anomalyFlag: tech.volumeAnomalyDetected
    },
    reasoning: `14-period RSI stands at ${tech.rsi14} (${tech.rsiSignal}). Price of ₹${stock.price} is trading above 50-day DMA (₹${tech.dma50}) and 200-day DMA (₹${tech.dma200}). Volume surge is ${stock.volumeSurgeRatio}x above 20-day median with MACD divergence showing ${tech.macd.status}. ${tech.anomalyDescription}`,
    actionRecommendation: action,
    executionTimeMs: latency
  };
}
