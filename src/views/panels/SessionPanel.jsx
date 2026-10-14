import React from "react";
import { Zap, ClipboardCheck, Gauge, CalendarClock, Terminal } from "lucide-react";
import { SidePanelCard } from "../../components/ui/SidePanelCard";
import { Pill } from "../../components/ui/Pill";
import { pct } from "../../domain/finance";

export function SessionPanel({ analysis }) {
  const { metrics, verdict, evidence_ledger: ledger } = analysis;
  const fwd = metrics.forward_return_check;

  const logLines = [
    { tag: "ORCHESTRATOR", tone: "orch", text: `snapshot ${analysis.symbol} @ ${analysis.verdict.entry} · profile ${analysis.profile.id} (appetite ${analysis.profile.appetite}/10) · engine ${analysis.engine.kind}` },
    ...analysis.agents.map((a) => ({
      tag: a.agent_id,
      tone: a.status === "HEALTHY" ? "agent" : "warn",
      text: `${a.status} · ${a.executionTimeMs}ms · signal ${a.signal} · confidence ${Math.round((a.confidence ?? 0) * 100)}% · ${a.audit?.verified ?? 0}/${a.audit?.checked ?? 0} figures traceable`
    })),
    { tag: "VERIFIER", tone: "ok", text: `${ledger.length} claims checked · coverage ${metrics.evidence_coverage_pct}% · ${metrics.unsupported_figures} unsupported figure(s) suppressed from reliance` },
    { tag: "SYNTHESIS", tone: "ok", text: `weighted score ${verdict.score}/100 → ${verdict.label}` },
    ...(analysis.degraded.mitigations.length
      ? [{ tag: "DEGRADED", tone: "warn", text: analysis.degraded.mitigations.join(" | ") }]
      : []),
    ...(analysis.compliance.prohibited_phrases_blocked
      ? [{ tag: "COMPLIANCE", tone: "warn", text: `${analysis.compliance.prohibited_phrases_blocked} prohibited phrase(s) rewritten before render: ${analysis.compliance.blocked_phrases.join(", ")}` }]
      : [])
  ];

  return (
    <>
      <SidePanelCard
        tone="blue"
        icon={Zap}
        category="Measured compute"
        date={`${metrics.latency_ms.total}ms total`}
        body={`A1 ${metrics.latency_ms.per_agent.A1_TECHNICAL}ms · A2 ${metrics.latency_ms.per_agent.A2_FUNDAMENTAL_RAG}ms · A3 ${metrics.latency_ms.per_agent.A3_SENTIMENT_FLOW}ms. Wall-clock time measured on this machine.`}
        clamp={3}
        pillLabel="Local compute, not network latency"
      />

      <SidePanelCard
        tone="green"
        icon={ClipboardCheck}
        category="Evidence coverage"
        date={`${metrics.evidence_coverage_pct}%`}
        body={`${ledger.length} claims in this run; ${ledger.filter((l) => l.verified).length} traced to a cited source. ${metrics.unsupported_figures} figure(s) failed verification and are struck through wherever they appear.`}
        clamp={3}
        pillLabel={`${metrics.unsupported_figures} unsupported`}
      />

      <SidePanelCard
        tone="lilac"
        icon={Gauge}
        category="Risk concentration"
        date={metrics.risk_concentration.label}
        body={`HHI ${metrics.risk_concentration.hhi.toFixed(3)} on total portfolio value · largest sector ${metrics.risk_concentration.max_sector.name} at ${pct(metrics.risk_concentration.max_sector.weight)}.`}
        clamp={3}
        pillLabel="Computed from holdings"
      />

      <SidePanelCard
        tone="yellow"
        icon={CalendarClock}
        category="Forward return check"
        date={fwd.status}
        body={`A signal is only scored as accurate once its ${fwd.window_days}-day forward window resolves. This run resolves on ${fwd.resolves_on}. Until then it is reported as pending rather than as an accuracy figure.`}
        clamp={4}
        pillLabel="No accuracy claim until measured"
      />

      <SidePanelCard tone="blue" icon={Terminal} category="Run log" date={analysis.generated_at}>
        <div className="vf-terminal">
          {logLines.map((line, i) => (
            <div className="vf-logline" key={`${line.tag}-${i}`}>
              <span className={`vf-terminal__tag vf-terminal__tag--${line.tone}`}>{`[${line.tag}]`}</span>
              <span>{line.text}</span>
            </div>
          ))}
        </div>
      </SidePanelCard>

      <SidePanelCard
        tone="dashed"
        icon={CalendarClock}
        category="Backtest harness"
        date="pending"
        body="Signal accuracy, calibration (Brier score) and latency percentiles are produced by eval/backtest.py over a point-in-time window and rendered from its report — never typed by hand."
      >
        <Pill tone="outline">Not yet run in this session</Pill>
      </SidePanelCard>
    </>
  );
}
