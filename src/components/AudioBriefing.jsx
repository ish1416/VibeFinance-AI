import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from "lucide-react";

export function AudioBriefing({ stock, synthesis, technicalResult, fundamentalResult, riskProfile }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.1);
  const [isSupported, setIsSupported] = useState(true);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Cancel audio if stock changes
  useEffect(() => {
    if (synthRef.current && isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [stock.symbol]);

  const generateBriefingText = () => {
    const verdictText = synthesis.verdict.replace("_", " ");
    return `VibeFinance Dalal Street Intelligence Report for ${stock.name}, trading at ${stock.currentPrice} rupees. 
    Our Tri-Agent consensus engine has reached a verdict of ${verdictText}, with a Bayesian confidence rating of ${synthesis.confidenceScore} percent. 
    The Technical Agent identifies ${technicalResult.momentumSignal} momentum with a 14-period RSI of ${technicalResult.rsi}. 
    Our Fundamental Agent retrieved audited SEBI LODR disclosures confirming a Financial Health rating of ${fundamentalResult.financialHealthScore} out of 100. 
    For your ${riskProfile.toLowerCase()} risk profile, we enforce a target of ${synthesis.targetPrice} rupees, protected by a strict stop-loss at ${synthesis.stopLossPrice} rupees.`;
  };

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synthRef.current.cancel();
    const text = generateBriefingText();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick an English voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.lang.startsWith("en-IN") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-US")) && !v.name.includes("Bad")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  };

  const handlePause = () => {
    if (!synthRef.current) return;
    synthRef.current.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`audio-briefing-card ${isPlaying ? "briefing-playing" : ""}`}>
      <div className="briefing-left">
        <div className="briefing-icon-wrap">
          <Volume2 size={18} className={isPlaying ? "sound-anim" : ""} />
        </div>
        <div className="briefing-text-block">
          <div className="briefing-title-row">
            <span className="briefing-tag">AI AUDIO INTELLIGENCE</span>
            <span className="briefing-badge">
              <Sparkles size={11} /> 60-Sec Dalal Street Voice Briefing
            </span>
          </div>
          <p className="briefing-desc">
            {isPlaying
              ? `Broadcasting autonomous multi-agent synthesis for ${stock.symbol}...`
              : `Listen to real-time SEBI-grounded audio brief for ${stock.symbol} (${stock.name}).`}
          </p>
        </div>
      </div>

      <div className="briefing-controls">
        {isPlaying && (
          <div className="audio-equalizer">
            <span className="eq-bar bar-1"></span>
            <span className="eq-bar bar-2"></span>
            <span className="eq-bar bar-3"></span>
            <span className="eq-bar bar-4"></span>
            <span className="eq-bar bar-5"></span>
          </div>
        )}

        <div className="briefing-buttons">
          {!isPlaying ? (
            <button className="btn-briefing-play" onClick={handlePlay} title="Play audio briefing">
              <Play size={13} fill="currentColor" />
              <span>{isPaused ? "Resume Briefing" : "Listen to AI Brief"}</span>
            </button>
          ) : (
            <button className="btn-briefing-pause" onClick={handlePause} title="Pause audio">
              <Pause size={13} fill="currentColor" />
              <span>Pause</span>
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button className="btn-briefing-stop" onClick={handleStop} title="Stop audio">
              <RotateCcw size={13} />
            </button>
          )}

          <button
            className="btn-briefing-speed"
            onClick={() => setSpeechRate((prev) => (prev === 1.1 ? 1.25 : prev === 1.25 ? 1.0 : 1.1))}
            title="Speech speed"
          >
            {speechRate}x
          </button>
        </div>
      </div>
    </div>
  );
}
