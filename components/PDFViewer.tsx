"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

export interface Pin {
  id: number;
  pageNumber: number;
  pinX: number;
  pinY: number;
  type: "error" | "saving";
}

interface PDFViewerProps {
  fileUrl: string;
  pins: Pin[];
  activePin: number | null;
  onPinClick: (id: number) => void;
  activeTab: "errors" | "savings";
  currentPage: number;
  onPageChange: (page: number) => void;
}

// Lazy-load react-pdf only when we need it (avoids canvas SSR issues)
const PDFDocument = dynamic(
  () => import("react-pdf").then((mod) => {
    mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
    return { default: mod.Document };
  }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">Loading viewer...</div> }
);

const PDFPage = dynamic(
  () => import("react-pdf").then((mod) => ({ default: mod.Page })),
  { ssr: false }
);

export function PDFViewer({
  fileUrl,
  pins,
  activePin,
  onPinClick,
  activeTab,
  currentPage,
  onPageChange,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
    },
    []
  );

  const visiblePins = pins.filter(
    (p) =>
      p.pageNumber === currentPage &&
      p.type === (activeTab === "errors" ? "error" : "saving")
  );

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node;
      const rect = node.getBoundingClientRect();
      setPageWidth(Math.min(rect.width - 32, 700)); // Default max width constraint
    }
  }, []);

  return (
    <div
      ref={measuredRef}
      className="relative flex flex-col items-center rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm"
    >
      {/* PDF / Mock Bill Render Area */}
      <div className="relative w-full flex justify-center bg-[#f4fbf9] py-8 min-h-[320px]">
        {fileUrl ? (
          <PDFDocument
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-[300px] text-sm text-slate-400">
                Loading document...
              </div>
            }
            error={
              <div className="flex items-center justify-center h-[300px] text-sm text-slate-400 font-medium">
                Could not load PDF. Displaying results below.
              </div>
            }
          >
            {/* 
                CRITICAL FIX: 
                We wrap the Page + Pins in a relative div with the exact same width 
                so percentage-based pins (left: X%, top: Y%) track the PDF page, not the outer container.
            */}
            <div className="relative" style={{ width: pageWidth || 600 }}>
              <PDFPage
                pageNumber={currentPage}
                width={pageWidth || 600}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-2xl shadow-slate-200/50"
              />
              <PinsOverlay
                pins={visiblePins}
                activePin={activePin}
                onPinClick={onPinClick}
              />
            </div>
          </PDFDocument>
        ) : (
          /* Mock Bill Case */
          <div className="relative w-[600px] max-w-full">
            <MockBillPreview />
            <PinsOverlay
              pins={visiblePins}
              activePin={activePin}
              onPinClick={onPinClick}
            />
          </div>
        )}
      </div>

      {/* Page Navigation */}
      {(numPages > 1 || !fileUrl) && (
        <div className="w-full flex items-center justify-center gap-4 py-3 border-t border-slate-100 bg-white">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-sm font-medium text-slate-500 tabular-nums">
            Page {currentPage} of {numPages || 1}
          </span>
          <button
            onClick={() => onPageChange(Math.min(numPages || 1, currentPage + 1))}
            disabled={currentPage >= (numPages || 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      )}
    </div>
  );
}

function PinsOverlay({
  pins,
  activePin,
  onPinClick
}: {
  pins: Pin[],
  activePin: number | null,
  onPinClick: (id: number) => void
}) {
  return (
    <AnimatePresence mode="popLayout">
      {pins.map((pin) => {
        const isActive = activePin === pin.id;
        const isError = pin.type === "error";
        return (
          <motion.button
            key={`${pin.type}-${pin.id}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => onPinClick(pin.id)}
            className={`absolute z-10 flex items-center justify-center rounded-full text-[10px] font-bold cursor-pointer transition-all duration-300 shadow-lg
              ${isActive ? "w-7 h-7 ring-[3px]" : "w-5.5 h-5.5"}
              ${isError
                ? `bg-red-500 text-white ${isActive ? "ring-red-200 scale-110" : ""}`
                : `bg-[#2D8F66] text-white ${isActive ? "ring-emerald-200 scale-110" : ""}`
              }
            `}
            style={{
              left: `${Math.max(3, Math.min(97, pin.pinX))}%`,
              top: `${Math.max(3, Math.min(97, pin.pinY))}%`,
              transform: "translate(-50%, -50%)",
            }}
            aria-label={`${isError ? "Error" : "Saving"} #${pin.id}`}
          >
            {pin.id}
            {isActive && (
              <motion.span
                className={`absolute inset-0 rounded-full ${isError ? "bg-red-400" : "bg-emerald-400"}`}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeOut",
                }}
              />
            )}
          </motion.button>
        );
      })}
    </AnimatePresence>
  );
}

export function getPageForPin(pins: Pin[], pinId: number): number {
  const pin = pins.find((p) => p.id === pinId);
  return pin?.pageNumber ?? 1;
}

function MockBillPreview() {
  return (
    <div className="w-[600px] max-w-full bg-card rounded-lg shadow-sm border border-border p-6 font-sans text-foreground text-xs leading-relaxed">
      {/* Demo badge */}
      <div className="flex items-center justify-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest border border-primary/20">
          Sample Bill Preview
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-5 pb-4 border-b border-border">
        <div>
          <div className="text-base font-bold text-primary tracking-tight">Pacific Gas & Electric</div>
          <div className="text-muted-foreground mt-0.5">Statement Date: Jan 15, 2026</div>
          <div className="text-muted-foreground">Account: 4829-1038-7721</div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground">Service Address:</div>
          <div className="font-medium">742 Evergreen Terrace</div>
          <div className="text-muted-foreground">San Francisco, CA 94102</div>
        </div>
      </div>

      {/* Meter Reading */}
      <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
        <div className="font-semibold text-foreground mb-1.5 text-[11px] uppercase tracking-wide">Meter Reading (Estimated)</div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Previous: 14,832 kWh</span>
          <span className="text-muted-foreground">Current: 15,319 kWh</span>
          <span className="font-semibold">Usage: 487 kWh</span>
        </div>
      </div>

      {/* Charges Table */}
      <table className="w-full mb-4">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
            <th className="py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr><td className="py-1.5">Basic Service Fee</td><td className="text-right">$12.50</td></tr>
          <tr><td className="py-1.5">Basic Service Fee</td><td className="text-right text-red-500 font-medium">$12.50</td></tr>
          <tr><td className="py-1.5">{"Electricity Usage - 487 kWh @ $0.38"}</td><td className="text-right">$185.06</td></tr>
          <tr><td className="py-1.5">Distribution Charges</td><td className="text-right">$28.14</td></tr>
          <tr><td className="py-1.5">Public Purpose Programs</td><td className="text-right">$8.92</td></tr>
          <tr><td className="py-1.5">Nuclear Decommissioning</td><td className="text-right">$0.86</td></tr>
          <tr><td className="py-1.5">{"State & Local Taxes"}</td><td className="text-right">$6.21</td></tr>
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-between items-center pt-3 border-t-2 border-foreground/20">
        <span className="font-bold text-sm">Total Amount Due</span>
        <span className="font-bold text-sm">$254.19</span>
      </div>

      {/* CARE Discount line */}
      <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">CARE Discount (expired 12/2025)</span>
          <span className="text-muted-foreground line-through">-$28.40</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex justify-between text-muted-foreground">
        <span>Due Date: Feb 05, 2026</span>
        <span>Customer Service: 1-800-743-5000</span>
      </div>
    </div>
  );
}
