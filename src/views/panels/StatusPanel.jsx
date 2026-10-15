import React from "react";
import { Database, ShieldCheck, AlertTriangle, Cpu, FileWarning, Radio } from "lucide-react";
import { SidePanelCard } from "../../components/ui/SidePanelCard";
import { Pill } from "../../components/ui/Pill";

const SOURCE_META = {
  price: { label: "Price feed", icon: Radio, tone: "blue" },
  volume: { label: "Volume feed", icon: Database, tone: "yellow" },
  filings: { label: "SEBI filings corpus", icon: FileWarning, tone: "lilac" },
  flows: { label: "FII/DII + options tape", icon: Radio, tone: "blue" },
  portfolio: { label: "Portfolio store", icon: Database, tone: "green" }
};

const STATUS_TONE = {
  LIVE: "ok",
  DELAYED: "warn",
  CACHED: "warn",
  SIMULATED: "outline",
  SYNTHETIC: "outline",
  UNAVAILABLE: "bad",
  COMPUTED: "ok"
};

export function StatusPanel({ analysis, onToggleDegraded, onForceConflict, forcedConflict }) {
  const { degraded, compliance } = analysis;

  return (
    <>
      <SidePanelCard
        tone="lilac"
        icon={Cpu}
        category="Engine"
        date={analysis.engine.kind}
        body={analysis.engine.note}
        clamp={4}
        pillLabel={degraded.active ? "Degraded scenario active" : "Nominal run"}
      />

      {Object.entries(degraded.sources).map(([key, status]) => {
        const meta = SOURCE_META[key] || { label: key, icon: Database, tone: "blue" };
        return (
          <SidePanelCard
            key={key}
            tone={status === "UNAVAILABLE" ? "pink" : meta.tone}
            icon={meta.icon}
            category={meta.label}
            date={status}
            body={
              status === "SIMULATED"
                ? "Committed snapshot data. Disclosed as simulated in the README; the API path replaces this with a live or delayed feed carrying the same provenance record."
                : status === "SYNTHETIC"
                  ? "Synthetic-but-realistic disclosure corpus with real document metadata (issuer, regulator, filing date, section, source URL)."
                  : status === "CACHED"
                    ? "Feed reported unavailable; the agent fell back to the last cached values and downgraded its confidence."
                    : status === "UNAVAILABLE"
                      ? "Source did not respond. The agent returned INSUFFICIENT_EVIDENCE instead of inventing a value."
                      : "Computed from stored holdings on every run."
            }
            clamp={4}
            pillLabel={status}
          >
            <Pill tone={STATUS_TONE[status] || "soft"}>{status}</Pill>
          </SidePanelCard>
        );
      })}

      <SidePanelCard
        tone={degraded.active ? "pink" : "green"}
        icon={degraded.active ? AlertTriangle : ShieldCheck}
        category="Mitigation trail"
        date={degraded.active ? `${degraded.mitigations.length} step(s)` : "none required"}
        body={
          degraded.mitigations.length
            ? degraded.mitigations.join(" · ")
            : "Every agent returned HEALTHY on this run. No figure needed suppression and no confidence cap was applied."
        }
        clamp={5}
        pillLabel={degraded.fallback_mode || "no fallback"}
      />

      <SidePanelCard
        tone="green"
        icon={ShieldCheck}
        category="Compliance shield"
        date={compliance.classification}
        body={compliance.disclosure}
        clamp={5}
        pillLabel={`${compliance.prohibited_phrases_blocked} phrase(s) rewritten`}
      />

      <SidePanelCard
        tone="dashed"
        icon={AlertTriangle}
        category="Demo scenarios"
        date="robustness"
        body="Drive the degradation paths live: drop the data feeds, or force an inter-agent conflict on a security whose dimensions currently agree."
      >
        <div className="vf-inline">
          <button type="button" className="vf-pillbtn" onClick={onToggleDegraded}>
            {degraded.active ? "Restore feeds" : "Drop data feeds"}
          </button>
          <button type="button" className="vf-pillbtn" onClick={onForceConflict} aria-pressed={forcedConflict}>
            {forcedConflict ? "Unforce conflict" : "Force conflict"}
          </button>
        </div>
      </SidePanelCard>
    </>
  );
}
