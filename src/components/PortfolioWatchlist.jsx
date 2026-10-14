import React, { useState } from "react";
import { Briefcase, Bell, Plus, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, PieChart, Shield, AlertTriangle } from "lucide-react";

export function PortfolioWatchlist({ onSelectStock, currentRiskProfile }) {
  const [activeTab, setActiveTab] = useState("PORTFOLIO"); // PORTFOLIO | WATCHLIST

  // Simulated Live Portfolio Holdings
  const [holdings, setHoldings] = useState([
    { symbol: "RELIANCE", name: "Reliance Industries", shares: 80, avgPrice: 2810.0, currentPrice: 2940.5, sector: "Energy & Conglomerate" },
    { symbol: "INFY", name: "Infosys Ltd", shares: 150, avgPrice: 1720.0, currentPrice: 1895.0, sector: "Information Technology" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", shares: 120, avgPrice: 1680.0, currentPrice: 1642.0, sector: "Banking & Financials" },
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd", shares: 140, avgPrice: 910.0, currentPrice: 965.8, sector: "Automobile & EV" },
  ]);

  // Simulated Watchlist with dynamic alerts
  const [watchlist, setWatchlist] = useState([
    { symbol: "RELIANCE", alertCondition: "RSI > 68 (Momentum Breakout)", status: "TRIGGERED", color: "#10b981" },
    { symbol: "INFY", alertCondition: "SEBI Q3 Earnings Margin > 21%", status: "ACTIVE", color: "#06b6d4" },
    { symbol: "HDFCBANK", alertCondition: "NIM Compression Warning", status: "MONITORING", color: "#f59e0b" },
    { symbol: "TATAMOTORS", alertCondition: "Trailing Stop-Loss -2.5%", status: "PROTECTED", color: "#8b5cf6" },
  ]);

  // Calculate Portfolio Totals
  const totalInvested = holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);
  const currentTotalValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
  const totalUnrealizedPnL = currentTotalValue - totalInvested;
  const totalPnLPercent = ((totalUnrealizedPnL / totalInvested) * 100).toFixed(2);
  const isOverallProfit = totalUnrealizedPnL >= 0;

  // Concentration metrics
  const maxStockAllocation = Math.max(...holdings.map((h) => (h.shares * h.currentPrice) / currentTotalValue)) * 100;
  const portfolioBeta = 1.06;

  return (
    <div className="portfolio-watchlist-container glass-panel">
      {/* Tab Switcher Header */}
      <div className="pw-header">
        <div className="pw-tabs">
          <button
            className={`pw-tab-btn ${activeTab === "PORTFOLIO" ? "active" : ""}`}
            onClick={() => setActiveTab("PORTFOLIO")}
          >
            <Briefcase size={15} />
            <span>Active Portfolio Holdings</span>
            <span className="pw-count-pill">{holdings.length}</span>
          </button>
          <button
            className={`pw-tab-btn ${activeTab === "WATCHLIST" ? "active" : ""}`}
            onClick={() => setActiveTab("WATCHLIST")}
          >
            <Bell size={15} />
            <span>Multi-Agent Watchlist & Alerts</span>
            <span className="pw-count-pill alert">{watchlist.length}</span>
          </button>
        </div>

        <div className="pw-header-meta">
          <span className="pw-risk-badge">
            <Shield size={12} />
            Profile Guardrail: <strong>{currentRiskProfile}</strong>
          </span>
        </div>
      </div>

      {activeTab === "PORTFOLIO" ? (
        <div className="portfolio-view">
          {/* Portfolio Metrics Overview Strip */}
          <div className="portfolio-summary-bar">
            <div className="ps-stat">
              <span className="ps-lbl">PORTFOLIO VALUATION</span>
              <span className="ps-val">₹{Math.round(currentTotalValue).toLocaleString("en-IN")}</span>
              <span className="ps-sub">Invested: ₹{Math.round(totalInvested).toLocaleString("en-IN")}</span>
            </div>

            <div className="ps-stat">
              <span className="ps-lbl">UNREALIZED P&L</span>
              <span className={`ps-val ${isOverallProfit ? "text-emerald" : "text-red"}`}>
                {isOverallProfit ? "+" : ""}₹{Math.round(totalUnrealizedPnL).toLocaleString("en-IN")} ({totalPnLPercent}%)
              </span>
              <span className="ps-sub">30-Day Forward Trajectory</span>
            </div>

            <div className="ps-stat">
              <span className="ps-lbl">PORTFOLIO BETA</span>
              <span className="ps-val text-cyan">{portfolioBeta}</span>
              <span className="ps-sub">Market Sensitivity: Moderate</span>
            </div>

            <div className="ps-stat">
              <span className="ps-lbl">MAX ASSET CONCENTRATION</span>
              <span className={`ps-val ${maxStockAllocation > 35 ? "text-amber" : "text-emerald"}`}>
                {maxStockAllocation.toFixed(1)}%
              </span>
              <span className="ps-sub">
                {maxStockAllocation > 35 ? "⚠️ High Single-Stock Exposure" : "✓ Diversified Allocation"}
              </span>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="holdings-table-wrap">
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>ASSET</th>
                  <th>QUANTITY</th>
                  <th>AVG BUY</th>
                  <th>LTP (NSE)</th>
                  <th>CURRENT VAL</th>
                  <th>P&L</th>
                  <th>SWARM ACTION</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const val = h.shares * h.currentPrice;
                  const pnl = val - h.shares * h.avgPrice;
                  const pnlPct = ((pnl / (h.shares * h.avgPrice)) * 100).toFixed(2);
                  const isPos = pnl >= 0;

                  return (
                    <tr key={h.symbol}>
                      <td>
                        <div className="holding-sym-wrap">
                          <span className="holding-sym">{h.symbol}</span>
                          <span className="holding-sec">{h.sector}</span>
                        </div>
                      </td>
                      <td className="mono">{h.shares} Shares</td>
                      <td className="mono">₹{h.avgPrice.toFixed(1)}</td>
                      <td className="mono font-bold">₹{h.currentPrice.toFixed(1)}</td>
                      <td className="mono">₹{Math.round(val).toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`holding-pnl ${isPos ? "pos" : "neg"}`}>
                          {isPos ? "+" : ""}₹{Math.round(pnl).toLocaleString("en-IN")} ({isPos ? "+" : ""}{pnlPct}%)
                        </span>
                      </td>
                      <td>
                        <button className="btn-holding-agent" onClick={() => onSelectStock(h.symbol)}>
                          <span>Dispatch Agents</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Watchlist View with Live Signals */
        <div className="watchlist-view">
          <div className="watchlist-grid">
            {watchlist.map((w) => (
              <div key={w.symbol} className="watchlist-card">
                <div className="wl-header">
                  <span className="wl-symbol">{w.symbol}</span>
                  <span className="wl-status-tag" style={{ color: w.color, borderColor: `${w.color}50` }}>
                    {w.status}
                  </span>
                </div>
                <div className="wl-condition">
                  <Bell size={13} color={w.color} />
                  <span>{w.alertCondition}</span>
                </div>
                <div className="wl-footer">
                  <button className="btn-wl-inspect" onClick={() => onSelectStock(w.symbol)}>
                    <span>Run Tri-Agent Synthesis</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
