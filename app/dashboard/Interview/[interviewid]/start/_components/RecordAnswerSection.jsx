"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, MicOff, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { evaluateAnswer } from "@/utils/Gemini_Ai_model";
import { db } from "@/utils/db";
import { useAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import * as blazeface from "@tensorflow-models/blazeface";

function RecordAnswerSection({ MockInterviewQuestion, activeQuestion, InterviewData }) {
  const [status, setStatus]         = useState("idle"); // idle | recording | saving | saved | error
  const [displayAnswer, setDisplay] = useState("");
  const [isFaceDetected, setIsFace] = useState(true);

  // Refs — never go stale inside callbacks
  const webcamRef   = useRef(null);
  const bfModel     = useRef(null);
  const answerRef   = useRef("");        // accumulates full spoken answer
  const savingRef   = useRef(false);     // prevents double-save

  const { user } = useUser();

  const {
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({ continuous: true, useLegacyResults: false, lang: "en-IN" });

  // ── Load BlazeFace once ──────────────────────────────────────────────────
  useEffect(() => {
    blazeface.load()
      .then(m => { bfModel.current = m; })
      .catch(() => {}); // non-critical
  }, []);

  // ── Face detection every 2s ──────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        if (bfModel.current && webcamRef.current?.video?.readyState === 4) {
          const preds = await bfModel.current.estimateFaces(webcamRef.current.video, false);
          setIsFace(preds.length > 0);
        }
      } catch (_) {}
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // ── Accumulate speech results into ref + display ─────────────────────────
  useEffect(() => {
    if (!results || results.length === 0) return;
    const chunk = results.map(r => r.transcript).join(" ").trim();
    if (!chunk) return;
    answerRef.current = (answerRef.current + " " + chunk).trim();
    setDisplay(answerRef.current);
  }, [results]);

  // ── Reset everything when question changes ───────────────────────────────
  useEffect(() => {
    answerRef.current = "";
    savingRef.current = false;
    setDisplay("");
    setStatus("idle");
    setResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion]);

  // ── Auto-save when recording stops ──────────────────────────────────────
  // We watch isRecording — when it flips false and we were recording (status===recording),
  // wait 600ms for the STT library to flush its final transcript, then save.
  useEffect(() => {
    if (isRecording) {
      setStatus("recording");
      return;
    }
    // isRecording just became false
    if (status !== "recording") return;          // wasn't us who triggered stop
    if (savingRef.current) return;               // already saving
    if (!answerRef.current.trim()) return;       // nothing to save

    // Give STT 600ms to push any final partial result into `results`
    const t = setTimeout(() => {
      doSave(answerRef.current.trim());
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // ── Core save + evaluate ─────────────────────────────────────────────────
  const doSave = useCallback(async (answer) => {
    if (!answer || answer.length < 5) {
      toast.error("Answer too short — please speak more clearly and try again.");
      setStatus("idle");
      return;
    }
    if (savingRef.current) return;
    savingRef.current = true;
    setStatus("saving");

    try {
      const question = MockInterviewQuestion[activeQuestion]?.Question || "";
      const jobPos   = InterviewData?.jobPosition   || "Software Engineer";
      const jobExp   = InterviewData?.jobExperience || "0";

      console.log("[IntraAi] ── Starting evaluation ──");
      console.log("[IntraAi] Q:", question);
      console.log("[IntraAi] A:", answer.slice(0, 120));
      console.log("[IntraAi] Role:", jobPos, "| Exp:", jobExp);

      let evalResult;
      try {
        evalResult = await evaluateAnswer(question, answer, jobPos, jobExp);
        console.log("[IntraAi] Eval result:", evalResult);
      } catch (evalErr) {
        // Show the REAL error so developer can debug, but still save the answer
        console.error("[IntraAi] evaluateAnswer threw:", evalErr);
        toast.error(
          `AI feedback failed: ${evalErr?.message || evalErr}`,
          { duration: 8000 }
        );
        // Save answer with placeholder feedback so at least the answer is recorded
        await db.insert(useAnswer).values({
          mockIdRef:  InterviewData?.mockId,
          question,
          correctAns: "AI evaluation failed — retry from feedback page.",
          userAns:    answer,
          feedback:   JSON.stringify({
            strengths: ["Answer captured"],
            areas_for_improvement: ["AI eval failed — see error toast"],
            suggestions: ["Check browser console (F12) for the exact error"],
          }),
          rating:     "0",
          userEmail:  user?.primaryEmailAddress?.emailAddress || "unknown",
          createdAt:  moment().format("DD-MM-YYYY"),
        });
        setStatus("error");
        savingRef.current = false;
        return;
      }

      await db.insert(useAnswer).values({
        mockIdRef:  InterviewData?.mockId,
        question,
        correctAns: evalResult.correctAns,
        userAns:    answer,
        feedback:   JSON.stringify(evalResult.feedback),
        rating:     String(evalResult.rating),
        userEmail:  user?.primaryEmailAddress?.emailAddress || "unknown",
        createdAt:  moment().format("DD-MM-YYYY"),
      });

      setStatus("saved");
      toast.success(`Saved! Score: ${evalResult.rating}/10`, { duration: 4000 });
    } catch (err) {
      console.error("[IntraAi] doSave error:", err);
      setStatus("error");
      toast.error("Save failed: " + (err?.message || "Unknown error"));
    } finally {
      savingRef.current = false;
    }
  }, [MockInterviewQuestion, activeQuestion, InterviewData, user]);

  // ── Toggle recording ─────────────────────────────────────────────────────
  const handleRecord = () => {
    if (status === "saving") return; // block during save
    if (isRecording) {
      stopSpeechToText();
      // useEffect above will detect isRecording→false and call doSave
    } else {
      // Fresh start
      answerRef.current = "";
      savingRef.current = false;
      setDisplay("");
      setStatus("idle");
      setResults([]);
      startSpeechToText();
    }
  };

  if (!MockInterviewQuestion) return null;

  // ── Status helpers ───────────────────────────────────────────────────────
  const recordBtnLabel = () => {
    if (status === "saving")    return <><Loader2 size={18} style={{ animation:"spin 0.8s linear infinite" }}/> Evaluating answer...</>;
    if (status === "saved")     return <><Mic size={18}/> Record Again</>;
    if (isRecording)            return <><MicOff size={18}/> Stop Recording</>;
    return <><Mic size={18}/> Record Answer</>;
  };

  const isRecordBtnDisabled = status === "saving";

  const recordBtnBg = isRecording
    ? "linear-gradient(135deg,#ef4444,#dc2626)"
    : status === "saving"
    ? "linear-gradient(135deg,#94a3b8,#64748b)"
    : "linear-gradient(135deg,#6366f1,#4f46e5)";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, padding:"20px 0" }}>

      {/* ── Webcam ── */}
      <div style={{ position:"relative", borderRadius:18, overflow:"hidden", background:"#1e1b4b", border:"2px solid #e8edf8" }}>
        <Webcam
          ref={webcamRef}
          mirrored
          style={{ width:"100%", height:300, objectFit:"cover", display:"block" }}
        />

        {/* Face warning */}
        {!isFaceDetected && status === "recording" && (
          <div style={{ position:"absolute", top:12, left:12, right:12, background:"rgba(239,68,68,0.92)", color:"white", fontFamily:"DM Sans,sans-serif", fontSize:13, fontWeight:600, padding:"8px 14px", borderRadius:10, textAlign:"center" }}>
            ⚠️ No face detected — center yourself in frame
          </div>
        )}

        {/* Recording badge */}
        {isRecording && (
          <div style={{ position:"absolute", top:12, right:12, background:"rgba(239,68,68,0.92)", color:"white", fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, letterSpacing:1, padding:"5px 12px", borderRadius:99, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:7, height:7, background:"white", borderRadius:"50%", animation:"blink 1s infinite", display:"inline-block" }}/>
            RECORDING
          </div>
        )}

        {/* Saving badge */}
        {status === "saving" && (
          <div style={{ position:"absolute", top:12, right:12, background:"rgba(99,102,241,0.92)", color:"white", fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:99, display:"flex", alignItems:"center", gap:6 }}>
            <Loader2 size={12} style={{ animation:"spin 0.8s linear infinite" }}/> ANALYZING
          </div>
        )}

        {/* Saved badge */}
        {status === "saved" && (
          <div style={{ position:"absolute", top:12, right:12, background:"rgba(34,197,94,0.92)", color:"white", fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:99, display:"flex", alignItems:"center", gap:6 }}>
            <CheckCircle size={12}/> SAVED
          </div>
        )}
      </div>

      {/* ── Answer preview / status panel ── */}
      {displayAnswer ? (
        <div style={{ background:"#f8faff", border:"1.5px solid #e0e7ff", borderRadius:14, padding:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <p style={{ fontFamily:"Sora,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#6366f1", margin:0 }}>
              Your Answer
            </p>
            {status === "saving" && (
              <span style={{ fontFamily:"DM Sans,sans-serif", fontSize:12, color:"#6366f1" }}>
                🤖 AI is analyzing...
              </span>
            )}
            {status === "saved" && (
              <span style={{ fontFamily:"DM Sans,sans-serif", fontSize:12, color:"#22c55e", fontWeight:600 }}>
                ✅ Feedback saved
              </span>
            )}
          </div>
          <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:14, color:"#374151", lineHeight:1.7, margin:0 }}>
            {displayAnswer}
          </p>
        </div>
      ) : (
        <div style={{ background:"#f8faff", border:"1.5px dashed #c7d2fe", borderRadius:14, padding:20, textAlign:"center" }}>
          <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:14, color:"#94a3b8", margin:0 }}>
            {isRecording
              ? "🎙️ Listening... speak your answer clearly"
              : "Press Record Answer, speak, then press Stop — feedback saves automatically"}
          </p>
        </div>
      )}

      {/* ── Record button ── */}
      <div style={{ display:"flex", justifyContent:"center" }}>
        <button
          onClick={handleRecord}
          disabled={isRecordBtnDisabled}
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"13px 28px", border:"none", borderRadius:14,
            fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:15,
            cursor: isRecordBtnDisabled ? "not-allowed" : "pointer",
            opacity: isRecordBtnDisabled ? 0.7 : 1,
            background: recordBtnBg,
            color:"white",
            boxShadow: isRecording
              ? "0 4px 16px rgba(239,68,68,0.45)"
              : "0 4px 16px rgba(99,102,241,0.35)",
            transition:"all 0.2s",
          }}
        >
          {recordBtnLabel()}
        </button>
      </div>

      {/* Error state */}
      {status === "error" && (
        <div style={{ background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:12, padding:"12px 16px", textAlign:"center" }}>
          <p style={{ fontFamily:"DM Sans,sans-serif", fontSize:13, color:"#ef4444", margin:0 }}>
            ❌ Could not save feedback. Open browser console (F12) to see the exact error, then try recording again.
          </p>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default RecordAnswerSection;