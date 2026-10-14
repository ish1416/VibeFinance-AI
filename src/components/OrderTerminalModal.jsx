import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle2, ArrowUpRight } from "lucide-react";

export function OrderTerminalModal({ isOpen, onClose, stock, synthesis, riskProfile }) {
  const [portfolioCapital, setPortfolioCapital] = useState(500000);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  if (!isOpen) return null;

  // Capital allocation % according to risk persona
  const allocationPercent = riskProfile === "CONSERVATIVE" ? 10 : riskProfile === "AGGRESSIVE" ? 30 : 20;
  const maxCapitalForStock = (portfolioCapital * (allocationPercent / 100));
  const suggestedQuantity = Math.floor(maxCapitalForStock / stock.currentPrice);
  const totalInvestment = (suggestedQuantity * stock.currentPrice).toFixed(2);

  const priceDiffTarget = synthesis.targetPrice - stock.currentPrice;
  const priceDiffStop = stock.currentPrice - synthesis.stopLossPrice;
  const potentialProfit = (suggestedQuantity * priceDiffTarget).toFixed(2);
  const maxRiskLoss = (suggestedQuantity * priceDiffStop).toFixed(2);
  const riskRewardRatio = priceDiffStop > 0 ? (priceDiffTarget / priceDiffStop).toFixed(2) : "N/A";

  const handlePlaceOrder = () => {
    const orderId = `VIBE-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderReceipt({
      orderId,
      symbol: stock.symbol,
      quantity: suggestedQuantity,
      price: stock.currentPrice,
      target: synthesis.targetPrice,
      stopLoss: synthesis.stopLossPrice,
      totalInvestment,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    });
    setOrderPlaced(true);
  };

  const handleReset = () => {
    setOrderPlaced(false);
    setOrderReceipt(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge order-badge">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="modal-title">Guardrailed Paper Execution Terminal</h2>
              <p className="modal-subtitle">
                Automated Bracket Order with <strong>{riskProfile}</strong> Risk Management Floor
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body order-body">
          {!orderPlaced ? (
            <>
              {/* Portfolio Capital Configurator */}
              <div className="terminal-section">
                <div className="section-label-row">
                  <span className="terminal-lbl">Total Trading Capital</span>
                  <span className="terminal-val">₹{Number(portfolioCapital).toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="5000000"
                  step="25000"
                  value={portfolioCapital}
                  onChange={(e) => setPortfolioCapital(Number(e.target.value))}
                  className="capital-slider"
                />
                <div className="slider-hints">
                  <span>₹50K (Retail Starter)</span>
                  <span>₹10L (Active Trader)</span>
                  <span>₹50L (HNI)</span>
                </div>
              </div>

              {/* Guardrailed Allocation & Sizing Matrix */}
              <div className="order-metrics-grid">
                <div className="order-metric-card">
                  <span className="om-lbl">Capital Cap ({allocationPercent}%)</span>
                  <span className="om-val">₹{Math.round(maxCapitalForStock).toLocaleString("en-IN")}</span>
                  <span className="om-sub">{riskProfile} Profile Limit</span>
                </div>

                <div className="order-metric-card highlight">
                  <span className="om-lbl">Guardrailed Sizing</span>
                  <span className="om-val">{suggestedQuantity} Shares</span>
                  <span className="om-sub">₹{Number(totalInvestment).toLocaleString("en-IN")} Total</span>
                </div>

                <div className="order-metric-card">
                  <span className="om-lbl">Risk-to-Reward</span>
                  <span className="om-val text-cyan">1 : {riskRewardRatio}</span>
                  <span className="om-sub">Mathematical Asymmetry</span>
                </div>

                <div className="order-metric-card">
                  <span className="om-lbl">Max Drawdown Risk</span>
                  <span className="om-val text-red">-₹{Number(maxRiskLoss).toLocaleString("en-IN")}</span>
                  <span className="om-sub">Hard Stop-Loss Floor</span>
                </div>
              </div>

              {/* Bracket Order Structure Details */}
              <div className="bracket-order-box">
                <div className="bracket-title">SEBI COMPLIANT 3-LEGGED BRACKET TICKET</div>
                <div className="bracket-legs">
                  <div className="bracket-leg entry">
                    <span className="leg-tag">LEG 1: LIMIT ENTRY</span>
                    <span className="leg-val">₹{stock.currentPrice}</span>
                    <span className="leg-sub">At Market LTP</span>
                  </div>
                  <div className="bracket-leg target">
                    <span className="leg-tag">LEG 2: TAKE PROFIT</span>
                    <span className="leg-val text-emerald">₹{synthesis.targetPrice}</span>
                    <span className="leg-sub">+{potentialProfit > 0 ? Number(potentialProfit).toLocaleString("en-IN") : 0} Gain</span>
                  </div>
                  <div className="bracket-leg stop">
                    <span className="leg-tag">LEG 3: HARD STOP-LOSS</span>
                    <span className="leg-val text-red">₹{synthesis.stopLossPrice}</span>
                    <span className="leg-sub">{synthesis.stopLossPercent}% Trailing Floor</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Order Placed Success Receipt */
            <div className="order-success-screen">
              <div className="success-icon-wrap">
                <CheckCircle2 size={48} color="#10b981" />
              </div>
              <h3 className="success-title">Paper Trade Order Dispatched!</h3>
              <p className="success-desc">
                Your guardrailed bracket order for <strong>{orderReceipt.quantity} shares of {orderReceipt.symbol}</strong> has been logged to the execution emulator.
              </p>

              <div className="receipt-box">
                <div className="receipt-row">
                  <span>Order Reference</span>
                  <strong className="mono">{orderReceipt.orderId}</strong>
                </div>
                <div className="receipt-row">
                  <span>Execution Price</span>
                  <strong className="mono">₹{orderReceipt.price}</strong>
                </div>
                <div className="receipt-row">
                  <span>Total Capital Committed</span>
                  <strong className="mono">₹{Number(orderReceipt.totalInvestment).toLocaleString("en-IN")}</strong>
                </div>
                <div className="receipt-row">
                  <span>Active Take Profit</span>
                  <strong className="mono text-emerald">₹{orderReceipt.target}</strong>
                </div>
                <div className="receipt-row">
                  <span>Active Stop Loss</span>
                  <strong className="mono text-red">₹{orderReceipt.stopLoss}</strong>
                </div>
                <div className="receipt-row">
                  <span>Execution Timestamp</span>
                  <strong className="mono">{orderReceipt.timestamp} IST</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!orderPlaced ? (
            <>
              <button className="btn-modal-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-place-order" onClick={handlePlaceOrder}>
                <span>Dispatch Guardrailed Order</span>
                <ArrowUpRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-modal-secondary" onClick={handleReset}>
                New Order
              </button>
              <button className="btn-modal-action" onClick={onClose}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
