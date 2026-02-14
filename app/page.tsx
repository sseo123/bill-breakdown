// 'use client'
// import { useCallback, useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { analyzeBill } from './actions';

// type AppState = 'UPLOAD' | 'ANALYZING' | 'RESULT';

// export default function BillAnalyzer() {
//   const [view, setView] = useState<AppState>('UPLOAD');
//   const [result, setResult] = useState("");

//   const onDrop = useCallback(async (acceptedFiles: File[]) => {
//     const file = acceptedFiles[0];
//     const reader = new FileReader();

//     reader.onload = async () => {
//       setView('ANALYZING');
//       const base64 = reader.result as string;
//       try {
//         const response = await analyzeBill(base64, file.type);
//         setResult(response);
//         setView('RESULT');
//       } catch (error) {
//         console.error(error);
//         alert("Something went wrong with the analysis.");
//         setView('UPLOAD');
//       }
//     };
//     reader.readAsDataURL(file);
//   }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
//     onDrop, 
//     maxFiles: 1,
//     accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] } 
//   });

//   return (
//     <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-800">
      
//       {/* 1. Header Section */}
//       <div className="text-center mb-8">
//         <div className="bg-[#10B981] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
//           <span className="text-white text-3xl">⚡</span>
//         </div>
//         <h1 className="text-3xl font-bold tracking-tight mb-2">Utility Bill Analyzer</h1>
//         <p className="text-slate-500">Upload your utility bill and we'll analyze it for errors and savings opportunities</p>
//       </div>

//       {/* 2. Main Content Card */}
//       <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        
//         {view === 'UPLOAD' && (
//           <div className="space-y-8">
//             {/* The Dropzone Box */}
//             <div 
//               {...getRootProps()} 
//               className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
//                 ${isDragActive ? "border-[#10B981] bg-emerald-50" : "border-slate-200 hover:border-emerald-400"}`}
//             >
//               <input {...getInputProps()} />
//               <div className="flex flex-col items-center">
//                 <div className="mb-4 text-slate-400">
//                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
//                   </svg>
//                 </div>
//                 <p className="text-lg font-semibold text-slate-700">Drag and drop your utility bill here</p>
//                 <p className="text-sm text-slate-400 mt-1 mb-6 text-center">or click to browse</p>
                
//                 <button className="bg-[#06B6D4] hover:bg-cyan-500 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-md active:scale-95">
//                   Select File
//                 </button>
                
//                 <p className="text-xs text-slate-400 mt-6 tracking-wide uppercase">Supported formats: PDF, JPG, PNG</p>
//               </div>
//             </div>

//             {/* Analyze Button (Disabled in Upload state as per UI) */}
//             <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
//               <span>⚡</span> Analyze Bill
//             </button>

//             {/* Feature Cards Grid */}
//             <div className="grid grid-cols-3 gap-4 mt-4">
//               <div className="bg-[#ECFDF5] p-4 rounded-2xl flex flex-col items-center text-center">
//                 <span className="text-xl mb-1">✔️</span>
//                 <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Error Detection</span>
//               </div>
//               <div className="bg-[#E0F7FA] p-4 rounded-2xl flex flex-col items-center text-center">
//                 <span className="text-xl mb-1">💰</span>
//                 <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Savings Tips</span>
//               </div>
//               <div className="bg-[#F0FDF4] p-4 rounded-2xl flex flex-col items-center text-center">
//                 <span className="text-xl mb-1">🌱</span>
//                 <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Eco-Friendly</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* STATE 2: LOADING */}
//         {view === 'ANALYZING' && (
//           <div className="py-16 flex flex-col items-center justify-center space-y-4">
//             <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
//             <p className="text-lg font-bold text-slate-700 animate-pulse">Running AI Audit...</p>
//             <p className="text-sm text-slate-400">Gemini is checking for errors and extracting location data.</p>
//           </div>
//         )}

//         {/* STATE 3: RESULT */}
//         {view === 'RESULT' && (
//           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
//             <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-100">
//               <h2 className="text-xl font-bold text-slate-800">Audit Results</h2>
//               <button onClick={() => setView('UPLOAD')} className="text-cyan-600 font-bold text-sm hover:underline">
//                 New Analysis
//               </button>
//             </div>
//             <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
//               {result}
//             </div>
//           </div>
//         )}
//       </div>

//       <footer className="mt-8 text-slate-400 text-sm font-medium">
//         Your data is processed securely and never stored on our servers
//       </footer>
//     </main>
//   );
// }

