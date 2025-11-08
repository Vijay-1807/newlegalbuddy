const express = require("express");
const router = express.Router();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const RAG_SERVICE_URL = "http://localhost:5001/search";

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid or missing message" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is not configured!");
      return res.status(500).json({ 
        error: "Server configuration error: GEMINI_API_KEY is missing. Please configure it in the backend .env file." 
      });
    }

    let finalPrompt = message;
    let context = "";

    try {
      // 1. Call RAG service to get context (with timeout)
      const ragResponse = await axios.post(RAG_SERVICE_URL, { query: message }, {
        timeout: 5000 // 5 second timeout
      });
      const retrievedSections = ragResponse.data;

      if (retrievedSections && retrievedSections.length > 0) {
        // 2. Format the context
        context = "Based on the following legal sections:\n" + retrievedSections
          .map(sec => `${sec.section_number} - ${sec.title}: ${sec.text}`)
          .join("\n\n");
        
        // 3. Construct the final prompt
        finalPrompt = `${context}\n\nAnswer the question: ${message}`;
      }
    } catch (ragError) {
      // If RAG service is not running or fails, proceed without context
      if (ragError.code === 'ECONNREFUSED' || ragError.code === 'ETIMEDOUT') {
        console.warn("⚠️ RAG service not available, proceeding without context");
      } else {
        console.error("RAG service call failed, proceeding without context:", ragError.message);
      }
      // If RAG fails, finalPrompt remains the original message
    }

    // 💡 TEMPORARY LOGGING: Display the final prompt being sent to Gemini
    console.log("==================== PROMPT SENT TO GEMINI ====================");
    console.log(finalPrompt);
    console.log("=============================================================");

    // Get a working model - try models in order until one works
    // Use gemini-2.0-flash and gemini-2.0-flash-lite as they're available for this API key
    const modelNames = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
    let text;
    let lastError;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`🔄 Trying model: ${modelName}`);
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        text = await response.text();
        console.log(`✅ Successfully used model: ${modelName}`);
        break;
      } catch (modelError) {
        console.error(`❌ Model ${modelName} failed:`, modelError.message?.substring(0, 150));
        lastError = modelError;
        // Continue to next model
      }
    }
    
    if (!text) {
      throw new Error(`None of the models worked. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    res.json({ response: text });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      response: error.response?.data,
      cause: error.cause,
      name: error.name,
      stack: error.stack
    });
    
    let errorMessage = "Failed to process chat message.";
    
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
