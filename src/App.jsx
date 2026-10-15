import React, { useMemo, useState } from "react";
import { ControlCenter } from "./screens/ControlCenter";
import { STOCKS_DATA } from "./data/stocksData";
import { USERS, getUser } from "./data/portfolios";
import { runEngine, buildAnalysis } from "./domain/analysis";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/views.css";

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [selectedUserId, setSelectedUserId] = useState("aarav");
  const [riskAppetite, setRiskAppetite] = useState(USERS[0].riskAppetite);
  const [isDegraded, setIsDegraded] = useState(false);
  const [forcedConflict, setForcedConflict] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [showRubric, setShowRubric] = useState(false);
  const [activeTab, setActiveTab] = useState("decision");
  const [panelTab, setPanelTab] = useState("profile");
  const [search, setSearch] = useState("");
  const [runToken, setRunToken] = useState(0);

  const stock = STOCKS_DATA[selectedSymbol] || STOCKS_DATA.RELIANCE;
  const user = getUser(selectedUserId);

  // The deterministic engine. Timings here are measured wall-clock time.
  // runToken is part of the result, so pressing "re-run" produces a genuinely
  // new run (fresh measurements) rather than a cached object.
  const engine = useMemo(
    () => ({ ...runEngine({ stock, isDegraded }), run_token: runToken }),
    [stock, isDegraded, runToken]
  );

  const analysis = useMemo(
    () => buildAnalysis({ stock, engine, riskAppetite, user, isDegraded, forcedConflict }),
    [stock, engine, riskAppetite, user, isDegraded, forcedConflict]
  );

  const handleRun = () => {
    setIsAnalyzing(true);
    setRunToken((t) => t + 1);
    window.setTimeout(() => setIsAnalyzing(false), 320);
  };

  const handleSelectUser = (userId) => {
    const next = getUser(userId);
    setSelectedUserId(next.id);
    setRiskAppetite(next.riskAppetite);
  };

  const handleSelectSymbol = (symbol) => {
    setSelectedSymbol(symbol);
    setSearch("");
    setActiveTab((tab) => (tab === "portfolio" ? "decision" : tab));
  };

  return (
    <ControlCenter
      analysis={analysis}
      stock={stock}
      search={search}
      onSearch={setSearch}
      onSelectSymbol={handleSelectSymbol}
      user={user}
      users={USERS}
      selectedUserId={selectedUserId}
      onSelectUser={handleSelectUser}
      riskAppetite={riskAppetite}
      onAppetite={setRiskAppetite}
      activeTab={activeTab}
      onTab={setActiveTab}
      panelTab={panelTab}
      onPanelTab={setPanelTab}
      onRun={handleRun}
      isAnalyzing={isAnalyzing}
      onOpenCitations={() => setShowCitations(true)}
      onOpenRubric={() => setShowRubric(true)}
      isDegraded={isDegraded}
      onToggleDegraded={() => setIsDegraded((v) => !v)}
      forcedConflict={forcedConflict}
      onForceConflict={() => setForcedConflict((v) => !v)}
      showCitations={showCitations}
      onCloseCitations={() => setShowCitations(false)}
      showRubric={showRubric}
      onCloseRubric={() => setShowRubric(false)}
    />
  );
}
