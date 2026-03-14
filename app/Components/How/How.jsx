import React from 'react';
import './How.css';

const steps = [
  {
    num: "01",
    icon: "📋",
    title: "Set Your Interview",
    desc: "Enter your job role, paste the job description, and choose experience level. IntraAi tailors every question to your profile.",
  },
  {
    num: "02",
    icon: "🎙️",
    title: "Speak Your Answers",
    desc: "Questions are read aloud. Simply click Record and answer verbally — just like sitting in front of a real interviewer.",
  },
  {
    num: "03",
    icon: "🤖",
    title: "AI Evaluates Instantly",
    desc: "Our AI scores your answer across clarity, depth, technical accuracy, and structure — within seconds of you finishing.",
  },
  {
    num: "04",
    icon: "📈",
    title: "Review & Improve",
    desc: "Get a detailed feedback report with radar charts, model answers, and personalized suggestions. Track your growth over time.",
  },
];

const How = () => {
  return (
    <div className="how-wrapper">
      <div className="section-label-dark">✦ HOW IT WORKS</div>
      <h2 className="how-heading">
        From Zero to <span className="how-heading-accent">Interview-Ready</span><br/>in 4 Simple Steps
      </h2>
      <p className="how-sub">
        No complex setup. No coaching sessions required. Just open IntraAi and start practicing.
      </p>

      <div className="how-steps">
        {steps.map((step, i) => (
          <div className="how-step" key={i}>
            <div className="step-left">
              <div className="step-num">{step.num}</div>
              {i < steps.length - 1 && <div className="step-connector" />}
            </div>
            <div className="step-card">
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default How;
