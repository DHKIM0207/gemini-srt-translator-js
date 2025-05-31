import gst from '../src/index.js';

// Configure API key
gst.geminiApiKey = process.env.GEMINI_API_KEY || "";

// List available models
await gst.listModels();