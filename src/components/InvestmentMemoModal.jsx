import React, { useState } from "react";
import { X, Printer, Copy, Check, FileText } from "lucide-react";

const TODAY_DATE = new Date().toLocaleDateString("en-IN", { dateStyle: "long" });

export function InvestmentMemoModal({
  isOpen,
  onClose,
  stock,
  synthesis,
  technicalResult,
  fundamentalResult,
  sentimentResult,
  riskProfile
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const memoText = `
VIBEFINANCE AI — AUTONOMOUS INVESTMENT MEMORANDUM
Security: ${stock.name} (${stock.symbol}) | Sector: ${stock.sector}
Date of Evaluation: ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
Consensus Verdict: ${synthesis.verdict} (Bayesian Confidence: ${synthesis.confidenceScore}%)
Risk Profile: ${riskProfile} | Target Price: ₹${synthesis.targetPrice} | Hard Stop-Loss: ₹${synthesis.stopLossPrice}

1. TECHNICAL AGENT EVALUATION:
- 14-period RSI: ${technicalResult.rsi} (${technicalResult.momentumSignal})
- Moving Averages: ${stock.metrics.dma50} (50 DMA) vs ${stock.metrics.dma200} (200 DMA)
- Volume Anomaly Ratio: ${stock.metrics.volumeRatio}x 20-day median

2. FUNDAMENTAL RAG GROUNDING (SEBI LODR):
- Financial Health Score: ${fundamentalResult.financialHealthScore}/100
- Audited Excerpts Retrieved: ${fundamentalResult.citations ? fundamentalResult.citations.length : 0} filings
- Primary Regulation: SEBI (LODR) Regulations 30 & 33

3. SENTIMENT & FLOW DYNAMICS:
- Flow Direction: ${sentimentResult.flowDirection}
- Institutional Position: FII ${stock.fiiFlow} | DII ${stock.diiFlow}
- Options Put-Call Ratio (PCR): ${stock.pcr}

4. PERSONALIZED RISK GUARDRAILS:
- Max Capital Drawdown Cap: ${synthesis.stopLossPercent}%
- Recommended Position Sizing: ${synthesis.positionSizePercent}%

DISCLAIMER: Generated autonomously by VibeFinance AI Tri-Agent Architecture. Grounded in audited SEBI regulatory filings.
    `.trim();

    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window memo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge memo-badge">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="modal-title">Autonomous Investment Memorandum</h2>
              <p className="modal-subtitle">
                SEBI Document-Grounded Institutional Research Report for <strong>{stock.symbol}</strong>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body memo-body" id="printable-memo">
          <div className="memo-document">
            {/* Memorandum Header */}
            <div className="memo-doc-header">
              <div className="memo-brand-block">
                <span className="memo-brand-logo">VibeFinance AI</span>
                <span className="memo-doc-type">CONFIDENTIAL EQUITY INTELLIGENCE MEMORANDUM</span>
              </div>
              <div className="memo-meta-block">
                <span><strong>Date:</strong> {TODAY_DATE}</span>
                <span><strong>Security:</strong> {stock.name} ({stock.symbol})</span>
                <span><strong>Sector:</strong> {stock.sector} • NSE India</span>
              </div>
            </div>

            {/* Executive Verdict Banner */}
            <div className="memo-verdict-box">
              <div className="memo-verdict-left">
                <span className="memo-lbl">CONSENSUS VERDICT</span>
                <span className="memo-verdict-title">{synthesis.verdict}</span>
                <span className="memo-verdict-conf">Bayesian Swarm Confidence: {synthesis.confidenceScore}%</span>
              </div>
              <div className="memo-verdict-right">
                <div className="memo-price-target">
                  <span className="memo-lbl">Price Target</span>
                  <span className="memo-val text-emerald">₹{synthesis.targetPrice}</span>
                </div>
                <div className="memo-price-stop">
                  <span className="memo-lbl">Hard Stop Loss</span>
                  <span className="memo-val text-red">₹{synthesis.stopLossPrice} ({synthesis.stopLossPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Tri-Agent Analysis Breakdown */}
            <div className="memo-section">
              <h4 className="memo-sec-title">1. Quantitative Technical & Momentum Analysis</h4>
              <p className="memo-p">
                Technical Agent evaluates {stock.symbol} with a 14-period RSI of <strong>{technicalResult.rsi}</strong>, reflecting{" "}
                <strong>{technicalResult.momentumSignal}</strong> momentum. 50-day moving average is charted at ₹{stock.metrics.dma50} against the 200-day baseline of ₹{stock.metrics.dma200}. Daily volume shows a <strong>{stock.metrics.volumeRatio}x</strong> expansion against the 20-day median.
              </p>
            </div>

            <div className="memo-section">
              <h4 className="memo-sec-title">2. Fundamental Grounding & Audited SEBI Disclosures</h4>
              <p className="memo-p">
                Fundamental RAG Agent synthesized verified regulatory filings submitted under SEBI (LODR) Regulations 30 & 33. Financial Health Score stands at <strong>{fundamentalResult.financialHealthScore}/100</strong> with a P/E multiple of {stock.pe}x.
              </p>
              <div className="memo-citations-list">
                {fundamentalResult.citations && fundamentalResult.citations.map((c, i) => (
                  <div key={i} className="memo-citation-item">
                    <span className="memo-cite-id">{c.filingType} • {c.filingDate} [Chunk: {c.chunkId}]</span>
                    <span className="memo-cite-text">"{c.excerpt}"</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="memo-section">
              <h4 className="memo-sec-title">3. Market Sentiment & Institutional Flow Tracking</h4>
              <p className="memo-p">
                Sentiment & Flow Agent identifies net <strong>{sentimentResult.flowDirection}</strong> institutional flow. Options Put-Call Ratio (PCR) is positioned at <strong>{stock.pcr}</strong>. Institutional ledger logs net FII flow of <strong>{stock.fiiFlow}</strong> and DII absorption of <strong>{stock.diiFlow}</strong>.
              </p>
            </div>

            <div className="memo-section">
              <h4 className="memo-sec-title">4. Personalized Risk Profile Execution Parameters</h4>
              <p className="memo-p">
                Client Profile: <strong>{riskProfile}</strong>. Capital allocation is bounded at a maximum of{" "}
                <strong>{synthesis.positionSizePercent}%</strong> of active portfolio capital to prevent single-stock concentration risk.
              </p>
            </div>

            {/* SEBI Compliance Footnote */}
            <div className="memo-footer-disclaimer">
              <strong>Regulatory Notice:</strong> This document is generated autonomously via VibeFinance AI's multi-agent consensus architecture for informational and educational purposes pursuant to SEBI Research Analyst guidelines. All fundamental claims are grounded in verified LODR regulatory filings.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-secondary" onClick={handleCopy}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Markdown"}</span>
          </button>
          <button className="btn-modal-action" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
