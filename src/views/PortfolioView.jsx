import React from "react";
import { Wallet, PiggyBank, AlertTriangle, Activity, Eye } from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { ContentCard } from "../components/ui/ContentCard";
import { Pill } from "../components/ui/Pill";
import { inr, pct } from "../domain/finance";

export function PortfolioView({ analysis, user, stocksData, onSelectSymbol }) {
  const { portfolio, behaviour, portfolio_impact: impact } = analysis;

  return (
    <div className="vf-stack">
      <div className="vf-statrow">
        <StatCard value={portfolio.hhi.toFixed(3)} label={`Concentration HHI · ${portfolio.hhiLabel}`} tone="blue" />
        <StatCard value={pct(portfolio.maxSector.weight)} label={`Largest sector · ${portfolio.maxSector.name}`} tone="green" />
        <StatCard value={portfolio.betaWeighted.toFixed(2)} label="Beta-weighted exposure" dashed />
        <StatCard value={inr(portfolio.totalValue)} label={`Total value · ${portfolio.positions.length} positions`} tone="yellow" deco="💰" />
      </div>

      <SectionHeader
        label={`${user.name}'s holdings`}
        count={portfolio.positions.length}
        action={<Pill tone="outline">{user.profileId} profile · appetite {user.riskAppetite}/10</Pill>}
      />

      <ContentCard
        badgeIcon={Wallet}
        badgeTone="blue"
        eyebrow="Positions"
        title={`Equity ${inr(portfolio.equityValue)}${portfolio.cashDebt ? ` · debt/cash ${inr(portfolio.cashDebt)}` : ""}`}
        desc="Weights are computed on total portfolio value, so the same concentration maths applies to cash and debt allocations."
        clamp={2}
      >
        <div className="vf-list">
          {portfolio.positions
            .slice()
            .sort((a, b) => b.weight - a.weight)
            .map((p) => (
              <div className="vf-holding" key={p.symbol}>
                <div className="vf-holding__left">
                  <div className="vf-holding__sym">{p.symbol}</div>
                  <div className="vf-holding__meta">
                    {p.sector} · {p.qty} @ {inr(p.avgPrice, { decimals: 2 })}
                    {!p.tracked ? " · no live snapshot" : ""}
                  </div>
                </div>
                <div className="vf-inline">
                  <div className="vf-weightbar" title={`${pct(p.weight, 2)} of portfolio`}>
                    <div className="vf-weightbar__fill" style={{ width: `${Math.min(100, p.weight * 100)}%` }} />
                  </div>
                  <div className="vf-holding__right">
                    <div className="vf-holding__val">{inr(p.value)}</div>
                    <div className={`vf-holding__meta ${p.pnl >= 0 ? "vf-up" : "vf-down"}`}>
                      {p.pnl >= 0 ? "+" : ""}{inr(p.pnl)} ({p.pnlPct >= 0 ? "+" : ""}{pct(p.pnlPct, 1)})
                    </div>
                  </div>
                  {stocksData[p.symbol] ? (
                    <button
                      type="button"
                      className="vf-iconbtn vf-iconbtn--sm"
                      onClick={() => onSelectSymbol(p.symbol)}
                      aria-label={`Analyse ${p.symbol}`}
                    >
                      <Activity size={15} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
        </div>
      </ContentCard>

      <div className="vf-grid-2">
        <ContentCard
          badgeIcon={AlertTriangle}
          badgeTone={impact.breach ? "pink" : "green"}
          eyebrow="Suitability gate on the current recommendation"
          title={impact.breach ? `Blocked: ${impact.suitability}` : `Cleared: ${impact.suitability}`}
          desc={impact.breach_reason || `The suggested ${inr(impact.suggested_trade_inr)} trade in ${analysis.symbol} keeps every sector inside the ${pct(impact.sector_cap, 0)} cap.`}
          clamp={3}
          status={impact.alternative ? `Consider ${impact.alternative} instead` : "No alternative required"}
          statusTone={impact.breach ? "bad" : "ok"}
        >
          <div className="vf-kv">
            <div className="vf-kv__cell">
              <div className="vf-kv__k">{impact.sector} now</div>
              <div className="vf-kv__v">{pct(impact.sector_before)}</div>
            </div>
            <div className="vf-kv__cell">
              <div className="vf-kv__k">After trade</div>
              <div className="vf-kv__v" style={{ color: impact.breach ? "var(--vf-bad-ink)" : undefined }}>{pct(impact.sector_after)}</div>
            </div>
            <div className="vf-kv__cell">
              <div className="vf-kv__k">HHI shift</div>
              <div className="vf-kv__v">{impact.hhi_before.toFixed(3)} → {impact.hhi_after.toFixed(3)}</div>
            </div>
          </div>
        </ContentCard>

        <ContentCard
          badgeIcon={PiggyBank}
          badgeTone="lilac"
          eyebrow="Sector exposure"
          title={`${portfolio.sectorEntries.length} sectors · top ${pct(portfolio.maxSector.weight)}`}
          desc="Concentration is measured on total portfolio value including any cash or debt allocation."
          clamp={2}
        >
          <div className="vf-list">
            {portfolio.sectorEntries.map(([name, weight]) => (
              <div className="vf-row" key={name}>
                <span className="vf-t-body">{name}</span>
                <span className="vf-inline">
                  <span className="vf-weightbar">
                    <span className="vf-weightbar__fill" style={{ width: `${Math.min(100, weight * 100)}%` }} />
                  </span>
                  <span className="vf-t-meta" style={{ fontWeight: 700 }}>{pct(weight)}</span>
                </span>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      <div className="vf-grid-2">
        <ContentCard
          badgeIcon={Activity}
          badgeTone={behaviour.realizedAggressive ? "pink" : "green"}
          eyebrow="Behavioural history"
          title={behaviour.headline}
          desc={`Declared profile ${behaviour.declaredProfile} · realized behaviour ${behaviour.tilt}`}
          clamp={3}
          meta={[
            { label: `${behaviour.stats.accepted}/${behaviour.stats.total} accepted` },
            { label: `${pct(behaviour.stats.acceptRate, 0)} acceptance` },
            { label: `${behaviour.stats.medianSize.toFixed(2)}× size` }
          ]}
          status={behaviour.realizedAggressive ? "Reframe suggested: review guardrails" : "Guardrails match behaviour"}
          statusTone={behaviour.realizedAggressive ? "warn" : "ok"}
          actions={behaviour.suggestProfileId ? <Pill tone="bad">Declared profile may under-state risk</Pill> : null}
        >
          <ul className="vf-stack vf-stack--tight">
            {behaviour.justifications.map((j) => (
              <li className="vf-t-body" key={j}>• {j}</li>
            ))}
          </ul>
        </ContentCard>

        <ContentCard
          badgeIcon={Eye}
          badgeTone="yellow"
          eyebrow="Watchlist"
          title={`${user.watchlist.length} securities being tracked`}
          desc="Watchlist alerts fire when a security's polarity crosses the profile's flip conditions."
          clamp={2}
        >
          <div className="vf-inline">
            {user.watchlist.map((sym) => (
              <button
                type="button"
                className="vf-picker__item"
                key={sym}
                onClick={() => onSelectSymbol(sym)}
                aria-label={`Analyse ${sym}`}
              >
                {sym}
                {stocksData[sym] ? (
                  <span className={`vf-picker__price ${stocksData[sym].change >= 0 ? "vf-up" : "vf-down"}`}>
                    {stocksData[sym].change >= 0 ? "+" : ""}{pct(stocksData[sym].changePercent / 100, 2)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
