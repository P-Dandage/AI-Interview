import React from 'react';
import Link from 'next/link';
import './Main_section.css';

const stats = [
  { value: "10K+", label: "Interviews Done" },
  { value: "94%",  label: "Success Rate" },
  { value: "50+",  label: "Job Roles" },
  { value: "4.9★", label: "User Rating" },
];

const Main_section = () => {
  return (
    <div className="hero-inner">
      {/* Badge */}
      <div className="hero-badge">
        <span className="badge-dot" />
        <span>AI-Powered Interview Coach — Now Live</span>
      </div>

      {/* Heading */}
      <h1 className="hero-heading">
        Ace Every Interview<br/>
        <span className="hero-heading-gradient">with Real-Time AI</span><br/>
        Feedback
      </h1>

      {/* Sub */}
      <p className="hero-sub">
        Practice with industry-specific questions, speak your answers, and get
        instant AI-scored feedback on clarity, depth, and confidence — just like a real interview panel.
      </p>

      {/* CTAs */}
      <div className="hero-cta-row">
        <Link href="/dashboard">
          <button className="hero-btn-primary">
            Start Free Practice
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </Link>
        <a href="#how">
          <button className="hero-btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16 10,8" fill="currentColor"/></svg>
            See How It Works
          </button>
        </a>
      </div>

      {/* Stats row */}
      <div className="hero-stats">
        {stats.map((s) => (
          <div className="hero-stat" key={s.label}>
            <div className="hero-stat-value">{s.value}</div>
            <div className="hero-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Floating cards */}
      <div className="hero-float-card hero-float-card--left">
        <div className="hfc-icon">🎯</div>
        <div>
          <div className="hfc-title">Score: 8.4/10</div>
          <div className="hfc-sub">Communication — Excellent</div>
        </div>
      </div>

      <div className="hero-float-card hero-float-card--right">
        <div className="hfc-icon">✅</div>
        <div>
          <div className="hfc-title">Answer Recorded</div>
          <div className="hfc-sub">AI feedback ready in 2s</div>
        </div>
      </div>
    </div>
  );
};

export default Main_section;
