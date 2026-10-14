import React from "react";
import { TrendingUp, TrendingDown, Layers, RefreshCw } from "lucide-react";
import { STOCKS_DATA } from "../data/stocksData";

export function StockHeader({ currentStock, onSelectStock, onRefreshAgents, isAnalyzing }) {
  const isPositive = currentStock.change >= 0;

  return (
    <div className="stock-header glass-panel">
      <div className="stock-selector-group">
        <label className="selector-label">
          <Layers size={14} /> Active Security (NSE)
        </label>
        <div className="stock-buttons">
          {Object.keys(STOCKS_DATA).map((sym) => {
            const stk = STOCKS_DATA[sym];
            const active = stk.symbol === currentStock.symbol;
            return (
              <button
                key={sym}
                className={`stock-pill ${active ? "active-stock" : ""}`}
                onClick={() => onSelectStock(sym)}
              >
                <span className="pill-symbol">{stk.symbol}</span>
                <span className={`pill-price ${stk.change >= 0 ? "text-green" : "text-red"}`}>
                  ₹{stk.price.toLocaleString("en-IN")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stock-metrics-summary">
        <div className="metric-box main-price-box">
          <div className="company-info">
            <h1 className="stock-name">{currentStock.name}</h1>
            <span className="sector-tag">{currentStock.sector}</span>
          </div>
          <div className="price-row">
            <span className="current-price">₹{currentStock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className={`price-change-tag ${isPositive ? "badge-green" : "badge-red"}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isPositive ? "+" : ""}{currentStock.change.toFixed(2)} ({isPositive ? "+" : ""}{currentStock.changePercent}%)
            </span>
          </div>
        </div>

        <div className="metric-grid">
          <div className="sub-metric">
            <span className="metric-lbl">Day High / Low</span>
            <span className="metric-val">₹{currentStock.dayHigh} / ₹{currentStock.dayLow}</span>
          </div>
          <div className="sub-metric">
            <span className="metric-lbl">Market Cap</span>
            <span className="metric-val">{currentStock.marketCap}</span>
          </div>
          <div className="sub-metric">
            <span className="metric-lbl">P/E Ratio</span>
            <span className="metric-val">{currentStock.peRatio}x</span>
          </div>
          <div className="sub-metric">
            <span className="metric-lbl">Volume vs 20d Avg</span>
            <span className="metric-val text-cyan">{currentStock.volumeSurgeRatio}x Surge</span>
          </div>
          <div className="sub-metric">
            <span className="metric-lbl">Beta</span>
            <span className="metric-val">{currentStock.beta}</span>
          </div>
        </div>

        <button
          className={`btn-refresh-agents ${isAnalyzing ? "rotating" : ""}`}
          onClick={onRefreshAgents}
          disabled={isAnalyzing}
          title="Trigger parallel multi-agent re-evaluation across all 3 agents"
        >
          <RefreshCw size={15} />
          <span>{isAnalyzing ? "Analyzing..." : "Re-Run Swarm"}</span>
        </button>
      </div>
    </div>
  );
}
