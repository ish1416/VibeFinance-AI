import React from "react";
import {
  Sparkles,
  BarChart3,
  Cpu,
  FileText,
  Wallet,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
  Users,
  AlertOctagon
} from "lucide-react";
import { AppFrame } from "../components/ui/AppFrame";
import { TopNav } from "../components/ui/TopNav";
import { IconRail } from "../components/ui/IconRail";
import { Dock } from "../components/ui/Dock";
import { PageHeader } from "../components/ui/PageHeader";
import { SidePanel } from "../components/ui/SidePanel";
import { Pill } from "../components/ui/Pill";
import { DecisionView } from "../views/DecisionView";
import { SignalsView } from "../views/SignalsView";
import { SwarmView } from "../views/SwarmView";
import { EvidenceView } from "../views/EvidenceView";
import { PortfolioView } from "../views/PortfolioView";
import { ProfilePanel } from "../views/panels/ProfilePanel";
import { SessionPanel } from "../views/panels/SessionPanel";
import { StatusPanel } from "../views/panels/StatusPanel";
import { CitationsModal } from "../views/modals/CitationsModal";
import { RubricModal } from "../views/modals/RubricModal";
import { STOCKS_DATA } from "../data/stocksData";

const TABS = [
  { id: "decision", label: "Decision", icon: Sparkles },
  { id: "signals", label: "Signals", icon: BarChart3 },
  { id: "swarm", label: "Swarm", icon: Cpu },
  { id: "evidence", label: "Evidence", icon: FileText },
  { id: "portfolio", label: "Portfolio", icon: Wallet }
];

const PANEL_TABS = [
  { id: "profile", label: "Profile" },
  { id: "session", label: "Session" },
  { id: "status", label: "Status" }
];

const PANEL_HEAD = {
  profile: {
    title: "Personalized investor profiling",
    emoji: "🧭",
    subtitle: "Identical market input produces tailored risk-weighted execution"
  },
  session: {
    title: "Session telemetry & evaluation",
    emoji: "📊",
    subtitle: "Measured metrics for this run — nothing typed by hand"
  },
  status: {
    title: "Data provenance & system status",
    emoji: "🩺",
    subtitle: "Per-source status, mitigation trail and compliance"
  }
};

