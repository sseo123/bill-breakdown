"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface SavingsAnimationProps {
  onComplete?: () => void
}

const tips = [
  "Comparing regional energy rates...",
  "Identifying off-peak savings...",
  "Estimating carbon reduction...",
]

export function SavingsAnimation({ onComplete }: SavingsAnimationProps) {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => {
        if (prev < tips.length - 1) return prev + 1
        return prev
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete?.()
    }, 7000)
    return () => clearTimeout(timeout)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {/* Large leaf circle */}
      <div className="relative mb-8">
        {/* Outer pulse rings */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(174, 60%, 45%), transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(160, 55%, 42%), transparent 70%)" }}
        />

        {/* Main circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: "linear-gradient(135deg, hsl(160, 55%, 42%), hsl(174, 60%, 45%))" }}
        >
          {/* Leaf SVG */}
          <motion.svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <path
              d="M28 8C28 8 14 16 14 32C14 40 20 46 28 48C36 46 42 40 42 32C42 16 28 8 28 8Z"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M28 48V24"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M22 32C22 32 25 29 28 29"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M34 26C34 26 31 23 28 23"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-[hsl(220,20%,18%)] mb-2"
      >
        Calculating Savings Potential
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-[hsl(220,10%,50%)] text-sm mb-10"
      >
        Finding ways to save energy and reduce your carbon footprint
      </motion.p>

      {/* Animated tip text */}
      <div className="h-5 mb-8">
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm text-[hsl(174,60%,45%)] font-medium"
        >
          {tips[tipIndex]}
        </motion.p>
      </div>

      {/* Three small eco icons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-12"
      >
        {/* Lightning / Energy */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M15.5 4L7 16H14L12.5 24L21 12H14L15.5 4Z"
              stroke="hsl(160, 55%, 42%)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.6"
            />
          </svg>
          <span className="text-[10px] font-semibold text-[hsl(220,10%,50%)] uppercase tracking-wider">Energy</span>
        </motion.div>

        {/* Water drop */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 4C14 4 6 14 6 19C6 23.4 9.6 26 14 26C18.4 26 22 23.4 22 19C22 14 14 4 14 4Z"
              stroke="hsl(174, 60%, 45%)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.6"
            />
          </svg>
          <span className="text-[10px] font-semibold text-[hsl(220,10%,50%)] uppercase tracking-wider">Water</span>
        </motion.div>

        {/* Leaf / Eco */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 4C14 4 8 10 8 18C8 22 10.7 25 14 26C17.3 25 20 22 20 18C20 10 14 4 14 4Z"
              stroke="hsl(160, 55%, 42%)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.6"
            />
            <path d="M14 26V16" stroke="hsl(160, 55%, 42%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M11 20L14 17" stroke="hsl(160, 55%, 42%)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          </svg>
          <span className="text-[10px] font-semibold text-[hsl(220,10%,50%)] uppercase tracking-wider">Eco</span>
        </motion.div>
      </motion.div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: tipIndex === i ? 1.3 : 1,
              backgroundColor: tipIndex >= i ? "hsl(160, 55%, 42%)" : "hsl(150, 20%, 88%)",
            }}
            className="w-2 h-2 rounded-full"
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  )
}
