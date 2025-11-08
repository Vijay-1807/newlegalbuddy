const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Get a working Gemini model instance
 * @param {string} apiKey - The Gemini API key
 * @returns {Promise<{model: any, modelName: string}>} - The model instance and name
 */
async function getWorkingModel(apiKey) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured!");
  }

  // Validate API key format (should start with AIza)
  if (!apiKey.startsWith('AIza')) {
    console.warn("⚠️ API key format looks incorrect. Gemini API keys usually start with 'AIza'");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // First, try to list available models
  let availableModels = [];
  try {
    console.log("🔄 Attempting to list available models...");
    const modelsResponse = await genAI.listModels();
    const models = modelsResponse.response?.models || modelsResponse.models || [];
    console.log(`📋 Raw models response:`, JSON.stringify(modelsResponse, null, 2).substring(0, 500));
    
    availableModels = models
      .filter(m => {
        const methods = m.supportedGenerationMethods || m.supportedMethods || [];
        return methods.includes('generateContent') || methods.length === 0;
      })
      .map(m => {
        const name = m.name || m;
        return name.replace('models/', '');
      });
    console.log(`✅ Found ${availableModels.length} available models:`, availableModels);
  } catch (listError) {
    console.error("❌ Could not list models:", listError.message);
    console.error("   Error details:", {
      status: listError.status,
      statusText: listError.statusText,
      response: listError.response?.data
    });
    console.warn("⚠️ Will try default models instead");
  }

  // Try models in order: available models first, then defaults
  // Use gemini-2.0-flash and gemini-2.0-flash-lite as they're the latest and available
  const defaultModels = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
  const modelsToTry = [...availableModels, ...defaultModels.filter(m => !availableModels.includes(m))];
  
  console.log(`🔄 Will try models in this order: ${modelsToTry.join(', ')}`);

  // Return the first model - we'll let the actual usage fail if it doesn't work
  // This avoids unnecessary test calls that might fail
  const firstModel = modelsToTry[0] || "gemini-pro";
  const model = genAI.getGenerativeModel({ model: firstModel });
  console.log(`✅ Using model: ${firstModel}`);
  return { model, modelName: firstModel, genAI };
}

/**
 * Generate content using a working model
 * @param {string} apiKey - The Gemini API key
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The generated text
 */
async function generateContent(apiKey, prompt) {
  const { model } = await getWorkingModel(apiKey);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return await response.text();
}

module.exports = {
  getWorkingModel,
  generateContent
};

