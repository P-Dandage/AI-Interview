"use client";
import React from "react";
import "./HowItWorks.css";

const steps = [
  { num: "01", icon: "🔐", title: "Login Securely", desc: "Sign in with your Google or email account via Clerk authentication — fast, safe, and passwordless." },
  { num: "02", icon: "🎯", title: "Set Your Interview", desc: "Enter your job role, paste the job description, and pick your experience level. IntraAi tailors every question to your profile." },
  { num: "03", icon: "🎙️", title: "Speak Your Answers", desc: "Questions are read aloud. Click Record and answer verbally — just like sitting in front of a real interviewer panel." },
  { num: "04", icon: "🤖", title: "Real-Time AI Analysis", desc: "The AI evaluates your speech, content quality, and confidence cues within seconds of your answer finishing." },
  { num: "05", icon: "📊", title: "Get Instant Feedback", desc: "Receive a score out of 10, model answers, strengths, areas to improve, and specific suggestions for every question." },
  { num: "06", icon: "📈", title: "Track & Improve", desc: "All sessions are saved. Review past feedback, monitor score trends, and repeat until you're confident." },
];

const whys = [
  { icon: "🧠", title: "AI-Generated Questions", desc: "Role-specific questions based on your exact job description — not generic MCQs." },
  { icon: "🎙️", title: "Voice Answering", desc: "No typing needed. Speak naturally; our speech-to-text captures every word." },
  { icon: "👁️", title: "Webcam Confidence Check", desc: "Maintains focus and simulates real interview pressure with live face detection." },
  { icon: "⚡", title: "Instant Structured Feedback", desc: "Scores + strengths + areas for improvement + suggestions in under 3 seconds." },
  { icon: "📅", title: "Unlimited Practice", desc: "No session limits. Practice daily, track trends, and build genuine confidence." },
  { icon: "🎖️", title: "Selection Probability", desc: "Get an estimated chance of selection based on your overall performance score." },
];

const HowItWorks = () => {
  return (
    <div className="hiw-page">

      {/* ── Intro Hero ── */}
      <div className="hiw-intro">
        <div className="hiw-label">✦ PLATFORM GUIDE</div>
        <h1 className="hiw-title">How <span>IntraAi</span> Works</h1>
        <p className="hiw-intro-text">
          IntraAi is a fully automated AI mock interview platform built for students and job seekers
          who want real practice — not just theory. Unlike platforms that rely on text responses or
          human evaluators, IntraAi uses voice recognition, webcam monitoring, and large language
          model evaluation to simulate a real interview environment.
        </p>
        <p className="hiw-intro-text">
          After every session you receive a detailed performance report — radar chart skill breakdown,
          per-question scores, model answers, and personalized suggestions — so you always know exactly
          what to work on next.
        </p>
        <div className="hiw-intro-tags">
          {["Voice-Based", "AI-Scored", "Webcam Enabled", "Unlimited Practice", "Instant Feedback"].map(t => (
            <span className="hiw-tag" key={t}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Step by Step ── */}
      <div className="hiw-section">
        <div className="hiw-section-label">📌 STEP-BY-STEP</div>
        <h2 className="hiw-section-title">The Process</h2>
        <div className="hiw-steps">
          {steps.map((s, i) => (
            <div className="hiw-step" key={i}>
              <div className="hiw-step-left">
                <div className="hiw-step-num">{s.num}</div>
                {i < steps.length - 1 && <div className="hiw-step-line" />}
              </div>
              <div className="hiw-step-card">
                <span className="hiw-step-icon">{s.icon}</span>
                <div>
                  <h3 className="hiw-step-title">{s.title}</h3>
                  <p className="hiw-step-desc">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Why Use ── */}
      <div className="hiw-section">
        <div className="hiw-section-label">🌟 WHY INTRAAI</div>
        <h2 className="hiw-section-title">Built Different</h2>
        <p className="hiw-section-sub">Everything competitors lack — IntraAi has by design.</p>
        <div className="hiw-why-grid">
          {whys.map((w, i) => (
            <div className="hiw-why-card" key={i}>
              <div className="hiw-why-icon">{w.icon}</div>
              <h3 className="hiw-why-title">{w.title}</h3>
              <p className="hiw-why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HowItWorks;