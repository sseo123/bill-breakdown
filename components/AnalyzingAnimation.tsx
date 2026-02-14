"use client"

import { motion } from "framer-motion"
import { Search, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { useEffect, useState } from "react"

const steps = [
  { id: 1, text: "Scanning document structure...", icon: <Search className="w-5 h-5" /> },
  { id: 2, text: "Extracting usage data & ZIP...", icon: <Zap className="w-5 h-5" /> },
  { id: 3, text: "Auditing for billing errors...", icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 4, text: "Generating sustainability tips...", icon: <Sparkles className="w-5 h-5" /> },
]

interface AnalyzingAnimationProps {
  onComplete?: () => void
}

export function AnalyzingAnimation({ onComplete }: AnalyzingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1
        return prev
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      const timeout = setTimeout(() => {
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [currentStep, onComplete])

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Floating Document with scan effect */}
      <div className="relative w-48 h-48 mb-10">
        {/* Background glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(160, 55%, 42%) 0%, transparent 70%)", filter: "blur(30px)" }}
        />

        {/* The document card */}
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: -10 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="relative z-10 w-36 h-44 mx-auto bg-white rounded-2xl shadow-xl border border-[hsl(150,20%,88%)] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Scanning line */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-0.5 z-20"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(160, 55%, 42%), hsl(174, 60%, 45%), transparent)",
              boxShadow: "0 0 12px hsl(160, 55%, 42%)",
            }}
          />

          {/* Document content skeleton */}
          <div className="flex flex-col gap-2 w-full px-5">
            <div className="h-2 w-16 rounded-full bg-[hsl(160,55%,42%)]/25" />
            <div className="h-2 w-20 rounded-full bg-[hsl(160,55%,42%)]/15" />
            <div className="h-2 w-12 rounded-full bg-[hsl(160,55%,42%)]/20" />
            <div className="h-px w-full bg-[hsl(150,20%,88%)] my-1" />
            <div className="h-2 w-18 rounded-full bg-[hsl(174,60%,45%)]/20" />
            <div className="h-2 w-14 rounded-full bg-[hsl(174,60%,45%)]/15" />
            <div className="h-2 w-20 rounded-full bg-[hsl(160,55%,42%)]/15" />
            <div className="h-px w-full bg-[hsl(150,20%,88%)] my-1" />
            <div className="h-2 w-10 rounded-full bg-[hsl(160,55%,42%)]/30" />
            <div className="h-2 w-16 rounded-full bg-[hsl(174,60%,45%)]/20" />
          </div>

          {/* Corner highlight */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-[hsl(150,30%,95%)] rounded-bl-xl border-b border-l border-[hsl(150,20%,88%)]" />
        </motion.div>
      </div>

      {/* Status Stepper */}
      <div className="max-w-xs w-full flex flex-col gap-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: index <= currentStep ? 1 : 0.3,
              x: index <= currentStep ? 0 : -10,
              scale: index === currentStep ? 1.03 : 1,
            }}
            transition={{ duration: 0.4 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              index < currentStep
                ? "bg-[hsl(160,55%,42%)]/5 border-[hsl(160,55%,42%)]/20 text-[hsl(160,55%,42%)]"
                : index === currentStep
                  ? "bg-white border-[hsl(160,55%,42%)]/30 shadow-sm text-[hsl(160,55%,42%)] font-medium"
                  : "border-transparent text-[hsl(220,10%,50%)]/50"
            }`}
          >
            <div className={`flex-shrink-0 ${
              index < currentStep
                ? "text-[hsl(160,55%,42%)]"
                : index === currentStep
                  ? "text-[hsl(174,60%,45%)]"
                  : "text-[hsl(220,10%,50%)]/30"
            }`}>
              {index < currentStep ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" fill="hsl(160, 55%, 42%)" fillOpacity="0.15" stroke="hsl(160, 55%, 42%)" strokeWidth="1.5" />
                  <path d="M6 10L9 13L14 7" stroke="hsl(160, 55%, 42%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                step.icon
              )}
            </div>
            <span className="text-sm">{step.text}</span>
            {index === currentStep && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="ml-auto w-1.5 h-1.5 rounded-full bg-[hsl(174,60%,45%)]"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Gemini processing text */}
      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-6 text-[hsl(220,10%,50%)] text-sm"
      >
        Gemini is processing your request...
      </motion.p>
    </div>
  )
}
