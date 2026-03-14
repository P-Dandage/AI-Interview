"use client";
import React, { useState } from 'react';
import './Feature.css';

const features = [
  {
    icon: "🧠",
    title: "AI-Powered Evaluation",
    desc: "Get real-time feedback from AI trained on thousands of real interviews. Every answer is scored across 5 dimensions including clarity, depth, and accuracy.",
    tag: "Core Feature",
    highlight: true,
  },
  {
    icon: "🎙️",
    title: "Voice-to-Text Answers",
    desc: "Simply speak your answer naturally. Our speech recognition converts it to text and sends it for AI analysis — no typing needed.",
    tag: "Hands-Free",
    highlight: false,
  },
  {
    icon: "👁️",
    title: "Live Webcam Confidence Check",
    desc: "BlazeFace AI monitors your presence through the webcam — just like a real interviewer — keeping you sharp and focused.",
    tag: "Unique",
    highlight: false,
  },
  {
    icon: "📊",
    title: "Detailed Score Dashboard",
    desc: "Visual radar charts, per-question breakdowns, and trend analysis across multiple sessions help you track real improvement.",
    tag: "Analytics",
    highlight: false,
  },
  {
    icon: "🎯",
    title: "Job-Specific Questions",
    desc: "Paste your job description and get tailored questions for your exact role — from Full Stack to Data Scientist to Marketing Manager.",
    tag: "Personalized",
    highlight: false,
  },
  {
    icon: "⚡",
    title: "Instant AI Feedback",
    desc: "No waiting. Get structured feedback with strengths, areas for improvement, and actionable suggestions within seconds of answering.",
    tag: "Real-Time",
    highlight: false,
  },
];

const Feature = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="feature-wrapper">
      <div className="section-label">✦ PLATFORM FEATURES</div>
      <h2 className="feature-heading">
        Everything You Need to<br/>
        <span className="feature-heading-accent">Land Your Dream Job</span>
      </h2>
      <p className="feature-sub">
        Built different from other platforms — IntraAi goes beyond MCQs and text prompts to give you a real interview simulation.
      </p>

      <div className="feature-grid">
        {features.map((f, i) => (
          <div
            key={i}
            className={`feature-card ${f.highlight ? "feature-card--featured" : ""} ${hovered === i ? "feature-card--hovered" : ""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="feature-card-top">
              <span className="feature-tag">{f.tag}</span>
              <div className="feature-icon">{f.icon}</div>
            </div>
            <h3 className="feature-card-title">{f.title}</h3>
            <p className="feature-card-desc">{f.desc}</p>
            <div className="feature-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feature;
