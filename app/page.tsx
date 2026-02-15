"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, X, Zap, Copy, AlertTriangle } from "lucide-react"

import { analyzeBill, BillAnalysis } from "./actions"

import { LoadingAnimation } from "@/components/loading-animation"
import { AnalyzingAnimation } from "@/components/AnalyzingAnimation"
import { SavingsAnimation } from "@/components/SavingsAnimation"
import { ResultsPage } from "@/components/ResultsPage"

type AppState = "UPLOAD" | "ANALYZING" | "RESULT"
type LoadingPhase = "drag-drop" | "scanning" | "savings"

type ParsedData = {
  parseError?: boolean
  raw?: string
  error?: string

  errorAnalysis?: {
    likelihoodPct?: number
    reasons?: string[]
    suspectedIssues?: Array<{
      issue: string
      evidence: string
      amount: number | null
      pageNumber: number
      pinX: number
      pinY: number
    }>
  }

  mockEmail?: string

  savingsTips?: Array<{
    title?: string
    action?: string
    whyItFits?: string
    estimatedMonthlySavings?: number
    pageNumber?: number
    pinX?: number
    pinY?: number
  }>

  regionalComparison?: {
    billType?: string
    totalAmount?: number
    comparison?: "above" | "below" | "about_average" | string
    estimatedAverageRange?: string
    explanation?: string
    estimatedAnnualSavings?: number | null
    annualCO2ReductionTons?: number | null
    comparisonStatement?: string
  }
}

export default function BillAnalyzer() {
  const [view, setView] = useState<AppState>("UPLOAD")
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("drag-drop")

  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const [data, setData] = useState<ParsedData | null>(null)
  const [loading, setLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<1 | 2>(1)

  const [toast, setToast] = useState<null | { type: "ok" | "err"; msg: string }>(null)

  const analysisDoneRef = useRef(false)
  const savingsPhaseEnteredAtRef = useRef<number | null>(null)

  const likelihoodPct = data?.errorAnalysis?.likelihoodPct ?? 0
  const suspicious = likelihoodPct >= 50

  const [animationFinished, setAnimationFinished] = useState(false);


  const sortedTips = useMemo(() => {
    const tips = Array.isArray(data?.savingsTips) ? [...(data!.savingsTips as any)] : []
    return tips.sort(
      (a: any, b: any) => (b?.estimatedMonthlySavings ?? -1) - (a?.estimatedMonthlySavings ?? -1)
    )
  }, [data])

  const showToast = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg })
    window.setTimeout(() => setToast(null), 2200)
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast("ok", "Copied!")
    } catch {
      showToast("err", "Copy failed. Please copy manually.")
    }
  }

  const resetAll = () => {
    setView("UPLOAD")
    setLoadingPhase("drag-drop")
    setPendingFile(null)
    setData(null)
    setLoading(false)
    setActiveTab(1)
    analysisDoneRef.current = false
    setAnimationFinished(false)
    savingsPhaseEnteredAtRef.current = null
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setPendingFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
  })

  const runAnalysis = async (file: File) => {
    setLoading(true)
    setData(null)
    analysisDoneRef.current = false

    try {
      const base64 = await readFileAsDataURL(file)
      const response = await analyzeBill(base64, file.type)

      try {
        const parsed = JSON.parse(response) as ParsedData
        setData(parsed)
      } catch {
        setData({ parseError: true, raw: response })
      }
    } catch (e: any) {
      setData({ error: e?.message ? String(e.message) : "Unknown error" })
    } finally {
      analysisDoneRef.current = true
      setLoading(false)
    }
  }

