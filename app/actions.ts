'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

type ErrorVerdict = "low" | "medium" | "high"
type BillType = "water" | "electric" | "gas" | "internet" | "unknown"
type Comparison = "below" | "about_average" | "above"

export type BillAnalysisJson = {
  errorAnalysis: {
    likelihoodPct: number
    verdict: ErrorVerdict
    reasons: string[]
    suspectedIssues: Array<{
      issue: string
      evidence: string
      amount: number | null
      pageNumber: number
      pinX: number // 0-100
      pinY: number // 0-100
    }>
  }
  mockEmail: string | null
  regionalComparison: {
    providerName: string | null
    providerEmail: string | null
    billType: BillType
    totalAmount: number | null
    comparison: Comparison
    estimatedAverageRange: string
    explanation: string
    estimatedAnnualSavings: number | null
    annualCO2ReductionTons: number | null
    comparisonStatement: string
  }
  savingsTips: Array<{
    title: string
    action: string
    estimatedMonthlySavings: number | null
    whyItFits: string
    pageNumber: number
    pinX: number // 0-100
    pinY: number // 0-100
  }>
}

export interface BillAnalysis {
  providerName: string;
  providerEmail: string;
  providerPhone?: string;
  summary: {
    totalErrors: number;
    totalPotentialSavings: string;
    totalCO2Reduction: string;
    comparedToAverage: string;
  };
  errors: Array<{
    id: number;
    title: string;
    description: string;
    amount?: string;
    severity: "high" | "medium" | "low";
    pageNumber: number;
    pinX: number;
    pinY: number;
  }>;
  savings: Array<{
    id: number;
    title: string;
    description: string;
    estimatedSaving: string;
    ecoImpact: string;
    category: "energy" | "water" | "other";
    pageNumber: number;
    pinX: number;
    pinY: number;
  }>;
}

function stripCodeFences(text: string) {
  return text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
}

// Gemini sometimes adds prose before/after the JSON — extract just the object
function extractJsonObject(text: string) {
  const cleaned = stripCodeFences(text)
  const first = cleaned.indexOf("{")
  const last = cleaned.lastIndexOf("}")
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in model output.")
  }
  return cleaned.slice(first, last + 1)
}

function clampPct(n: any) {
  const x = Number(n)
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(100, Math.round(x)))
}

