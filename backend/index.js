const express = require("express");
const cors = require("cors");
require("dotenv").config();
const chatRoutes = require("./routes/chat");
const generateDocRoutes = require("./routes/generateDoc");
const transformRoutes = require("./routes/transform");

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Test endpoint to check available models and API key
app.get("/api/test-models", async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // First, try to list models
    let listModelsResult = null;
    try {
      const modelsResponse = await genAI.listModels();
      listModelsResult = {
        success: true,
        models: modelsResponse.response?.models || modelsResponse.models || []
      };
    } catch (listError) {
      listModelsResult = {
        success: false,
        error: listError.message,
        status: listError.status,
        statusText: listError.statusText
      };
    }
    
    // Then try each model - use gemini-2.0-flash first as it's available
    const modelNames = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
    const results = [];
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        const text = await response.text();
        results.push({ 
          model: modelName, 
          status: "success", 
          response: text.substring(0, 50) 
        });
      } catch (error) {
        results.push({ 
          model: modelName, 
          status: "failed", 
          error: error.message,
          status: error.status,
          statusText: error.statusText
        });
      }
    }
    
    res.json({ 
      apiKeyConfigured: !!apiKey,
      apiKeyFormat: apiKey.startsWith('AIza') ? 'valid' : 'invalid',
      listModels: listModelsResult,
      modelTests: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/chat", chatRoutes);
app.use("/api/generate-doc", generateDocRoutes);
app.use("/api/transform", transformRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GEMINI_API_KEY configured: ${!!process.env.GEMINI_API_KEY}`);
}); 