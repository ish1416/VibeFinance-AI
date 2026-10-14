import React from "react";
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Scale,
  ShieldAlert,
  Gauge,
  Activity,
  TrendingDown
} from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { FeaturedCard } from "../components/ui/FeaturedCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { ContentCard } from "../components/ui/ContentCard";
import { Pill } from "../components/ui/Pill";
import { inr, pct } from "../domain/finance";

const BADGE_TONE = {
  STRONG_BUY: "ok",
  BUY: "ok",
  HOLD: "warn",
  SELL: "bad",
  WARNING: "warn",
  NO_ACTION: "outline"
};

export function DecisionView({ analysis, onOpenEvidence }) {
  const { verdict, profile, metrics, conflict, portfolio_impact: impact } = analysis;
  const coverage = metrics.evidence_coverage_pct;
  const unsupported = metrics.unsupported_figures;

  return (
    <div className="vf-stack">
      <div className="vf-statrow">
        <StatCard value={verdict.score} label="Consensus score / 100" tone="blue" />
        <StatCard value={`${Math.round(verdict.confidence * 100)}%`} label="Consolidated confidence" tone="green" />
        <StatCard
          value={`${coverage}%`}
          label={`Evidence coverage · ${unsupported} unsupported`}
          dashed
          deco={unsupported === 0 ? "✓" : "⚠"}
          title="Share of displayed claims that trace back to a cited source"
        />
        <StatCard
          value={`${metrics.latency_ms.total}ms`}
          label="Measured local compute"
          tone="yellow"
          deco="⚡"
          title="Measured wall-clock time of the deterministic engine on this machine"
        />
      </div>

      <FeaturedCard
        badgeIcon={Sparkles}
        eyebrow="Unified multi-agent decision engine"
        headline={verdict.label}
        scoreValue={verdict.score}
        scoreSub="Consensus score / 100"
        body={verdict.summary}
        targets={[
          { label: "Reference price", value: inr(verdict.entry) },
          { label: "Target objective", value: inr(verdict.target) },
          { label: `Stop-loss (${profile.stop_loss_percent}%)`, value: inr(verdict.stop_loss), ink: "var(--vf-bad-ink)" }
        ]}
        footerLeft={
          <div className="vf-inline">
            <Pill tone="white" icon={Scale}>{profile.name}</Pill>
            <Pill tone="white" icon={Gauge}>{profile.target_horizon}</Pill>
            <Pill tone={BADGE_TONE[verdict.badge] || "soft"}>{Math.round(verdict.confidence * 100)}% confidence</Pill>
            <Pill tone="white">Suggested size {inr(impact.suggested_trade_inr)}</Pill>
          </div>
        }
        footerAction={
          <button
            type="button"
            className="vf-featuredcard__circle"
            onClick={onOpenEvidence}
            aria-label="Open the evidence ledger for this verdict"
            title="Open the evidence ledger"
          >
            <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        }
      />

      {conflict?.detected ? (
        <ContentCard
          badgeIcon={AlertTriangle}
          badgeTone="pink"
          eyebrow={conflict.forced ? "Disagreement (forced scenario)" : "Agent tension detected"}
          title={`Agents disagree by ${conflict.max_polarity_gap ?? "—"} on a −1…+1 scale`}
          desc={conflict.policy_applied}
          clamp={4}
          status={`Arbiter: ${conflict.dominant_agent}`}
          statusTone="warn"
          statusEmoji="⚖️"
          actions={<Pill tone="outline">Minority view kept on record</Pill>}
        >
          <div className="vf-stack vf-stack--tight">
            {conflict.debate?.map((turn) => (
              <div className="vf-quote" key={`${turn.speaker}-${turn.signal}`}>
                <div className="vf-inline vf-inline--between">
                  <span className="vf-t-label">{turn.speaker}</span>
                  <Pill tone="outline">{turn.signal}</Pill>
                </div>
                <p className="vf-t-body" style={{ marginTop: 6 }}>{turn.statement}</p>
                <span className="vf-t-faint">rebuts {turn.rebuts}</span>
              </div>
            ))}

            <div className="vf-inline">
              <span className="vf-t-label">Rejected for this input:</span>
              {conflict.rejected_verdicts?.map((r) => (
                <Pill tone="outline" key={r}>{r}</Pill>
              ))}
            </div>

            <div>
              <span className="vf-t-label">What would flip this decision</span>
              <ul className="vf-card__meta" style={{ marginTop: 6, flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                {conflict.flip_conditions?.map((c) => (
                  <li key={c} className="vf-t-body">• {c}</li>
                ))}
              </ul>
            </div>
          </div>
        </ContentCard>
      ) : null}

      <div>
        <SectionHeader
          label={`Portfolio impact · ${analysis.portfolio.positions.length} holdings`}
          action={<Pill tone={impact.breach ? "bad" : "ok"} emoji={impact.breach ? "⛔" : "✓"}>{impact.suitability}</Pill>}
        />
        <div className="vf-grid-2">
          <ContentCard
            badgeIcon={ShieldAlert}
            badgeTone={impact.breach ? "pink" : "green"}
            eyebrow="Suitability gate"
            title={`${impact.sector} exposure ${pct(impact.sector_before)} → ${pct(impact.sector_after)}`}
            desc={
              impact.breach_reason ||
              `Within the ${pct(impact.sector_cap, 0)} sector cap and ${pct(profile.per_equity_cap, 0)} per-equity guide for ${profile.name}. No limit is breached by the suggested trade.`
            }
            clamp={3}
            status={impact.alternative ? `Alternative with headroom: ${impact.alternative}` : "No alternative needed"}
            statusTone="soft"
          >
            <div className="vf-kv">
              <div className="vf-kv__cell">
                <div className="vf-kv__k">HHI before</div>
                <div className="vf-kv__v">{impact.hhi_before.toFixed(3)}</div>
              </div>
              <div className="vf-kv__cell">
                <div className="vf-kv__k">HHI after</div>
                <div className="vf-kv__v">{impact.hhi_after.toFixed(3)}</div>
              </div>
              <div className="vf-kv__cell">
                <div className="vf-kv__k">Sector cap</div>
                <div className="vf-kv__v">{pct(impact.sector_cap, 0)}</div>
              </div>
            </div>
          </ContentCard>

          <ContentCard
            badgeIcon={TrendingDown}
            badgeTone="yellow"
            eyebrow="Stress test"
            title={`Portfolio stress · beta-weighted ${analysis.portfolio.betaWeighted.toFixed(2)}`}
            desc="Deterministic scenarios; the market shock assumption is stated next to each row so the number can be checked."
            clamp={2}
            status={`Largest sector ${analysis.portfolio.maxSector.name} ${pct(analysis.portfolio.maxSector.weight)}`}
            statusTone={impact.breach ? "bad" : "soft"}
          >
            <div className="vf-list">
              {impact.stress_test?.map((s) => (
                <div className="vf-row" key={s.id}>
                  <span className="vf-t-body">{s.label}</span>
                  <span className={`vf-t-meta ${s.impactPct < 0 ? "vf-down" : "vf-up"}`} style={{ fontWeight: 700 }}>
                    {pct(s.impactPct, 2)} · {inr(s.impactInr)}
                  </span>
                </div>
              ))}
            </div>
          </ContentCard>
        </div>
      </div>

      <ContentCard
        badgeIcon={Activity}
        badgeTone="blue"
        eyebrow="Agent contributions to this verdict"
        title={`Weighted synthesis under ${profile.name}`}
        desc={`Technical ${pct(profile.weights.technical, 0)} · Fundamental ${pct(profile.weights.fundamental, 0)} · Sentiment ${pct(profile.weights.sentiment, 0)} · portfolio risk applied as a gate rather than a weight.`}
        clamp={2}
        meta={analysis.agents.map((a) => ({
          label: `${a.agent_id.split("_")[1]} ${a.score ?? "—"}`
        }))}
        status={`${analysis.verification_summary.claims_verified}/${analysis.verification_summary.claims_total} claims verified`}
        statusTone={unsupported === 0 ? "ok" : "warn"}
      />
    </div>
  );
}