// 'use client'
// import { useCallback, useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// // import { analyzeBill } from './actions'; // Commented out for testing mode

// type AppState = 'UPLOAD' | 'ANALYZING' | 'RESULT';

// export default function BillAnalyzer() {
//   const [view, setView] = useState<AppState>('UPLOAD');
//   const [result, setResult] = useState("");

//   // --- CONSOLIDATED ONDROP ---
//   const onDrop = useCallback(async (acceptedFiles: File[]) => {
//     if (acceptedFiles.length === 0) return;

//     setView('ANALYZING');
//     await new Promise(resolve => setTimeout(resolve, 5000)); 
    
//     setResult("ANALYSIS SUCCESSFUL (MOCK DATA):\n\n1. Error Detection: No math errors found. However, there is a late fee of $15.00.\n2. Savings: Your peak usage is between 4pm-9pm. Shifting laundry could save $12/mo.\n3. Comparison: Your usage is 10% lower than the average in zip code 90210.");
    
//     setView('RESULT');

//     /* // REAL API LOGIC (Uncomment this later when done testing UI)
//     const file = acceptedFiles[0];
//     const reader = new FileReader();
//     reader.onload = async () => {
//       const base64 = reader.result as string;
//       try {
//         const response = await analyzeBill(base64, file.type);
//         setResult(response);
//         setView('RESULT');
//       } catch (error) {
//         alert("Error!");
//         setView('UPLOAD');
//       }
//     };
//     reader.readAsDataURL(file);
//     */
//   }, []);

//   // --- ACTIVATE THE HOOK ---
//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
//     onDrop, 
//     maxFiles: 1,
//     accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] } 
//   });

//   return (
//     <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-800">
      
//       {/* 1. Header Section */}
//       <div className="text-center mb-8">
//         <div className="bg-[#10B981] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
//           <span className="text-white text-3xl">⚡</span>
//         </div>
//         <h1 className="text-3xl font-bold tracking-tight mb-2">Utility Bill Analyzer</h1>
//         <p className="text-slate-500">Upload your utility bill and we'll analyze it for errors and savings opportunities</p>
//       </div>

//       {/* 2. Main Content Card */}
//       <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        
//         {view === 'UPLOAD' && (
//           <div className="space-y-8">
//             <div 
//               {...getRootProps()} 
//               className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
//                 ${isDragActive ? "border-[#10B981] bg-emerald-50" : "border-slate-200 hover:border-emerald-400"}`}
//             >
//               <input {...getInputProps()} />
//               <div className="flex flex-col items-center">
//                 <div className="mb-4 text-slate-400">
//                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
//                   </svg>
//                 </div>
//                 <p className="text-lg font-semibold text-slate-700 text-balance">Drag and drop your utility bill here</p>
//                 <p className="text-sm text-slate-400 mt-1 mb-6 text-center">or click to browse</p>
                
//                 <button className="bg-[#06B6D4] hover:bg-cyan-500 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-md active:scale-95">
//                   Select File
//                 </button>
                
//                 <p className="text-xs text-slate-400 mt-6 tracking-wide uppercase">Supported formats: PDF, JPG, PNG</p>
//               </div>
//             </div>

//             <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
//               <span>⚡</span> Analyze Bill
//             </button>

//             {/* Feature Cards Grid */}
//             <div className="grid grid-cols-3 gap-4 mt-4">
//               <div className="bg-[#ECFDF5] p-4 rounded-2xl flex flex-col items-center text-center">
//                 <span className="text-xl mb-1">✔️</span>
//                 <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-tight">Error Detection</span>
//               </div>
//               <div className="bg-[#E0F7FA] p-4 rounded-2xl flex flex-col items-center text-center">
//                 <span className="text-xl mb-1">💰</span>
//                 <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-tight">Savings Tips</span>
//               </div>
//               <div className="bg-[#F0FDF4] p-4 rounded-2xl flex flex-col items-center text-center">
//                 <span className="text-xl mb-1">🌱</span>
//                 <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-tight">Eco-Friendly</span>
//               </div>
//             </div>
//           </div>
//         )}








//         {/* STATE 2: LOADING (Replace the spinner here with your Lottie animation later) */}
//         {view === 'ANALYZING' && (
//           <div className="py-16 flex flex-col items-center justify-center space-y-4">
//             <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
//             <p className="text-lg font-bold text-slate-700 animate-pulse">Running AI Audit...</p>
//             <p className="text-sm text-slate-400">Gemini is checking for errors and extracting location data.</p>
//           </div>
//         )}





