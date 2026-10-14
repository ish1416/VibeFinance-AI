import React, { useState } from "react";
import { BarChart3 } from "lucide-react";

export function CandlestickChart({ stock }) {
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [activeIndicator, setActiveIndicator] = useState("ALL"); // ALL, RSI, MACD
  const candles = stock.candles || [];

  // Dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 60, bottom: 40, left: 20 };

  // Price range calculation
  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...allPrices) * 0.99;
  const maxPrice = Math.max(...allPrices) * 1.01;
  const priceRange = maxPrice - minPrice;

  // Volume range calculation
  const maxVol = Math.max(...candles.map((c) => c.volume));

  // Coordinates helper
  const getX = (index) => {
    const usableWidth = width - padding.left - padding.right;
    const step = usableWidth / candles.length;
    return padding.left + index * step + step / 2;
  };

  const getY = (price) => {
    const usableHeight = height - padding.top - padding.bottom;
    return padding.top + usableHeight - ((price - minPrice) / priceRange) * usableHeight;
  };

  const candleWidth = Math.max(14, (width - padding.left - padding.right) / candles.length - 12);

  return (
    <div className="chart-card glass-panel">
      <div className="chart-header">
        <div className="chart-title-group">
          <div className="chart-icon">
            <BarChart3 size={18} />
          </div>
          <div>
            <h2 className="chart-heading">{stock.symbol} Price Action & Indicators</h2>
            <span className="chart-subheading">Daily Candlesticks • 50/200 DMA • Volume Anomaly Overlay</span>
          </div>
        </div>

        <div className="chart-controls">
          <span className="indicator-legend dma-50">50-DMA: ₹{stock.technicalMetrics.dma50}</span>
          <span className="indicator-legend dma-200">200-DMA: ₹{stock.technicalMetrics.dma200}</span>
          <div className="filter-pill-group">
            <button
              className={`filter-btn ${activeIndicator === "ALL" ? "active" : ""}`}
              onClick={() => setActiveIndicator("ALL")}
            >
              All Indicators
            </button>
            <button
              className={`filter-btn ${activeIndicator === "RSI" ? "active" : ""}`}
              onClick={() => setActiveIndicator("RSI")}
            >
              RSI (14)
            </button>
            <button
              className={`filter-btn ${activeIndicator === "MACD" ? "active" : ""}`}
              onClick={() => setActiveIndicator("MACD")}
            >
              MACD
            </button>
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      <div className="chart-tooltip-bar">
        {hoveredCandle ? (
          <div className="tooltip-content">
            <span className="tt-item"><strong>Date:</strong> {hoveredCandle.date}</span>
            <span className="tt-item"><strong>Open:</strong> ₹{hoveredCandle.open}</span>
            <span className="tt-item"><strong>High:</strong> ₹{hoveredCandle.high}</span>
            <span className="tt-item"><strong>Low:</strong> ₹{hoveredCandle.low}</span>
            <span className="tt-item"><strong>Close:</strong> ₹{hoveredCandle.close}</span>
            <span className="tt-item"><strong>Vol:</strong> {hoveredCandle.volume}M shares</span>
          </div>
        ) : (
          <div className="tooltip-hint">
            <span>Hover over any candle to inspect open/high/low/close and volume levels</span>
          </div>
        )}
      </div>

      {/* SVG Chart Rendering */}
      <div className="svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="main-svg-chart">
          <defs>
            <linearGradient id="volGradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="volGradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct, idx) => {
            const yVal = padding.top + (height - padding.top - padding.bottom) * pct;
            const priceVal = Math.round(maxPrice - pct * priceRange);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={yVal}
                  x2={width - padding.right}
                  y2={yVal}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={width - padding.right + 8}
                  y={yVal + 4}
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  ₹{priceVal}
                </text>
              </g>
            );
          })}

          {/* Volume bars at bottom */}
          {candles.map((candle, i) => {
            const x = getX(i);
            const isGreen = candle.close >= candle.open;
            const volHeight = (candle.volume / maxVol) * 60;
            const yVol = height - padding.bottom - volHeight;
            return (
              <rect
                key={`vol-${i}`}
                x={x - candleWidth / 2}
                y={yVol}
                width={candleWidth}
                height={volHeight}
                fill={isGreen ? "url(#volGradGreen)" : "url(#volGradRed)"}
                stroke={isGreen ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.6)"}
                rx="2"
              />
            );
          })}

          {/* 50-DMA trendline (interpolated approximation) */}
          <path
            d={candles
              .map((c, i) => {
                const x = getX(i);
                // slight curve near dma
                const y = getY(c.close * 0.985);
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Candlesticks (Wick + Body) */}
          {candles.map((candle, i) => {
            const x = getX(i);
            const isGreen = candle.close >= candle.open;
            const yOpen = getY(candle.open);
            const yClose = getY(candle.close);
            const yHigh = getY(candle.high);
            const yLow = getY(candle.low);
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(3, Math.abs(yClose - yOpen));

            return (
              <g
                key={`candle-${i}`}
                className="candle-node"
                onMouseEnter={() => setHoveredCandle(candle)}
                onMouseLeave={() => setHoveredCandle(null)}
              >
                {/* Wick line */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={isGreen ? "#10b981" : "#ef4444"}
                  strokeWidth="1.5"
                />
                {/* Body rect */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isGreen ? "#10b981" : "#ef4444"}
                  stroke={isGreen ? "#34d399" : "#f87171"}
                  strokeWidth="1"
                  rx="2"
                />
                {/* X-axis date labels */}
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  fill="rgba(255, 255, 255, 0.5)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                >
                  {candle.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Subplot Indicator Banner */}
      <div className="indicators-footer">
        <div className="ind-box">
          <span className="ind-name">RSI (14-Period):</span>
          <span className="ind-val text-green">{stock.technicalMetrics.rsi14}</span>
          <span className="ind-desc">{stock.technicalMetrics.rsiSignal}</span>
        </div>
        <div className="ind-box">
          <span className="ind-name">MACD (12, 26, 9):</span>
          <span className="ind-val text-cyan">+{stock.technicalMetrics.macd.histogram}</span>
          <span className="ind-desc">{stock.technicalMetrics.macd.status}</span>
        </div>
        <div className="ind-box">
          <span className="ind-name">Bollinger Band (20, 2):</span>
          <span className="ind-val">{(stock.technicalMetrics.bollingerBands.percentile * 100).toFixed(0)}%</span>
          <span className="ind-desc">Upper: ₹{stock.technicalMetrics.bollingerBands.upper}</span>
        </div>
      </div>
    </div>
  );
}
