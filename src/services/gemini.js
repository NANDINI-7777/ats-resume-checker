import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── System Prompts ───────────────────────────────────────────────────────────

export const ANALYZE_SYSTEM_PROMPT = `You are an elite ATS (Applicant Tracking System) expert and senior career strategist with deep knowledge of how Taleo, Workday, Greenhouse, Lever, iCIMS, and BambooHR parse and rank resumes.

Your job is to evaluate a resume EXACTLY as a real ATS algorithm would — not as a human recruiter. You must:
1. Detect the candidate's target profession/role from context clues in the resume
2. Score the resume on 5 critical ATS dimensions with brutally honest, accurate scores
3. Identify real keywords, real formatting issues, and real structural problems
4. Base ALL scores purely on content quality, NOT guesswork or flattery

Rules:
- Keyword matching is CASE-INSENSITIVE
- Flag ATS-unfriendly formatting: tables, columns, headers with symbols/emojis, graphics, text boxes
- Check section names against ATS-expected labels (Work Experience, Education, Skills, Summary, Certifications)
- Evaluate if bullets use strong action verbs with quantified results
- The "detected_role" should be the specific job title/profession you infer from the resume
- When no job description is provided, generate role-relevant keywords from industry standards for the detected profession
- Be brutally honest. A score of 72 means 72, not 85.`;

export const ANALYZE_PROMPT_TEMPLATE = (resumeText, jobDescription) => {
  const hasJD = jobDescription && jobDescription.trim().length > 50;
  return `${hasJD ? `JOB DESCRIPTION (target role):
${jobDescription}

` : "NOTE: No job description was provided. Analyze this resume based on the detected profession and industry-standard ATS requirements for that role.\n\n"}RESUME TEXT:
${resumeText}

Respond ONLY with a valid JSON object — no markdown, no explanation, no preamble — exactly matching this schema:
{
  "detected_role": "<profession/role title detected from resume>",
  "analysis_mode": "${hasJD ? "jd_specific" : "profession_based"}",
  "overall_score": <integer 0-100>,
  "grade": "<letter grade: A+/A/A-/B+/B/B-/C+/C/C-/D/F>",
  "verdict": "<one compelling sentence summary of the resume's ATS strength>",
  "sections": {
    "keyword_match": {
      "score": <0-100>,
      "matched_keywords": ["keyword1", "keyword2"],
      "missing_keywords": ["keyword1", "keyword2"],
      "explanation": "<2-3 sentence ATS keyword analysis>"
    },
    "formatting": {
      "score": <0-100>,
      "issues": ["issue1", "issue2"],
      "explanation": "<2-3 sentence formatting analysis>"
    },
    "section_structure": {
      "score": <0-100>,
      "present_sections": ["section1", "section2"],
      "missing_sections": ["section1", "section2"],
      "explanation": "<2-3 sentence structure analysis>"
    },
    "impact_language": {
      "score": <0-100>,
      "weak_bullets": ["bullet1", "bullet2"],
      "explanation": "<2-3 sentence impact language analysis>"
    },
    "readability": {
      "score": <0-100>,
      "issues": [],
      "explanation": "<2-3 sentence readability analysis>"
    }
  },
  "top_improvements": [
    "improvement1",
    "improvement2",
    "improvement3",
    "improvement4",
    "improvement5"
  ],
  "ats_compatibility_warnings": [
    "warning1",
    "warning2"
  ],
  "strengths": [
    "strength1",
    "strength2",
    "strength3"
  ]
}`;
};

export const REWRITE_SYSTEM_PROMPT = `You are an expert resume writer and ATS optimization specialist. You write resumes that pass ATS systems AND impress human recruiters.

Critical rules:
1. NEVER fabricate job titles, company names, dates, or achievements
2. NEVER invent skills or certifications the candidate doesn't have
3. DO rewrite existing bullets using the STAR method with implied quantification where reasonable
4. DO incorporate missing keywords NATURALLY — never stuff them awkwardly
5. DO use only ATS-safe section headers: Summary, Work Experience, Education, Skills, Certifications, Projects
6. DO remove ALL ATS-unfriendly formatting (tables, columns, symbols in headers)
7. Format as clean plain text only. NO markdown. NO **, ##, ---, or similar.
8. Start with a powerful 3-4 sentence Professional Summary tailored to the role.
9. Ensure phone numbers always include the international calling code prefix with a '+' sign (e.g., +91 9351874133).
10. Ensure contact info is grouped cleanly at the top, and all bullet points start strictly with '• '`;

