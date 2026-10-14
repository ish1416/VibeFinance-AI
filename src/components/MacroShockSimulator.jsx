import React, { useState } from "react";
import { Zap, AlertCircle, TrendingDown, Flame, DollarSign, RefreshCw } from "lucide-react";

const MACRO_SCENARIOS = {
  BASELINE: {
    id: "BASELINE",
    title: "Standard Market Baseline",
    badge: "Neutral Regime",
    icon: RefreshCw,
    color: "#06b6d4",
    impactText: "NSE operating under standard macroeconomic conditions. RBI Repo rate stable at 6.50%, Brent crude at $78/bbl.",
    targetAdjustment: 0,
    stopLossAdjustment: 0,
    hedgeRecommendation: "Standard risk-to-reward guardrails active. No macro overlay required."
  },
  RBI_RATE_HIKE: {
    id: "RBI_RATE_HIKE",
    title: "RBI Unexpected +50 bps Rate Hike",
    badge: "Monetary Tightening",
    icon: TrendingDown,
    color: "#f59e0b",
    impactText: "RBI MPC surprises with +50 bps hike to combat food inflation. Banking cost of funds surges, auto lending slows.",
    targetAdjustment: -3.2,
    stopLossAdjustment: -1.8,
    hedgeRecommendation: "Tighten trailing stop-loss by 1.8%. Reduce capital allocation to rate-sensitive financials by 15%."
  },
  CRUDE_OIL_SPIKE: {
    id: "CRUDE_OIL_SPIKE",
    title: "Brent Crude Spike to $105/bbl",
    badge: "Geopolitical Shock",
    icon: Flame,
    color: "#ef4444",
    impactText: "Middle Eastern shipping bottlenecks trigger sudden oil rally. Indian CAD widens, refining margin volatility jumps.",
    targetAdjustment: -2.5,
    stopLossAdjustment: -2.2,
    hedgeRecommendation: "Hedge energy exposure with OTM Nifty Put spreads. Rotate 20% into defensive IT & FMCG holdings."
  },
  FII_FLIGHT: {
    id: "FII_FLIGHT",
    title: "Global Tech Selloff / FII Outflow",
    badge: "Liquidity Crunch",
    icon: DollarSign,
    color: "#ec4899",
    impactText: "US 10-year yield surges above 4.75%, prompting institutional FII liquidation of ₹12,500 Cr across emerging markets.",
    targetAdjustment: -4.0,
    stopLossAdjustment: -2.5,
    hedgeRecommendation: "Downgrade speculative breakouts. Enforce mandatory -2.5% stop-loss floor and raise cash reserves to 25%."
  }
};

export function MacroShockSimulator({ activeScenario, onSelectScenario, _stock, synthesis, isAlwaysOpen = false }) {
  const [isOpen, setIsOpen] = useState(isAlwaysOpen);
  const currentScenario = MACRO_SCENARIOS[activeScenario] || MACRO_SCENARIOS.BASELINE;

  const adjustedTarget = (synthesis.targetPrice * (1 + currentScenario.targetAdjustment / 100)).toFixed(1);
  const adjustedStop = (synthesis.stopLossPrice * (1 + currentScenario.stopLossAdjustment / 100)).toFixed(1);

  return (
    <div className="macro-shock-section">
      <div className="macro-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="macro-header-left">
          <div className="macro-badge-pill" style={{ borderColor: currentScenario.color }}>
            <Zap size={14} color={currentScenario.color} />
            <span>Macro Stress-Testing Engine</span>
          </div>
          <span className="macro-active-name">
            Active Regime: <strong>{currentScenario.title}</strong>
          </span>
        </div>
        <div className="macro-header-right">
          <span className="macro-toggle-btn">{isOpen ? "Hide Stress Test ▲" : "Simulate Macro Shock ▼"}</span>
        </div>
      </div>

      {isOpen && (
        <div className="macro-body">
          <div className="macro-tabs">
            {Object.values(MACRO_SCENARIOS).map((sc) => {
              const Icon = sc.icon;
              const isSelected = sc.id === activeScenario;
              return (
                <button
                  key={sc.id}
                  className={`macro-tab-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectScenario(sc.id)}
                  style={{ borderColor: isSelected ? sc.color : "transparent" }}
                >
                  <Icon size={14} color={sc.color} />
                  <span>{sc.badge}</span>
                </button>
              );
            })}
          </div>

          <div className="macro-results-grid">
            <div className="macro-card macro-narrative">
              <span className="card-kicker">SCENARIO IMPACT DEDUCTION</span>
              <p className="scenario-desc">{currentScenario.impactText}</p>
              <div className="macro-hedge-box">
                <AlertCircle size={15} color={currentScenario.color} />
                <span>
                  <strong>Autonomous Hedge:</strong> {currentScenario.hedgeRecommendation}
                </span>
              </div>
            </div>

            <div className="macro-card macro-metrics">
              <span className="card-kicker">STRESS-ADJUSTED GUARDRAILS</span>
              <div className="stress-metrics-row">
                <div className="stress-metric">
                  <span className="stress-lbl">Original Target</span>
                  <span className="stress-val">₹{synthesis.targetPrice}</span>
                </div>
                <div className="stress-arrow">→</div>
                <div className="stress-metric highlight">
                  <span className="stress-lbl">Stress Target</span>
                  <span className="stress-val" style={{ color: currentScenario.color }}>
                    ₹{adjustedTarget} ({currentScenario.targetAdjustment > 0 ? "+" : ""}
                    {currentScenario.targetAdjustment}%)
                  </span>
                </div>
              </div>

              <div className="stress-metrics-row">
                <div className="stress-metric">
                  <span className="stress-lbl">Base Stop-Loss</span>
                  <span className="stress-val">₹{synthesis.stopLossPrice}</span>
                </div>
                <div className="stress-arrow">→</div>
                <div className="stress-metric highlight">
                  <span className="stress-lbl">Tighter Stop-Loss</span>
                  <span className="stress-val" style={{ color: "#ef4444" }}>
                    ₹{adjustedStop} ({currentScenario.stopLossAdjustment}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
