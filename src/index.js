/**
 * # Gemini SRT Translator
 *     A tool to translate subtitles using Google Generative AI.
 * 
 * ## Usage:
 * 
 * ### Translate Subtitles
 *     You can translate subtitles using the `translate` function:
 *     ```javascript
 *     import gst from 'gemini-srt-translator';
 * 
 *     gst.geminiApiKey = "your_gemini_api_key_here";
 *     gst.targetLanguage = "French";
 *     gst.inputFile = "subtitle.srt";
 * 
 *     await gst.translate();
 *     ```
 *     This will translate the subtitles in the `subtitle.srt` file to French.
 * 
 * ### List Models
 *     You can list the available models using the `listModels` function:
 *     ```javascript
 *     import gst from 'gemini-srt-translator';
 * 
 *     gst.geminiApiKey = "your_gemini_api_key_here";
 *     await gst.listModels();
 *     ```
 *     This will print a list of available models to the console.
 */

import { GeminiSRTTranslator } from './translator.js';
import { upgradePackage } from './utils.js';

// Module-level variables (similar to Python module attributes)
const moduleState = {
  geminiApiKey: null,
  geminiApiKey2: null,
  targetLanguage: null,
  inputFile: null,
  outputFile: null,
  startLine: null,
  description: null,
  modelName: null,
  batchSize: null,
  streaming: null,
  thinking: null,
  thinkingBudget: null,
  temperature: null,
  topP: null,
  topK: null,
  freeQuota: null,
  skipUpgrade: null,
  useColors: true,
  progressLog: null,
  thoughtsLog: null
};

/**
 * ## Retrieves available models from the Gemini API.
 *     This function configures the genai library with the provided Gemini API key
 *     and retrieves a list of available models.
 * 
 * Example:
 * ```javascript
 * import gst from 'gemini-srt-translator';
 * 
 * // Your Gemini API key
 * gst.geminiApiKey = "your_gemini_api_key_here";
 * 
 * const models = await gst.getModels();
 * console.log(models);
 * ```
 * 
 * @returns {Promise<string[]>} Array of available model names
 * @throws {Error} If the Gemini API key is not provided
 */
async function getModels() {
  const translator = new GeminiSRTTranslator({ geminiApiKey: moduleState.geminiApiKey });
  return translator.getModels();
}

/**
 * ## Lists available models from the Gemini API.
 *     This function configures the genai library with the provided Gemini API key
 *     and retrieves a list of available models. It then prints each model to the console.
 * 
 * Example:
 * ```javascript
 * import gst from 'gemini-srt-translator';
 * 
 * // Your Gemini API key
 * gst.geminiApiKey = "your_gemini_api_key_here";
 * 
 * await gst.listModels();
 * ```
 * 
 * @throws {Error} If the Gemini API key is not provided
 */
async function listModels() {
  const translator = new GeminiSRTTranslator({ geminiApiKey: moduleState.geminiApiKey });
  const models = await translator.getModels();
  
  if (models && models.length > 0) {
    console.log("Available models:\n");
    models.forEach(model => console.log(model));
  } else {
    console.log("No models available or an error occurred while fetching models.");
  }
}

/**
 * ## Translates a subtitle file using the Gemini API.
 *     This function configures the genai library with the provided Gemini API key
 *     and translates the dialogues in the subtitle file to the target language.
 *     The translated dialogues are then written to a new subtitle file.
 * 
 * Example:
 * ```javascript
 * import gst from 'gemini-srt-translator';
 * 
 * // Your Gemini API key
 * gst.geminiApiKey = "your_gemini_api_key_here";
 * 
 * // Target language for translation
 * gst.targetLanguage = "French";
 * 
 * // Path to the subtitle file to translate
 * gst.inputFile = "subtitle.srt";
 * 
 * // (Optional) Gemini API key 2 for additional quota
 * gst.geminiApiKey2 = "your_gemini_api_key2_here";
 * 
 * // (Optional) Path to save the translated subtitle file
 * gst.outputFile = "translated_subtitle.srt";
 * 
 * // (Optional) Line number to start translation from
 * gst.startLine = 120;
 * 
 * // (Optional) Additional description of the translation task
 * gst.description = "This subtitle is from a TV Series called 'Friends'.";
 * 
 * // (Optional) Model name to use for translation (default: "gemini-2.5-flash-preview-05-20")
 * gst.modelName = "gemini-2.5-flash-preview-05-20";
 * 
 * // (Optional) Batch size for translation (default: 300)
 * gst.batchSize = 300;
 * 
 * // (Optional) Whether to use streamed responses (default: true)
 * gst.streaming = true;
 * 
 * // (Optional) Whether to use thinking (default: true)
 * gst.thinking = true;
 * 
 * // (Optional) Thinking budget for translation (default: 2048, range: 0-24576, 0 disables thinking)
 * gst.thinkingBudget = 2048;
 * 
 * // (Optional) Temperature for the translation model (range: 0.0-2.0)
 * gst.temperature = 0.5;
 * 
 * // (Optional) Top P for the translation model (range: 0.0-1.0)
 * gst.topP = 0.9;
 * 
 * // (Optional) Top K for the translation model (range: >=0)
 * gst.topK = 10;
 * 
 * // (Optional) Signal GST that you are using the free quota (default: true)
 * gst.freeQuota = true;
 * 
 * // (Optional) Skip package upgrade check (default: false)
 * gst.skipUpgrade = false;
 * 
 * // (Optional) Use colors in the output (default: true)
 * gst.useColors = true;
 * 
 * // (Optional) Enable progress logging (default: false)
 * gst.progressLog = false;
 * 
 * // (Optional) Enable thoughts logging (default: false)
 * gst.thoughtsLog = false;
 * 
 * await gst.translate();
 * ```
 * 
 * @returns {Promise<boolean>} True if translation was successful
 * @throws {Error} If required parameters are not provided
 */
async function translate() {
  const params = {
    geminiApiKey: moduleState.geminiApiKey,
    geminiApiKey2: moduleState.geminiApiKey2,
    targetLanguage: moduleState.targetLanguage,
    inputFile: moduleState.inputFile,
    outputFile: moduleState.outputFile,
    startLine: moduleState.startLine,
    description: moduleState.description,
    modelName: moduleState.modelName,
    batchSize: moduleState.batchSize,
    streaming: moduleState.streaming,
    thinking: moduleState.thinking,
    thinkingBudget: moduleState.thinkingBudget,
    temperature: moduleState.temperature,
    topP: moduleState.topP,
    topK: moduleState.topK,
    freeQuota: moduleState.freeQuota,
    useColors: moduleState.useColors,
    progressLog: moduleState.progressLog,
    thoughtsLog: moduleState.thoughtsLog
  };
  
  if (!moduleState.skipUpgrade) {
    try {
      await upgradePackage('gemini-srt-translator', moduleState.useColors);
    } catch (err) {
      // Continue with translation even if upgrade check fails
    }
  }
  
  // Filter out null/undefined values
  const filteredParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      filteredParams[key] = value;
    }
  }
  
  const translator = new GeminiSRTTranslator(filteredParams);
  return translator.translate();
}

// Create a proxy to expose module-level variables
const gst = new Proxy({
  getModels,
  listModels,
  translate,
  GeminiSRTTranslator
}, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    return moduleState[prop];
  },
  set(target, prop, value) {
    if (prop in moduleState) {
      moduleState[prop] = value;
      return true;
    }
    return false;
  }
});

export default gst;
export { GeminiSRTTranslator };