function ensureArrayStrings(v: any) {
  if (!Array.isArray(v)) return []
  return v
    .filter((x) => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
}

function normalizeBillType(v: any): BillType {
  const s = String(v ?? "").toLowerCase()
  if (s.includes("water")) return "water"
  if (s.includes("electric")) return "electric"
  if (s.includes("electricity")) return "electric"
  if (s.includes("gas")) return "gas"
  if (s.includes("internet")) return "internet"
  return "unknown"
}

function normalizeComparison(v: any): Comparison {
  const s = String(v ?? "").toLowerCase()
  if (s.includes("below")) return "below"
  if (s.includes("above")) return "above"
  return "about_average"
}

function normalizeVerdict(v: any): ErrorVerdict {
  const s = String(v ?? "").toLowerCase()
  if (s === "high") return "high"
  if (s === "medium") return "medium"
  return "low"
}

function asNumberOrNull(v: any): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function sanitizeParsed(raw: any): BillAnalysisJson {
  const errorAnalysis = raw?.errorAnalysis ?? {}
  const regionalComparison = raw?.regionalComparison ?? {}

  const suspectedIssuesRaw = Array.isArray(errorAnalysis?.suspectedIssues)
    ? errorAnalysis.suspectedIssues
    : []

  const suspectedIssues = suspectedIssuesRaw
    .filter((x: any) => x && typeof x === "object")
    .map((x: any) => ({
      issue: String(x.issue ?? "").trim() || "Unspecified issue",
      evidence: String(x.evidence ?? "").trim() || "No evidence provided",
      amount: asNumberOrNull(x.amount),
      pageNumber: Number(x.pageNumber ?? 1) || 1,
      pinX: Number(x.pinX ?? 50),
      pinY: Number(x.pinY ?? 50),
    }))

  const savingsTipsRaw = Array.isArray(raw?.savingsTips) ? raw.savingsTips : []
  const savingsTips = savingsTipsRaw
    .filter((x: any) => x && typeof x === "object")
    .slice(0, 5)
    .map((x: any) => ({
      title: String(x.title ?? "").trim() || "Tip",
      action: String(x.action ?? "").trim() || "",
      estimatedMonthlySavings: asNumberOrNull(x.estimatedMonthlySavings),
      whyItFits: String(x.whyItFits ?? "").trim() || "",
      pageNumber: Number(x.pageNumber ?? 1) || 1,
      pinX: Number(x.pinX ?? 50),
      pinY: Number(x.pinY ?? 50),
    }))
    .filter((t: any) => t.action)

  // Enforce 3–5 tips: don't pad with empty items, just cap at 5.
  // The UI can check the length; strip any extras here.
  const likelihoodPct = clampPct(errorAnalysis?.likelihoodPct)
  const verdict = normalizeVerdict(errorAnalysis?.verdict)
  const reasons = ensureArrayStrings(errorAnalysis?.reasons).slice(0, 6)

  const providerName = String(regionalComparison?.providerName ?? "").trim() || null
  const providerEmail = String(regionalComparison?.providerEmail ?? "").trim() || null
  const billType = normalizeBillType(regionalComparison?.billType)
  const totalAmount = asNumberOrNull(regionalComparison?.totalAmount)
  const comparison = normalizeComparison(regionalComparison?.comparison)
  const estimatedAverageRange =
    String(regionalComparison?.estimatedAverageRange ?? "").trim() || "Unknown"
  const explanation =
    String(regionalComparison?.explanation ?? "").trim() ||
    "No comparison explanation provided."
  const estimatedAnnualSavings = asNumberOrNull(regionalComparison?.estimatedAnnualSavings)
  const annualCO2ReductionTons = asNumberOrNull(regionalComparison?.annualCO2ReductionTons)
  const comparisonStatement =
    String(regionalComparison?.comparisonStatement ?? "").trim() ||
    (comparison === "above" ? "Above average for your region" : "About average for your region")

  // mockEmail business rule: if likelihood >= 50% or there are suspected issues, a draft email is required.
  let mockEmail: string | null =
    raw?.mockEmail === null || raw?.mockEmail === undefined
      ? null
      : String(raw.mockEmail)

  const needsEmail = likelihoodPct >= 50 || suspectedIssues.length > 0
  if (!needsEmail) mockEmail = null
  if (needsEmail && (!mockEmail || mockEmail.trim().length < 20)) {
    mockEmail =
      "Dear Customer Service,\n\nI’m reaching out regarding my recent utility bill. I noticed charges and/or usage that appear unusual and I would appreciate a review of the bill for potential errors or miscalculations. Please provide an itemized explanation of any fees or adjustments, and let me know if a correction or credit is warranted.\n\nThank you,\n[Your Name]\n[Address]\n[Account Number]"
  }

  return {
    errorAnalysis: {
      likelihoodPct,
      verdict,
      reasons,
      suspectedIssues,
    },
    mockEmail,
    regionalComparison: {
      providerName,
      providerEmail,
      billType,
      totalAmount,
      comparison,
      estimatedAverageRange,
      explanation,
      estimatedAnnualSavings,
      annualCO2ReductionTons,
      comparisonStatement,
    },
    savingsTips,
  }
}

export async function analyzeBill(base64File: string, fileType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const base64 = base64File.includes(",") ? base64File.split(",")[1] : base64File

  const prompt = `
You are an expert utility bill auditor and sustainability consultant.

Analyze the attached utility bill image/PDF.

IMPORTANT:
- First, identify the service ZIP code from the bill (service address / mailing address). If missing or unreadable, use "unknown".

Return ONLY a valid JSON object matching EXACTLY the schema below (no extra keys):

{
  "errorAnalysis": {
    "likelihoodPct": number,
    "verdict": "low" | "medium" | "high",
    "reasons": string[],
    "suspectedIssues": [
      { 
        "issue": string, "evidence": string, "amount": number | null,
        "pageNumber": number, "pinX": number (0-100), "pinY": number (0-100)
      }
    ]
  },
  "mockEmail": string | null,
  "regionalComparison": {
    "providerName": "Full name of the utility provider (e.g. Pacific Gas & Electric, Los Angeles Department of Water and Power)",
    "providerEmail": "customer service email if found on bill, or null",
    "billType": "water" | "electric" | "gas" | "internet" | "unknown",
    "totalAmount": number | null,
    "comparison": "below" | "about_average" | "above",
    "estimatedAverageRange": string,
    "explanation": string,
    "estimatedAnnualSavings": number | null,
    "annualCO2ReductionTons": number | null,
    "comparisonStatement": string
  },
  "savingsTips": [
    { 
      "title": string, "action": string, "estimatedMonthlySavings": number | null, "whyItFits": string,
      "pageNumber": number, "pinX": number (0-100), "pinY": number (0-100)
    }
  ]
}

RULES:
- likelihoodPct is the probability (0-100) that this bill contains an error or suspicious charge based on what you can see.
- If likelihoodPct >= 50 OR suspectedIssues has at least 1 item, mockEmail MUST be a complete dispute email. Otherwise null.
- regionalComparison MUST be based on the ZIP code found on the bill. If ZIP is unknown, say it is an estimate and use a broad average range.
- estimatedAnnualSavings is the TOTAL expected annual savings if ALL savingsTips are implemented.
- annualCO2ReductionTons is the TOTAL expected annual CO2 reduction in tons (e.g. 6.5) if eco-friendly tips are followed.
- comparisonStatement should be a VERY brief comparison (max 6 words) like "12% above Northern California average" or "About average for Miami".
- savingsTips MUST be based on billType and the regionalComparison outcome (if above average, focus on reducing the main driver).
- savingsTips must contain 3 to 5 items.
- Output ONLY the JSON. No markdown. No commentary.
- IMPORTANT: For the (pinX, pinY) coordinates, choose a location in the **WHITESPACE** or **MARGIN** near the relevant text. Do NOT place the pin directly on top of the text; offset it slightly so the numbered circle does not cover any letters or numbers.
`


  const part = {
    inlineData: {
      data: base64,
      mimeType: fileType, // e.g. image/png, image/jpeg, application/pdf
    },
  }

  const result = await model.generateContent([prompt, part])
  const text = result.response.text()

  // First parse attempt
  try {
    const jsonText = extractJsonObject(text)
    const parsed = JSON.parse(jsonText)
    const safe = sanitizeParsed(parsed)
    return JSON.stringify(safe)
  } catch (err) {
    // Second attempt: ask the model to return only the JSON object
    const repairPrompt = `
Your previous response was NOT valid JSON or did not follow the required schema.

Return ONLY the JSON object with EXACTLY this structure (no extra keys):
{
  "errorAnalysis": {
    "likelihoodPct": number,
    "verdict": "low" | "medium" | "high",
    "reasons": string[],
    "suspectedIssues": [
      { 
        "issue": string, "evidence": string, "amount": number | null,
        "pageNumber": number, "pinX": number (0-100), "pinY": number (0-100)
      }
    ]
  },
  "mockEmail": string | null,
  "regionalComparison": {
    "providerName": string | null,
    "providerEmail": string | null,
    "billType": "water" | "electric" | "gas" | "internet" | "unknown",
    "totalAmount": number | null,
    "comparison": "below" | "about_average" | "above",
    "estimatedAverageRange": string,
    "explanation": string,
    "estimatedAnnualSavings": number | null,
    "annualCO2ReductionTons": number | null,
    "comparisonStatement": string
  },
  "savingsTips": [
    { 
      "title": string, "action": string, "estimatedMonthlySavings": number | null, "whyItFits": string,
      "pageNumber": number, "pinX": number (0-100), "pinY": number (0-100)
    }
  ]
}
No markdown. No extra text.
`

    const retry = await model.generateContent([repairPrompt, part])
    const retryText = retry.response.text()
    const jsonText = extractJsonObject(retryText)
    const parsed = JSON.parse(jsonText)
    const safe = sanitizeParsed(parsed)
    return JSON.stringify(safe)
  }
}
