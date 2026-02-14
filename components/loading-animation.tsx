"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type AnimationPhase =
  | "idle"
  | "pdf-to-folder"
  | "pdf-entering-folder"
  | "folder-close"
  | "folder-to-ai"
  | "folder-entering-ai"
  | "ai-analyzing"
  | "ai-complete"

interface LoadingAnimationProps {
  onComplete?: () => void
}

export function LoadingAnimation({ onComplete }: LoadingAnimationProps) {
  const [phase, setPhase] = useState<AnimationPhase>("idle")

  useEffect(() => {
    const timings: { phase: AnimationPhase; delay: number }[] = [
      { phase: "pdf-to-folder", delay: 800 },
      { phase: "pdf-entering-folder", delay: 1200 },
      { phase: "folder-close", delay: 700 },
      { phase: "folder-to-ai", delay: 1400 },
      { phase: "folder-entering-ai", delay: 900 },
      { phase: "ai-analyzing", delay: 2600 },
      { phase: "ai-complete", delay: 1400 },
    ]

    const timeouts: NodeJS.Timeout[] = []
    let totalDelay = 0

    timings.forEach(({ phase: p, delay }) => {
      totalDelay += delay
      const t = setTimeout(() => setPhase(p), totalDelay)
      timeouts.push(t)
    })

    const doneTimeout = setTimeout(() => {
      onComplete?.()
    }, totalDelay + 600)
    timeouts.push(doneTimeout)

    return () => timeouts.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="relative flex items-center justify-center w-full max-w-3xl mx-auto h-72 select-none overflow-hidden">
      {/* Connection Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 280"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Left line: PDF to Folder */}
        <line
          x1="195" y1="140" x2="345" y2="140"
          stroke="hsl(160, 55%, 42%)" strokeWidth="2" strokeDasharray="6 4"
          className={`transition-opacity duration-500 ${
            phase === "pdf-to-folder" || phase === "pdf-entering-folder" ? "opacity-60" : "opacity-15"
          }`}
        />
        {/* Right line: Folder to AI */}
        <line
          x1="455" y1="140" x2="605" y2="140"
          stroke="hsl(174, 60%, 45%)" strokeWidth="2" strokeDasharray="6 4"
          className={`transition-opacity duration-500 ${
            phase === "folder-to-ai" || phase === "folder-entering-ai" ? "opacity-60" : "opacity-15"
          }`}
        />
        {/* Animated dot left */}
        {(phase === "pdf-to-folder" || phase === "pdf-entering-folder") && (
          <circle r="4" fill="hsl(160, 55%, 42%)">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M195,140 L345,140" />
          </circle>
        )}
        {/* Animated dot right */}
        {(phase === "folder-to-ai" || phase === "folder-entering-ai") && (
          <circle r="4" fill="hsl(174, 60%, 45%)">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M455,140 L605,140" />
          </circle>
        )}
      </svg>

      {/* ---- PDF DOCUMENT (Left) ---- */}
      <div
        className={`absolute transition-all ease-in-out z-10 ${
          phase === "idle"
            ? "left-[5%] opacity-100 scale-100 duration-700"
            : phase === "pdf-to-folder"
              ? "left-[30%] opacity-100 scale-90 duration-1000"
              : phase === "pdf-entering-folder"
                ? "left-[37%] opacity-0 scale-50 duration-[600ms]"
                : "left-[37%] opacity-0 scale-50 duration-300"
        }`}
        style={{ top: "50%", transform: `translateY(-50%) ${phase === "pdf-to-folder" ? "rotate(-3deg)" : "rotate(0deg)"}` }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`relative w-20 h-24 rounded-lg border-2 border-[hsl(160,55%,42%)]/30 bg-white shadow-lg transition-shadow duration-500 ${phase === "idle" ? "shadow-[hsl(160,55%,42%)]/10" : ""}`}>
            <div className="absolute top-0 right-0 w-5 h-5 bg-[hsl(150,30%,95%)] rounded-bl-md border-b-2 border-l-2 border-[hsl(160,55%,42%)]/20" />
            <div className="p-2.5 pt-3 flex flex-col gap-1.5">
              <div className="h-1.5 w-10 rounded-full bg-[hsl(160,55%,42%)]/30" />
              <div className="h-1.5 w-12 rounded-full bg-[hsl(160,55%,42%)]/20" />
              <div className="h-1.5 w-8 rounded-full bg-[hsl(160,55%,42%)]/15" />
              <div className="h-1.5 w-11 rounded-full bg-[hsl(160,55%,42%)]/20" />
              <div className="h-1.5 w-6 rounded-full bg-[hsl(160,55%,42%)]/15" />
              <div className="mt-1 h-1.5 w-9 rounded-full bg-[hsl(174,60%,45%)]/40" />
            </div>
            {phase === "idle" && (
              <div className="absolute -inset-1 rounded-xl bg-[hsl(160,55%,42%)]/5 animate-pulse" />
            )}
          </div>
          <span className="text-xs font-medium text-[hsl(220,10%,50%)] whitespace-nowrap">utility_bill.pdf</span>
        </div>
      </div>

      {/* ---- FOLDER (Center) ---- */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col items-center gap-2">
          <div className={`relative transition-all duration-500 ${
            phase === "pdf-entering-folder" || phase === "folder-close" ? "scale-110" : "scale-100"
          }`}>
            <div className={`w-24 h-20 rounded-lg border-2 transition-colors duration-500 ${
              phase === "pdf-entering-folder" || phase === "folder-close"
                ? "bg-[hsl(160,55%,42%)]/20 border-[hsl(160,55%,42%)]/40"
                : "bg-[hsl(150,30%,95%)] border-[hsl(160,55%,42%)]/25"
            }`}>
              <div className={`absolute -top-2.5 left-2 w-10 h-4 rounded-t-md border-2 border-b-0 transition-colors duration-500 ${
                phase === "pdf-entering-folder" || phase === "folder-close"
                  ? "bg-[hsl(160,55%,42%)]/25 border-[hsl(160,55%,42%)]/40"
                  : "bg-[hsl(150,30%,95%)] border-[hsl(160,55%,42%)]/25"
              }`} />
              <div className={`absolute bottom-0 left-0 right-0 h-14 rounded-b-lg border-t-2 transition-all duration-500 ${
                phase === "pdf-entering-folder" || phase === "folder-close"
                  ? "bg-[hsl(160,55%,42%)]/15 border-[hsl(160,55%,42%)]/30"
                  : "bg-white/80 border-[hsl(160,55%,42%)]/15"
              }`} />
              {(phase === "folder-close" || phase === "folder-to-ai" || phase === "folder-entering-ai") && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-12 rounded bg-white border border-[hsl(160,55%,42%)]/20 opacity-60">
                  <div className="p-1 flex flex-col gap-1 mt-1">
                    <div className="h-1 w-5 rounded-full bg-[hsl(160,55%,42%)]/25" />
                    <div className="h-1 w-6 rounded-full bg-[hsl(160,55%,42%)]/15" />
                    <div className="h-1 w-4 rounded-full bg-[hsl(160,55%,42%)]/20" />
                  </div>
                </div>
              )}
            </div>
            {phase === "pdf-entering-folder" && (
              <div className="absolute -inset-3 rounded-2xl border-2 border-[hsl(160,55%,42%)]/30 animate-ping" />
            )}
          </div>
          <span className="text-xs font-medium text-[hsl(220,10%,50%)]">Bills Folder</span>
        </div>
      </div>

      {/* ---- Folder moving to AI ---- */}
      {(phase === "folder-to-ai" || phase === "folder-entering-ai") && (
        <div
          className={`absolute z-30 transition-all ease-in-out ${
            phase === "folder-to-ai"
              ? "left-[55%] opacity-100 scale-90 duration-[1200ms]"
              : "left-[63%] opacity-0 scale-50 duration-[600ms]"
          }`}
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <div className="relative w-20 h-16 rounded-lg bg-[hsl(160,55%,42%)]/20 border-2 border-[hsl(160,55%,42%)]/35">
            <div className="absolute -top-2 left-2 w-8 h-3 rounded-t-md bg-[hsl(160,55%,42%)]/25 border-2 border-b-0 border-[hsl(160,55%,42%)]/35" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-10 rounded bg-white/80 border border-[hsl(160,55%,42%)]/15">
              <div className="p-1 flex flex-col gap-0.5 mt-0.5">
                <div className="h-0.5 w-4 rounded-full bg-[hsl(160,55%,42%)]/25" />
                <div className="h-0.5 w-5 rounded-full bg-[hsl(160,55%,42%)]/15" />
                <div className="h-0.5 w-3 rounded-full bg-[hsl(160,55%,42%)]/20" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- AI ANALYSIS (Right) ---- */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col items-center gap-2">
          <div className={`relative w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all duration-700 ${
            phase === "ai-analyzing"
              ? "bg-[hsl(174,60%,45%)]/15 border-[hsl(174,60%,45%)]/50 shadow-lg shadow-[hsl(174,60%,45%)]/20"
              : phase === "ai-complete"
                ? "bg-[hsl(160,55%,42%)]/15 border-[hsl(160,55%,42%)]/50 shadow-lg shadow-[hsl(160,55%,42%)]/20"
                : "bg-[hsl(150,30%,95%)] border-[hsl(160,55%,42%)]/20"
          }`}>
            <div className="relative">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
                className={`transition-all duration-500 ${phase === "ai-analyzing" ? "animate-spin" : ""} ${phase === "ai-complete" ? "scale-110" : "scale-100"}`}
                style={{ animationDuration: "3s" }}
              >
                <path
                  d="M18 2C18 2 22 14 34 18C22 22 18 34 18 34C18 34 14 22 2 18C14 14 18 2 18 2Z"
                  fill={
                    phase === "ai-analyzing" ? "hsl(174, 60%, 45%)"
                      : phase === "ai-complete" ? "hsl(160, 55%, 42%)"
                        : "hsl(160, 35%, 60%)"
                  }
                  className="transition-all duration-500"
                  fillOpacity={phase === "ai-analyzing" || phase === "ai-complete" ? 1 : 0.5}
                />
              </svg>
              {phase === "ai-analyzing" && (
                <>
                  <div className="absolute -top-2 -right-2 w-2 h-2 rounded-full bg-[hsl(174,60%,45%)] animate-ping" />
                  <div className="absolute -bottom-1 -left-2 w-1.5 h-1.5 rounded-full bg-[hsl(160,55%,42%)] animate-ping" style={{ animationDelay: "0.3s" }} />
                  <div className="absolute top-0 -left-3 w-1 h-1 rounded-full bg-[hsl(174,60%,45%)]/70 animate-ping" style={{ animationDelay: "0.6s" }} />
                </>
              )}
            </div>

            {phase === "ai-analyzing" && <MagnifyingGlass />}

            {phase === "ai-complete" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[hsl(160,55%,42%)] flex items-center justify-center shadow-md"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}

            {phase === "ai-analyzing" && (
              <div className="absolute inset-[-6px] rounded-2xl border-2 border-[hsl(174,60%,45%)]/25 border-t-[hsl(174,60%,45%)]/60 animate-spin" style={{ animationDuration: "2s" }} />
            )}
          </div>
          <span className="text-xs font-medium text-[hsl(220,10%,50%)]">AI Analysis</span>
        </div>
      </div>

      {/* ---- Progress Bar ---- */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64">
        <div className="h-1.5 rounded-full bg-[hsl(150,30%,95%)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ease-out bg-gradient-to-r from-[hsl(160,55%,42%)] to-[hsl(174,60%,45%)] ${getProgressWidth(phase)}`}
            style={{ transitionDuration: "800ms" }}
          />
        </div>
        <p className="text-center text-xs text-[hsl(220,10%,50%)] mt-2 h-4">
          {getStatusText(phase)}
        </p>
      </div>
    </div>
  )
}

function MagnifyingGlass() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative animate-bounce" style={{ animationDuration: "1.5s" }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
          <circle cx="20" cy="20" r="12" stroke="hsl(160, 55%, 42%)" strokeWidth="3" fill="hsl(160, 55%, 42%)" fillOpacity="0.08" />
          <path d="M14 14C16 12 19 11 20 11" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="29" y1="29" x2="40" y2="40" stroke="hsl(160, 55%, 42%)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        <div className="absolute top-2 left-2 w-9 h-9 overflow-hidden rounded-full">
          <div className="w-full h-0.5 bg-[hsl(174,60%,45%)]/50" style={{ animation: "scanLine 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(32px); }
        }
      `}</style>
    </div>
  )
}

function getProgressWidth(phase: AnimationPhase): string {
  switch (phase) {
    case "idle": return "w-0"
    case "pdf-to-folder": return "w-1/6"
    case "pdf-entering-folder": return "w-2/6"
    case "folder-close": return "w-3/6"
    case "folder-to-ai": return "w-4/6"
    case "folder-entering-ai": return "w-5/6"
    case "ai-analyzing": return "w-[90%]"
    case "ai-complete": return "w-full"
    default: return "w-0"
  }
}

function getStatusText(phase: AnimationPhase): string {
  switch (phase) {
    case "idle": return "Preparing analysis..."
    case "pdf-to-folder":
    case "pdf-entering-folder": return "Collecting utility bill..."
    case "folder-close": return "Organizing documents..."
    case "folder-to-ai":
    case "folder-entering-ai": return "Sending to AI engine..."
    case "ai-analyzing": return "Analyzing bill data..."
    case "ai-complete": return "Analysis complete!"
    default: return ""
  }
}
