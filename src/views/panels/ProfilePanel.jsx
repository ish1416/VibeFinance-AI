import React from "react";
import { Shield, Scale, Flame, Check, Sliders, UserRound, Plus } from "lucide-react";
import { SidePanelCard } from "../../components/ui/SidePanelCard";
import { Pill } from "../../components/ui/Pill";
import { PROFILE_IDS, getProfile, profileForAppetite } from "../../domain/profiles";
import { pct } from "../../domain/finance";

const PROFILE_VISUAL = {
  CONSERVATIVE: { tone: "blue", icon: Shield },
  BALANCED: { tone: "lilac", icon: Scale },
  AGGRESSIVE: { tone: "yellow", icon: Flame }
};

export function ProfilePanel({ analysis, users, selectedUserId, onSelectUser, riskAppetite, onAppetite }) {
  const active = profileForAppetite(riskAppetite);

  return (
    <>
      <SidePanelCard
        tone="dashed"
        icon={Sliders}
        category="Risk appetite"
        date={`${riskAppetite}/10`}
        body={`Continuous appetite. Resulting weights — fundamental ${pct(active.weights.fundamental, 0)}, technical ${pct(active.weights.technical, 0)}, sentiment ${pct(active.weights.sentiment, 0)}. Stop-loss ${active.stopLossPercent}%.`}
      >
        <label className="vf-sr-only" htmlFor="vf-appetite">Risk appetite from 1 to 10</label>
        <input
          id="vf-appetite"
          className="vf-slider"
          type="range"
          min="1"
          max="10"
          step="1"
          value={riskAppetite}
          onChange={(e) => onAppetite(Number(e.target.value))}
        />
      </SidePanelCard>

      {PROFILE_IDS.map((id) => {
        const profile = getProfile(id);
        const visual = PROFILE_VISUAL[id];
        const isActive = analysis.profile.base_id === id;
        return (
          <SidePanelCard
            key={id}
            tone={visual.tone}
            icon={visual.icon}
            category={profile.name}
            date={`stop ${profile.stopLossPercent}%`}
            body={profile.description}
            clamp={4}
            pillLabel={`Fund ${pct(profile.weights.fundamental, 0)} · Tech ${pct(profile.weights.technical, 0)} · Sent ${pct(profile.weights.sentiment, 0)}`}
            onPill={() => onAppetite(id === "CONSERVATIVE" ? 3 : id === "BALANCED" ? 6 : 9)}
            tools={[
              {
                label: isActive ? `${profile.name} is active` : `Apply ${profile.name}`,
                icon: Check,
                onClick: () => onAppetite(id === "CONSERVATIVE" ? 3 : id === "BALANCED" ? 6 : 9)
              }
            ]}
          >
            <Pill tone={isActive ? "white" : "outline"}>
              {isActive ? "Active guardrail" : "Select"} · sector cap {pct(profile.sectorCap, 0)} · trade cap ₹{(profile.maxTradeInr / 1000).toFixed(0)}k
            </Pill>
          </SidePanelCard>
        );
      })}

      <SidePanelCard
        tone={analysis.behaviour.realizedAggressive ? "pink" : "blue"}
        icon={UserRound}
        category="Behavioural history"
        date={analysis.behaviour.tilt}
        body={analysis.behaviour.headline}
        clamp={3}
        pillLabel={`${analysis.behaviour.stats.accepted}/${analysis.behaviour.stats.total} accepted · ${analysis.behaviour.stats.medianSize.toFixed(2)}× size`}
      />

      <SidePanelCard
        tone="dashed"
        icon={Plus}
        category="Switch investor"
        date={`${users.length} seeded`}
        body="Personalization is only meaningful across people: switch investor to re-run the identical market snapshot against a different portfolio, profile and behavioural history."
      >
        <div className="vf-inline">
          {users.map((u) => (
            <button
              type="button"
              key={u.id}
              className="vf-picker__item"
              onClick={() => onSelectUser(u.id)}
              aria-pressed={u.id === selectedUserId}
              style={u.id === selectedUserId ? { background: "var(--vf-frame)", color: "var(--vf-on-dark)", borderColor: "transparent" } : undefined}
            >
              {u.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </SidePanelCard>
    </>
  );
}
