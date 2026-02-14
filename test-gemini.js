const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

async function test() {
  try {
    const modelName = "gemini-1.5-flash"; // testing with a known good one
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log("Success with " + modelName + ":", result.response.text());
  } catch (e) {
    console.error("Error with gemini-1.5-flash:", e.message);
  }

  try {
    const modelName = "gemini-2.0-flash-exp"; // another common one
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log("Success with " + modelName + ":", result.response.text());
  } catch (e) {
    console.error("Error with gemini-2.0-flash-exp:", e.message);
  }

  try {
    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log("Success with " + modelName + ":", result.response.text());
  } catch (e) {
    console.error("Error with gemini-2.5-flash:", e.message);
  }
}

test();
