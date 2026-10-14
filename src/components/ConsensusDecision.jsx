import React from "react";
import { Sparkles, Shield, AlertTriangle, CheckCircle2, UserCheck, Flame, Scale } from "lucide-react";
import { RISK_PROFILES } from "../agents/synthesisEngine";

export function ConsensusDecision({ synthesis, selectedRiskProfile, onSelectRiskProfile }) {
  const isBuy = synthesis.verdictBadge === "BUY" || synthesis.verdictBadge === "STRONG_BUY";
  const isHold = synthesis.verdictBadge === "HOLD";
  const isWarning = synthesis.verdictBadge === "WARNING";

  const getBadgeClass = () => {
    if (isWarning) return "verdict-warning";
    if (isBuy) return "verdict-buy";
    if (isHold) return "verdict-hold";
    return "verdict-sell";
  };

  return (
    <div className="consensus-section">
      <div className="consensus-grid">
        {/* Main Unified Decision Card */}
        <div className={`unified-decision-card glass-panel ${getBadgeClass()}`}>
          <div className="decision-header">
            <div className="decision-tagline">
              <Sparkles size={16} className="text-cyan" />
              <span>Unified Multi-Agent Decision Engine</span>
            </div>
            <div className="confidence-pill">
              <span>Consolidated Confidence:</span>
              <strong>{synthesis.consolidatedConfidence}%</strong>
            </div>
          </div>

          <div className="verdict-banner">
            <div className="verdict-left">
              <span className="verdict-label">Executive Recommendation</span>
              <h1 className="verdict-title">{synthesis.finalVerdict}</h1>
            </div>
            <div className="score-meter-box">
              <div className="score-number">{synthesis.weightedScore}</div>
              <div className="score-sub">Consensus Score / 100</div>
            </div>
          </div>

          <p className="verdict-summary">{synthesis.actionSummary}</p>

          {/* Pricing Guardrails */}
          <div className="price-targets-row">
            <div className="target-card">
              <span className="target-lbl">Current Reference Price</span>
              <span className="target-val">₹{synthesis.entryPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="target-card border-green">
              <span className="target-lbl">Dynamic Target Objective</span>
              <span className="target-val text-green">₹{synthesis.targetPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="target-card border-red">
              <span className="target-lbl">Guardrail Stop-Loss ({synthesis.riskProfile.stopLossPercent}%)</span>
              <span className="target-val text-red">₹{synthesis.stopLossPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Conflict Resolution Banner (If detected) */}
          {synthesis.conflictNotice && (
            <div className="conflict-banner">
              <div className="conflict-title">
                <AlertTriangle size={15} />
                <span>{synthesis.conflictNotice.type}: Transparent Agent Trade-Off</span>
              </div>
              <p className="conflict-desc">{synthesis.conflictNotice.description}</p>
              <p className="conflict-res"><strong>Resolution Policy:</strong> {synthesis.conflictNotice.resolution}</p>
            </div>
          )}
        </div>

        {/* Personalized Risk Profiler Card (Core MVP Feature) */}
        <div className="risk-profiler-card glass-panel">
          <div className="profiler-header">
            <div className="profiler-title-row">
              <UserCheck size={18} className="text-emerald" />
              <div>
                <h3 className="card-title">Personalized Investor Profiling</h3>
                <span className="card-subtitle">Identical market input produces tailored risk-weighted execution</span>
              </div>
            </div>
          </div>

          <div className="persona-selector">
            {Object.keys(RISK_PROFILES).map((key) => {
              const p = RISK_PROFILES[key];
              const isSelected = selectedRiskProfile === key;
              return (
                <div
                  key={key}
                  className={`persona-card ${isSelected ? "persona-selected" : ""}`}
                  onClick={() => onSelectRiskProfile(key)}
                >
                  <div className="persona-top">
                    <div className="persona-title-area">
                      {key === "CONSERVATIVE" && <Shield size={16} className="text-blue" />}
                      {key === "BALANCED" && <Scale size={16} className="text-emerald" />}
                      {key === "AGGRESSIVE" && <Flame size={16} className="text-purple" />}
                      <span className="persona-name">{p.name}</span>
                    </div>
                    {isSelected && <span className="active-tag"><CheckCircle2 size={12} /> Active</span>}
                  </div>
                  <p className="persona-desc">{p.description}</p>
                  <div className="persona-weights">
                    <span className="weight-item">Fund: {(p.weights.fundamental * 100).toFixed(0)}%</span>
                    <span className="weight-item">Tech: {(p.weights.technical * 100).toFixed(0)}%</span>
                    <span className="weight-item">Sent: {(p.weights.sentiment * 100).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="profiler-summary-box">
            <span className="current-profile-indicator">
              Active Guardrail: <strong>{synthesis.riskProfile.name}</strong> • Time Horizon: <strong>{synthesis.riskProfile.targetHorizon}</strong> • Stop Loss: <strong>-{synthesis.riskProfile.stopLossPercent}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
