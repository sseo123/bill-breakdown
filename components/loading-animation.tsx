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
      { phase: "pdf-to-folder", delay: 1000 },
      { phase: "pdf-entering-folder", delay: 1500 },
      { phase: "folder-close", delay: 1000 },
      { phase: "folder-to-ai", delay: 1500 },
      { phase: "folder-entering-ai", delay: 1000 },
      { phase: "ai-analyzing", delay: 1500 },
      { phase: "ai-complete", delay: 1000 },
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
    <div className="relative flex items-center justify-center w-full max-w-3xl mx-auto h-[300px] select-none overflow-hidden">
      {/* Connection Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 280"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Left line: PDF to Folder */}
        <motion.line
          x1="195" y1="140" x2="345" y2="140"
          stroke="hsl(160, 55%, 42%)" strokeWidth="2" strokeDasharray="6 4"
          initial={{ opacity: 0.15 }}
          animate={{
            opacity: phase === "pdf-to-folder" || phase === "pdf-entering-folder" ? 0.6 : 0.15
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        {/* Right line: Folder to AI */}
        <motion.line
          x1="455" y1="140" x2="605" y2="140"
          stroke="hsl(174, 60%, 45%)" strokeWidth="2" strokeDasharray="6 4"
          initial={{ opacity: 0.15 }}
          animate={{
            opacity: phase === "folder-to-ai" || phase === "folder-entering-ai" ? 0.6 : 0.15
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
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
      <motion.div
        className="absolute z-10"
        style={{ top: "50%", y: "-50%" }}
        initial={{ left: "5%", opacity: 1, scale: 1, rotate: 0 }}
        animate={{
          left: phase === "idle" ? "5%" : phase === "pdf-to-folder" ? "30%" : "37%",
          opacity: phase === "idle" || phase === "pdf-to-folder" ? 1 : 0,
          scale: phase === "idle" ? 1 : phase === "pdf-to-folder" ? 0.9 : 0.5,
          rotate: phase === "pdf-to-folder" ? -3 : 0
        }}
        transition={{
          duration: phase === "pdf-entering-folder" ? 0.5 : phase === "pdf-to-folder" ? 1.1 : 0.7,
          ease: [0.34, 1.56, 0.64, 1],
          opacity: { duration: phase === "pdf-entering-folder" ? 0.4 : 0.6 }
        }}
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
              <motion.div 
                className="absolute -inset-1 rounded-xl bg-[hsl(160,55%,42%)]/5"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
          <span className="text-xs font-medium text-[hsl(220,10%,50%)] whitespace-nowrap">utility_bill.pdf</span>
        </div>
      </motion.div>

      {/* ---- FOLDER (Center) ---- */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="relative"
            animate={{
              scale: phase === "pdf-entering-folder" || phase === "folder-close" ? 1.1 : 1
            }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.div 
              className="w-24 h-20 rounded-lg border-2"
              animate={{
                backgroundColor: phase === "pdf-entering-folder" || phase === "folder-close"
                  ? "hsl(160, 55%, 42%, 0.2)"
                  : "hsl(150, 30%, 95%)",
                borderColor: phase === "pdf-entering-folder" || phase === "folder-close"
                  ? "hsl(160, 55%, 42%, 0.4)"
                  : "hsl(160, 55%, 42%, 0.25)"
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <motion.div 
                className="absolute -top-2.5 left-2 w-10 h-4 rounded-t-md border-2 border-b-0"
                animate={{
                  backgroundColor: phase === "pdf-entering-folder" || phase === "folder-close"
                    ? "hsl(160, 55%, 42%, 0.25)"
                    : "hsl(150, 30%, 95%)",
                  borderColor: phase === "pdf-entering-folder" || phase === "folder-close"
                    ? "hsl(160, 55%, 42%, 0.4)"
                    : "hsl(160, 55%, 42%, 0.25)"
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-14 rounded-b-lg border-t-2"
                animate={{
                  backgroundColor: phase === "pdf-entering-folder" || phase === "folder-close"
                    ? "hsl(160, 55%, 42%, 0.15)"
                    : "hsl(0, 0%, 100%, 0.8)",
                  borderColor: phase === "pdf-entering-folder" || phase === "folder-close"
                    ? "hsl(160, 55%, 42%, 0.3)"
                    : "hsl(160, 55%, 42%, 0.15)"
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              {(phase === "folder-close" || phase === "folder-to-ai" || phase === "folder-entering-ai") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-12 rounded bg-white border border-[hsl(160,55%,42%)]/20"
                >
                  <div className="p-1 flex flex-col gap-1 mt-1">
                    <div className="h-1 w-5 rounded-full bg-[hsl(160,55%,42%)]/25" />
                    <div className="h-1 w-6 rounded-full bg-[hsl(160,55%,42%)]/15" />
                    <div className="h-1 w-4 rounded-full bg-[hsl(160,55%,42%)]/20" />
                  </div>
                </motion.div>
              )}
            </motion.div>
            {phase === "pdf-entering-folder" && (
              <motion.div 
                className="absolute -inset-3 rounded-2xl border-2 border-[hsl(160,55%,42%)]/30"
                animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </motion.div>
          <span className="text-xs font-medium text-[hsl(220,10%,50%)]">Bills Folder</span>
        </div>
      </div>

      {/* ---- Folder moving to AI ---- */}
      {(phase === "folder-to-ai" || phase === "folder-entering-ai") && (
        <motion.div
          className="absolute z-30"
          style={{ top: "46%", y: "-50%" }}
          initial={{ left: "50%", opacity: 1, scale: 1 }}
          animate={{
            left: phase === "folder-to-ai" ? "55%" : "63%",
            opacity: phase === "folder-to-ai" ? 1 : 0,
            scale: phase === "folder-to-ai" ? 0.9 : 0.5
          }}
          transition={{
            duration: phase === "folder-entering-ai" ? 0.5 : 1.1,
            ease: [0.34, 1.56, 0.64, 1],
            opacity: { duration: phase === "folder-entering-ai" ? 0.4 : 0.6 }
          }}
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
        </motion.div>
      )}

      {/* ---- AI ANALYSIS (Right) ---- */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="relative w-24 h-24 rounded-2xl border-2 flex items-center justify-center"
            animate={{
              backgroundColor: phase === "ai-analyzing"
                ? "hsl(174, 60%, 45%, 0.15)"
                : phase === "ai-complete"
                ? "hsl(160, 55%, 42%, 0.15)"
                : "hsl(150, 30%, 95%)",
              borderColor: phase === "ai-analyzing"
                ? "hsl(174, 60%, 45%, 0.5)"
                : phase === "ai-complete"
                ? "hsl(160, 55%, 42%, 0.5)"
                : "hsl(160, 55%, 42%, 0.2)"
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div className="relative">
              <motion.svg
                width="36" height="36" viewBox="0 0 36 36" fill="none"
                animate={{
                  rotate: phase === "ai-analyzing" ? 360 : 0,
                  scale: phase === "ai-complete" ? 1.1 : phase === "ai-analyzing" ? [1, 1.05, 1] : 1
                }}
                transition={{
                  rotate: { duration: 3, repeat: phase === "ai-analyzing" ? Infinity : 0, ease: "linear" },
                  scale: phase === "ai-complete" 
                    ? { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
                    : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <motion.path
                  d="M18 2C18 2 22 14 34 18C22 22 18 34 18 34C18 34 14 22 2 18C14 14 18 2 18 2Z"
                  animate={{
                    fill: phase === "ai-analyzing"
                      ? "hsl(174, 60%, 45%)"
                      : phase === "ai-complete"
                      ? "hsl(160, 55%, 42%)"
                      : "hsl(160, 35%, 60%)",
                    fillOpacity: phase === "ai-analyzing" || phase === "ai-complete" ? 1 : 0.5
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </motion.svg>
              {phase === "ai-analyzing" && (
                <>
                  {/* Floating sparkle particles */}
                  <motion.div
                    className="absolute -top-3 right-0 w-1.5 h-1.5 rounded-full bg-[hsl(174,60%,45%)]"
                    animate={{
                      y: [-8, -16, -8],
                      x: [0, 4, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute top-2 -right-4 w-1 h-1 rounded-full bg-[hsl(160,55%,42%)]"
                    animate={{
                      y: [-6, -14, -6],
                      x: [0, -3, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  />
                  <motion.div
                    className="absolute -bottom-2 -left-3 w-1.5 h-1.5 rounded-full bg-[hsl(174,60%,45%)]/80"
                    animate={{
                      y: [8, 16, 8],
                      x: [0, -4, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  />
                  <motion.div
                    className="absolute top-0 -left-4 w-1 h-1 rounded-full bg-[hsl(174,60%,45%)]/70"
                    animate={{
                      y: [-4, -10, -4],
                      x: [0, 2, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                  />
                </>
              )}
            </div>

            {phase === "ai-complete" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[hsl(160,55%,42%)] flex items-center justify-center shadow-md"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}

            {phase === "ai-analyzing" && (
              <>
                {/* Pulsing glow rings */}
                <motion.div
                  className="absolute inset-[-12px] rounded-2xl border-2 border-[hsl(174,60%,45%)]/40"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-[-12px] rounded-2xl border-2 border-[hsl(174,60%,45%)]/30"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0, 0.4]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                />
                <motion.div
                  className="absolute inset-[-12px] rounded-2xl border-2 border-[hsl(160,55%,42%)]/25"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                />
              </>
            )}
          </motion.div>
          <span className="text-xs font-medium text-[hsl(220,10%,50%)]">AI Analysis</span>
        </div>
      </div>

      {/* ---- Progress Bar ---- */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64">
        <div className="h-1.5 rounded-full bg-[hsl(150,30%,95%)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[hsl(160,55%,42%)] to-[hsl(174,60%,45%)]"
            initial={{ width: "0%" }}
            animate={{ width: getProgressWidth(phase) }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
        <motion.p
          className="text-center text-xs text-[hsl(220,10%,50%)] mt-2 h-4"
          key={phase}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {getStatusText(phase)}
        </motion.p>
      </div>
    </div>
  )
}

function getProgressWidth(phase: AnimationPhase): string {
  switch (phase) {
    case "idle": return "0%"
    case "pdf-to-folder": return "16.66%"
    case "pdf-entering-folder": return "33.33%"
    case "folder-close": return "50%"
    case "folder-to-ai": return "66.66%"
    case "folder-entering-ai": return "83.33%"
    case "ai-analyzing": return "90%"
    case "ai-complete": return "100%"
    default: return "0%"
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