import gst from '../src/index.js';

// Configure all options
gst.geminiApiKey = process.env.GEMINI_API_KEY || "";
gst.geminiApiKey2 = process.env.GEMINI_API_KEY2 || ""; // Optional backup key
gst.targetLanguage = "Korean";
gst.inputFile = "subtitle.srt";
gst.outputFile = "subtitle_Korean_custom.srt";
gst.startLine = 1;
gst.description = "This is a technical documentary about AI";
gst.modelName = "gemini-2.5-flash-preview-05-20";
gst.batchSize = 250;
gst.streaming = true;
gst.thinking = true;
gst.thinkingBudget = 2048;
gst.temperature = 0.3;
gst.topP = 0.95;
gst.topK = 40;
gst.freeQuota = true;
gst.skipUpgrade = false;
gst.useColors = true;
gst.progressLog = true;
gst.thoughtsLog = true;

console.log("Starting translation with all options configured...");
console.log({
  targetLanguage: gst.targetLanguage,
  inputFile: gst.inputFile,
  outputFile: gst.outputFile,
  model: gst.modelName,
  batchSize: gst.batchSize,
  temperature: gst.temperature,
  streaming: gst.streaming,
  thinking: gst.thinking
});

// Run translation
await gst.translate();