//         {/* STATE 3: RESULT */}
//         {view === 'RESULT' && (
//           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
//             <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-100">
//               <h2 className="text-xl font-bold text-slate-800">Audit Results</h2>
//               <button onClick={() => setView('UPLOAD')} className="text-cyan-600 font-bold text-sm hover:underline">
//                 New Analysis
//               </button>
//             </div>
//             <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
//               {result}
//             </div>
//           </div>
//         )}
//       </div>

//       <footer className="mt-8 text-slate-400 text-sm font-medium">
//         Your data is processed securely and never stored on our servers
//       </footer>
//     </main>
//   );
// }
"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { LoadingAnimation } from "@/components/loading-animation"
import { AnalyzingAnimation } from "@/components/AnalyzingAnimation"
import { SavingsAnimation } from "@/components/SavingsAnimation"
import { FileText, X, Zap } from "lucide-react"
// import { analyzeBill } from './actions';

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

    // --- TESTING MODE: Mock delay ---
    await new Promise((resolve) => setTimeout(resolve, 25000))
    setResult(
      "ANALYSIS SUCCESSFUL (MOCK DATA):\n\n1. **Error Detection**: No math errors found.\n2. **Savings**: Shift usage to off-peak hours.\n3. **Comparison**: 10% lower than average."
    )
    setView("RESULT")

    /* // REAL API LOGIC
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const response = await analyzeBill(base64, pendingFile.type);
        setResult(response);
        setView('RESULT');
      } catch (error) {
        alert("Error!");
        setView('UPLOAD');
      }
    };
    reader.readAsDataURL(pendingFile);
    */
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
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-800">
      {/* Header - hidden during loading */}
      <AnimatePresence>
        {view !== "ANALYZING" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-8"
          >
            <div className="bg-[#10B981] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
              <Zap className="text-white w-8 h-8" fill="white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">
              Utility Bill Analyzer
            </h1>
            <p className="text-slate-500">
              Upload your bill and click generate to start the audit
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <motion.div
        layout
        className={`w-full max-w-2xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden ${
          view === "ANALYZING" ? "p-0" : "p-8"
        }`}
      >
        <AnimatePresence mode="wait">
          {/* ========== STATE 1: UPLOAD ========== */}
          {view === "UPLOAD" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
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
                      Drag and drop your bill here
                    </p>
                    <p className="text-sm text-slate-400 mt-1 mb-6 text-center">
                      or click to browse
                    </p>
                    <span className="bg-[#06B6D4] text-white font-bold py-3 px-10 rounded-xl shadow-md inline-block">
                      Select File
                    </span>
                    <p className="text-xs text-slate-400 mt-6 tracking-wide uppercase">
                      Supported formats: PDF, JPG, PNG
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-emerald-100 bg-emerald-50/50 rounded-2xl p-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <FileText className="text-emerald-500 w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 truncate max-w-[200px]">
                        {pendingFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(pendingFile.size / 1024).toFixed(1)} KB{" "}
                        {"- Ready to analyze"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPendingFile(null)}
                    className="p-2 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors"
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

              {/* Feature Grid */}
              <div className="grid grid-cols-3 gap-4 border-t pt-6 border-slate-50">
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========== STATE 2: ANALYZING (3 phases) ========== */}
          {view === "ANALYZING" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnimatePresence mode="wait">
                {loadingPhase === "drag-drop" && (
                  <motion.div
                    key="phase1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="p-8"
                  >
                    <div className="text-center mb-2">
                      <h3 className="text-lg font-bold text-slate-700">
                        Processing Your Bill
                      </h3>
                      <p className="text-sm text-slate-400">
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AnalyzingAnimation
                      onComplete={() => setLoadingPhase("savings")}
                    />
                  </motion.div>
                )}

                {loadingPhase === "savings" && (
                  <motion.div
                    key="phase3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SavingsAnimation />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ========== STATE 3: RESULT ========== */}
          {view === "RESULT" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b pb-4 border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">
                  Audit Results
                </h2>
                <button
                  onClick={() => {
                    setView("UPLOAD")
                    setPendingFile(null)
                    setLoadingPhase("drag-drop")
                  }}
                  className="text-cyan-600 font-bold text-sm hover:underline"
                >
                  New Analysis
                </button>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <footer className="mt-8 text-slate-400 text-sm font-medium">
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
      className="text-slate-500"
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
      className="text-amber-500"
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
      className="text-emerald-500"
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
