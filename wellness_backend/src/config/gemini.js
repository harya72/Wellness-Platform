
const { GoogleGenerativeAI } = require('@google/generative-ai');

let apiKeys = [];
let currentKeyIndex = 0;
let model = null;


const initializeGemini = () => {
  const rawKeys = process.env.GEMINI_API_KEY;

  if (!rawKeys) {
    console.warn('⚠️ GEMINI_API_KEY not configured. Food image analysis will not work.');
    return null;
  }

  apiKeys = rawKeys.split(',').map(key => key.trim()).filter(key => key.length > 0);

  if (apiKeys.length === 0) {
    console.warn('⚠️ No valid Gemini API keys found.');
    return null;
  }

  return setupModel(apiKeys[currentKeyIndex]);
};


const setupModel = (key) => {
  try {
    const genAI = new GoogleGenerativeAI(key);

    model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 800,
      },
    });

    console.log(`✅ Gemini API initialized with key index ${currentKeyIndex}`);
    return model;
  } catch (error) {
    console.error(`❌ Failed to initialize Gemini model with key at index ${currentKeyIndex}:`, error.message);
    return null;
  }
};

/**
 * Switch to the next available API key in the pool
 * @returns {boolean} - True if a new key was rotated to, false if no more keys
 */
const rotateKey = () => {
  if (currentKeyIndex + 1 < apiKeys.length) {
    currentKeyIndex++;
    console.log(`🔄 Rotating Gemini API key to index ${currentKeyIndex}...`);
    setupModel(apiKeys[currentKeyIndex]);
    return true;
  }

  console.error('🚫 All Gemini API keys in the pool have been exhausted/rate-limited.');
  return false;
};

/**
 * Get the Gemini model instance
 * @returns {GenerativeModel|null}
 */
const getModel = () => {
  if (!model) {
    initializeGemini();
  }
  return model;
};

/**
 * Check if Gemini is configured
 * @returns {boolean}
 */
const isConfigured = () => {
  return apiKeys.length > 0 || !!process.env.GEMINI_API_KEY;
};

module.exports = {
  initializeGemini,
  getModel,
  rotateKey,
  isConfigured,
};
