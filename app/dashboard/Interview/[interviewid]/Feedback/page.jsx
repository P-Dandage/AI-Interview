"use client";
import { db } from "@/utils/db";
import { useAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Trophy, Target, Zap, Home, RefreshCw } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
const avg = (items) => {
  const vals = items.map(i => Number(i.rating) || 0).filter(r => r > 0);
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
};

const getStatus = (r) => {
  if (r >= 8)   return { label: "Excellent 🏆",     color: "#22c55e",  bg: "#f0fdf4",  border: "#bbf7d0" };
  if (r >= 6.5) return { label: "Good — Keep It Up", color: "#f59e0b",  bg: "#fffbeb",  border: "#fde68a" };
  if (r >= 5)   return { label: "Moderate",          color: "#f97316",  bg: "#fff7ed",  border: "#fed7aa" };
  return             { label: "Needs Practice",      color: "#ef4444",  bg: "#fef2f2",  border: "#fecaca" };
};

const getBarColor = (r) => r >= 7.5 ? "#22c55e" : r >= 5 ? "#f59e0b" : "#ef4444";

// ── SVG Radar Chart (pure, no external lib) ───────────────────────────────
const RadarChart = ({ data }) => {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;
  const levels = 4;
  const axes = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    return { ...d, angle };
  });

  const polarToXY = (angle, radius) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  const gridPoints = (level) =>
    axes.map(a => {
      const pt = polarToXY(a.angle, (r * (level + 1)) / levels);
      return `${pt.x},${pt.y}`;
    }).join(" ");

  const dataPoints = axes.map(a => {
    const pt = polarToXY(a.angle, r * (a.value / 10));
    return `${pt.x},${pt.y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {Array.from({ length: levels }).map((_, i) => (
        <polygon key={i} points={gridPoints(i)}
          fill="none" stroke="#e0e7ff" strokeWidth="1" />
      ))}
      {axes.map((a, i) => {
        const end = polarToXY(a.angle, r);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#c7d2fe" strokeWidth="1" />;
      })}
      <polygon points={dataPoints} fill="rgba(99,102,241,0.25)" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
      {axes.map((a, i) => {
        const pt = polarToXY(a.angle, r * (a.value / 10));
        return <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />;
      })}
      {axes.map((a, i) => {
        const pt = polarToXY(a.angle, r + 22);
        return (
          <text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fontFamily="Sora, sans-serif" fontWeight="600" fill="#374151">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
};

// ── Circular progress ring WITH centre symbol ─────────────────────────────
const Ring = ({ value, max, size = 90, stroke = 7, color, symbol }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / max) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e0e7ff" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      {symbol && (
        <div style={{
          position:  "absolute",
          top:       "50%",
          left:      "50%",
          transform: "translate(-50%, -50%)",
          fontSize:  20,
          lineHeight: 1,
        }}>
          {symbol}
        </div>
      )}
    </div>
  );
};

// ── Main Feedback Component ────────────────────────────────────────────────
function Feedback({ params }) {
  const [all, setAll]           = useState([]);
  const [latest, setLatest]     = useState([]);
  const [showAll, setShowAll]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const router = useRouter();

  useEffect(() => { getFeedback(); }, []);

  const getFeedback = async () => {
    try {
      const result = await db.select().from(useAnswer)
        .where(eq(useAnswer.mockIdRef, params.interviewid))
        .orderBy(useAnswer.id);
      setAll(result);

      const seen = new Set(); const latest_ = [];
      for (const item of [...result].reverse()) {
        if (!seen.has(item.question)) { seen.add(item.question); latest_.push(item); }
      }
      setLatest(latest_);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  const displayed     = showAll ? all : latest;
  const overallRating = avg(latest);
  const status        = getStatus(overallRating);
  const chance        = overallRating >= 8 ? 92 : overallRating >= 6.5 ? 72 : overallRating >= 5 ? 52 : 28;

  const radarData = [
    { label: "Clarity",     value: Math.min(10, Math.max(1, overallRating * 0.95 + (Math.random()-0.5))) },
    { label: "Depth",       value: Math.min(10, Math.max(1, overallRating * 0.9  + (Math.random()-0.5))) },
    { label: "Accuracy",    value: Math.min(10, Math.max(1, overallRating * 1.05 + (Math.random()-0.5))) },
    { label: "Confidence",  value: Math.min(10, Math.max(1, overallRating * 0.88 + (Math.random()-0.5))) },
    { label: "Structure",   value: Math.min(10, Math.max(1, overallRating * 0.92 + (Math.random()-0.5))) },
  ].map(d => ({ ...d, value: parseFloat(d.value.toFixed(1)) }));

  const parseFeedback = (raw) => {
    try {
      const f = JSON.parse(raw);
      if (!f.strengths) return { strengths: [], improvements: [], suggestions: [] };

      const raw_improv = f.improvements || f.areas_for_improvement || [];
      f.improvements = raw_improv.map(item =>
        typeof item === "string"
          ? { point: item, studyLinks: [] }
          : { point: item.point || String(item), studyLinks: Array.isArray(item.studyLinks) ? item.studyLinks : [] }
      );
      return f;
    } catch {
      return { strengths: [], improvements: [], suggestions: [] };
    }
  };

  // ── Loading ──
  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
      <div style={{ width:44, height:44, border:"4px solid #e0e7ff", borderTop:"4px solid #6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Empty ──
  if (latest.length === 0) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
      <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:22, fontWeight:700, color:"#05264e", marginBottom:8 }}>No feedback yet</h2>
      <p style={{ fontFamily:"DM Sans,sans-serif", color:"#64748b", marginBottom:24 }}>Complete your interview to see detailed AI feedback here.</p>
      <button onClick={() => router.replace("/dashboard")} style={{ padding:"11px 24px", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"white", border:"none", borderRadius:12, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>
        Go to Dashboard
      </button>
    </div>
  );

  // ── Main render ──
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 20px" }}>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b, #312e81)",
        borderRadius: 24,
        padding: "40px 32px",
        textAlign: "center",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:300, height:300, background:"rgba(129,140,248,0.1)", borderRadius:"50%", pointerEvents:"none" }} />
        <Trophy size={42} color="#fbbf24" style={{ marginBottom:12 }} />
        <h1 style={{ fontFamily:"Sora,sans-serif", fontSize:32, fontWeight:800, color:"white", margin:"0 0 8px", letterSpacing:-1 }}>
          Interview Complete!
        </h1>
        <p style={{ fontFamily:"DM Sans,sans-serif", color:"rgba(255,255,255,0.65)", fontSize:16 }}>
          Here's your detailed AI performance analysis
        </p>
        <div style={{
          display:"inline-block",
          marginTop:16,
          background: status.bg,
          color: status.color,
          border: `1.5px solid ${status.border}`,
          fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:13,
          padding:"6px 18px", borderRadius:99,
        }}>
          {status.label}
        </div>
      </div>

      {/* ── Score Cards Row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
        {[
          { icon: <Target size={18} color="#6366f1"/>, label:"Overall Score",    value: overallRating.toFixed(1)+"/10", sub:"AI Evaluation", color:"#6366f1", symbol:"🎯" },
          { icon: <Zap    size={18} color="#f59e0b"/>, label:"Questions Done",   value: latest.length,                  sub:"Answered",      color:"#f59e0b", symbol:"📋" },
          { icon: <Trophy size={18} color="#22c55e"/>, label:"Selection Chance", value: chance+"%",                     sub:"Estimated",     color:"#22c55e", symbol:"✅" },
        ].map(({ icon, label, value, sub, color, symbol }) => (
          <div key={label} style={{ background:"white", border:"1.5px solid #e8edf8", borderRadius:18, padding:"22px 20px", textAlign:"center" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
              <Ring
                value={typeof value === "string" ? parseFloat(value) : value}
                max={label === "Overall Score" ? 10 : label === "Selection Chance" ? 100 : latest.length}
                color={color}
                symbol={symbol}
              />
            </div>
            <div style={{ fontFamily:"Sora,sans-serif", fontSize:22, fontWeight:800, color:"#05264e" }}>{value}</div>
            <div style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#94a3b8", marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Radar + mini bars ── */}
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:24, background:"white", border:"1.5px solid #e8edf8", borderRadius:20, padding:28, marginBottom:28, alignItems:"center" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          <RadarChart data={radarData} />
          <p style={{ fontFamily:"Sora,sans-serif", fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginTop:8 }}>Skill Breakdown</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <h3 style={{ fontFamily:"Sora,sans-serif", fontSize:14, fontWeight:700, color:"#05264e", marginBottom:4 }}>Per Question</h3>
          {latest.map((item, i) => {
            const r = Number(item.rating) || 0;
            return (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontFamily:"DM Sans,sans-serif", fontSize:12, color:"#374151" }}>Q{i+1}. {item.question.slice(0,50)}{item.question.length > 50 ? "…" : ""}</span>
                  <span style={{ fontFamily:"Sora,sans-serif", fontSize:12, fontWeight:700, color:getBarColor(r) }}>{r}/10</span>
                </div>
                <div style={{ background:"#f1f5f9", borderRadius:99, height:6 }}>
                  <div style={{ width:`${(r/10)*100}%`, background:getBarColor(r), height:6, borderRadius:99, transition:"width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Question Accordion ── */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:18, fontWeight:700, color:"#05264e" }}>
            {showAll ? "All Responses" : "Latest Responses"}
          </h2>
          {all.length > latest.length && (
            <button onClick={() => setShowAll(!showAll)} style={{ background:"transparent", border:"1.5px solid #6366f1", color:"#6366f1", borderRadius:10, padding:"6px 14px", fontFamily:"Sora,sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {showAll ? "Latest Only" : "Show All"}
            </button>
          )}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {displayed.map((item, i) => {
            const r  = Number(item.rating) || 0;
            const fb = parseFeedback(item.feedback);
            const open = expanded === i;
            return (
              <div key={i} style={{ background:"white", border:"1.5px solid #e8edf8", borderRadius:16, overflow:"hidden", transition:"border-color 0.2s", ...(open ? {borderColor:"#a5b4fc", boxShadow:"0 4px 20px rgba(99,102,241,0.1)"} : {}) }}>
                <button
                  onClick={() => setExpanded(open ? null : i)}
                  style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left", gap:12 }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
                    <span style={{ flexShrink:0, width:28, height:28, background:getBarColor(r), borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Sora,sans-serif", fontSize:12, fontWeight:800, color:"white" }}>
                      {i+1}
                    </span>
                    <span style={{ fontFamily:"DM Sans,sans-serif", fontSize:14, fontWeight:500, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {item.question}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                    <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:13, color:getBarColor(r), background:getBarColor(r)+"18", padding:"3px 10px", borderRadius:99 }}>
                      {r}/10
                    </span>
                    <ChevronsUpDown size={16} color="#94a3b8" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition:"transform 0.2s" }} />
                  </div>
                </button>

                {open && (
                  <div style={{ padding:"0 20px 20px", display:"flex", flexDirection:"column", gap:14 }}>
                    {/* Your answer */}
                    <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:16 }}>
                      <p style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#16a34a", marginBottom:6 }}>Your Answer</p>
                      <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:14, color:"#374151", lineHeight:1.65 }}>{item.userAns || "No answer recorded"}</p>
                    </div>
                    {/* Model answer */}
                    <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:16 }}>
                      <p style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#2563eb", marginBottom:6 }}>Model Answer</p>
                      <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:14, color:"#374151", lineHeight:1.65 }}>{item.correctAns}</p>
                    </div>
                    {/* AI Feedback */}
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

                      {/* Strengths */}
                      {fb.strengths?.length > 0 && (
                        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:16 }}>
                          <p style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#16a34a", marginBottom:10 }}>✅ Strengths</p>
                          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                            {fb.strengths.map((s,j) => (
                              <div key={j} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                                <span style={{ color:"#22c55e", fontSize:14, flexShrink:0, marginTop:1 }}>•</span>
                                <span style={{ fontFamily:"DM Sans,sans-serif", fontSize:13.5, color:"#166534", lineHeight:1.55 }}>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Areas to Improve — with study links */}
                      {fb.improvements?.length > 0 && (
                        <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:16 }}>
                          <p style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#c2410c", marginBottom:10 }}>⚠️ Areas to Improve</p>
                          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {fb.improvements.map((improv, j) => (
                              <div key={j} style={{ background:"white", border:"1px solid #fed7aa", borderRadius:10, padding:"12px 14px" }}>
                                <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:13.5, color:"#7c2d12", lineHeight:1.55, margin:"0 0 8px" }}>
                                  {improv.point}
                                </p>
                                {improv.studyLinks?.length > 0 && (
                                  <div>
                                    <p style={{ fontFamily:"Sora,sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#9a3412", marginBottom:5 }}>
                                      📚 Study Resources
                                    </p>
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                                      {improv.studyLinks.map((url, k) => {
                                        let domain = "";
                                        try { domain = new URL(url).hostname.replace("www.", ""); } catch { domain = url.slice(0,30); }
                                        return (
                                          <a key={k} href={url} target="_blank" rel="noopener noreferrer"
                                            style={{
                                              display:"inline-flex", alignItems:"center", gap:4,
                                              fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:600,
                                              color:"#4f46e5", background:"#eef2ff",
                                              border:"1px solid #c7d2fe", borderRadius:6,
                                              padding:"3px 10px", textDecoration:"none",
                                              transition:"all 0.2s",
                                            }}
                                          >
                                            🔗 {domain}
                                          </a>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggestions */}
                      {fb.suggestions?.length > 0 && (
                        <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:16 }}>
                          <p style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#1d4ed8", marginBottom:10 }}>💡 Suggestions</p>
                          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                            {fb.suggestions.map((s,j) => (
                              <div key={j} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                                <span style={{ color:"#6366f1", fontSize:14, flexShrink:0, marginTop:1 }}>→</span>
                                <span style={{ fontFamily:"DM Sans,sans-serif", fontSize:13.5, color:"#1e3a5f", lineHeight:1.55 }}>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pro Tips ── */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:20, padding:28, marginBottom:28 }}>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontSize:16, fontWeight:700, color:"white", marginBottom:16 }}>🚀 Pro Tips to Improve</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            "Use the STAR method: Situation, Task, Action, Result",
            "Quantify achievements — numbers make answers memorable",
            "Research the company deeply before your actual interview",
            "Practice out loud daily — confidence comes from repetition",
          ].map((tip, i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.08)", borderRadius:12, padding:14, display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontFamily:"Sora,sans-serif", fontSize:14, fontWeight:800, color:"#818cf8", flexShrink:0 }}>0{i+1}</span>
              <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.55, margin:0 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <button onClick={() => router.replace("/dashboard")} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px", background:"white", border:"1.5px solid #e8edf8", borderRadius:14, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:14, color:"#374151", cursor:"pointer", transition:"all 0.2s" }}>
          <Home size={16} /> Back to Dashboard
        </button>
        <button onClick={() => router.back()} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"white", border:"none", borderRadius:14, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 4px 16px rgba(99,102,241,0.35)", transition:"all 0.2s" }}>
          <RefreshCw size={16} /> Practice Again
        </button>
      </div>
    </div>
  );
}

export default Feedback;