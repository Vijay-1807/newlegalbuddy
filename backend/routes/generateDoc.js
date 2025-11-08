const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const { deponentName, address, statement } = req.body;

    if (!deponentName || !address || !statement) {
      return res.status(400).json({ error: "Missing required fields for document generation." });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is not configured!");
      return res.status(500).json({ 
        error: "Server configuration error: GEMINI_API_KEY is missing. Please configure it in the backend .env file." 
      });
    }

    // Construct a detailed prompt for generating a legal affidavit
    const prompt = `
      Generate a legally appropriate affidavit for use in India based on the following details.
      The affidavit must be formal, correctly formatted, and include all necessary components like the title, deponent's details, the main statement, and a verification clause.

      **Deponent Details:**
      - Name: ${deponentName}
      - Address: ${address}

      **Statement of Facts to Include:**
      "${statement}"

      Produce the full text of the affidavit below.
    `;

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
        const result = await model.generateContent(prompt);
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

    res.json({ document: text });
  } catch (error) {
    console.error("❌ Document Generation Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      response: error.response?.data,
      cause: error.cause,
      name: error.name
    });
    
    let errorMessage = "Failed to generate document.";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.cause?.message) {
      errorMessage = error.cause.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 