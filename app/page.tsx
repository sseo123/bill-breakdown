"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, X, Zap, Copy, RefreshCw, AlertTriangle } from "lucide-react"

import { analyzeBill } from "./actions"

// 애니메이션 컴포넌트(프로젝트에 이미 있는 걸로 가정)
import { LoadingAnimation } from "@/components/loading-animation"
import { AnalyzingAnimation } from "@/components/AnalyzingAnimation"
import { SavingsAnimation } from "@/components/SavingsAnimation"

type AppState = "UPLOAD" | "ANALYZING" | "RESULT"
type LoadingPhase = "prep" | "scanning" | "savings"

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
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("prep")

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

  const resetAll = () => {
    setView("UPLOAD")
    setLoadingPhase("prep")
    setPendingFile(null)
    setData(null)
    setLoading(false)
    setActiveTab(1)
    analysisDoneRef.current = false
    savingsPhaseEnteredAtRef.current = null
  }

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPendingFile(acceptedFiles[0])
    }
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

    // UI는 ANALYZING로 전환 + 로딩 3단계 시작
    setView("ANALYZING")
    setLoadingPhase("prep")
    savingsPhaseEnteredAtRef.current = null

    // 분석은 병렬로 시작
    void runAnalysis(pendingFile)
  }

  // savings phase에 들어가면, 최소 1.3초는 보여주고,
  // 그 사이에 분석도 끝났으면 RESULT로 넘어가게 처리
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

  // 만약 애니메이션 단계가 끝났는데 분석이 아직이면, 계속 ANALYZING 유지(RESULT로 안 넘어감)
  // 반대로 분석이 먼저 끝나도, 단계가 savings까지 진행되어야 RESULT로 넘어감.

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-800">
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

      {/* Header (로딩 중엔 숨김) */}
      <AnimatePresence>
        {view !== "ANALYZING" && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="text-center mb-8"
          >
            <div className="bg-[#10B981] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
              <Zap className="text-white w-8 h-8" fill="white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">
              Utility Bill Analyzer
            </h1>
            <p className="text-slate-500">
              Upload your bill, then click <span className="font-semibold">Generate</span> to run the AI audit.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <motion.div
        layout
        className={`w-full max-w-3xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden ${
          view === "ANALYZING" ? "p-0" : "p-8"
        }`}
      >
        <AnimatePresence mode="wait">
          {/* ===================== UPLOAD ===================== */}
          {view === "UPLOAD" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Reset button (data 있을 때) */}
              {data && (
                <div className="flex justify-end">
                  <button
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Analyze Another Bill
                  </button>
                </div>
              )}

              {!pendingFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                    isDragActive
                      ? "border-[#10B981] bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="mb-4 text-slate-400">
                      <FileText className="w-12 h-12" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 text-balance">
                      Drag and drop your utility bill here
                    </p>
                    <p className="text-sm text-slate-400 mt-1 mb-6 text-center">or click to browse</p>

                    <span className="bg-[#06B6D4] hover:bg-cyan-500 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-md inline-block">
                      Select File
                    </span>

                    <p className="text-xs text-slate-400 mt-6 tracking-wide uppercase">
                      Supported formats: PDF, JPG, PNG
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-emerald-100 bg-emerald-50/50 rounded-2xl p-8 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <FileText className="text-emerald-500 w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-700 truncate">{pendingFile.name}</p>
                      <p className="text-xs text-slate-500">
                        {(pendingFile.size / 1024).toFixed(1)} KB • Ready to analyze
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPendingFile(null)}
                    className="p-2 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!pendingFile}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  pendingFile
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Zap className={pendingFile ? "fill-white" : ""} />
                Generate Audit
              </button>

              {/* Feature Row */}
              <div className="grid grid-cols-3 gap-4 border-t pt-6 border-slate-50">
                <MiniFeature label="Errors" icon={<CheckIcon />} />
                <MiniFeature label="Savings" icon={<DollarIcon />} />
                <MiniFeature label="Eco" icon={<LeafIcon />} />
              </div>
            </motion.div>
          )}

          {/* ===================== ANALYZING ===================== */}
          {view === "ANALYZING" && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnimatePresence mode="wait">
                {loadingPhase === "prep" && (
                  <motion.div
                    key="phase-prep"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.45 }}
                    className="p-8"
                  >
                    <div className="text-center mb-2">
                      <h3 className="text-lg font-bold text-slate-700">Preparing Your Document</h3>
                      <p className="text-sm text-slate-400">Uploading & formatting for AI analysis…</p>
                    </div>

                    <LoadingAnimation onComplete={() => setLoadingPhase("scanning")} />
                  </motion.div>
                )}

                {loadingPhase === "scanning" && (
                  <motion.div
                    key="phase-scan"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.45 }}
                  >
                    <AnalyzingAnimation onComplete={() => setLoadingPhase("savings")} />
                  </motion.div>
                )}

                {loadingPhase === "savings" && (
                  <motion.div
                    key="phase-savings"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.45 }}
                  >
                    <SavingsAnimation />
                    <div className="px-8 pb-8 -mt-2 text-center">
                      <p className="text-sm text-slate-500">
                        {loading ? "Finalizing insights…" : "Almost done…"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ===================== RESULT ===================== */}
          {view === "RESULT" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800">Audit Results</h2>
                  {suspicious && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white px-2.5 py-1 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      suspicious
                    </span>
                  )}
                </div>

                <button
                  onClick={resetAll}
                  className="text-cyan-600 font-bold text-sm hover:underline"
                >
                  New Analysis
                </button>
              </div>

              {/* Error / Savings 탭 */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab(1)}
                    className={`px-4 py-2 rounded-lg font-semibold border ${
                      activeTab === 1 ? "bg-slate-900 text-white" : "bg-white"
                    }`}
                  >
                    Error Audit
                  </button>

                  <button
                    onClick={() => setActiveTab(2)}
                    className={`px-4 py-2 rounded-lg font-semibold border ${
                      activeTab === 2 ? "bg-slate-900 text-white" : "bg-white"
                    }`}
                  >
                    Savings & Comparison
                  </button>
                </div>

                {pendingFile && (
                  <div className="text-xs text-slate-500 truncate max-w-[45%] text-right">
                    File: <span className="font-semibold">{pendingFile.name}</span>
                  </div>
                )}
              </div>

              {/* 결과 내용 */}
              {!data ? (
                <div className="rounded-2xl border p-6 bg-white">
                  <p className="text-slate-600">No result data.</p>
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
                  <h3 className="text-lg font-bold mb-3 text-slate-800">Error Audit</h3>

                  <p className="text-base">
                    Error Probability:{" "}
                    <span className="font-extrabold">{likelihoodPct}%</span>
                    {suspicious && <span className="ml-2 text-red-600 font-semibold">⚠ suspicious</span>}
                  </p>

                  {Array.isArray(data.errorAnalysis?.reasons) && data.errorAnalysis!.reasons!.length > 0 && (
                    <ul className="mt-4 list-disc pl-6 text-slate-700">
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
                        <h4 className="text-base font-bold text-slate-800">Draft Email</h4>

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
                  <h3 className="text-lg font-bold mb-3 text-slate-800">Sustainable Savings</h3>

                  <div className="space-y-3">
                    {sortedTips.length > 0 ? (
                      sortedTips.map((tip: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border">
                          <div className="font-bold text-slate-800">{tip.title ?? `Tip ${i + 1}`}</div>
                          {tip.action && <div className="text-slate-700 mt-1">{tip.action}</div>}

                          {tip.estimatedMonthlySavings != null && (
                            <div className="mt-2 text-emerald-700 font-semibold">
                              Est. Save: ${tip.estimatedMonthlySavings}/month
                            </div>
                          )}

                          {tip.whyItFits && <div className="mt-1 text-sm text-slate-500">{tip.whyItFits}</div>}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border text-slate-600">
                        No savings tips found.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t pt-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-800">Regional Comparison</h4>
                      <ComparisonBadge value={data.regionalComparison?.comparison} />
                    </div>

                    <div className="mt-3 space-y-1 text-slate-700">
                      <p>
                        Bill Type:{" "}
                        <span className="font-semibold">{data.regionalComparison?.billType ?? "unknown"}</span>
                      </p>
                      <p>
                        Total Amount:{" "}
                        <span className="font-semibold">
                          {data.regionalComparison?.totalAmount != null
                            ? `$${data.regionalComparison.totalAmount}`
                            : "Unknown"}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Avg Range: {data.regionalComparison?.estimatedAverageRange ?? "Unknown"}
                      </p>
                      {data.regionalComparison?.explanation && (
                        <p className="mt-2 text-slate-700">{data.regionalComparison.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="mt-8 text-slate-400 text-sm font-medium">Secure AI Processing • No data stored</footer>
    </main>
  )
}

/* ===================== Helpers ===================== */

function MiniFeature({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      {icon}
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function ComparisonBadge({ value }: { value?: string }) {
  const v = value ?? "about_average"
  const label = v === "above" ? "Above Average" : v === "below" ? "Below Average" : "About Average"
  const cls =
    v === "above"
      ? "bg-red-600 text-white"
      : v === "below"
      ? "bg-emerald-600 text-white"
      : "bg-gray-200 text-gray-800"

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>
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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-slate-500">
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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-amber-500">
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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-emerald-500">
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
