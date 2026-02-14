// 'use client'
// import { useCallback, useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { analyzeBill } from './actions';

// export default function BillAnalyzer() {
//   const [result, setResult] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [zip, setZip] = useState("");

//   const onDrop = useCallback(async (acceptedFiles: File[]) => {
//     const file = acceptedFiles[0];
//     const reader = new FileReader();

//     reader.onload = async () => {
//       setLoading(true);
//       const base64 = reader.result as string;
//       // Pass the file data to our server action
//       const response = await analyzeBill(base64, file.type, zip || "unknown");
//       setResult(response);
//       setLoading(false);
//     };
//     reader.readAsDataURL(file);
//   }, [zip]);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
//     onDrop, 
//     accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg'] } 
//   });

//   return (
//     <div className="max-w-4xl mx-auto p-10">
//       <input 
//         type="text" placeholder="Enter Zip Code" 
//         className="border p-2 mb-4 w-full"
//         onChange={(e) => setZip(e.target.value)}
//       />
      
//       <div {...getRootProps()} className="border-2 border-dashed border-blue-400 p-20 text-center cursor-pointer rounded-xl bg-blue-50">
//         <input {...getInputProps()} />
//         {loading ? "Gemini is auditing your bill..." : "Drop your utility bill here (PDF or Image)"}
//       </div>

//       {result && (
//         <div className="mt-10 p-6 bg-white border shadow-lg rounded-lg prose prose-blue max-w-none">
//           <h2 className="text-xl font-bold mb-4">Gemini's Audit Result:</h2>
//           <div className="whitespace-pre-wrap">{result}</div>
//         </div>
//       )}
//     </div>
//   );
// }


'use client'
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeBill } from './actions';

type AppState = 'UPLOAD' | 'ANALYZING' | 'RESULT';

export default function BillAnalyzer() {
  const [view, setView] = useState<AppState>('UPLOAD');
  const [result, setResult] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = async () => {
      setView('ANALYZING');
      const base64 = reader.result as string;
      try {
        const response = await analyzeBill(base64, file.type);
        setResult(response);
        setView('RESULT');
      } catch (error) {
        console.error(error);
        alert("Something went wrong with the analysis.");
        setView('UPLOAD');
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    maxFiles: 1,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] } 
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-800">
      
      {/* 1. Header Section */}
      <div className="text-center mb-8">
        <div className="bg-[#10B981] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
          <span className="text-white text-3xl">⚡</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Utility Bill Analyzer</h1>
        <p className="text-slate-500">Upload your utility bill and we'll analyze it for errors and savings opportunities</p>
      </div>

      {/* 2. Main Content Card */}
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        
        {view === 'UPLOAD' && (
          <div className="space-y-8">
            {/* The Dropzone Box */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                ${isDragActive ? "border-[#10B981] bg-emerald-50" : "border-slate-200 hover:border-emerald-400"}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <div className="mb-4 text-slate-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-slate-700">Drag and drop your utility bill here</p>
                <p className="text-sm text-slate-400 mt-1 mb-6 text-center">or click to browse</p>
                
                <button className="bg-[#06B6D4] hover:bg-cyan-500 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-md active:scale-95">
                  Select File
                </button>
                
                <p className="text-xs text-slate-400 mt-6 tracking-wide uppercase">Supported formats: PDF, JPG, PNG</p>
              </div>
            </div>

            {/* Analyze Button (Disabled in Upload state as per UI) */}
            <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
              <span>⚡</span> Analyze Bill
            </button>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-[#ECFDF5] p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="text-xl mb-1">✔️</span>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Error Detection</span>
              </div>
              <div className="bg-[#E0F7FA] p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="text-xl mb-1">💰</span>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Savings Tips</span>
              </div>
              <div className="bg-[#F0FDF4] p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="text-xl mb-1">🌱</span>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Eco-Friendly</span>
              </div>
            </div>
          </div>
        )}

        {/* STATE 2: LOADING */}
        {view === 'ANALYZING' && (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-lg font-bold text-slate-700 animate-pulse">Running AI Audit...</p>
            <p className="text-sm text-slate-400">Gemini is checking for errors and extracting location data.</p>
          </div>
        )}

        {/* STATE 3: RESULT */}
        {view === 'RESULT' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Audit Results</h2>
              <button onClick={() => setView('UPLOAD')} className="text-cyan-600 font-bold text-sm hover:underline">
                New Analysis
              </button>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 text-slate-400 text-sm font-medium">
        Your data is processed securely and never stored on our servers
      </footer>
    </main>
  );
}