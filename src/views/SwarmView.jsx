import React from "react";
import {
  TrendingUp,
  ShieldCheck,
  Activity,
  Wallet,
  Clock,
  FileText,
  RefreshCw
} from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { ContentCard } from "../components/ui/ContentCard";
import { Pill } from "../components/ui/Pill";
import { IconButton } from "../components/ui/IconButton";
import { AuditedText } from "./AuditedText";

const AGENT_ICONS = {
  A1_TECHNICAL: TrendingUp,
  A2_FUNDAMENTAL_RAG: ShieldCheck,
  A3_SENTIMENT_FLOW: Activity,
  A4_PORTFOLIO_RISK: Wallet
};

const BADGE_TONE = {
  A1_TECHNICAL: "green",
  A2_FUNDAMENTAL_RAG: "lav",
  A3_SENTIMENT_FLOW: "yellow",
  A4_PORTFOLIO_RISK: "lilac"
};

const STATUS_TONE = {
  HEALTHY: "ok",
  DEGRADED: "warn",
  INSUFFICIENT_EVIDENCE: "bad",
  FAILED: "bad"
};

const STATUS_EMOJI = {
  HEALTHY: "✅",
  DEGRADED: "⚠️",
  INSUFFICIENT_EVIDENCE: "🚫",
  FAILED: "❌"
};

export function SwarmView({ analysis, onOpenCitations, onRun, isAnalyzing }) {
  const { agents } = analysis;

  return (
    <div className="vf-stack">
      <SectionHeader
        label="Tri-agent autonomous consensus swarm"
        count={agents.length}
        action={
          <Pill tone="outline" emoji="⚙️" title="The API path runs these concurrently; this local fixture engine is deterministic and single-threaded, and the latency shown is measured local compute time.">
            Fixture engine · measured locally
          </Pill>
        }
      />

      <div className="vf-grid-3">
        {agents.map((agent) => {
          const audit = agent.audit || { unsupported: [] };
          const metricEntries = Object.entries(agent.metrics || {}).slice(0, 2);

          return (
            <ContentCard
              key={agent.agent_id}
              badgeIcon={AGENT_ICONS[agent.agent_id]}
              badgeTone={BADGE_TONE[agent.agent_id]}
              eyebrow={agent.role}
              title={agent.agent_name}
              desc={<AuditedText text={agent.reasoning} unsupported={audit.unsupported} />}
              clamp={4}
              meta={[
                { icon: Clock, label: `${agent.executionTimeMs}ms` },
                { label: `${Math.round((agent.confidence ?? 0) * 100)}% confidence` },
                ...metricEntries.map(([k, v]) => ({ label: `${k}: ${v}` }))
              ]}
              status={`${agent.status}`}
              statusTone={STATUS_TONE[agent.status] || "soft"}
              statusEmoji={STATUS_EMOJI[agent.status] || "•"}
              actions={
                agent.agent_id === "A2_FUNDAMENTAL_RAG" ? (
                  <IconButton
                    label="Inspect the retrieved source citations for this agent"
                    icon={FileText}
                    tone="primary"
                    onClick={onOpenCitations}
                  />
                ) : (
                  <IconButton
                    label={`Re-run ${agent.agent_name}`}
                    icon={RefreshCw}
                    onClick={onRun}
                    disabled={isAnalyzing}
                  />
                )
              }
            >
              <div className="vf-stack vf-stack--tight">
                <div className="vf-meter" role="img" aria-label={`Confidence ${Math.round((agent.confidence ?? 0) * 100)} percent`}>
                  <div className="vf-meter__fill" style={{ width: `${Math.round((agent.confidence ?? 0) * 100)}%` }} />
                </div>
                <div className="vf-inline">
                  <Pill tone={audit.unsupported.length === 0 ? "ok" : "bad"}>
                    {audit.verified}/{audit.checked} figures traceable
                  </Pill>
                  {audit.unsupported.length > 0 ? (
                    <Pill tone="bad">{audit.unsupported.length} flagged</Pill>
                  ) : null}
                  <Pill tone="outline">action: {agent.action}</Pill>
                </div>
              </div>
            </ContentCard>
          );
        })}
      </div>
    </div>
  );
}
