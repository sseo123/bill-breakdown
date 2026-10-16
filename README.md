# 🔋 BillBreakdown

An AI-powered utility bill auditor that analyzes your electricity, water, gas, or internet bills for billing errors, overcharges, and savings opportunities — with an interactive PDF overlay to pinpoint exactly where issues appear.

## Features

- **Error Detection** — Identifies suspicious charges, duplicate fees, and billing anomalies with a likelihood score
- **Savings Tips** — Personalized recommendations based on your bill type and regional usage data
- **Regional Comparison** — Compares your usage against local averages and estimates annual savings
- **CO₂ Impact** — Calculates potential carbon reduction if eco-friendly tips are followed
- **Dispute Email Generator** — Drafts a ready-to-send customer service email when errors are found
- **Interactive PDF Viewer** — Pins error/saving markers directly onto your bill pages
- **Animated Loading Experience** — Multi-phase animation that fast-forwards the moment AI analysis completes

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- **AI**: [Google Gemini 2.5 Flash](https://ai.google.dev) via `@google/generative-ai`
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **PDF Rendering**: [react-pdf](https://react-pdf.org) (lazy-loaded client-side)
- **Styling**: Tailwind CSS v4
- **Icons**: [Lucide React](https://lucide.dev)

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/sseo123/bill-breakdown.git
cd bill-breakdown
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload a utility bill (PDF, JPG, or PNG)
2. Click **Generate Audit**
3. Wait for the AI to analyze (typically 10–30 seconds)
4. Review flagged errors and savings tips pinned directly on your bill
5. Copy the auto-generated dispute email if errors were found

## Project Structure

```
app/
  actions.ts     # Server Actions — Gemini API calls & response parsing
  page.tsx       # Main upload + animation + results orchestration
  globals.css    # Tailwind v4 theme tokens

components/
  LoadingAnimation.tsx    # Phase 1: PDF → folder → AI animation
  AnalyzingAnimation.tsx  # Phase 2: Step-by-step scanning animation
  SavingsAnimation.tsx    # Phase 3: Looping savings tips (until AI responds)
  PDFViewer.tsx           # Interactive PDF with error/savings pins
  ResultsPage.tsx         # Full results layout with tabs and summary cards
```

## Notes

- Bills are processed via Google's Gemini multimodal API and are **not stored** anywhere
- The `bodySizeLimit` for Server Actions is set to `10mb` to support multi-page PDF uploads
- The loading animation fast-forwards automatically the moment the AI response arrives
