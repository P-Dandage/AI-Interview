// ─────────────────────────────────────────────────────────────────────────────
// Gemini_Ai_model.js — Production hardened, zero loopholes
// ─────────────────────────────────────────────────────────────────────────────
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("[IntraAi] ❌ NEXT_PUBLIC_GEMINI_API_KEY is not set in .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// thinkingBudget:0  → disables gemini-2.5-flash chain-of-thought, ~3x faster
// maxOutputTokens:2048 → eval with study links needs ~900-1200 tokens minimum
//   (old 600 cap was the root cause of the truncation / JSON parse errors)
const BASE_CONFIG = {
  temperature:     0.3,
  topP:            0.9,
  maxOutputTokens: 2048,
  thinkingConfig:  { thinkingBudget: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// extractAndRepairJSON
// Handles every real-world failure mode:
//   1. Markdown fences      ```json ... ```
//   2. Preamble text before the JSON
//   3. Truncated JSON       (model hit maxOutputTokens mid-write)
//   4. Trailing comma       (,} or ,])
// ─────────────────────────────────────────────────────────────────────────────
function extractAndRepairJSON(raw) {
  if (!raw || typeof raw !== "string") throw new Error("Empty or non-string AI response");

  let s = raw.trim();

  // Step 1 — strip markdown fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  // Step 2 — find first JSON token { or [
  const start = s.search(/[{\[]/);
  if (start === -1) throw new Error("No JSON found in AI response. Got: " + s.slice(0, 200));
  s = s.slice(start);

  // Step 3 — try parsing immediately (happy path, covers ~95% of responses)
  try { return JSON.parse(s); } catch (_) { /* fall through to repair */ }

  // Step 4 — repair truncated / malformed JSON
  // 4a: remove trailing incomplete string value (e.g. "text cut of...)
  s = s.replace(/,?\s*"[^"\\]*(?:\\.[^"\\]*)*$/, "");
  // 4b: remove trailing incomplete key  (e.g. ,"keyName":)
  s = s.replace(/,?\s*"[^"]*"\s*:\s*$/, "");
  // 4c: remove any trailing commas
  s = s.replace(/,+\s*$/, "");
  // 4d: close unclosed arrays then objects
  const unclosedArr = ((s.match(/\[/g) || []).length) - ((s.match(/\]/g) || []).length);
  const unclosedObj = ((s.match(/\{/g) || []).length) - ((s.match(/\}/g) || []).length);
  for (let i = 0; i < Math.max(0, unclosedArr); i++) s += "]";
  for (let i = 0; i < Math.max(0, unclosedObj); i++) s += "}";

  // Step 5 — try parsing repaired string
  try {
    const parsed = JSON.parse(s);
    console.warn("[IntraAi] ⚠️ JSON was truncated — repaired and parsed successfully");
    return parsed;
  } catch (e) {
    throw new Error(
      "JSON parse failed even after repair. " +
      "Parser: " + e.message + " | " +
      "Raw (first 400 chars): " + raw.slice(0, 400)
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// callGemini — single model, human-readable errors, finish reason guard
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(prompt, label) {
  if (!apiKey) throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not configured. Check .env.local");

  const t0 = Date.now();
  console.log(`[IntraAi] ${label} → gemini-2.5-flash`);

  let res;
  try {
    const m = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    res = await m.generateContent({
      contents:         [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: BASE_CONFIG,
    });
  } catch (err) {
    const msg = err?.message || String(err);
    console.error(`[IntraAi] ${label} ❌ API error (${Date.now() - t0}ms):`, msg);
    if (msg.includes("API_KEY") || err?.status === 400 || err?.status === 403)
      throw new Error("Invalid Gemini API key — check NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
    if (err?.status === 429)
      throw new Error("Gemini rate limit reached — wait 30 seconds then retry");
    if (err?.status === 503 || msg.toLowerCase().includes("overload"))
      throw new Error("Gemini servers are temporarily overloaded — retry in a moment");
    throw new Error("Gemini API error: " + msg);
  }

  const candidate    = res.response.candidates?.[0];
  const finishReason = candidate?.finishReason || "UNKNOWN";

  if (finishReason === "MAX_TOKENS") {
    // Not fatal — extractAndRepairJSON will attempt recovery
    console.warn(`[IntraAi] ${label} ⚠️ MAX_TOKENS — response cut off. Attempting JSON repair.`);
  }
  if (finishReason === "SAFETY") {
    throw new Error("Gemini blocked this content for safety reasons. Try rephrasing the answer or question.");
  }
  if (finishReason === "RECITATION") {
    throw new Error("Gemini refused due to recitation policy. Rephrase the question.");
  }

  const raw = res.response.text();
  console.log(`[IntraAi] ${label} ✅ ${Date.now() - t0}ms | finishReason:${finishReason} | preview:`, raw.slice(0, 200));
  return raw;
}

// ── Sanitise user input before embedding in prompts ───────────────────────
function sanitise(str, maxLen = 2000) {
  return (str || "")
    .replace(/[`\\]/g, "'")   // backticks and backslashes break prompt strings
    .replace(/\n+/g, " ")     // newlines → space
    .trim()
    .slice(0, maxLen);
}

// ── Legacy chatSession (backward compat with existing project code) ────────
const _legacy = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
export const chatSession = _legacy.startChat({ generationConfig: BASE_CONFIG });

// ─────────────────────────────────────────────────────────────────────────────
// generateInterviewQuestions — 70% technical, 30% behavioral
// ─────────────────────────────────────────────────────────────────────────────
export async function generateInterviewQuestions(jobPosition, jobDesc, jobExperience) {
  const count = Math.max(1, parseInt(process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || "5", 10));
  const pos   = sanitise(jobPosition || "Software Engineer");
  const desc  = sanitise(jobDesc     || "general software development");
  const exp   = Math.max(0, parseInt(jobExperience, 10) || 0);

  const techCount   = Math.ceil(count * 0.7);
  const behvCount   = count - techCount;
  const primaryTech = desc.split(",")[0].trim();

  const level =
    exp === 0  ? "fresher — no professional experience, test fundamentals and learning mindset"
    : exp <= 2 ? "junior — 1-2 years, test core concepts and basic project experience"
    : exp <= 5 ? "mid-level — 3-5 years, test independent decisions and design trade-offs"
    : exp <= 9 ? "senior — 6-9 years, test system design, performance, and leadership"
    : "principal/staff — 10+ years, test architecture, org impact, and strategy";

  const prompt =
`You are a senior engineering interviewer. Generate exactly ${count} interview questions.

CANDIDATE: ${pos} | ${exp} years | ${level}
TECH STACK: ${desc}

RULES — follow strictly:
Questions 1-${techCount}: TECHNICAL
  - Must directly reference ${primaryTech} or specific tech from the stack
  - Frame as real scenarios (debugging, architecture, performance, edge cases)
  - Never ask "What is X?" — always "How did you / How would you handle..."
  - Difficulty must match ${level}

Questions ${techCount + 1}-${count}: BEHAVIORAL
  - Must start with "Tell me about a time..." or "Describe a situation where..."
  - Must be relevant to day-to-day work of a ${pos}

Each Answered field: 4-5 sentences, name specific tools/patterns/techniques from the stack.

Return ONLY a raw JSON array — zero text before or after:
[{"Question":"full question","Answered":"detailed model answer"}]`;

  try {
    const raw    = await callGemini(prompt, "generateQuestions");
    const parsed = extractAndRepairJSON(raw);

    if (!Array.isArray(parsed))  throw new Error("Response is not a JSON array");
    if (parsed.length === 0)     throw new Error("Response array is empty");
    if (!parsed[0]?.Question)    throw new Error("Items missing Question field");
    if (!parsed[0]?.Answered)    throw new Error("Items missing Answered field");

    return parsed;
  } catch (err) {
    console.error("[IntraAi] generateInterviewQuestions failed — using fallback:", err.message);
    return buildFallbackQuestions(pos, desc, count);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// evaluateAnswer — structured feedback with study links
// THROWS with human-readable messages — RecordAnswerSection handles & shows toast
// ─────────────────────────────────────────────────────────────────────────────
export async function evaluateAnswer(question, userAnswer, jobPosition, jobExperience) {
  // Guard — must have a meaningful answer
  if (!userAnswer || sanitise(userAnswer).length < 5) {
    throw new Error("Answer too short — please record a longer response.");
  }

  const q   = sanitise(question   || "General interview question");
  const ans = sanitise(userAnswer,  3000);   // allow longer spoken answers
  const pos = sanitise(jobPosition || "Software Engineer");
  const exp = Math.max(0, parseInt(jobExperience, 10) || 0);
  const lvl = exp === 0 ? "fresher" : exp <= 2 ? "junior" : exp <= 5 ? "mid-level" : exp <= 9 ? "senior" : "principal";

  const prompt =
`You are a strict but fair technical interviewer evaluating a ${lvl} ${pos} candidate (${exp} yrs experience).

QUESTION: ${q}
CANDIDATE ANSWER: ${ans}

SCORING:
10=perfect, 8-9=strong minor gaps, 6-7=good missing depth, 4-5=partial basics only, 2-3=weak, 1=wrong/blank
Hold the bar appropriate for a ${lvl} engineer — do not be overly generous.

OUTPUT RULES:
- strengths: exactly 2 items — specific things they actually said that were correct
- improvements: exactly 2 items — specific gaps in their actual answer, each with 1 real study URL from this list only: developer.mozilla.org, reactjs.org, nodejs.org, javascript.info, web.dev, geeksforgeeks.org, docs.python.org, typescriptlang.org/docs, docs.mongodb.com, redis.io/docs, kubernetes.io/docs, docs.docker.com, spring.io/guides, leetcode.com/explore
- suggestions: exactly 2 items — concrete actionable study or practice tips
- correctAns: 3-4 sentences, what a strong ${lvl} ${pos} would have said, with specific techniques
- keyMissing: single most important concept they omitted, or "None"

Return ONLY a raw JSON object — zero text before or after it:
{"rating":7,"correctAns":"...","feedback":{"strengths":["...","..."],"improvements":[{"point":"...","studyLinks":["https://..."]},{"point":"...","studyLinks":["https://..."]}],"suggestions":["...","..."]},"keyMissing":"..."}`;

  // callGemini throws human-readable errors — let them propagate to the caller
  const raw    = await callGemini(prompt, "evaluateAnswer");
  const parsed = extractAndRepairJSON(raw);

  // ── Hard validation — every field the feedback page renders ──────────
  if (typeof parsed.rating !== "number")
    throw new Error("AI response missing numeric 'rating' field");
  if (typeof parsed.correctAns !== "string" || !parsed.correctAns.trim())
    throw new Error("AI response missing 'correctAns' field");
  if (!parsed.feedback || typeof parsed.feedback !== "object")
    throw new Error("AI response missing 'feedback' object");
  if (!Array.isArray(parsed.feedback.strengths))
    throw new Error("AI response missing 'feedback.strengths' array");

  // ── Normalise & clamp ────────────────────────────────────────────────
  parsed.rating = Math.min(10, Math.max(1, Math.round(parsed.rating)));

  // Normalise improvements — handle both old string[] and new {point,studyLinks}[] formats
  const rawImprov = parsed.feedback.improvements || parsed.feedback.areas_for_improvement || [];
  parsed.feedback.improvements = rawImprov.map(item => {
    if (typeof item === "string") return { point: item, studyLinks: [] };
    return {
      point:      typeof item.point === "string" ? item.point : String(item),
      studyLinks: Array.isArray(item.studyLinks)
        ? item.studyLinks.filter(u => typeof u === "string" && u.startsWith("http"))
        : [],
    };
  });

  // Flat string[] for backward compat with feedback page parseFeedback()
  parsed.feedback.areas_for_improvement = parsed.feedback.improvements.map(i => i.point);

  // Ensure every array exists even if AI omitted it
  parsed.feedback.strengths   = Array.isArray(parsed.feedback.strengths)   ? parsed.feedback.strengths   : [];
  parsed.feedback.suggestions = Array.isArray(parsed.feedback.suggestions) ? parsed.feedback.suggestions : [];
  parsed.keyMissing           = typeof parsed.keyMissing === "string"       ? parsed.keyMissing           : "None";

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildFallbackQuestions — shown when AI call fails entirely
// ─────────────────────────────────────────────────────────────────────────────
function buildFallbackQuestions(pos, desc, count) {
  const tech = desc.split(",")[0]?.trim() || pos;
  const pool = [
    {
      Question: `Walk me through the most complex feature you built with ${tech} — architecture, challenges, trade-offs.`,
      Answered: `Describe your design decisions, specific libraries or patterns used, performance or scaling challenges, how you resolved them, and what you would do differently now with hindsight.`,
    },
    {
      Question: `How do you debug a hard-to-reproduce issue in a ${tech} production environment?`,
      Answered: `Explain your observability approach using structured logging and tracing, how you reproduce flaky issues in staging with feature flags, your systematic elimination process, and rollback strategy.`,
    },
    {
      Question: `How do you approach performance optimisation in a ${tech} application?`,
      Answered: `Discuss profiling tools to identify bottlenecks with real data, specific optimisations like caching layers, lazy loading, query tuning, and how you measured before/after impact quantitatively.`,
    },
    {
      Question: `Tell me about a time you had to refactor critical code under a tight deadline.`,
      Answered: `Describe your risk assessment, how you broke the work into safe incremental steps, maintained test coverage throughout, communicated progress to stakeholders, and delivered without breaking production.`,
    },
    {
      Question: `Tell me about a time you disagreed with a technical decision and how you handled it.`,
      Answered: `Explain the disagreement, how you presented your reasoning with data or prototypes, how the team reached consensus or escalated, and what you learned about navigating technical disagreements.`,
    },
    {
      Question: `Describe a situation where you had to deliver under pressure without compromising quality.`,
      Answered: `Cover how you prioritised ruthlessly, communicated trade-offs clearly to stakeholders, maintained automated tests under pressure, and decided what to ship versus defer to a follow-up sprint.`,
    },
  ];
  return pool.slice(0, count);
}