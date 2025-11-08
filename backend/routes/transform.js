const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const getPrompt = (action, text, targetLanguage = "Hindi") => {
  switch (action) {
    case 'simplify':
      return `Explain the following legal text to a non-lawyer in simple, clear terms. Maintain the core meaning but avoid jargon:\n\n"${text}"`;
    case 'translate':
      return `Strictly translate the following English text to ${targetLanguage}. Provide only the translated text and nothing else. Do not add explanations, notes, or phonetics.\n\nEnglish text: "${text}"`;
    default:
      return text;
  }
};

router.post("/", async (req, res) => {
  try {
    const { text, action, targetLanguage } = req.body;

    if (!text || !action) {
      return res.status(400).json({ error: "Missing required fields: text and action." });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is not configured!");
      return res.status(500).json({ 
        error: "Server configuration error: GEMINI_API_KEY is missing. Please configure it in the backend .env file." 
      });
    }

    const prompt = getPrompt(action, text, targetLanguage);
    console.log(`Processing ${action} request with prompt length: ${prompt.length}`);

    // Get a working model - try models in order until one works
    // Use gemini-2.0-flash and gemini-2.0-flash-lite as they're available for this API key
    const modelNames = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
    let transformedText;
    let lastError;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`🔄 Trying model: ${modelName}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        transformedText = await response.text();
        console.log(`✅ Successfully used model: ${modelName}`);
        break;
      } catch (modelError) {
        console.error(`❌ Model ${modelName} failed:`, modelError.message?.substring(0, 150));
        lastError = modelError;
        // Continue to next model
      }
    }
    
    if (!transformedText) {
      throw new Error(`None of the models worked. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    res.json({ transformedText });
  } catch (error) {
    console.error("❌ Text Transformation Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      response: error.response?.data,
      cause: error.cause,
      name: error.name,
      stack: error.stack
    });
    
    let errorMessage = "Failed to transform text.";
    
    // Try to extract meaningful error message
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.cause?.message) {
      errorMessage = error.cause.message;
    }
    
    // Check for common Gemini API errors but preserve the original message
    if (errorMessage.includes("API key") || errorMessage.includes("authentication")) {
      errorMessage = `Invalid or missing Gemini API key: ${errorMessage}`;
    } else if (errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
      errorMessage = `API quota exceeded: ${errorMessage}`;
    } else if (errorMessage.includes("model") || errorMessage.includes("not found")) {
      // Keep the original error message so we can see what's wrong
      errorMessage = `Model error: ${errorMessage}`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 