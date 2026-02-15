"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Leaf,
  ChevronRight,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  Check,
  X,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { PDFViewer, getPageForPin } from "./PDFViewer";
import type { Pin } from "./PDFViewer";
import type { BillAnalysis } from "@/app/actions";

interface ResultsPageProps {
  analysis: BillAnalysis;
  fileUrl: string;
  onNewAnalysis: () => void;
}

export function ResultsPage({
  analysis,
  fileUrl,
  onNewAnalysis,
}: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState<"errors" | "savings">("errors");
  const [activePin, setActivePin] = useState<number | null>(null);
  const [isPdfExpanded, setIsPdfExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Build pins array from analysis data
  const pins: Pin[] = [
    ...analysis.errors.map((e) => ({
      id: e.id,
      pageNumber: e.pageNumber,
      pinX: e.pinX,
      pinY: e.pinY,
      type: "error" as const,
    })),
    ...analysis.savings.map((s) => ({
      id: s.id,
      pageNumber: s.pageNumber,
      pinX: s.pinX,
      pinY: s.pinY,
      type: "saving" as const,
    })),
  ];

  const handlePinClick = useCallback(
    (id: number) => {
      setActivePin((prev) => (prev === id ? null : id));
      // Scroll to the corresponding list item
      const el = document.getElementById(`item-${activeTab}-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [activeTab]
  );

  const handleListItemHover = useCallback(
    (id: number, type: "error" | "saving") => {
      setActivePin(id);
      const page = getPageForPin(pins, id);
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [pins, currentPage]
  );

  const handleListItemLeave = useCallback(() => {
    setActivePin(null);
  }, []);

  // Reset active pin when switching tabs
  useEffect(() => {
    setActivePin(null);
    setShowEmailDraft(false);
  }, [activeTab]);

  const severityColor = (sev: "high" | "medium" | "low") => {
    switch (sev) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "energy":
        return <Zap className="w-4 h-4" />;
      case "water":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C12 2 5 11 5 16C5 19.9 8.1 22 12 22C15.9 22 19 19.9 19 16C19 11 12 2 12 2Z" />
          </svg>
        );
      default:
        return <Leaf className="w-4 h-4" />;
    }
  };

  // Generate email draft
  const emailSubject = `Billing Errors on Account - ${analysis.providerName}`;
  const emailBody = `Dear ${analysis.providerName} Customer Service,

I am writing to report the following billing errors found on my recent utility bill. I kindly request a review and correction of these charges.

${analysis.errors
      .map(
        (e, i) =>
          `${i + 1}. ${e.title}${e.amount ? ` (${e.amount})` : ""}
   ${e.description}`
      )
      .join("\n\n")}

I would appreciate a prompt resolution and a corrected bill. Please contact me at your earliest convenience to discuss these discrepancies.

Thank you for your attention to this matter.

Sincerely,
[Your Name]
[Your Account Number]`;

  const mailtoLink = `mailto:${analysis.providerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${emailSubject}\n\n${emailBody}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 w-full flex flex-col items-center">
      <main className="w-full max-w-8xl flex flex-col relative">

        {/* Fullscreen PDF Overlay */}
        <AnimatePresence>
          {isPdfExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
              onClick={() => setIsPdfExpanded(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-xl h-full max-h-[96vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <PDFViewer
                  fileUrl={fileUrl}
                  pins={pins}
                  activePin={activePin}
                  onPinClick={handlePinClick}
                  activeTab={activeTab}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  isFullscreen={true}
                  onToggleFullscreen={() => setIsPdfExpanded(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="w-full border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2D8F66] flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">
                  Audit Complete
                </h1>
                <p className="text-sm font-bold text-slate-400">
                  {analysis.providerName}
                </p>
              </div>
            </div>
            <button
              onClick={onNewAnalysis}
              className="group flex items-center gap-2.5 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-[#2D8F66] rounded-2xl transition-all duration-300 border border-slate-100/50"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-black tracking-tight">New Analysis</span>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="w-full max-w-7xl mx-auto px-6 pb-8">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-100 rounded-2xl px-5 py-3 text-sm font-black ring-4 ring-white shadow-sm">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                {analysis.summary.totalErrors} Errors Found
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-2xl px-5 py-3 text-sm font-black ring-4 ring-white shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Save {analysis.summary.totalPotentialSavings}
              </div>
              <div className="flex items-center gap-2 bg-slate-50 text-slate-500 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-black ring-4 ring-white shadow-sm">
                <Leaf className="w-4 h-4 text-slate-400" />
                {analysis.summary.totalCO2Reduction}
              </div>
              <div className="flex items-center bg-slate-50 text-slate-500 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-black ring-4 ring-white shadow-sm">
                {analysis.summary.comparedToAverage}
              </div>
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
          {/* PDF Viewer - Top 1/4 of page */}
          <div className="w-full" style={{ maxHeight: "40vh", overflow: "auto" }}>
            <PDFViewer
              fileUrl={fileUrl}
              pins={pins}
              activePin={activePin}
              onPinClick={handlePinClick}
              activeTab={activeTab}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onToggleFullscreen={() => setIsPdfExpanded(true)}
            />
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center gap-3 px-6 pt-6">
            <button
              onClick={() => setActiveTab("errors")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === "errors"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Utility Bill Errors ({analysis.errors.length})
            </button>
            <button
              onClick={() => setActiveTab("savings")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === "savings"
                ? "bg-[#2D8F66] text-white shadow-lg shadow-emerald-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
            >
              <Leaf className="w-4 h-4" />
              {"Savings & Sustainability"} ({analysis.savings.length})
            </button>
          </div>

          {/* Tab Content */}
          <div ref={listRef} className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 flex-1">
            <AnimatePresence mode="wait">
              {/* ERRORS TAB */}
              {activeTab === "errors" && (
                <motion.div
                  key="errors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 w-full"
                >
                  {analysis.errors.length === 0 ? (
                    <div className="w-full bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-emerald-50/50">
                        <Check className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-3">No Errors Found!</h3>
                      <p className="text-slate-500 max-w-md mx-auto font-medium">
                        Your bill looks clean. Switch to the <strong>Savings & Sustainability</strong> tab to see how you can further optimize your utility costs.
                      </p>
                    </div>
                  ) : (
                    <>
                      {analysis.errors.map((error) => (
                        <motion.div
                          key={error.id}
                          id={`item-errors-${error.id}`}
                          onMouseEnter={() =>
                            handleListItemHover(error.id, "error")
                          }
                          onMouseLeave={handleListItemLeave}
                          className={`bg-white border rounded-3xl p-6 transition-all duration-300 cursor-pointer mb-2
                          ${activePin === error.id
                              ? "border-red-200 shadow-2xl shadow-red-500/5 bg-red-50/10 scale-[1.01]"
                              : "border-slate-100 hover:border-red-100 hover:bg-red-50/5 shadow-sm"
                            }
                        `}
                        >
                          <div className="flex items-start gap-6">
                            {/* Number badge */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black ring-4 transition-all duration-300
                            ${activePin === error.id ? "bg-red-500 text-white ring-red-100" : "bg-red-50 text-red-500 ring-white"}
                          `}>
                              {error.id}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <h3 className="font-bold text-slate-800 text-lg">
                                  {error.title}
                                </h3>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {error.amount && (
                                    <span className="text-base font-black text-red-500">
                                      {error.amount}
                                    </span>
                                  )}
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${severityColor(error.severity)}`}
                                  >
                                    {error.severity}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {error.description}
                              </p>
                              <div className="mt-4 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  Page {error.pageNumber} • Marked on bill above
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Contact Provider Section */}
                      <div className="bg-card border border-border rounded-2xl p-6 mt-2">
                        <h3 className="text-base font-semibold text-foreground mb-1">
                          Contact {analysis.providerName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Dispute these errors directly with your utility provider.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowEmailDraft(!showEmailDraft)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:shadow-md transition-all"
                          >
                            <Mail className="w-4 h-4" />
                            Draft Email
                          </button>
                          {analysis.providerPhone && (
                            <a
                              href={`tel:${analysis.providerPhone}`}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm border border-border hover:bg-muted transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              Call {analysis.providerPhone}
                            </a>
                          )}
                          {!analysis.providerPhone && (
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-muted-foreground font-medium text-sm border border-border">
                              <Phone className="w-4 h-4" />
                              Phone not available
                            </div>
                          )}
                        </div>

                        {/* Email Draft Expandable */}
                        <AnimatePresence>
                          {showEmailDraft && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 border border-border rounded-xl bg-muted/30 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                      Email Draft
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setShowEmailDraft(false)}
                                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                                    aria-label="Close email draft"
                                  >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                </div>
                                <div className="p-4">
                                  <div className="mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      To
                                    </span>
                                    <p className="text-sm text-foreground">
                                      {analysis.providerEmail || "customer.service@provider.com"}
                                    </p>
                                  </div>
                                  <div className="mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Subject
                                    </span>
                                    <p className="text-sm text-foreground">
                                      {emailSubject}
                                    </p>
                                  </div>
                                  <div className="mb-4">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Body
                                    </span>
                                    <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed mt-1 font-sans">
                                      {emailBody}
                                    </pre>
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={handleCopyEmail}
                                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm border border-border hover:bg-muted transition-colors"
                                    >
                                      {copied ? (
                                        <Check className="w-4 h-4 text-primary" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                      {copied ? "Copied!" : "Copy to Clipboard"}
                                    </button>
                                    <a
                                      href={mailtoLink}
                                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:shadow-md transition-all"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      Open in Email Client
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* SAVINGS TAB */}
              {activeTab === "savings" && (
                <motion.div
                  key="savings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 w-full"
                >
                  {analysis.savings.map((saving) => (
                    <motion.div
                      key={saving.id}
                      id={`item-savings-${saving.id}`}
                      onMouseEnter={() =>
                        handleListItemHover(saving.id, "saving")
                      }
                      onMouseLeave={handleListItemLeave}
                      className={`bg-white border rounded-3xl p-6 transition-all duration-300 cursor-pointer mb-2
                      ${activePin === saving.id
                          ? "border-emerald-200 shadow-2xl shadow-emerald-500/5 bg-emerald-50/10 scale-[1.01]"
                          : "border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/5 shadow-sm"
                        }
                    `}
                    >
                      <div className="flex items-start gap-6">
                        {/* Number badge */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black ring-4 transition-all duration-300
                        ${activePin === saving.id ? "bg-emerald-500 text-white ring-emerald-100" : "bg-emerald-50 text-emerald-500 ring-white"}
                      `}>
                          {saving.id}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-emerald-500">
                              {categoryIcon(saving.category)}
                            </span>
                            <h3 className="font-bold text-slate-800 text-lg">
                              {saving.title}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            {saving.description}
                          </p>

                          <div className="mt-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Page {saving.pageNumber} • Marked on bill above
                            </p>
                          </div>
                        </div>

                        {/* Right Badges Column */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-3 self-center">
                          <div className={`px-4 py-3 rounded-2xl border transition-all duration-300 text-center min-w-[120px]
                          ${activePin === saving.id ? "bg-emerald-500 text-white border-emerald-400 shadow-xl shadow-emerald-200" : "bg-emerald-50/50 text-emerald-600 border-emerald-100"}
                        `}>
                            <p className="text-xl font-black leading-tight">
                              {saving.estimatedSaving}
                            </p>
                            <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${activePin === saving.id ? "text-white/70" : "text-emerald-500/70"}`}>
                              Estimated Savings
                            </p>
                          </div>

                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                            <Leaf className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              {saving.ecoImpact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Sustainability Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-900/20 mt-4 overflow-hidden relative"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                          <Leaf className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-1">Impact Summary</h3>
                          <p className="text-emerald-100/80 text-sm max-w-[280px]">
                            By implementing these changes, you're not just saving money—you're healing the planet.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="text-center">
                          <p className="text-4xl font-black mb-1">
                            {analysis.summary.totalPotentialSavings}
                          </p>
                          <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Annual Savings
                          </p>
                        </div>
                        <div className="w-px h-12 bg-white/20 hidden md:block" />
                        <div className="text-center">
                          <p className="text-4xl font-black mb-1">
                            {Math.round(
                              parseFloat(
                                analysis.summary.totalCO2Reduction.replace(
                                  /[^0-9.]/g,
                                  ""
                                ) || "0"
                              ) * 45
                            )}
                          </p>
                          <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Trees Planted / Yr
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
                    <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-700/50 rounded-full blur-3xl" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-8">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              {"Secure AI Processing \u2022 No data stored \u2022 Results are advisory only"}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
