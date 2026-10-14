import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { StockHeader } from "./components/StockHeader";
import { CandlestickChart } from "./components/CandlestickChart";
import { AgentPanel } from "./components/AgentPanel";
import { ConsensusDecision } from "./components/ConsensusDecision";
import { DocumentCitationModal } from "./components/DocumentCitationModal";
import { ArchitectureModal } from "./components/ArchitectureModal";
import { PerformanceTelemetry } from "./components/PerformanceTelemetry";
import { AudioBriefing } from "./components/AudioBriefing";
import { MacroShockSimulator } from "./components/MacroShockSimulator";
import { SwarmScreenerModal } from "./components/SwarmScreenerModal";
import { OrderTerminalModal } from "./components/OrderTerminalModal";
import { InvestmentMemoModal } from "./components/InvestmentMemoModal";
import { PortfolioWatchlist } from "./components/PortfolioWatchlist";
import { BacktestingEngine } from "./components/BacktestingEngine";
import { SemanticSearchModal } from "./components/SemanticSearchModal";
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

  // Advanced Feature States
  const [activeMacroScenario, setActiveMacroScenario] = useState("BASELINE");
  const [showScreenerModal, setShowScreenerModal] = useState(false);
  const [showOrderTerminal, setShowOrderTerminal] = useState(false);
  const [showInvestmentMemo, setShowInvestmentMemo] = useState(false);
  const [showSemanticSearchModal, setShowSemanticSearchModal] = useState(false);

  // Auto Demo Tour State
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourStep, setTourStep] = useState(1);
  const [tourTitle, setTourTitle] = useState("");
  const [tourDesc, setTourDesc] = useState("");
  const tourTimerRef = useRef(null);

  const stopTour = useCallback(() => {
    if (tourTimerRef.current) {
      tourTimerRef.current.forEach(clearTimeout);
      tourTimerRef.current = null;
    }
    setIsTourRunning(false);
    setShowCitationModal(false);
    setShowArchitectureModal(false);
    setIsDegraded(false);
  }, []);

  const startTour = useCallback(() => {
    if (tourTimerRef.current) {
      tourTimerRef.current.forEach(clearTimeout);
    }
    setIsTourRunning(true);
    setTourStep(1);
    setTourTitle("Security Overview & Tri-Agent Dispatch");
    setTourDesc("Streaming real-time NSE market indicators and initiating parallel multi-agent evaluation for RELIANCE.");
    setSelectedSymbol("RELIANCE");
    setSelectedRiskProfile("BALANCED");
    setIsDegraded(false);
    setShowCitationModal(false);
    setShowArchitectureModal(false);

    const step2 = setTimeout(() => {
      setTourStep(2);
      setTourTitle("Personalized Risk Profiler Guardrails");
      setTourDesc("Switching risk personas: Watch how target, stop-loss (-2.0% vs -6.5%), and position sizing adapt dynamically.");
      setSelectedRiskProfile("CONSERVATIVE");
    }, 4500);

    const step2b = setTimeout(() => {
      setSelectedRiskProfile("AGGRESSIVE");
    }, 7000);

    const step3 = setTimeout(() => {
      setSelectedRiskProfile("BALANCED");
      setTourStep(3);
      setTourTitle("Cross-Asset Swarm Execution");
      setTourDesc("Switching asset to INFY (Infosys Ltd) — synthesizing Q3 FY26 audited RAG data and IT sector institutional flows.");
      setSelectedSymbol("INFY");
    }, 9500);

    const step4 = setTimeout(() => {
      setTourStep(4);
      setTourTitle("Audited SEBI LODR Regulation 30 & 33 Grounding");
      setTourDesc("Inspecting verified regulatory filings: Notice exact chunk attribution IDs, audited figures, and hallucination suppression.");
      setShowCitationModal(true);
    }, 14500);

    const step5 = setTimeout(() => {
      setShowCitationModal(false);
      setTourStep(5);
      setTourTitle("Tri-Agent Consensus & Bayesian Arbitration");
      setTourDesc("Resolving technical momentum vs fundamental valuation conflicts through mathematical Bayesian weighting.");
      setShowArchitectureModal(true);
    }, 19500);

    const step6 = setTimeout(() => {
      setShowArchitectureModal(false);
      setTourStep(6);
      setTourTitle("Graceful Failure & Degraded Data Simulator");
      setTourDesc("Simulating feed failure: Confidence drops to 42%, hallucinations are eliminated, and capital preservation activates.");
      setIsDegraded(true);
    }, 24500);

    const step7 = setTimeout(() => {
      setIsDegraded(false);
      setSelectedSymbol("RELIANCE");
      setTourStep(7);
      setTourTitle("Tour Complete!");
      setTourDesc("VibeFinance AI is fully operational, SEBI-grounded, and ready for deployment!");
    }, 28500);

    const finish = setTimeout(() => {
      setIsTourRunning(false);
    }, 32000);

    tourTimerRef.current = [step2, step2b, step3, step4, step5, step6, step7, finish];
  }, []);

  // Autostart if ?demo=true in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true" || params.get("tour") === "true") {
      startTour();
    }
    return () => {
      if (tourTimerRef.current) {
        tourTimerRef.current.forEach(clearTimeout);
      }
    };
  }, [startTour]);

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
        onOpenScreener={() => setShowScreenerModal(true)}
        onOpenSemanticSearch={() => setShowSemanticSearchModal(true)}
        citationsCount={synthesis.citationsCount}
        isTourRunning={isTourRunning}
        onStartTour={startTour}
        onStopTour={stopTour}
      />

      {/* Main Financial Analytics Workspace */}
      <main className="main-content">
        {/* Autonomous Demo Tour Interactive Banner */}
        {isTourRunning && (
          <div className="demo-tour-banner">
            <div className="tour-badge">
              <span className="tour-pulse-dot"></span>
              <span>LIVE DEMO • STEP {tourStep}/6</span>
            </div>
            <div className="tour-info">
              <div className="tour-title">{tourTitle}</div>
              <div className="tour-desc">{tourDesc}</div>
            </div>
            <button className="tour-exit-btn" onClick={stopTour}>
              ✕ Exit Tour
            </button>
          </div>
        )}

        {/* Active Security Header & Ticker Switcher */}
        <StockHeader
          currentStock={currentStock}
          onSelectStock={(sym) => setSelectedSymbol(sym)}
          onRefreshAgents={handleRefreshAgents}
          isAnalyzing={isAnalyzing}
        />

        {/* Dalal Street AI Voice Briefing */}
        <AudioBriefing
          stock={currentStock}
          synthesis={synthesis}
          technicalResult={technicalResult}
          fundamentalResult={fundamentalResult}
          riskProfile={selectedRiskProfile}
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
          onOpenOrderTerminal={() => setShowOrderTerminal(true)}
          onOpenInvestmentMemo={() => setShowInvestmentMemo(true)}
        />

        {/* Macro Stress-Testing & Shock Simulator */}
        <MacroShockSimulator
          activeScenario={activeMacroScenario}
          onSelectScenario={(sc) => setActiveMacroScenario(sc)}
          stock={currentStock}
          synthesis={synthesis}
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

        {/* Portfolio & Watchlist Tracker (PS 04 Mandatory MVP #5) */}
        <PortfolioWatchlist
          onSelectStock={(sym) => setSelectedSymbol(sym)}
          currentRiskProfile={selectedRiskProfile}
        />

        {/* 30-Day Forward Return Backtesting & Evaluation Engine */}
        <BacktestingEngine />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span><strong>VibeFinance AI</strong> • Autonomous Multi-Agent Financial Intelligence Platform</span>
            <span className="footer-sub">Built for Wild Bugs 24-Hour Online Hackathon • Problem Statement 04</span>
          </div>
          <div className="footer-right">
            <span>Team: <strong>SHAKTI (Wild Bugs Finalist)</strong></span>
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

      <SwarmScreenerModal
        isOpen={showScreenerModal}
        onClose={() => setShowScreenerModal(false)}
        onSelectStock={(sym) => setSelectedSymbol(sym)}
        currentRiskProfile={selectedRiskProfile}
      />

      <OrderTerminalModal
        isOpen={showOrderTerminal}
        onClose={() => setShowOrderTerminal(false)}
        stock={currentStock}
        synthesis={synthesis}
        riskProfile={selectedRiskProfile}
      />

      <InvestmentMemoModal
        isOpen={showInvestmentMemo}
        onClose={() => setShowInvestmentMemo(false)}
        stock={currentStock}
        synthesis={synthesis}
        technicalResult={technicalResult}
        fundamentalResult={fundamentalResult}
        sentimentResult={sentimentResult}
        riskProfile={selectedRiskProfile}
      />

      <SemanticSearchModal
        isOpen={showSemanticSearchModal}
        onClose={() => setShowSemanticSearchModal(false)}
      />
    </div>
  );
}
