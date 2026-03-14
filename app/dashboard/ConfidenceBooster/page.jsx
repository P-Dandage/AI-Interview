"use client";
import React, { useState, useEffect } from "react";
import "./ConfidenceBooster.css";

const quotes = [
  { text: "Believe in yourself and all that you are.", author: "Christian D. Larson" },
  { text: "Confidence comes not from always being right but from not fearing to be wrong.", author: "Peter T. McIntyre" },
  { text: "You are capable of amazing things.", author: "IntraAi Team" },
  { text: "The only limit to your impact is your imagination and commitment.", author: "Tony Robbins" },
  { text: "Every interview is a learning opportunity.", author: "IntraAi Team" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

const mindfulnessPrompts = [
  "Close your eyes for 2 minutes. Imagine yourself walking confidently into the interview room.",
  "Visualize answering questions with calmness and clarity.",
  "Take deep breaths and focus on the present moment — let go of future worries.",
  "Recall a proud achievement. Let that positive energy guide your mindset.",
  "Imagine your success — your name on the offer letter!",
  "Picture the interviewer nodding, impressed by your thoughtful, clear answers.",
];

const breathingSteps = [
  { text: "Breathe in slowly", sub: "through your nose", duration: 4, color: "#6366f1", icon: "🫁" },
  { text: "Hold your breath", sub: "stay calm and still", duration: 7, color: "#f59e0b", icon: "⏸️" },
  { text: "Exhale slowly", sub: "through your mouth", duration: 8, color: "#22c55e", icon: "💨" },
];

const interviewTips = [
  { icon: "🎯", tip: "Research the company thoroughly before your interview" },
  { icon: "⭐", tip: "Use STAR method: Situation, Task, Action, Result" },
  { icon: "📊", tip: "Quantify your achievements with specific numbers" },
  { icon: "🤝", tip: "Prepare 3–5 thoughtful questions to ask the interviewer" },
  { icon: "🧘", tip: "Arrive 10 minutes early — rushing kills confidence" },
  { icon: "💬", tip: "Speak slowly and clearly — silence before answering is okay" },
];

export default function ConfidenceBooster() {
  const [quoteIdx, setQuoteIdx]     = useState(0);
  const [promptIdx, setPromptIdx]   = useState(0);
  const [breathStep, setBreathStep] = useState(0);
  const [breathing, setBreathing]   = useState(false);
  const [timer, setTimer]           = useState(0);
  const [done, setDone]             = useState(false);
  const [progress, setProgress]     = useState(100);

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * quotes.length));
    setPromptIdx(Math.floor(Math.random() * mindfulnessPrompts.length));
  }, []);

  // Breathing timer
  useEffect(() => {
    if (!breathing) return;
    const step = breathingSteps[breathStep];
    setProgress(100);

    const interval = setInterval(() => {
      setTimer(prev => {
        const next = prev - 1;
        setProgress((next / step.duration) * 100);
        if (next <= 0) {
          clearInterval(interval);
          if (breathStep < breathingSteps.length - 1) {
            setBreathStep(s => s + 1);
            const ns = breathingSteps[breathStep + 1];
            setTimer(ns.duration);
          } else {
            setBreathing(false);
            setDone(true);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathing, breathStep]);

  const startBreathing = () => {
    setDone(false);
    setBreathing(true);
    setBreathStep(0);
    setTimer(breathingSteps[0].duration);
    setProgress(100);
  };

  const nextQuote  = () => setQuoteIdx(i => (i + 1) % quotes.length);
  const nextPrompt = () => setPromptIdx(i => (i + 1) % mindfulnessPrompts.length);

  const currentStep = breathingSteps[breathStep];

  return (
    <div className="cb-page">
      {/* Page Header */}
      <div className="cb-page-header">
        <div className="cb-page-label">✦ MENTAL PREP</div>
        <h1 className="cb-page-title">Confidence <span>Booster</span></h1>
        <p className="cb-page-sub">Prepare your mind before the interview — calm, focused, and ready.</p>
      </div>

      <div className="cb-grid">

        {/* ── Motivational Quote ── */}
        <div className="cb-card cb-card--quote">
          <div className="cb-card-icon">💬</div>
          <div className="cb-card-label">Today's Quote</div>
          <blockquote className="cb-quote-text">
            "{quotes[quoteIdx].text}"
          </blockquote>
          <p className="cb-quote-author">— {quotes[quoteIdx].author}</p>
          <button className="cb-btn" onClick={nextQuote}>
            Next Quote →
          </button>
        </div>

        {/* ── Breathing Exercise ── */}
        <div className="cb-card cb-card--breath">
          <div className="cb-card-icon">🫁</div>
          <div className="cb-card-label">4-7-8 Breathing</div>
          <p className="cb-card-desc">A clinically proven technique to calm nerves in under 20 seconds.</p>

          {!breathing && !done && (
            <button className="cb-btn cb-btn--primary" onClick={startBreathing}>
              Start Breathing Exercise
            </button>
          )}

          {breathing && (
            <div className="cb-breath-active">
              {/* Animated ring */}
              <div className="cb-breath-ring" style={{ borderColor: currentStep.color }}>
                <div className="cb-breath-ring-inner">
                  <span className="cb-breath-icon">{currentStep.icon}</span>
                  <span className="cb-breath-timer" style={{ color: currentStep.color }}>{timer}s</span>
                </div>
              </div>
              <p className="cb-breath-label" style={{ color: currentStep.color }}>{currentStep.text}</p>
              <p className="cb-breath-sub">{currentStep.sub}</p>
              {/* Progress bar */}
              <div className="cb-progress-track">
                <div className="cb-progress-fill" style={{ width: `${progress}%`, background: currentStep.color }} />
              </div>
              <div className="cb-steps-row">
                {breathingSteps.map((s, i) => (
                  <div key={i} className={`cb-step-dot ${i === breathStep ? "cb-step-dot--active" : i < breathStep ? "cb-step-dot--done" : ""}`} style={i === breathStep ? { background: s.color } : {}} />
                ))}
              </div>
            </div>
          )}

          {done && (
            <div className="cb-breath-done">
              <div className="cb-done-icon">✅</div>
              <p className="cb-done-text">Exercise complete! You're ready.</p>
              <button className="cb-btn" onClick={startBreathing}>Repeat</button>
            </div>
          )}
        </div>

        {/* ── Mindfulness ── */}
        <div className="cb-card cb-card--mind">
          <div className="cb-card-icon">🧘</div>
          <div className="cb-card-label">Mini Mindfulness</div>
          <p className="cb-prompt-text">{mindfulnessPrompts[promptIdx]}</p>
          <button className="cb-btn" onClick={nextPrompt}>
            New Prompt →
          </button>
        </div>

        {/* ── Interview Tips ── */}
        <div className="cb-card cb-card--tips">
          <div className="cb-card-icon">🚀</div>
          <div className="cb-card-label">Quick Interview Tips</div>
          <div className="cb-tips-grid">
            {interviewTips.map((t, i) => (
              <div className="cb-tip" key={i}>
                <span className="cb-tip-icon">{t.icon}</span>
                <p className="cb-tip-text">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}