export function ControlCenter({
  analysis,
  stock,
  search,
  onSearch,
  onSelectSymbol,
  user,
  users,
  selectedUserId,
  onSelectUser,
  riskAppetite,
  onAppetite,
  activeTab,
  onTab,
  panelTab,
  onPanelTab,
  onRun,
  isAnalyzing,
  onOpenCitations,
  onOpenRubric,
  isDegraded,
  onToggleDegraded,
  forcedConflict,
  onForceConflict,
  showCitations,
  onCloseCitations,
  showRubric,
  onCloseRubric
}) {
  const citationsCount = analysis.verdict ? analysis.citations.length : 0;

  const header = {
    decision: {
      title: "Unified multi-agent decision engine",
      emoji: analysis.verdict.badge === "BUY" || analysis.verdict.badge === "STRONG_BUY" ? "📈" : "🧮",
      subtitle: "Three specialized autonomous agents with structured output contracts, consumed by a synthesis layer and gated by your portfolio"
    },
    signals: {
      title: `${stock.name} price action`,
      emoji: "🕯️",
      subtitle: "Daily candlesticks • 50/200 DMA levels • volume in its own band"
    },
    swarm: {
      title: "Tri-agent autonomous consensus swarm",
      emoji: "🐝",
      subtitle: "Three specialized autonomous agents with structured output contracts"
    },
    evidence: {
      title: "Verified regulatory citations",
      emoji: "🔎",
      subtitle: "Claim-level verification with visible source attribution"
    },
    portfolio: {
      title: "Portfolio & risk",
      emoji: "💼",
      subtitle: user.subtitle
    }
  }[activeTab];

  const filtered = Object.values(STOCKS_DATA).filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q);
  });

  const view = () => {
    switch (activeTab) {
      case "signals":
        return <SignalsView stock={stock} analysis={analysis} />;
      case "swarm":
        return <SwarmView analysis={analysis} onOpenCitations={onOpenCitations} onRun={onRun} isAnalyzing={isAnalyzing} />;
      case "evidence":
        return <EvidenceView analysis={analysis} onOpenCitations={onOpenCitations} />;
      case "portfolio":
        return <PortfolioView analysis={analysis} user={user} stocksData={STOCKS_DATA} onSelectSymbol={onSelectSymbol} />;
      default:
        return (
          <DecisionView
            analysis={analysis}
            onOpenEvidence={() => onTab("evidence")}
          />
        );
    }
  };

  const cycleUser = () => {
    const idx = users.findIndex((u) => u.id === selectedUserId);
    onSelectUser(users[(idx + 1) % users.length].id);
  };

  return (
    <>
      <AppFrame
        topNav={
          <TopNav
            productName="VibeFinance AI"
            mark="V"
            liveLabel={analysis.degraded.active ? "NSE feeds dropped · scenario active" : "NSE LIVE · NIFTY 50 24,862.15 +0.48%"}
            tabs={TABS}
            activeTab={activeTab}
            onSelectTab={onTab}
            user={{ initials: user.initials, name: user.name, sub: `${user.profileId} · appetite ${analysis.profile.appetite}/10` }}
            menuItems={[
              { label: "Re-run all agents", icon: RefreshCw, onClick: onRun },
              { label: "Verified SEBI citations", icon: BookOpen, onClick: onOpenCitations },
              { label: "Architecture & rubric", icon: Cpu, onClick: onOpenRubric },
              { label: "Switch investor", icon: Users, onClick: cycleUser },
              { label: isDegraded ? "Restore data feeds" : "Simulate dropped feeds", icon: AlertTriangle, onClick: onToggleDegraded, danger: isDegraded }
            ]}
          />
        }
        rail={
          <IconRail
            top={[
              { label: "Re-run all agents", icon: RefreshCw, solid: true, onClick: onRun, disabled: isAnalyzing },
              {
                label: isDegraded ? "Restore data feeds" : "Simulate dropped data feeds",
                icon: isDegraded ? AlertTriangle : ShieldAlert,
                warn: isDegraded,
                pressed: isDegraded,
                onClick: onToggleDegraded
              }
            ]}
            bottom={[
              { label: "Verified SEBI citations", icon: BookOpen, badge: citationsCount, onClick: onOpenCitations },
              { label: "Force an agent conflict", icon: AlertOctagon, pressed: forcedConflict, onClick: onForceConflict },
              { label: "Switch investor", icon: Users, onClick: cycleUser },
              { label: "Architecture & rubric", icon: Cpu, onClick: onOpenRubric }
            ]}
          />
        }
        main={
          <main className="vf-main">
            <div className="vf-main__scroll vf-scroll">
              <PageHeader
                title={header.title}
                emoji={header.emoji}
                subtitle={header.subtitle}
                search={search}
                onSearchChange={onSearch}
                searchPlaceholder="Search securities"
              />

              <div className="vf-picker" role="group" aria-label="Active security">
                {filtered.length === 0 ? (
                  <Pill tone="dashed">No security matches “{search}”</Pill>
                ) : (
                  filtered.map((s) => (
                    <button
                      type="button"
                      key={s.symbol}
                      className={`vf-picker__item${s.symbol === stock.symbol ? " is-active" : ""}`}
                      onClick={() => onSelectSymbol(s.symbol)}
                      aria-pressed={s.symbol === stock.symbol}
                    >
                      <span>{s.symbol}</span>
                      <span className={`vf-picker__price ${s.change >= 0 ? "vf-up" : "vf-down"}`}>
                        ₹{s.price.toLocaleString("en-IN")} {s.change >= 0 ? "+" : ""}{s.changePercent}%
                      </span>
                    </button>
                  ))
                )}
              </div>

              {view()}
            </div>

            <Dock
              items={[
                { label: "Re-run all agents", icon: RefreshCw, tone: "blue", onClick: onRun },
                { label: "Verified SEBI citations", icon: BookOpen, tone: "lav", badge: citationsCount, onClick: onOpenCitations },
                { label: "Force an agent conflict", icon: AlertOctagon, tone: "pink", active: forcedConflict, onClick: onForceConflict },
                { label: isDegraded ? "Restore data feeds" : "Simulate dropped data feeds", icon: ShieldAlert, tone: "yellow", active: isDegraded, onClick: onToggleDegraded },
                { label: "Architecture & rubric", icon: Cpu, tone: "green", onClick: onOpenRubric }
              ]}
              onPlus={cycleUser}
              plusLabel="Switch investor"
            />
          </main>
        }
        panel={
          <SidePanel
            title={PANEL_HEAD[panelTab].title}
            emoji={PANEL_HEAD[panelTab].emoji}
            subtitle={PANEL_HEAD[panelTab].subtitle}
            tabs={PANEL_TABS}
            activeTab={panelTab}
            onTabChange={onPanelTab}
          >
            {panelTab === "profile" ? (
              <ProfilePanel
                analysis={analysis}
                users={users}
                selectedUserId={selectedUserId}
                onSelectUser={onSelectUser}
                riskAppetite={riskAppetite}
                onAppetite={onAppetite}
              />
            ) : null}
            {panelTab === "session" ? <SessionPanel analysis={analysis} /> : null}
            {panelTab === "status" ? (
              <StatusPanel
                analysis={analysis}
                onToggleDegraded={onToggleDegraded}
                onForceConflict={onForceConflict}
                forcedConflict={forcedConflict}
              />
            ) : null}
          </SidePanel>
        }
        footnote={
          <>
            <span>
              <strong>VibeFinance AI</strong> · Autonomous Multi-Agent Financial Intelligence Platform · Built for Wild Bugs
              24-Hour Online Hackathon, Problem Statement 04
            </span>
            <span>Builders: <strong>Ishita Singh &amp; Atharv Soni (Team SHAKTI)</strong></span>
          </>
        }
      />

      <CitationsModal
        isOpen={showCitations}
        onClose={onCloseCitations}
        citations={analysis.citations}
        verification={analysis.verification_summary}
        symbol={analysis.symbol}
      />
      <RubricModal isOpen={showRubric} onClose={onCloseRubric} />
    </>
  );
}
