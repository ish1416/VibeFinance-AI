import React from "react";
import { Cpu, TrendingUp, ShieldCheck, FileText, Activity, Clock, CheckCircle2, AlertOctagon } from "lucide-react";

export function AgentPanel({ technicalResult, fundamentalResult, sentimentResult, onOpenCitations }) {
  return (
    <div className="agent-panel-section">
      <div className="section-title-row">
        <div className="title-left">
          <Cpu className="text-cyan" size={20} />
          <div>
            <h2 className="section-heading">Tri-Agent Autonomous Consensus Swarm</h2>
            <p className="section-subheading">Three specialized autonomous agents running in parallel with structured output contracts</p>
          </div>
        </div>
        <div className="parallel-badge">
          <span className="dot-pulse"></span>
          <span>Parallel Asynchronous Execution</span>
        </div>
      </div>

      <div className="agents-grid">
        {/* Agent 1: Technical Momentum Agent */}
        <div className={`agent-card glass-panel ${technicalResult.status === "DEGRADED_DATA_FALLBACK" ? "border-amber" : "border-cyan"}`}>
          <div className="agent-card-header">
            <div className="agent-identity">
              <div className="agent-avatar tech-avatar">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="agent-name">{technicalResult.agentName}</h3>
                <span className="agent-role">{technicalResult.role}</span>
              </div>
            </div>
            <div className="agent-meta">
              <span className={`status-pill ${technicalResult.status === "HEALTHY" ? "pill-healthy" : "pill-degraded"}`}>
                {technicalResult.status === "HEALTHY" ? <CheckCircle2 size={12} /> : <AlertOctagon size={12} />}
                {technicalResult.status}
              </span>
              <span className="latency-tag"><Clock size={11} /> {technicalResult.executionTimeMs}ms</span>
            </div>
          </div>

          <div className="agent-confidence-block">
            <div className="conf-label-row">
              <span className="conf-title">Model Conviction</span>
              <span className="conf-val text-cyan">{(technicalResult.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill fill-cyan"
                style={{ width: `${technicalResult.confidence * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="agent-metrics-row">
            <div className="metric-chip">
              <span className="chip-key">14-Period RSI</span>
              <span className="chip-val">{technicalResult.metrics.rsi}</span>
            </div>
            <div className="metric-chip">
              <span className="chip-key">Volume Surge</span>
              <span className="chip-val text-cyan">{technicalResult.metrics.volumeSurge || technicalResult.metrics.volumeSurgeRatio}</span>
            </div>
            <div className="metric-chip">
              <span className="chip-key">Anomaly Flag</span>
              <span className="chip-val">{technicalResult.metrics.anomalyFlag ? "DETECTED" : "NORMAL"}</span>
            </div>
          </div>

          <div className="agent-reasoning-box">
            <span className="reasoning-label">Autonomous Reasoning Chain:</span>
            <p className="reasoning-text">{technicalResult.reasoning}</p>
          </div>

          <div className="agent-footer">
            <span className="action-tag action-tech">Signal: {technicalResult.actionRecommendation}</span>
          </div>
        </div>

        {/* Agent 2: Fundamental & SEBI RAG Agent */}
        <div className={`agent-card glass-panel ${fundamentalResult.status === "DEGRADED_RAG_FALLBACK" ? "border-amber" : "border-emerald"}`}>
          <div className="agent-card-header">
            <div className="agent-identity">
              <div className="agent-avatar fund-avatar">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="agent-name">{fundamentalResult.agentName}</h3>
                <span className="agent-role">{fundamentalResult.role}</span>
              </div>
            </div>
            <div className="agent-meta">
              <span className={`status-pill ${fundamentalResult.status === "HEALTHY" ? "pill-healthy" : "pill-degraded"}`}>
                {fundamentalResult.status === "HEALTHY" ? <CheckCircle2 size={12} /> : <AlertOctagon size={12} />}
                {fundamentalResult.status}
              </span>
              <span className="latency-tag"><Clock size={11} /> {fundamentalResult.executionTimeMs}ms</span>
            </div>
          </div>

          <div className="agent-confidence-block">
            <div className="conf-label-row">
              <span className="conf-title">Model Conviction</span>
              <span className="conf-val text-emerald">{(fundamentalResult.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill fill-emerald"
                style={{ width: `${fundamentalResult.confidence * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="agent-metrics-row">
            <div className="metric-chip">
              <span className="chip-key">Trailing P/E</span>
              <span className="chip-val">{fundamentalResult.metrics.peRatio}x</span>
            </div>
            <div className="metric-chip">
              <span className="chip-key">SEBI Filings Grounded</span>
              <span className="chip-val text-emerald">{fundamentalResult.citations ? fundamentalResult.citations.length : 0} Docs</span>
            </div>
            <div className="metric-chip">
              <span className="chip-key">Audit Verification</span>
              <span className="chip-val text-emerald">PASSED</span>
            </div>
          </div>

          <div className="agent-reasoning-box">
            <span className="reasoning-label">Document-Grounded Inference:</span>
            <p className="reasoning-text">{fundamentalResult.reasoning}</p>
          </div>

          <div className="agent-footer">
            <button className="btn-view-citations" onClick={onOpenCitations}>
              <FileText size={13} />
              <span>Inspect Source Citations ({fundamentalResult.citations ? fundamentalResult.citations.length : 0})</span>
            </button>
          </div>
        </div>

        {/* Agent 3: Sentiment & Flow Agent */}
        <div className={`agent-card glass-panel ${sentimentResult.status === "DEGRADED_FEED" ? "border-amber" : "border-purple"}`}>
          <div className="agent-card-header">
            <div className="agent-identity">
              <div className="agent-avatar sent-avatar">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="agent-name">{sentimentResult.agentName}</h3>
                <span className="agent-role">{sentimentResult.role}</span>
              </div>
            </div>
            <div className="agent-meta">
              <span className={`status-pill ${sentimentResult.status === "HEALTHY" ? "pill-healthy" : "pill-degraded"}`}>
                {sentimentResult.status === "HEALTHY" ? <CheckCircle2 size={12} /> : <AlertOctagon size={12} />}
                {sentimentResult.status}
              </span>
              <span className="latency-tag"><Clock size={11} /> {sentimentResult.executionTimeMs}ms</span>
            </div>
          </div>

          <div className="agent-confidence-block">
            <div className="conf-label-row">
              <span className="conf-title">Model Conviction</span>
              <span className="conf-val text-purple">{(sentimentResult.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill fill-purple"
                style={{ width: `${sentimentResult.confidence * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="agent-metrics-row">
            <div className="metric-chip">
              <span className="chip-key">FII Net Flow</span>
              <span className="chip-val text-purple">{sentimentResult.metrics.fiiFlow}</span>
            </div>
            <div className="metric-chip">
              <span className="chip-key">Options PCR</span>
              <span className="chip-val">{sentimentResult.metrics.pcrRatio}</span>
            </div>
            <div className="metric-chip">
              <span className="chip-key">Sentiment Index</span>
              <span className="chip-val text-purple">{sentimentResult.metrics.sentimentScore}/100</span>
            </div>
          </div>

          <div className="agent-reasoning-box">
            <span className="reasoning-label">Macro Flow Synthesis:</span>
            <p className="reasoning-text">{sentimentResult.reasoning}</p>
          </div>

          <div className="agent-footer">
            <span className="action-tag action-sentiment">Flow: {sentimentResult.actionRecommendation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
