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
import { VectorRAGExplorer } from "./components/VectorRAGExplorer";
import { Activity, Briefcase, Zap, BarChart3, Database } from "lucide-react";
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

  // Multi-Screen Navigation Tab State
  const [activeViewTab, setActiveViewTab] = useState("TERMINAL"); // "TERMINAL" | "PORTFOLIO" | "MACRO" | "BACKTEST" | "VECTOR_RAG"

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
    setActiveViewTab("TERMINAL");
  }, []);

  const startTour = useCallback(() => {
    if (tourTimerRef.current) {
      tourTimerRef.current.forEach(clearTimeout);
    }
    setIsTourRunning(true);
    setTourStep(1);
    setTourTitle("Screen 1: Swarm Terminal & Real-Time Signals");
    setTourDesc("Streaming real-time NSE price momentum, 50/200 DMA crossovers, and parallel agent evaluation for RELIANCE.");
    setSelectedSymbol("RELIANCE");
    setSelectedRiskProfile("BALANCED");
    setActiveViewTab("TERMINAL");
    setIsDegraded(false);
    setShowCitationModal(false);
    setShowArchitectureModal(false);

    const step2 = setTimeout(() => {
      setTourStep(2);
      setTourTitle("Screen 1: Personalized Risk Profiling Guardrails");
      setTourDesc("Switching risk personas: Watch dynamic stop-loss (-2.0% vs -6.5%) and position sizing adapt in real time.");
      setSelectedRiskProfile("CONSERVATIVE");
    }, 4500);

    const step2b = setTimeout(() => {
      setSelectedRiskProfile("AGGRESSIVE");
    }, 7000);

    const step3 = setTimeout(() => {
      setSelectedRiskProfile("BALANCED");
      setTourStep(3);
      setTourTitle("Screen 2: Active Portfolio & Watchlist State (MVP Item #5)");
      setTourDesc("Tracking client portfolio valuation, +6.8% P&L, portfolio beta (1.06), and single-stock concentration limits.");
      setActiveViewTab("PORTFOLIO");
    }, 9500);

    const step4 = setTimeout(() => {
      setTourStep(4);
      setTourTitle("Screen 3: Macro Shock Stress-Testing ('What-If' Engine)");
      setTourDesc("Simulating an unexpected RBI +50 bps Rate Hike: auto-tightening stop loss by -1.8% and adding hedging alerts.");
      setActiveViewTab("MACRO");
      setActiveMacroScenario("RBI_RATE_HIKE");
    }, 14500);

    const step5 = setTimeout(() => {
      setTourStep(5);
      setTourTitle("Screen 4: Vector RAG Semantic Search Studio");
      setTourDesc("Live cosine similarity search across audited SEBI LODR Regulation 30 & 33 disclosures with verified chunks.");
      setActiveViewTab("VECTOR_RAG");
    }, 19500);

    const step6 = setTimeout(() => {
      setTourStep(6);
      setTourTitle("Screen 5: 30-Day Forward Return Evaluation & Latency");
      setTourDesc("Verifying an 84.6% win rate across 48 evaluated trades with sub-second parallel agent latency telemetry.");
      setActiveViewTab("BACKTEST");
    }, 24500);

    const step7 = setTimeout(() => {
      setActiveViewTab("TERMINAL");
      setActiveMacroScenario("BASELINE");
      setTourStep(7);
      setTourTitle("Screen 1: Graceful Failure & Degraded Data Simulator");
      setTourDesc("Simulating feed failure: system suppresses uncited claims and prioritizes capital preservation without crashing.");
      setIsDegraded(true);
    }, 29500);

    const step8 = setTimeout(() => {
      setIsDegraded(false);
      setSelectedSymbol("RELIANCE");
      setTourStep(8);
      setTourTitle("Tour Complete! Uncluttered Multi-Screen Architecture");
      setTourDesc("VibeFinance AI provides an institutional-grade, organized terminal for Indian retail investors.");
    }, 33500);

    const finish = setTimeout(() => {
      setIsTourRunning(false);
    }, 36500);

    tourTimerRef.current = [step2, step2b, step3, step4, step5, step6, step7, step8, finish];
  }, []);

  // Autostart if ?demo=true in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let timer;
    if (params.get("demo") === "true" || params.get("tour") === "true") {
      timer = setTimeout(() => {
        startTour();
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
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
              <span>LIVE DEMO • STEP {tourStep}/8</span>
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

        {/* Multi-Screen Navigation Tabs Bar */}
        <nav className="workspace-tabs-bar">
          <div className="tabs-container">
            <button
              className={`ws-tab-btn ${activeViewTab === "TERMINAL" ? "active" : ""}`}
              onClick={() => setActiveViewTab("TERMINAL")}
            >
              <Activity size={15} />
              <span>Swarm Terminal</span>
              <span className="tab-pill-badge">{currentStock.symbol}</span>
            </button>
            <button
              className={`ws-tab-btn ${activeViewTab === "PORTFOLIO" ? "active" : ""}`}
              onClick={() => setActiveViewTab("PORTFOLIO")}
            >
              <Briefcase size={15} />
              <span>Portfolio & Watchlist</span>
              <span className="tab-pill-badge pos">+6.8%</span>
            </button>
            <button
              className={`ws-tab-btn ${activeViewTab === "MACRO" ? "active" : ""}`}
              onClick={() => setActiveViewTab("MACRO")}
            >
              <Zap size={15} />
              <span>Macro Stress-Test</span>
              <span className="tab-pill-badge amber">What-If</span>
            </button>
            <button
              className={`ws-tab-btn ${activeViewTab === "BACKTEST" ? "active" : ""}`}
              onClick={() => setActiveViewTab("BACKTEST")}
            >
              <BarChart3 size={15} />
              <span>30D Backtest & Metrics</span>
              <span className="tab-pill-badge cyan">84.6% Win</span>
            </button>
            <button
              className={`ws-tab-btn ${activeViewTab === "VECTOR_RAG" ? "active" : ""}`}
              onClick={() => setActiveViewTab("VECTOR_RAG")}
            >
              <Database size={15} />
              <span>Vector RAG Explorer</span>
              <span className="tab-pill-badge purple">SEBI LODR</span>
            </button>
          </div>
        </nav>

        {/* ======================================================== */}
        {/* SCREEN 1: SWARM TERMINAL (Core Market Intelligence)      */}
        {/* ======================================================== */}
        {activeViewTab === "TERMINAL" && (
          <div className="tab-screen-view active-view">
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

            {/* Price Action & Indicator Chart */}
            <CandlestickChart stock={currentStock} />

            {/* Tri-Agent Parallel Execution Panel */}
            <AgentPanel
              technicalResult={technicalResult}
              fundamentalResult={fundamentalResult}
              sentimentResult={sentimentResult}
              onOpenCitations={() => setShowCitationModal(true)}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: PORTFOLIO & WATCHLIST (Mandatory MVP Item #5)   */}
        {/* ======================================================== */}
        {activeViewTab === "PORTFOLIO" && (
          <div className="tab-screen-view active-view">
            <PortfolioWatchlist
              onSelectStock={(sym) => {
                setSelectedSymbol(sym);
                setActiveViewTab("TERMINAL");
              }}
              currentRiskProfile={selectedRiskProfile}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: MACRO STRESS-TESTING ("What-If" Shock Engine)   */}
        {/* ======================================================== */}
        {activeViewTab === "MACRO" && (
          <div className="tab-screen-view active-view">
            <MacroShockSimulator
              activeScenario={activeMacroScenario}
              onSelectScenario={(sc) => setActiveMacroScenario(sc)}
              stock={currentStock}
              synthesis={synthesis}
              isAlwaysOpen={true}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 4: 30-DAY BACKTESTING & EVALUATION TELEMETRY      */}
        {/* ======================================================== */}
        {activeViewTab === "BACKTEST" && (
          <div className="tab-screen-view active-view">
            <BacktestingEngine isAlwaysOpen={true} />

            <PerformanceTelemetry
              synthesis={synthesis}
              technicalResult={technicalResult}
              fundamentalResult={fundamentalResult}
              sentimentResult={sentimentResult}
              isDegraded={isDegraded}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 5: VECTOR RAG DOCUMENT EXPLORER (SEBI LODR)       */}
        {/* ======================================================== */}
        {activeViewTab === "VECTOR_RAG" && (
          <div className="tab-screen-view active-view">
            <VectorRAGExplorer
              onSelectStock={(sym) => {
                setSelectedSymbol(sym);
                setActiveViewTab("TERMINAL");
              }}
            />
          </div>
        )}
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
