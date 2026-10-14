import React from "react";
import { X, Layers, TrendingUp, ShieldCheck, Activity, ArrowRight } from "lucide-react";
import { STOCKS_DATA } from "../data/stocksData";
import { runTechnicalAgent } from "../agents/technicalAgent";
import { runFundamentalRAGAgent } from "../agents/fundamentalAgent";
import { runSentimentAgent } from "../agents/sentimentAgent";
import { synthesizeAgents } from "../agents/synthesisEngine";

export function SwarmScreenerModal({ isOpen, onClose, onSelectStock, currentRiskProfile }) {
  if (!isOpen) return null;

  const stocksList = Object.values(STOCKS_DATA);

  // Compute swarm metrics for each stock
  const swarmData = stocksList.map((stk) => {
    const tech = runTechnicalAgent(stk, false);
    const fund = runFundamentalRAGAgent(stk, false);
    const sent = runSentimentAgent(stk, false);
    const synth = synthesizeAgents({
      stock: stk,
      technicalResult: tech,
      fundamentalResult: fund,
      sentimentResult: sent,
      riskProfile: currentRiskProfile,
      isDegraded: false
    });

    return {
      stock: stk,
      tech,
      fund,
      sent,
      synth
    };
  });

  return (
    <div className="modal-backdrop modal-overlay" onClick={onClose}>
      <div className="modal-window modal-dialog screener-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="modal-title">Autonomous Swarm Screener & Matrix</h2>
              <p className="modal-subtitle">
                Side-by-side multi-agent evaluation calibrated to <strong>{currentRiskProfile}</strong> profile
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body screener-body">
          <div className="screener-table-wrap">
            <table className="screener-table">
              <thead>
                <tr>
                  <th>SECURITY / SECTOR</th>
                  <th>LTP (NSE)</th>
                  <th>TECHNICAL AGENT</th>
                  <th>FUNDAMENTAL RAG</th>
                  <th>SENTIMENT & FLOW</th>
                  <th>CONSENSUS VERDICT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {swarmData.map(({ stock, tech, fund, sent, synth }) => {
                  const isPositive = stock.change >= 0;
                  const isBuy = synth.verdictBadge === "BUY" || synth.verdictBadge === "STRONG_BUY";
                  const isHold = synth.verdictBadge === "HOLD";
                  const verdictColor = isBuy ? "#10b981" : isHold ? "#f59e0b" : "#ef4444";

                  return (
                    <tr key={stock.symbol}>
                      <td>
                        <div className="screener-sec-info">
                          <span className="screener-sym">{stock.symbol}</span>
                          <span className="screener-name">{stock.name}</span>
                          <span className="screener-sector">{stock.sector}</span>
                        </div>
                      </td>
                      <td>
                        <div className="screener-price-info">
                          <span className="screener-ltp">₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          <span className={`screener-chg ${isPositive ? "pos" : "neg"}`}>
                            {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent}%)
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="screener-agent-pill tech">
                          <Activity size={12} />
                          <span>RSI {tech.metrics.rsi} • {tech.signal.replace(/_/g, " ")}</span>
                        </div>
                      </td>
                      <td>
                        <div className="screener-agent-pill fund">
                          <ShieldCheck size={12} />
                          <span>P/E {stock.peRatio}x • {fund.signal.replace(/_/g, " ")}</span>
                        </div>
                      </td>
                      <td>
                        <div className="screener-agent-pill sent">
                          <TrendingUp size={12} />
                          <span>PCR {sent.metrics.pcrRatio} • {sent.signal.replace(/_/g, " ")}</span>
                        </div>
                      </td>
                      <td>
                        <div className="screener-verdict-wrap">
                          <span
                            className="screener-verdict-tag"
                            style={{
                              backgroundColor: `${verdictColor}18`,
                              color: verdictColor,
                              borderColor: `${verdictColor}40`
                            }}
                          >
                            {synth.finalVerdict}
                          </span>
                          <span className="screener-conf">Conf: {Math.round(synth.consolidatedConfidence * 100)}%</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn-inspect-security"
                          onClick={() => {
                            onSelectStock(stock.symbol);
                            onClose();
                          }}
                        >
                          <span>Analyze</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer screener-footer">
          <div className="screener-footer-left">
            <span>Arbitrated across 3 parallel agents per security • Sub-second latency</span>
          </div>
          <button className="btn-modal-action" onClick={onClose}>
            Close Screener
          </button>
        </div>
      </div>
    </div>
  );
}
