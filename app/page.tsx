"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, X, Zap, Copy, AlertTriangle } from "lucide-react"

import { analyzeBill } from "./actions"

import { LoadingAnimation } from "@/components/loading-animation"
import { AnalyzingAnimation } from "@/components/AnalyzingAnimation"
import { SavingsAnimation } from "@/components/SavingsAnimation"

type AppState = "UPLOAD" | "ANALYZING" | "RESULT"
type LoadingPhase = "drag-drop" | "scanning" | "savings"

type ParsedData = {
  parseError?: boolean
  raw?: string
  error?: string

  errorAnalysis?: {
    likelihoodPct?: number
    reasons?: string[]
  }

  mockEmail?: string

  savingsTips?: Array<{
    title?: string
    action?: string
    whyItFits?: string
    estimatedMonthlySavings?: number
  }>

  regionalComparison?: {
    billType?: string
    totalAmount?: number
    comparison?: "above" | "below" | "about_average" | string
    estimatedAverageRange?: string
    explanation?: string
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
    savingsPhaseEnteredAtRef.current = null

    void runAnalysis(pendingFile)
  }

  // savings phase 최소 노출 + 분석 완료 후 RESULT 진입
  useEffect(() => {
    if (view !== "ANALYZING") return

    if (loadingPhase === "savings") {
      if (savingsPhaseEnteredAtRef.current == null) {
        savingsPhaseEnteredAtRef.current = Date.now()
      }

      const tick = () => {
        const enteredAt = savingsPhaseEnteredAtRef.current ?? Date.now()
        const shownLongEnough = Date.now() - enteredAt >= 1300
        if (shownLongEnough && analysisDoneRef.current) {
          setView("RESULT")
        }
      }

      const id = window.setInterval(tick, 200)
      return () => window.clearInterval(id)
    }
  }, [view, loadingPhase])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans text-foreground">
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
        {view !== "ANALYZING" && (
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
                  <SavingsAnimation />
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
          {view === "RESULT" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-7xl p-10 bg-white shadow-xl rounded-[2rem] border border-slate-100 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b pb-4 border-card-border">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" fill="hsl(var(--primary))" /> Audit Results
                  </h2>

                  {suspicious && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white px-2.5 py-1 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      suspicious
                    </span>
                  )}
                </div>

                <button onClick={resetAll} className="text-accent font-semibold text-sm hover:underline">
                  New Analysis
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab(1)}
                    className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                      activeTab === 1 ? "bg-slate-900 text-white" : "bg-white"
                    }`}
                  >
                    Error Audit
                  </button>

                  <button
                    onClick={() => setActiveTab(2)}
                    className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                      activeTab === 2 ? "bg-slate-900 text-white" : "bg-white"
                    }`}
                  >
                    Savings & Comparison
                  </button>
                </div>

                {pendingFile && (
                  <div className="text-xs text-muted-foreground truncate max-w-[45%] text-right">
                    File: <span className="font-semibold text-foreground">{pendingFile.name}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              {!data ? (
                <div className="rounded-2xl border p-6 bg-white">
                  <p className="text-muted-foreground">No result data.</p>
                </div>
              ) : data.error ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
                  <p className="font-bold text-red-700">Analysis failed</p>
                  <p className="mt-2 text-sm text-red-700 whitespace-pre-wrap">{data.error}</p>
                </div>
              ) : data.parseError ? (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
                  <p className="font-bold text-amber-800">Couldn’t parse JSON response</p>
                  <p className="mt-2 text-sm text-amber-800 whitespace-pre-wrap">{data.raw}</p>
                </div>
              ) : activeTab === 1 ? (
                <div
                  className={`p-6 rounded-2xl border shadow-sm ${
                    suspicious ? "bg-red-50 border-red-400" : "bg-white border-slate-200"
                  }`}
                >
                  <h3 className="text-lg font-bold mb-3 text-foreground">Error Audit</h3>

                  <p className="text-base text-foreground">
                    Error Probability: <span className="font-extrabold">{likelihoodPct}%</span>
                    {suspicious && <span className="ml-2 text-red-600 font-semibold">⚠ suspicious</span>}
                  </p>

                  {Array.isArray(data.errorAnalysis?.reasons) && data.errorAnalysis!.reasons!.length > 0 && (
                    <ul className="mt-4 list-disc pl-6 text-foreground/90">
                      {data.errorAnalysis!.reasons!.map((r, i) => (
                        <li key={i} className="mb-2">
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}

                  {data.mockEmail && (
                    <div className="mt-6 border-t pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-base font-bold text-foreground">Draft Email</h4>

                        <button
                          onClick={() => handleCopy(data.mockEmail!)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white font-semibold hover:bg-slate-800"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Email
                        </button>
                      </div>

                      <pre className="mt-3 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl text-sm border">
                        {data.mockEmail}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`p-6 rounded-2xl border shadow-sm ${
                    data.regionalComparison?.comparison === "above"
                      ? "bg-yellow-50 border-yellow-300"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <h3 className="text-lg font-bold mb-3 text-foreground">Sustainable Savings</h3>

                  <div className="space-y-3">
                    {sortedTips.length > 0 ? (
                      sortedTips.map((tip: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border">
                          <div className="font-bold text-foreground">{tip.title ?? `Tip ${i + 1}`}</div>
                          {tip.action && <div className="text-foreground/90 mt-1">{tip.action}</div>}

                          {tip.estimatedMonthlySavings != null && (
                            <div className="mt-2 text-emerald-700 font-semibold">
                              Est. Save: ${tip.estimatedMonthlySavings}/month
                            </div>
                          )}

                          {tip.whyItFits && (
                            <div className="mt-1 text-sm text-muted-foreground">{tip.whyItFits}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border text-muted-foreground">
                        No savings tips found.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t pt-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-foreground">Regional Comparison</h4>
                      <ComparisonBadge value={data.regionalComparison?.comparison} />
                    </div>

                    <div className="mt-3 space-y-1 text-foreground/90">
                      <p>
                        Bill Type:{" "}
                        <span className="font-semibold">
                          {data.regionalComparison?.billType ?? "unknown"}
                        </span>
                      </p>
                      <p>
                        Total Amount:{" "}
                        <span className="font-semibold">
                          {data.regionalComparison?.totalAmount != null
                            ? `$${data.regionalComparison.totalAmount}`
                            : "Unknown"}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avg Range: {data.regionalComparison?.estimatedAverageRange ?? "Unknown"}
                      </p>
                      {data.regionalComparison?.explanation && (
                        <p className="mt-2 text-foreground/90">{data.regionalComparison.explanation}</p>
                      )}
                    </div>
                  </div>
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
