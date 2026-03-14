import { Lightbulb, Volume2 } from 'lucide-react';
import React from 'react';

function QuestionSections({ MockInterviewQuestion, activeQuestion, setActiveQuestion }) {
  const speak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(MockInterviewQuestion[activeQuestion].Question);
      u.rate = 0.95; u.pitch = 1.0; u.volume = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  return MockInterviewQuestion && (
    <div style={{ padding: "20px 0" }}>
      {/* Question tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {MockInterviewQuestion.map((_, i) => (
          <button key={i}
            onClick={() => setActiveQuestion(i)}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              border: "1.5px solid",
              borderColor: activeQuestion === i ? "#6366f1" : "#e8edf8",
              background: activeQuestion === i ? "#eef2ff" : "white",
              color: activeQuestion === i ? "#6366f1" : "#64748b",
              fontFamily: "Sora, sans-serif",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Q{i + 1}
          </button>
        ))}
      </div>

      {/* Question text */}
      <div style={{ background: "white", border: "1.5px solid #e8edf8", borderRadius: 18, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#6366f1", marginBottom:10 }}>
              Question {activeQuestion + 1} of {MockInterviewQuestion.length}
            </div>
            <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:17, fontWeight:500, color:"#1e293b", lineHeight:1.65, margin:0 }}>
              {MockInterviewQuestion[activeQuestion].Question}
            </p>
          </div>
          <button onClick={speak} title="Read question aloud"
            style={{ flexShrink:0, width:38, height:38, borderRadius:10, border:"1.5px solid #e8edf8", background:"#f8faff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#6366f1", transition:"all 0.2s" }}>
            <Volume2 size={17} />
          </button>
        </div>
      </div>

      {/* Hint */}
      <div style={{ background: "linear-gradient(135deg,#eff6ff,#e0e7ff)", border: "1.5px solid #bfdbfe", borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Lightbulb size={16} color="#2563eb" />
          <span style={{ fontFamily:"Sora,sans-serif", fontSize:12, fontWeight:700, color:"#2563eb" }}>Tip</span>
        </div>
        <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:13, color:"#1d4ed8", lineHeight:1.55, margin:0 }}>
          Click <strong>Record Answer</strong> when ready to speak. Take your time — structure your answer before recording. 
          At the end you'll receive AI feedback with a model answer to compare.
        </p>
      </div>
    </div>
  );
}

export default QuestionSections;
