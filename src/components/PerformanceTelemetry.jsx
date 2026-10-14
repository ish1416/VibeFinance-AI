import React, { useState } from "react";
import { Terminal, Activity, Zap, Shield, ChevronDown, ChevronUp } from "lucide-react";

export function PerformanceTelemetry({ synthesis, technicalResult, fundamentalResult, sentimentResult, isDegraded }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="telemetry-bar glass-panel">
      <div className="telemetry-summary" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="telemetry-left">
          <Terminal size={16} className="text-cyan" />
          <span className="telemetry-title">Session Telemetry & Evaluation Metrics</span>
          <span className="badge-live-pulse">LIVE MONITOR</span>
        </div>

        <div className="telemetry-metrics-pills">
          <div className="t-pill">
            <span className="t-label"><Zap size={12} className="text-amber" /> Total Latency:</span>
            <span className="t-value">{synthesis.sessionMetrics.inferenceLatencyMs}ms</span>
          </div>

          <div className="t-pill">
            <span className="t-label"><Activity size={12} className="text-green" /> 30d Signal Accuracy:</span>
            <span className="t-value text-green">{synthesis.sessionMetrics.historicalSignalAccuracy30d}</span>
          </div>

          <div className="t-pill">
            <span className="t-label"><Shield size={12} className="text-cyan" /> Risk Concentration:</span>
            <span className="t-value">{synthesis.sessionMetrics.riskConcentrationScore}</span>
          </div>

          <button className="btn-toggle-terminal">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>{isExpanded ? "Collapse Logs" : "Inspect Agent Logs"}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="terminal-log-view">
          <div className="terminal-header">
            <span className="term-circle red"></span>
            <span className="term-circle yellow"></span>
            <span className="term-circle green"></span>
            <span className="term-title">multi_agent_orchestrator.log — active execution traces</span>
          </div>
          <div className="terminal-body font-mono">
            <div className="log-line">
              <span className="log-ts">[{synthesis.timestamp}]</span>{" "}
              <span className="log-info">[ORCHESTRATOR]</span> Ingested real-time NSE packet for {synthesis.stockSymbol} @ ₹{synthesis.entryPrice}
            </div>
            <div className="log-line">
              <span className="log-ts">[{synthesis.timestamp}]</span>{" "}
              <span className="log-agent">[AGENT-1: TECH]</span> Executed in {technicalResult.executionTimeMs}ms. Status: {technicalResult.status}. Signal: {technicalResult.signal} (Confidence: {(technicalResult.confidence * 100).toFixed(0)}%)
            </div>
            <div className="log-line">
              <span className="log-ts">[{synthesis.timestamp}]</span>{" "}
              <span className="log-agent">[AGENT-2: RAG]</span> Executed in {fundamentalResult.executionTimeMs}ms. Retrieved {synthesis.citationsCount} verified SEBI chunks. Status: {fundamentalResult.status}. Signal: {fundamentalResult.signal}
            </div>
            <div className="log-line">
              <span className="log-ts">[{synthesis.timestamp}]</span>{" "}
              <span className="log-agent">[AGENT-3: FLOW]</span> Executed in {sentimentResult.executionTimeMs}ms. FII Net Flow: {sentimentResult.metrics.fiiFlow}. PCR: {sentimentResult.metrics.pcrRatio}
            </div>
            <div className="log-line">
              <span className="log-ts">[{synthesis.timestamp}]</span>{" "}
              <span className="log-success">[SYNTHESIS]</span> Applied Bayesian weighting for {synthesis.riskProfile.name}. Unified Conviction: {synthesis.weightedScore}/100. Verdict: {synthesis.finalVerdict}
            </div>
            {isDegraded && (
              <div className="log-line text-amber">
                <span className="log-ts">[{synthesis.timestamp}]</span>{" "}
                <span className="log-warn">[DEGRADED-SAFEGUARD]</span> Active simulated network disruption. Heuristic fallback engaged. Uncited claims suppressed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
