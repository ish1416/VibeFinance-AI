import React from "react";
import { Activity, ShieldAlert, Cpu, BookOpen, AlertTriangle, Play, Square, Layers, Database } from "lucide-react";

export function Navbar({
  isDegraded,
  onToggleDegraded,
  onOpenArchitecture,
  onOpenCitations,
  onOpenScreener,
  onOpenSemanticSearch,
  citationsCount,
  isTourRunning,
  onStartTour,
  onStopTour
}) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="brand-logo">
          <div className="brand-icon">
            <span className="brand-v">V</span>
            <span className="brand-dot"></span>
          </div>
          <div className="brand-text">
            <span className="brand-title">VibeFinance <span className="brand-ai">AI</span></span>
            <span className="brand-subtitle">Autonomous Multi-Agent Financial Intelligence</span>
          </div>
        </div>

        <div className="market-ticker-pill">
          <span className="ticker-dot pulse"></span>
          <span className="ticker-status">NSE LIVE</span>
          <span className="ticker-val">NIFTY 50 24,862.15</span>
          <span className="ticker-change positive">+0.48%</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Interactive Autonomous Demo Tour */}
        <button
          className={`btn-tour ${isTourRunning ? "active-tour" : ""}`}
          onClick={isTourRunning ? onStopTour : onStartTour}
          title="Play autonomous walkthrough demo of VibeFinance AI"
        >
          {isTourRunning ? (
            <>
              <Square size={13} fill="currentColor" />
              <span>Stop Tour</span>
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" />
              <span>Auto Demo Tour</span>
            </>
          )}
        </button>

        {/* Degraded Mode Simulation Toggle (PS 04 Mandatory Requirement) */}
        <button
          className={`btn-degraded ${isDegraded ? "active-degraded" : ""}`}
          onClick={onToggleDegraded}
          title="Simulate degraded feeds or missing SEBI filings to evaluate graceful failure handling"
        >
          {isDegraded ? (
            <>
              <AlertTriangle size={15} className="blink" />
              <span>Degraded Mode: ACTIVE</span>
            </>
          ) : (
            <>
              <ShieldAlert size={15} />
              <span>Simulate Degraded Data</span>
            </>
          )}
        </button>

        {/* Document Citations Drawer Button */}
        <button className="btn-citations" onClick={onOpenCitations}>
          <BookOpen size={15} />
          <span>Verified SEBI Citations</span>
          <span className="citation-badge">{citationsCount}</span>
        </button>

        {/* Vector RAG Semantic Search Button */}
        <button className="btn-vector" onClick={onOpenSemanticSearch} title="Explore Vector Embeddings & Semantic Search across SEBI LODR Filings">
          <Database size={15} />
          <span>Vector RAG</span>
        </button>

        {/* Swarm Screener Matrix Button */}
        <button className="btn-screener" onClick={onOpenScreener} title="Compare all 4 securities across multi-agent dimensions">
          <Layers size={15} />
          <span>Swarm Matrix</span>
        </button>

        {/* System Architecture & Rubric Review Modal */}
        <button className="btn-architecture" onClick={onOpenArchitecture}>
          <Cpu size={15} />
          <span>Architecture & Rubric</span>
        </button>

        {/* User Account / Team Badge */}
        <div className="user-badge">
          <div className="user-avatar">IS</div>
          <div className="user-info">
            <span className="user-name">Ishita Singh</span>
            <span className="user-team">Team SHAKTI</span>
          </div>
        </div>
      </div>
    </header>
  );
}
