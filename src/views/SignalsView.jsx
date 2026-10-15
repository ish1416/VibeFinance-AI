import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SegmentedTabs } from "../components/ui/SegmentedTabs";
import { StatCard } from "../components/ui/StatCard";
import { Pill } from "../components/ui/Pill";
import { inr, pct } from "../domain/finance";

const W = 820;
const H = 300;
const PAD = { left: 12, right: 62, top: 14 };
const PRICE_BOTTOM = 196;
const VOL_TOP = 214;
const VOL_BOTTOM = 262;

const INDICATOR_TABS = [
  { id: "ALL", label: "All indicators" },
  { id: "RSI", label: "RSI (14)" },
  { id: "MACD", label: "MACD" },
  { id: "VOL", label: "Volume" }
];

/** Honest chart: candles from the snapshot, volume in its own band, DMA drawn as a level (not a fabricated series). */
function CandleChart({ stock, onHover, emphasis }) {
  const candles = stock.candles || [];
  if (candles.length === 0) return null;

  const t = stock.technicalMetrics;
  const allPrices = [...candles.flatMap((c) => [c.high, c.low]), t.dma50, t.dma200];
  const min = Math.min(...allPrices) * 0.995;
  const max = Math.max(...allPrices) * 1.005;
  const span = max - min || 1;
  const innerW = W - PAD.left - PAD.right;
  const step = innerW / candles.length;
  const y = (p) => PAD.top + (max - p) / span * (PRICE_BOTTOM - PAD.top);
  const maxVol = Math.max(...candles.map((c) => c.volume));

  return (
    <svg className="vf-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${stock.symbol} daily candlestick chart with volume`}>
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const price = max - f * span;
        const yy = y(price);
        return (
          <g key={f}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yy} y2={yy} stroke="var(--vf-hairline)" strokeDasharray="4 4" />
            <text x={W - PAD.right + 6} y={yy + 3} fontSize="10" fill="var(--vf-text-2)">₹{Math.round(price)}</text>
          </g>
        );
      })}

      {/* DMA levels, labelled as levels */}
      {[
        { level: t.dma50, label: "50-DMA", color: "var(--vf-p-blue)" },
        { level: t.dma200, label: "200-DMA", color: "var(--vf-p-lilac)" }
      ].map((d) => (
        <g key={d.label}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(d.level)} y2={y(d.level)} stroke={d.color} strokeWidth="2" />
          <text x={PAD.left + 4} y={y(d.level) - 4} fontSize="9" fill="var(--vf-text-2)">{d.label} ₹{d.level}</text>
        </g>
      ))}

      {candles.map((c, i) => {
        const x = PAD.left + i * step;
        const cx = x + step / 2;
        const cw = Math.max(8, Math.min(24, step * 0.5));
        const up = c.close >= c.open;
        const color = up ? "var(--vf-p-green)" : "var(--vf-pink)";
        const stroke = up ? "#1f6b2a" : "var(--vf-bad-ink)";
        const bodyTop = y(Math.max(c.open, c.close));
        const bodyBottom = y(Math.min(c.open, c.close));
        const volH = maxVol > 0 ? (c.volume / maxVol) * (VOL_BOTTOM - VOL_TOP) : 0;

        return (
          <g key={c.date} onMouseEnter={() => onHover?.(c)} onMouseLeave={() => onHover?.(null)} className="vf-chart__candle">
            <rect x={x} y={PAD.top} width={step} height={VOL_BOTTOM - PAD.top} fill="transparent" />
            <line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={stroke} strokeWidth="1.25" />
            <rect x={cx - cw / 2} y={bodyTop} width={cw} height={Math.max(2, bodyBottom - bodyTop)} fill={color} stroke={stroke} strokeWidth="1" rx="3" />
            <rect
              x={cx - cw / 2}
              y={VOL_BOTTOM - volH}
              width={cw}
              height={volH}
              rx="2"
              fill={up ? "var(--vf-p-green)" : "var(--vf-p-pink)"}
              opacity={emphasis === "VOL" || emphasis === "ALL" ? 0.95 : 0.35}
            />
            <text x={cx} y={VOL_BOTTOM + 16} fontSize="10" fill="var(--vf-text-2)" textAnchor="middle">{c.date}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function SignalsView({ stock, analysis }) {
  const [active, setActive] = useState("ALL");
  const [hovered, setHovered] = useState(null);
  const t = stock.technicalMetrics;
  const held = analysis.portfolio.positions.find((p) => p.symbol === stock.symbol);

  return (
    <div className="vf-stack">
      <div className="vf-statrow">
        <StatCard
          value={t.rsi14}
          label={`RSI (14) · ${t.rsiSignal}`}
          tone={active === "RSI" ? "blue" : "plain"}
          dashed={active !== "RSI"}
        />
        <StatCard
          value={t.macd.histogram > 0 ? `+${t.macd.histogram}` : t.macd.histogram}
          label={`MACD histogram · ${t.macd.status}`}
          tone={active === "MACD" ? "green" : "plain"}
          dashed={active !== "MACD"}
        />
        <StatCard value={`${stock.volumeSurgeRatio}×`} label="Volume vs 20-day median" tone="yellow" deco="📈" />
        <StatCard
          value={`${Math.round(t.bollingerBands.percentile * 100)}%`}
          label="Bollinger %B position"
          tone="blue"
        />
      </div>

      <SectionHeader
        label={`${stock.name} price action`}
        count={stock.candles.length}
        action={<SegmentedTabs items={INDICATOR_TABS} value={active} onChange={setActive} label="Indicator emphasis" />}
      />

      <div className="vf-chartwrap">
        <div className="vf-chart-tooltip">
          {hovered ? (
            <>
              <span><strong>{hovered.date}</strong></span>
              <span>O {inr(hovered.open, { decimals: 2 })}</span>
              <span>H {inr(hovered.high, { decimals: 2 })}</span>
              <span>L {inr(hovered.low, { decimals: 2 })}</span>
              <span>C {inr(hovered.close, { decimals: 2 })}</span>
              <span>Vol {hovered.volume}M</span>
            </>
          ) : (
            <span>Hover a session to read open, high, low, close and volume.</span>
          )}
        </div>

        <CandleChart stock={stock} onHover={setHovered} emphasis={active} />

        <div className="vf-chart-legend">
          <span><span className="vf-legend-swatch" style={{ background: "var(--vf-p-green)" }} />up session</span>
          <span><span className="vf-legend-swatch" style={{ background: "var(--vf-p-pink)" }} />down session</span>
          <span><span className="vf-legend-swatch" style={{ background: "var(--vf-p-blue)" }} />50-DMA level</span>
          <span><span className="vf-legend-swatch" style={{ background: "var(--vf-p-lilac)" }} />200-DMA level</span>
          <span className="vf-t-faint">Volume in its own band under the price panel</span>
        </div>

        <div className="vf-kv">
          <div className="vf-kv__cell">
            <div className="vf-kv__k">MACD line</div>
            <div className="vf-kv__v">{t.macd.macdLine}</div>
          </div>
          <div className="vf-kv__cell">
            <div className="vf-kv__k">Signal line</div>
            <div className="vf-kv__v">{t.macd.signalLine}</div>
          </div>
          <div className="vf-kv__cell">
            <div className="vf-kv__k">Bollinger %B</div>
            <div className="vf-kv__v">{pct(t.bollingerBands.percentile, 0)}</div>
          </div>
          <div className="vf-kv__cell">
            <div className="vf-kv__k">Anomaly</div>
            <div className="vf-kv__v">{t.volumeAnomalyDetected ? "Detected" : "Normal"}</div>
          </div>
        </div>

        <div className="vf-inline">
          <Pill tone="outline" icon={BarChart3}>
            {t.movingAvgSignal}
          </Pill>
          <Pill tone="soft">{t.anomalyDescription}</Pill>
          {held ? (
            <Pill tone="info">
              You hold {held.qty} @ {inr(held.avgPrice, { decimals: 2 })} · {pct(held.weight)} of portfolio
            </Pill>
          ) : (
            <Pill tone="dashed">Not currently held</Pill>
          )}
        </div>
      </div>
    </div>
  );
}