const handleGenerate = async () => {
    if (!pendingFile) return

    setView("ANALYZING")
    setLoadingPhase("drag-drop")
    
    // We use the runAnalysis helper you already wrote
    runAnalysis(pendingFile) 
  }

  // 2. Combined and Cleaned useEffect (removed the duplicate)
  useEffect(() => {
    if (view !== "ANALYZING") return;

    // We only move to the result once BOTH are true:
    // 1. The SavingsAnimation has finished its cycle (animationFinished)
    // 2. The API call is done (analysisDoneRef.current)
    if (animationFinished && analysisDoneRef.current) {
      setView("RESULT");
    }
  }, [view, animationFinished, loading]);

  return (
    <main className={`min-h-screen bg-background flex flex-col items-center p-6 font-sans text-foreground ${view !== "RESULT" ? "justify-center" : "pt-0 px-0 pb-0"}`}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-2 shadow-lg text-white ${
              toast.type === "ok" ? "bg-black" : "bg-red-600"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - hidden during loading */}
      <AnimatePresence>
        {view === "UPLOAD" && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="text-center mb-8"
          >
            <div className="bg-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Zap className="text-white w-8 h-8" fill="white" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">
              Utility Bill Analyzer
            </h1>
            <p className="text-muted-foreground text-sm">
              Upload your bill and click generate to start the audit
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* ===================== UPLOAD ===================== */}
          {view === "UPLOAD" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-xl p-8 bg-white shadow-xl rounded-[2rem] border border-slate-100 flex flex-col gap-6"
            >
              <div className="min-h-[340px] flex flex-col">
                {!pendingFile ? (
                  <div
                    {...getRootProps()}
                    className={`group flex-1 border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                      isDragActive
                        ? "border-primary bg-primary/10 scale-[0.99]"
                        : "border-card-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div
                      className={`mb-4 transition-colors duration-200 ${
                        isDragActive
                          ? "text-primary"
                          : "text-muted-foreground/60 group-hover:text-primary"
                      }`}
                    >
                      <FileText className="w-12 h-12" />
                    </div>

                    <p className="text-lg font-semibold text-foreground text-balance">
                      Drop your utility bill here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-6 text-center">
                      or click to browse files
                    </p>

                    <span className="bg-primary text-white font-semibold py-3 px-10 rounded-xl shadow-md inline-block transition-transform group-hover:scale-105">
                      Select File
                    </span>

                    <p className="text-[10px] text-muted-foreground/60 mt-6 tracking-[0.15em] uppercase font-medium">
                      Supports PDF, JPG, PNG
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 border-2 border-solid border-primary/20 bg-primary/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center relative">
                    <button
                      onClick={() => setPendingFile(null)}
                      className="absolute top-4 right-4 p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <div className="bg-card p-6 rounded-2xl shadow-sm mb-4 border border-primary/10">
                      <FileText className="text-primary w-16 h-16" />
                    </div>

                    <p className="font-semibold text-xl text-foreground truncate max-w-[300px] mb-1">
                      {pendingFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(pendingFile.size / 1024).toFixed(1)} KB — Ready to analyze
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      File Loaded
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!pendingFile}
                className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  pendingFile
                    ? "bg-gradient-to-r from-primary to-accent text-white hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-card-border/50 text-muted-foreground/50 cursor-not-allowed shadow-none border border-card-border"
                }`}
              >
                <Zap className={pendingFile ? "fill-white" : ""} />
                Generate Audit
              </button>

              {/* Feature Grid */}
              <div className="grid grid-cols-3 gap-4 border-t pt-6 border-card-border/50">
                {[
                  { label: "Errors", icon: <CheckIcon /> },
                  { label: "Savings", icon: <DollarIcon /> },
                  { label: "Eco", icon: <LeafIcon /> },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-1">
                    {item.icon}
                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ===================== ANALYZING ===================== */}
          {view === "ANALYZING" && (
            <AnimatePresence mode="wait">
              {loadingPhase === "drag-drop" && (
                <motion.div
                  key="phase1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-4xl p-10 py-20 bg-white shadow-2xl rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center overflow-hidden"
                >
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold text-foreground">Processing Your Bill</h3>
                    <p className="text-xs text-muted-foreground">Preparing document for AI analysis</p>
                  </div>

                  <LoadingAnimation onComplete={() => setLoadingPhase("scanning")} />
                </motion.div>
              )}

              {loadingPhase === "scanning" && (
                <motion.div
                  key="phase2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-4xl p-10 py-20 bg-white shadow-2xl rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center overflow-hidden"
                >
                  <AnalyzingAnimation onComplete={() => setLoadingPhase("savings")} />
                </motion.div>
              )}
{loadingPhase === "savings" && (
  <motion.div
    key="phase3"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-4xl p-10 py-20 bg-white shadow-2xl rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center overflow-hidden"
  >
    {/* Pass the state setter directly to onComplete */}
    <SavingsAnimation onComplete={() => setAnimationFinished(true)} />
    
    <div className="px-8 pb-8 -mt-2 text-center">
      <p className="text-sm text-muted-foreground">
        {loading ? "Finalizing insights…" : "Almost done…"}
      </p>
    </div>
  </motion.div>
)}
            </AnimatePresence>
          )}
          {/* ===================== RESULT ===================== */}
          {view === "RESULT" && data && !data.error && !data.parseError && (
            <ResultsPage
              analysis={{
                providerName: data.regionalComparison?.billType === "electric" ? "Pacific Gas & Electric" : "Utility Provider",
                providerEmail: "customer.service@provider.com",
                summary: {
                  totalErrors: data.errorAnalysis?.suspectedIssues?.length ?? 0,
                  totalPotentialSavings: data.regionalComparison?.estimatedAnnualSavings 
                    ? `$${data.regionalComparison.estimatedAnnualSavings.toLocaleString()}/yr` 
                    : "$2,814/yr",
                  totalCO2Reduction: data.regionalComparison?.annualCO2ReductionTons 
                    ? `${data.regionalComparison.annualCO2ReductionTons} tons/yr` 
                    : "6.5 tons/yr",
                  comparedToAverage: data.regionalComparison?.comparisonStatement || 
                    (data.regionalComparison?.comparison === "above" 
                      ? "Above average for Northern California" 
                      : "About average for Northern California"),
                },
                errors: (data.errorAnalysis?.suspectedIssues ?? []).map((issue, i) => ({
                  id: i + 1,
                  title: issue.issue,
                  description: issue.evidence,
                  amount: issue.amount ? `$${issue.amount}` : undefined,
                  severity: "high",
                  pageNumber: issue.pageNumber || 1,
                  pinX: issue.pinX,
                  pinY: issue.pinY,
                })),
                savings: (data.savingsTips ?? []).map((tip, i) => ({
                  id: i + 1,
                  title: tip.title || "Energy Saving Tip",
                  description: tip.action || tip.whyItFits || "",
                  estimatedSaving: tip.estimatedMonthlySavings ? `$${tip.estimatedMonthlySavings}/mo` : "$47/mo",
                  ecoImpact: "Reduces CO2 emissions",
                  category: "energy",
                  pageNumber: tip.pageNumber || 1,
                  pinX: tip.pinX,
                  pinY: tip.pinY,
                }))
              } as BillAnalysis}
              fileUrl={pendingFile ? URL.createObjectURL(pendingFile) : ""}
              onNewAnalysis={resetAll}
            />
          )}

          {/* Standard fallbacks for errors/parsing issues */}
          {view === "RESULT" && (!data || data.error || data.parseError) && (
            <motion.div
              key="result-fallback"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-7xl p-10 bg-white shadow-xl rounded-[2rem] border border-slate-100 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b pb-4 border-card-border">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" fill="hsl(var(--primary))" /> Audit Results
                  </h2>
                </div>
                <button onClick={resetAll} className="text-accent font-semibold text-sm hover:underline">
                  New Analysis
                </button>
              </div>
              
              {!data ? (
                <div className="rounded-2xl border p-6 bg-white">
                  <p className="text-muted-foreground">No result data.</p>
                </div>
              ) : data.error ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
                  <p className="font-bold text-red-700">Analysis failed</p>
                  <p className="mt-2 text-sm text-red-700 whitespace-pre-wrap">{data.error}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
                  <p className="font-bold text-amber-800">Couldn’t parse JSON response</p>
                  <p className="mt-2 text-sm text-amber-800 whitespace-pre-wrap">{data.raw}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-muted-foreground/60 text-xs font-medium tracking-wide">
        {"Secure AI Processing \u2022 No data stored"}
      </footer>
    </main>
  )
}

/* ===================== Helpers ===================== */

function ComparisonBadge({ value }: { value?: string }) {
  const v = value ?? "about_average"
  const label = v === "above" ? "Above Average" : v === "below" ? "Below Average" : "About Average"
  const cls =
    v === "above"
      ? "bg-red-600 text-white"
      : v === "below"
      ? "bg-emerald-600 text-white"
      : "bg-gray-200 text-gray-800"

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}

function readFileAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-muted-foreground">
      <path
        d="M5 10L9 14L15 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DollarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M10 5V15M12.5 7.5C12.5 7.5 11.5 6.5 10 6.5C8.5 6.5 7.5 7.5 7.5 8.5C7.5 9.5 8.5 10 10 10.5C11.5 11 12.5 11.5 12.5 12.5C12.5 13.5 11.5 14 10 14C8.5 14 7.5 13 7.5 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary">
      <path
        d="M10 4C10 4 6 8 6 13C6 16 7.8 18 10 18C12.2 18 14 16 14 13C14 8 10 4 10 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M10 18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 14L10 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