// ─── Gap Identification Prompt ────────────────────────────────────────────────

export const GAP_SYSTEM_PROMPT = `You are an expert ATS resume consultant. Your job is to identify SPECIFIC missing information gaps in a resume that, if provided by the candidate, would meaningfully improve their ATS score and make the rewritten resume more accurate and complete.

Only ask for information that is truly missing and would realistically improve the resume. Do NOT fabricate or assume anything.`;

export const GAP_PROMPT_TEMPLATE = (resumeText, jobDescription, analysis) => {
  const hasJD = jobDescription && jobDescription.trim().length > 50;
  return `RESUME TEXT:
${resumeText}

${hasJD ? `JOB DESCRIPTION:\n${jobDescription}\n\n` : `DETECTED ROLE: ${analysis?.detected_role || "Professional"}\n\n`}ATS ANALYSIS:
- Missing keywords: ${analysis?.sections?.keyword_match?.missing_keywords?.slice(0, 8).join(", ") || "none"}
- Missing sections: ${analysis?.sections?.section_structure?.missing_sections?.join(", ") || "none"}
- Weak bullets: ${analysis?.sections?.impact_language?.weak_bullets?.slice(0, 3).join(" | ") || "none"}

Identify 3-6 specific questions to ask the candidate that would fill in real gaps. Focus on:
- Quantifiable achievements they may have omitted (numbers, percentages, scale)
- Missing certifications, tools, or technologies they actually have
- Contact info gaps (LinkedIn, GitHub, portfolio URL) if missing
- Missing dates, company descriptions, or role context
- A professional summary if absent

Respond ONLY with a valid JSON array of question objects — no markdown, no preamble:
[
  {
    "id": "unique_id",
    "category": "achievements|contact|skills|summary|structure",
    "question": "Specific question to ask the candidate",
    "example": "Example of what a good answer looks like",
    "required": false
  }
]`;
};

export const REWRITE_PROMPT_TEMPLATE = (resumeText, jobDescription, analysis, userAnswers = {}) => {
  const hasJD = jobDescription && jobDescription.trim().length > 50;
  const answersText = Object.keys(userAnswers).length > 0
    ? `\nADDITIONAL DETAILS PROVIDED BY CANDIDATE:\n${Object.entries(userAnswers)
        .filter(([, v]) => v && v.trim())
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")}

IMPORTANT: Incorporate the above candidate-provided details naturally into the rewritten resume. These are real facts — use them.
`
    : "";

  return `ORIGINAL RESUME:
${resumeText}

${hasJD ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` : `DETECTED ROLE: ${analysis?.detected_role || "Professional"}\n\n`}ATS ANALYSIS RESULTS:
- Overall Score: ${analysis?.overall_score}/100
- Missing Keywords: ${analysis?.sections?.keyword_match?.missing_keywords?.join(", ") || "none"}
- Weak Bullets: ${analysis?.sections?.impact_language?.weak_bullets?.join(" | ") || "none"}
- Missing Sections: ${analysis?.sections?.section_structure?.missing_sections?.join(", ") || "none"}
- Formatting Issues: ${analysis?.sections?.formatting?.issues?.join(", ") || "none"}
${answersText}
Rewrite the entire resume to fix all the above issues. Return ONLY clean plain text — no JSON, no markdown formatting.`;
};

// ─── JSON Cleaner ─────────────────────────────────────────────────────────────

function cleanAndParseJSON(responseText) {
  let cleaned = responseText.trim();
  // Strip markdown fences
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Fallback: extract first JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    throw new Error("The AI returned an unexpected format. Please try again.");
  }
}

// ─── Model Cascade ────────────────────────────────────────────────────────────

const MODELS_TO_TRY = [
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }
  return new GoogleGenerativeAI(apiKey);
}

// ─── Analyze Resume ───────────────────────────────────────────────────────────

export async function analyzeResume(resumeText, jobDescription = "") {
  if (!resumeText || resumeText.trim().length < 100) {
    throw new Error("Resume text is too short. Please check your file uploaded correctly.");
  }

  const genAI = getClient();
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[ATS] Analyzing with ${modelName}...`);
      const isOldModel = modelName === "gemini-pro";
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: isOldModel ? undefined : ANALYZE_SYSTEM_PROMPT,
        generationConfig: { 
          responseMimeType: isOldModel ? "text/plain" : "application/json",
          temperature: 0.0 
        },
      });

      const prompt = isOldModel 
        ? `${ANALYZE_SYSTEM_PROMPT}\n\n${ANALYZE_PROMPT_TEMPLATE(resumeText, jobDescription)}\n\nIMPORTANT: YOU MUST RETURN ONLY RAW JSON.`
        : ANALYZE_PROMPT_TEMPLATE(resumeText, jobDescription);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = cleanAndParseJSON(text);
      console.log(`[ATS] Success with ${modelName}. Score: ${parsed.overall_score}`);
      return parsed;
    } catch (err) {
      console.warn(`[ATS] ${modelName} failed:`, err.message);
      lastError = err;
      
      // Stop cascading for rate limits or auth errors
      if (err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("403")) {
        break;
      }
      
      if (err.message?.includes("JSON format") || err.message?.includes("unexpected format")) {
        throw err;
      }
    }
  }

  let msg = lastError?.message || "AI analysis failed.";
  if (msg.includes("429") || msg.includes("quota")) msg = "API Rate Limit Reached! Google's Free Tier only allows 15 requests per minute. Please wait 60 seconds and try again.";
  if (msg.includes("API key") || msg.includes("403")) msg = "Invalid API key. Please check your VITE_GEMINI_API_KEY in .env";
  throw new Error(msg);
}

