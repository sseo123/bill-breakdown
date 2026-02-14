'use client'
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeBill } from './actions';

export default function BillAnalyzer() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [zip, setZip] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = async () => {
      setLoading(true);
      const base64 = reader.result as string;
      // Pass the file data to our server action
      const response = await analyzeBill(base64, file.type, zip || "unknown");
      setResult(response);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, [zip]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg'] } 
  });

  return (
    <div className="max-w-4xl mx-auto p-10">
      <input 
        type="text" placeholder="Enter Zip Code" 
        className="border p-2 mb-4 w-full"
        onChange={(e) => setZip(e.target.value)}
      />
      
      <div {...getRootProps()} className="border-2 border-dashed border-blue-400 p-20 text-center cursor-pointer rounded-xl bg-blue-50">
        <input {...getInputProps()} />
        {loading ? "Gemini is auditing your bill..." : "Drop your utility bill here (PDF or Image)"}
      </div>

      {result && (
        <div className="mt-10 p-6 bg-white border shadow-lg rounded-lg prose prose-blue max-w-none">
          <h2 className="text-xl font-bold mb-4">Gemini's Audit Result:</h2>
          <div className="whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
}