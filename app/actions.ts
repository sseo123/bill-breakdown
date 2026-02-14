'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function analyzeBill(base64File: string, fileType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert utility auditor and sustainability consultant. 
    Analyze the attached utility bill for a resident in zip code (if the zip code is provided)

    Provide the following in a structured format:
    1. **Error Detection**: Check for math errors, double billing, or unusual surges compared to previous months (if visible).
    2. **Sustainable Savings**: Suggest 3-5 specific actions based on the bill's data (e.g., if they have high peak usage, suggest shifting laundry to off-peak hours).
    3. **Regional Comparison**: Based on common data for zip code , tell the user if their total is above or below average for a typical household.

    
    Keep the tone helpful and concise.
  `;

  const part = {
    inlineData: {
      data: base64File.split(',')[1],
      mimeType: fileType,
    },
  };

  const result = await model.generateContent([prompt, part]);
  return result.response.text();
}