// ─── Identify Missing Details ────────────────────────────────────────────

export async function identifyMissingDetails(resumeText, jobDescription = "", analysis = null) {
  const genAI = getClient();
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[ATS] Identifying gaps with ${modelName}...`);
      const isOldModel = modelName === "gemini-pro";
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: isOldModel ? undefined : GAP_SYSTEM_PROMPT,
        generationConfig: { 
          responseMimeType: isOldModel ? "text/plain" : "application/json",
          temperature: 0.2 
        },
      });

      const prompt = isOldModel
        ? `${GAP_SYSTEM_PROMPT}\n\n${GAP_PROMPT_TEMPLATE(resumeText, jobDescription, analysis)}\n\nIMPORTANT: YOU MUST RETURN ONLY A RAW JSON ARRAY.`
        : GAP_PROMPT_TEMPLATE(resumeText, jobDescription, analysis);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse the JSON array
      let cleaned = text.trim()
        .replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleaned);
      console.log(`[ATS] Gap identification found ${parsed.length} questions`);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(`[ATS] Gap ID ${modelName} failed:`, err.message);
      lastError = err;
      if (err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("403")) {
        break;
      }
    }
  }

  // If gap identification fails, just proceed with rewrite (non-critical)
  console.warn("[ATS] Gap identification failed, skipping:", lastError?.message);
  return [];
}

// ─── Rewrite Resume ───────────────────────────────────────────────────────────

export async function rewriteResume(resumeText, jobDescription = "", analysis = null, userAnswers = {}) {
  const genAI = getClient();
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[ATS] Rewriting with ${modelName}...`);
      const isOldModel = modelName === "gemini-pro";
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: isOldModel ? undefined : REWRITE_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.2
        }
      });

      const prompt = isOldModel
        ? `${REWRITE_SYSTEM_PROMPT}\n\n${REWRITE_PROMPT_TEMPLATE(resumeText, jobDescription, analysis, userAnswers)}`
        : REWRITE_PROMPT_TEMPLATE(resumeText, jobDescription, analysis, userAnswers);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`[ATS] Rewrite success with ${modelName}`);
      return text.trim();
    } catch (err) {
      console.warn(`[ATS] Rewrite ${modelName} failed:`, err.message);
      lastError = err;
      if (err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("403")) {
        break;
      }
    }
  }

  let msg = lastError?.message || "Rewrite failed.";
  if (msg.includes("429") || msg.includes("quota")) msg = "API Rate Limit Reached! Google's Free Tier only allows 15 requests per minute. Please wait 60 seconds and try again.";
  throw new Error(msg);
}
