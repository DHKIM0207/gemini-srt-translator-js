import gst from '../src/index.js';

// Configure translation
gst.geminiApiKey = process.env.GEMINI_API_KEY || "";
gst.targetLanguage = "French";
gst.inputFile = "subtitle.srt";

// Run translation
await gst.translate();