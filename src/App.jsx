import React, { useState, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { StockHeader } from "./components/StockHeader";
import { CandlestickChart } from "./components/CandlestickChart";
import { AgentPanel } from "./components/AgentPanel";
import { ConsensusDecision } from "./components/ConsensusDecision";
import { DocumentCitationModal } from "./components/DocumentCitationModal";
import { ArchitectureModal } from "./components/ArchitectureModal";
import { PerformanceTelemetry } from "./components/PerformanceTelemetry";
import { STOCKS_DATA } from "./data/stocksData";
import { runTechnicalAgent } from "./agents/technicalAgent";
import { runFundamentalRAGAgent } from "./agents/fundamentalAgent";
import { runSentimentAgent } from "./agents/sentimentAgent";
import { synthesizeAgents } from "./agents/synthesisEngine";
import "./App.css";

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [selectedRiskProfile, setSelectedRiskProfile] = useState("BALANCED");
  const [isDegraded, setIsDegraded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);

  // Active stock data
  const currentStock = STOCKS_DATA[selectedSymbol] || STOCKS_DATA.RELIANCE;

  // Execute the 3 Parallel Specialized Agents
  const technicalResult = useMemo(
    () => runTechnicalAgent(currentStock, isDegraded),
    [currentStock, isDegraded]
  );

  const fundamentalResult = useMemo(
    () => runFundamentalRAGAgent(currentStock, isDegraded),
    [currentStock, isDegraded]
  );

  const sentimentResult = useMemo(
    () => runSentimentAgent(currentStock, isDegraded),
    [currentStock, isDegraded]
  );

  // Execute the Consensus & Synthesis Layer with Personalized Risk Profiling
  const synthesis = useMemo(
    () =>
      synthesizeAgents({
        stock: currentStock,
        technicalResult,
        fundamentalResult,
        sentimentResult,
        riskProfile: selectedRiskProfile,
        isDegraded
      }),
    [currentStock, technicalResult, fundamentalResult, sentimentResult, selectedRiskProfile, isDegraded]
  );

  // Re-run animation simulation
  const handleRefreshAgents = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 450);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        isDegraded={isDegraded}
        onToggleDegraded={() => setIsDegraded(!isDegraded)}
        onOpenArchitecture={() => setShowArchitectureModal(true)}
        onOpenCitations={() => setShowCitationModal(true)}
        citationsCount={synthesis.citationsCount}
      />

      {/* Main Financial Analytics Workspace */}
      <main className="main-content">
        {/* Active Security Header & Ticker Switcher */}
        <StockHeader
          currentStock={currentStock}
          onSelectStock={(sym) => setSelectedSymbol(sym)}
          onRefreshAgents={handleRefreshAgents}
          isAnalyzing={isAnalyzing}
        />

        {/* Degraded Mode Warning Alert (When toggled) */}
        {isDegraded && (
          <div className="degraded-alert-banner">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">
              <strong>Simulated Data Degradation Active (PS 04 Robustness Test):</strong>{" "}
              Live price feeds and audited SEBI filing endpoints simulated as disconnected. Autonomous fallback engaged:
              Confidence scores downgraded, uncited claims suppressed, and conservative capital preservation guardrails enforced.
            </div>
          </div>
        )}

        {/* Unified Consensus Decision & Risk Profile Switcher */}
        <ConsensusDecision
          synthesis={synthesis}
          selectedRiskProfile={selectedRiskProfile}
          onSelectRiskProfile={(profile) => setSelectedRiskProfile(profile)}
        />

        {/* Price Action & Indicator Chart */}
        <CandlestickChart stock={currentStock} />

        {/* Tri-Agent Parallel Execution Panel */}
        <AgentPanel
          technicalResult={technicalResult}
          fundamentalResult={fundamentalResult}
          sentimentResult={sentimentResult}
          onOpenCitations={() => setShowCitationModal(true)}
        />

        {/* Real-Time Session Telemetry & Logs */}
        <PerformanceTelemetry
          synthesis={synthesis}
          technicalResult={technicalResult}
          fundamentalResult={fundamentalResult}
          sentimentResult={sentimentResult}
          isDegraded={isDegraded}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span><strong>VibeFinance AI</strong> • Autonomous Multi-Agent Financial Intelligence Platform</span>
            <span className="footer-sub">Built for Wild Bugs 24-Hour Online Hackathon • Problem Statement 04</span>
          </div>
          <div className="footer-right">
            <span>Builders: <strong>Ishita Singh & Atharv Soni (Team SHAKTI)</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DocumentCitationModal
        isOpen={showCitationModal}
        onClose={() => setShowCitationModal(false)}
        citations={fundamentalResult.citations || []}
        stockSymbol={currentStock.symbol}
      />

      <ArchitectureModal
        isOpen={showArchitectureModal}
        onClose={() => setShowArchitectureModal(false)}
      />
    </div>
  );
}
