"use client";
import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { mockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { Lightbulb, WebcamIcon, Play } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';

function Interview({ params }) {
  const [interviewdata, setInterviewData] = useState();
  const [webcamEnable, setWebcamEnable] = useState(false);

  useEffect(() => { getInterviewDetails(); }, []);

  const getInterviewDetails = async () => {
    const results = await db.select().from(mockInterview).where(eq(mockInterview.mockId, params.interviewid));
    setInterviewData(results[0]);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0" }}>
      <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 24, fontWeight: 800, color: "#05264e", textAlign: "center", marginBottom: 32 }}>
        Ready to Start? 🎯
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left: Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Job info card */}
          <div style={{ background: "white", border: "1.5px solid #e8edf8", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Position", value: interviewdata?.jobPosition },
              { label: "Tech Stack", value: interviewdata?.jobDesc },
              { label: "Experience", value: interviewdata?.jobExperience ? interviewdata.jobExperience + " year(s)" : null },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#94a3b8", marginBottom:3 }}>{label}</div>
                <div style={{ fontFamily:"DM Sans,sans-serif", fontSize:15, fontWeight:600, color:"#05264e" }}>{value || "Loading..."}</div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{ background: "linear-gradient(135deg, #fffbeb, #fef9c3)", border: "1.5px solid #fde68a", borderRadius: 18, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Lightbulb size={18} color="#d97706" />
              <span style={{ fontFamily:"Sora,sans-serif", fontSize:13, fontWeight:700, color:"#d97706" }}>Interview Tips</span>
            </div>
            {[
              "Enable your webcam and microphone before starting",
              "Click 'Record Answer' before speaking — answer clearly and concisely",
              "Use headphones for better speech recognition",
              "Take a breath before each answer — confidence matters!",
            ].map((tip, i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}>
                <span style={{ fontFamily:"Sora,sans-serif", fontSize:12, fontWeight:700, color:"#f59e0b", flexShrink:0 }}>{i+1}.</span>
                <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:13, color:"#92400e", lineHeight:1.5, margin:0 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Webcam */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {webcamEnable ? (
            <div style={{ borderRadius: 18, overflow: "hidden", border: "2px solid #e8edf8" }}>
              <Webcam mirrored={true}
                onUserMedia={() => setWebcamEnable(true)}
                onUserMediaError={() => setWebcamEnable(false)}
                style={{ width: "100%", height: 300, objectFit: "cover" }}
              />
            </div>
          ) : (
            <div style={{ background: "#f8faff", border: "2px dashed #c7d2fe", borderRadius: 18, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <WebcamIcon size={48} color="#a5b4fc" />
              <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:14, color:"#64748b" }}>Camera not enabled</p>
            </div>
          )}

          <Button
            onClick={() => setWebcamEnable(!webcamEnable)}
            style={{ background: webcamEnable ? "#f1f5f9" : "linear-gradient(135deg,#6366f1,#4f46e5)", color: webcamEnable ? "#374151" : "white", border:"none", borderRadius:12, height:44, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:14, cursor:"pointer", boxShadow: webcamEnable ? "none" : "0 4px 14px rgba(99,102,241,0.35)" }}
          >
            {webcamEnable ? "Disable Camera" : "Enable Webcam & Microphone"}
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
        <Link href={'/dashboard/Interview/' + params.interviewid + '/start'}>
          <button style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 36px", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"white", border:"none", borderRadius:16, fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, cursor:"pointer", boxShadow:"0 6px 24px rgba(99,102,241,0.4)", transition:"all 0.2s" }}>
            <Play size={20} fill="white" /> Start Interview
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Interview;
