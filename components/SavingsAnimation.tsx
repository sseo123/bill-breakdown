"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface SavingsAnimationProps {
  onComplete?: () => void
}

const tips = [
  "Comparing regional energy rates...",
  "Identifying off-peak savings...",
  "Estimating carbon reduction potential...",
]

export function SavingsAnimation({ onComplete }: SavingsAnimationProps) {
  const [tipIndex, setTipIndex] = useState(0)

  // Cycle through the tips based on timing
useEffect(() => {
  const interval = setInterval(() => {
    setTipIndex((prev) => {
      // If we are at the last tip
      if (prev === tips.length - 1) {
        clearInterval(interval);
        // Give the user a moment (e.g., 2 seconds) to read the final tip before closing
        setTimeout(() => {
          onComplete?.();
        }, 2000);
        return prev;
      }
      return prev + 1;
    });
  }, 2000); // Time per tip

  return () => clearInterval(interval);
}, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* 1. Main Icon with Pulse Rings */}
      <div className="relative mb-8">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0, 0.12] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-accent/30 blur-md"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0, 0.08] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
          className="absolute inset-0 rounded-full bg-primary/30 blur-md"
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl shadow-primary/15"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
        >
          <motion.svg
            width="48" height="48" viewBox="0 0 48 48" fill="none"
            initial={{ rotate: -15, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <path
              d="M24 8C24 8 12 15 12 28C12 35 17 40 24 42C31 40 36 35 36 28C36 15 24 8 24 8Z"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
            />
            <path d="M24 42V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M19 28C19 28 21.5 25.5 24 25.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M29 23C29 23 26.5 20.5 24 20.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        </motion.div>
      </div>

      {/* 2. Headlines */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-foreground mb-1.5"
      >
        Calculating Savings Potential
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground mb-8"
      >
        Finding ways to save energy and reduce your carbon footprint
      </motion.p>

      {/* 3. Cycling Tip Text (With AnimatePresence for smooth swapping) */}
      <div className="h-5 mb-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-accent"
          >
            {tips[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 4. Eco Feature Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-10"
      >
        {/* Energy */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L5 14H12L11 22L19 10H12L13 2Z"
              stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55"
            />
          </svg>
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Energy</span>
        </motion.div>

        {/* Water */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="flex flex-col items-center gap-1.5"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 2 5 11 5 16C5 19.9 8.1 22 12 22C15.9 22 19 19.9 19 16C19 11 12 2 12 2Z"
              stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55"
            />
          </svg>
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Water</span>
        </motion.div>

        {/* Eco */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="flex flex-col items-center gap-1.5"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C12 3 7 8 7 15C7 18.3 9.2 20.5 12 21.5C14.8 20.5 17 18.3 17 15C17 8 12 3 12 3Z"
              stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55"
            />
            <path d="M12 21.5V14" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
            <path d="M9.5 17L12 14.5" stroke="hsl(var(--primary))" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
          </svg>
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Eco</span>
        </motion.div>
      </motion.div>

      {/* 5. Progress Dots */}
      <div className="flex items-center gap-1.5 mt-7">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: tipIndex === i ? 1.4 : 1,
              backgroundColor: tipIndex >= i ? "hsl(var(--primary))" : "hsl(var(--muted))",
            }}
            className="w-1.5 h-1.5 rounded-full"
            transition={{ duration: 0.25 }}
          />
        ))}
      </div>
    </div>
  )
}