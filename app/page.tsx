"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { LoadingAnimation } from "@/components/loading-animation"
import { AnalyzingAnimation } from "@/components/AnalyzingAnimation"
import { SavingsAnimation } from "@/components/SavingsAnimation"
import { FileText, X, Zap } from "lucide-react"
import { analyzeBill } from './actions';

type AppState = "UPLOAD" | "ANALYZING" | "RESULT"
type LoadingPhase = "drag-drop" | "scanning" | "savings"

export default function BillAnalyzer() {
  const [view, setView] = useState<AppState>("UPLOAD")
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("drag-drop")
  const [result, setResult] = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPendingFile(acceptedFiles[0])
    }
  }, [])

  const handleGenerate = async () => {
    if (!pendingFile) return

    setView("ANALYZING")
    setLoadingPhase("drag-drop")

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const response = await analyzeBill(base64, pendingFile.type);
        setResult(response);
        setView('RESULT');
      } catch (error: any) {
        console.error("Gemini API Error:", error);
        alert(`Error: ${error.message || "Unknown error occurred"}`);
        setView('UPLOAD');
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
      setView('UPLOAD');
    };
    reader.readAsDataURL(pendingFile);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
  })

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans text-foreground">
      {/* Header - hidden during loading */}
      <AnimatePresence>
        {view !== "ANALYZING" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
          {/* ========== STATE 1: UPLOAD ========== */}
          {view === "UPLOAD" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-xl p-8 bg-white shadow-xl rounded-[2rem] border border-slate-100 flex flex-col gap-6"
            >
    <div className="min-h-[340px] flex flex-col"> {/* Fixed min-height to prevent jumping */}
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
          <div className={`mb-4 transition-colors duration-200 ${
            isDragActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary"
          }`}>
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
        /* Consistent File Selected State */
        <div className="flex-1 border-2 border-solid border-primary/20 bg-primary/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center relative">
          <button
            onClick={() => setPendingFile(null)}
            className="absolute top-4 right-4 p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
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
                  <div
                    key={i}
                    className="flex flex-col items-center text-center gap-1"
                  >
                    {item.icon}
                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========== STATE 2: ANALYZING (3 phases) ========== */}
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
                      <h3 className="text-lg font-semibold text-foreground">
                        Processing Your Bill
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Preparing document for AI analysis
                      </p>
                    </div>
                    <LoadingAnimation
                      onComplete={() => setLoadingPhase("scanning")}
                    />
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
                    <AnalyzingAnimation
                      onComplete={() => setLoadingPhase("savings")}
                    />
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
                  </motion.div>
                )}
              </AnimatePresence>
            )}

          {/* ========== STATE 3: RESULT ========== */}
          {view === "RESULT" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-7xl p-10 bg-white shadow-xl rounded-[2rem] border border-slate-100 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b pb-4 border-card-border">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" fill="hsl(var(--primary))" /> Audit Results
                </h2>
                <button
                  onClick={() => {
                    setView("UPLOAD")
                    setPendingFile(null)
                    setLoadingPhase("drag-drop")
                  }}
                  className="text-accent font-semibold text-sm hover:underline"
                >
                  New Analysis
                </button>
              </div>
              <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                {result}
              </div>
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

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-muted-foreground"
    >
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
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-accent"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
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
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-primary"
    >
      <path
        d="M10 4C10 4 6 8 6 13C6 16 7.8 18 10 18C12.2 18 14 16 14 13C14 8 10 4 10 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 18V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 14L10 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
