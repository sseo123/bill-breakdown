'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { analyzeBill } from './actions'


export default function BillAnalyzer() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
const [activeTab, setActiveTab] = useState<1 | 2>(1)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
    const handleReset = () => {
    setData(null)
    setActiveTab(1)
    setLoading(false)
    setCopied(false)
    setCopyError(null)
  }

  const handleCopyEmail = async (text: string) => {
  try {
    setCopyError(null)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  } catch (e) {
    setCopyError('Copy failed. Please copy manually.')
    setTimeout(() => setCopyError(null), 2500)
  }
}


  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = async () => {
        setLoading(true)
        setData(null)

          const base64 = reader.result as string
  // 1️⃣ 먼저 metrics 추출 (trend용)



// 2️⃣ 기존 분석 (에러/이메일/절감/비교)
const response = await analyzeBill(base64, file.type)

try {
  const parsed = JSON.parse(response)
  setData(parsed)
} catch {
  setData({ parseError: true, raw: response })
}

        setLoading(false)
      }

      reader.readAsDataURL(file)
}, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
  })

  return (
    <div className="max-w-4xl mx-auto p-10">
      {copied && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-black text-white px-4 py-2 shadow-lg">
    Copied!
  </div>
)}

{copyError && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-600 text-white px-4 py-2 shadow-lg">
    {copyError}
  </div>
)}
      {data && (
  <button
    onClick={handleReset}
    className="mb-4 rounded-lg border px-4 py-2 font-semibold bg-white hover:bg-gray-50"
  >
    Analyze Another Bill
  </button>
)}
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-blue-400 p-20 text-center cursor-pointer rounded-xl bg-blue-50"
      >
        <input {...getInputProps()} />
        {loading ? 'Gemini is auditing your bill...' : 'Drop your utility bill here (PDF or Image)'}
      </div>

      {data && (

        <div className="mt-10">
          {/* 탭 버튼 */}
<div className="flex items-center justify-between mb-4">
  <div className="flex gap-2">
    <button
      onClick={() => setActiveTab(1)}
      className={`px-4 py-2 rounded-lg font-semibold border ${
        activeTab === 1 ? 'bg-blue-600 text-white' : 'bg-white'
      }`}
    >
      Error Audit
    </button>

    <button
      onClick={() => setActiveTab(2)}
      className={`px-4 py-2 rounded-lg font-semibold border ${
        activeTab === 2 ? 'bg-blue-600 text-white' : 'bg-white'
      }`}
    >
      Savings & Comparison
    </button>


  </div>


</div>


          {/* 탭 내용 */}
          {activeTab === 1 ? (
  <div
    className={`p-6 shadow-lg rounded-lg border ${
      (data.errorAnalysis?.likelihoodPct ?? 0) >= 50
        ? "bg-red-50 border-red-400"
        : "bg-white border-gray-200"
    }`}
  >
    <h2 className="text-2xl font-bold mb-3">Audit Results</h2>

              <p className="text-lg">
                Error Probability:{' '}
                <span className="font-extrabold">{data.errorAnalysis?.likelihoodPct ?? 0}%</span>
                {(data.errorAnalysis?.likelihoodPct ?? 0) >= 50 && (
                  <span className="ml-2 text-red-600 font-semibold">⚠ suspicious</span>
                )}
              </p>

              {Array.isArray(data.errorAnalysis?.reasons) && data.errorAnalysis.reasons.length > 0 && (
                <ul className="mt-4 list-disc pl-6 text-gray-700">
                  {data.errorAnalysis.reasons.map((r: string, i: number) => (
                    <li key={i} className="mb-2">
                      {r}
                    </li>
                  ))}
                </ul>
              )}

              {/* 이메일 (있을 때만) */}
              {data.mockEmail && (
                <div className="mt-6 border-t pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Draft Email</h3>

                    <button
                      onClick={() => handleCopyEmail(data.mockEmail)}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      Copy Email
                    </button>
                  </div>

                  <pre className="mt-3 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                    {data.mockEmail}
                  </pre>
                </div>
              )}
            </div>
          ) : (
  <div
    className={`p-6 shadow-lg rounded-lg border ${
      data.regionalComparison?.comparison === "above"
        ? "bg-yellow-50 border-yellow-300"
        : "bg-white border-gray-200"
    }`}
  >
    <h2 className="text-2xl font-bold mb-3">Sustainable Savings</h2>

              <div className="space-y-3">
{Array.isArray(data.savingsTips) &&
  [...data.savingsTips]
    .sort((a: any, b: any) => (b?.estimatedMonthlySavings ?? -1) - (a?.estimatedMonthlySavings ?? -1))
    .map((tip: any, i: number) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50 border">
                      <div className="font-bold">{tip.title}</div>
                      <div className="text-gray-700 mt-1">{tip.action}</div>

                      {tip.estimatedMonthlySavings != null && (
                        <div className="mt-2 text-green-700 font-semibold">
                          Est. Save: ${tip.estimatedMonthlySavings}/month
                        </div>
                      )}

                      {tip.whyItFits && (
                        <div className="mt-1 text-sm text-gray-500">{tip.whyItFits}</div>
                      )}
                    </div>
                  ))}
              </div>

              <div className="mt-6 border-t pt-5">
                <h3 className="text-xl font-bold">Regional Comparison</h3>
                {(() => {
  const c = data.regionalComparison?.comparison ?? "about_average"
  const label =
    c === "above" ? "Above Average" : c === "below" ? "Below Average" : "About Average"
  const cls =
    c === "above"
      ? "bg-red-600 text-white"
      : c === "below"
      ? "bg-green-600 text-white"
      : "bg-gray-200 text-gray-800"

  return (
    <div className="mt-2">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
        {label}
      </span>
    </div>
  )
})()}


                <p className="mt-2">
                  Bill Type:{' '}
                  <span className="font-semibold">{data.regionalComparison?.billType ?? 'unknown'}</span>
                </p>

                <p className="mt-1">
                  Total Amount:{' '}
                  <span className="font-semibold">
                    {data.regionalComparison?.totalAmount != null
                      ? `$${data.regionalComparison.totalAmount}`
                      : 'Unknown'}
                  </span>
                </p>

                <p className="mt-1">
                  Comparison:{' '}
                  <span className="font-semibold">{data.regionalComparison?.comparison ?? 'about_average'}</span>
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Avg Range: {data.regionalComparison?.estimatedAverageRange ?? 'Unknown'}
                </p>

                <p className="mt-2 text-gray-700">{data.regionalComparison?.explanation ?? ''}</p>
              </div>
            </div>
          )}
          </div>
      )}
    </div>
  )
}