import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SRTParser from 'srt-parser-2';
import { jsonrepair } from 'jsonrepair';
import { getInstruction, getSafetySettings, getResponseSchema } from './helpers.js';
import {
  error,
  errorWithProgress,
  getLastChunkSize,
  highlight,
  highlightWithProgress,
  info,
  infoWithProgress,
  inputPrompt,
  inputPromptWithProgress,
  progressBar,
  saveLogsToFile,
  saveThoughtsToFile,
  setColorMode,
  successWithProgress,
  updateLoadingAnimation,
  warning,
  warningWithProgress,
  success
} from './logger.js';

export class GeminiSRTTranslator {
  constructor(options = {}) {
    // API Keys
    this.geminiApiKey = options.geminiApiKey || null;
    this.geminiApiKey2 = options.geminiApiKey2 || null;
    this.currentApiKey = this.geminiApiKey;
    this.currentApiNumber = 1;
    this.backupApiNumber = 2;
    
    // Translation settings
    this.targetLanguage = options.targetLanguage || null;
    this.inputFile = options.inputFile || null;
    this.outputFile = options.outputFile || null;
    this.startLine = options.startLine || 1;
    this.description = options.description || null;
    this.modelName = options.modelName || 'gemini-2.5-flash-preview-05-20';
    this.batchSize = options.batchSize || 300;
    this.batchNumber = 0;
    
    // Model configuration
    this.streaming = options.streaming !== undefined ? options.streaming : true;
    this.thinking = options.thinking !== undefined ? options.thinking : true;
    this.thinkingBudget = options.thinkingBudget || 2048;
    this.temperature = options.temperature || null;
    this.topP = options.topP || null;
    this.topK = options.topK || null;
    
    // Quota and UI settings
    this.freeQuota = options.freeQuota !== undefined ? options.freeQuota : true;
    this.useColors = options.useColors !== undefined ? options.useColors : true;
    this.progressLog = options.progressLog || false;
    this.thoughtsLog = options.thoughtsLog || false;
    this.progressCallback = options.progressCallback || null;
    
    // Progress tracking
    if (this.inputFile && path.dirname(this.inputFile)) {
      this.logFilePath = path.join(path.dirname(this.inputFile), 'progress.log');
      this.thoughtsFilePath = path.join(path.dirname(this.inputFile), 'thoughts.log');
    } else {
      this.logFilePath = 'progress.log';
      this.thoughtsFilePath = 'thoughts.log';
    }
    
    this.progressFile = null;
    this.tokenLimit = null;
    this.tokenCount = null;
    this.translatedBatch = [];
    this.totalLines = 0;
    
    setColorMode(this.useColors);
    
    // Check for saved progress
    this._checkSavedProgress();
  }
  
  async translate() {
    try {
      // Validate inputs
      if (!this.geminiApiKey || !this.targetLanguage || !this.inputFile || !this.outputFile) {
        error('Missing required parameters for translation');
        return false;
      }
      
      // Load subtitle file
      const subtitles = await this._loadSubtitles();
      if (!subtitles || subtitles.length === 0) {
        error('No subtitles found in the input file');
        return false;
      }
      
      // Check for existing output
      let existingSubtitles = [];
      if (fs.existsSync(this.outputFile)) {
        existingSubtitles = await this._loadSubtitles(this.outputFile);
      }
      
      // Setup signal handlers
      this._setupSignalHandlers(subtitles);
      
      // Initialize translation
      this.totalLines = subtitles.length;
      let currentLine = this.startLine;
      let context = [];
      
      info(`Starting translation from line ${currentLine} of ${this.totalLines}`);
      
      while (currentLine <= this.totalLines) {
        // Build batch
        const batch = [];
        const batchStartLine = currentLine;
        
        while (batch.length < this.batchSize && currentLine <= this.totalLines) {
          const subtitle = subtitles[currentLine - 1];
          batch.push({
            index: subtitle.id,
            content: subtitle.text
          });
          currentLine++;
        }
        
        if (batch.length === 0) break;
        
        // Process batch
        this.batchNumber++;
        const result = await this._processBatch(batch, context, batchStartLine);
        
        if (result) {
          context = result.context;
          
          // Save progress
          await this._saveProgress(currentLine);
          
          // Add delay for free quota
          if (this.freeQuota && currentLine <= this.totalLines) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          // Batch failed, retry or skip
          warningWithProgress('Batch processing failed, retrying...');
          currentLine = batchStartLine; // Reset to retry
        }
      }
      
      // Save final results
      await this._saveSubtitles(subtitles);
      await this._clearProgress();
      
      success('Translation completed successfully!');
      return true;
      
    } catch (err) {
      error(`Translation error: ${err.message}`);
      return false;
    }
  }
  
  async getModels() {
    try {
      const genAI = new GoogleGenerativeAI(this.geminiApiKey || process.env.GEMINI_API_KEY);
      
      // The Google Generative AI SDK doesn't have a listModels method
      // We'll return a hardcoded list of known models
      return [
        'gemini-2.5-flash-preview-05-20',
        'gemini-2.5-flash-thinking-latest',
        'gemini-2.5-pro-preview-05-20',
        'gemini-2.5-pro-thinking-latest',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-1.0-pro'
      ];
    } catch (err) {
      error(`Error fetching models: ${err.message}`);
      return [];
    }
  }
  
  async _processBatch(batch, previousContext, startLine) {
    try {
      const client = this._getClient();
      const config = this._getConfig();
      
      // Validate token size
      const isValid = await this._validateTokenSize(batch, previousContext);
      if (!isValid) return null;
      
      // Build prompt
      const prompt = JSON.stringify(batch);
      const messages = [
        ...previousContext,
        { role: 'user', parts: [{ text: prompt }] }
      ];
      
      if (this.progressCallback) {
        this.progressCallback.progressBar(startLine - 1, this.totalLines, 'Sending batch...');
      } else {
        progressBar(
          startLine - 1,
          this.totalLines,
          30,
          'Translating: ',
          '',
          '',
          null,
          false,
          false,
          true,
          false,
          0
        );
      }
      
      // Generate content
      let response;
      let thoughts = '';
      
      if (this.streaming) {
        response = await this._processStreamingResponse(client, config, messages, startLine);
        thoughts = response.thoughts;
      } else {
        const result = await client.generateContent({
          ...config,
          contents: messages
        });
        
        const responseText = result.response.text();
        if (this.thinking && responseText.includes('<thinking>')) {
          const parts = responseText.split('</thinking>');
          if (parts.length > 1) {
            thoughts = parts[0].replace('<thinking>', '').trim();
            response = { text: parts[1].trim(), thoughts };
          } else {
            response = { text: responseText, thoughts: '' };
          }
        } else {
          response = { text: responseText, thoughts: '' };
        }
      }
      
      // Save thoughts if enabled
      if (this.thoughtsLog && thoughts) {
        saveThoughtsToFile(thoughts, this.thoughtsFilePath, 0);
      }
      
      // Process response
      const translatedLines = await this._processTranslatedLines(response.text, batch);
      
      if (!translatedLines) {
        throw new Error('Failed to process translation response');
      }
      
      // Update translated batch
      this.translatedBatch.push(...translatedLines);
      
      // Build context for next batch
      const newContext = [
        ...previousContext,
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: JSON.stringify(translatedLines) }] }
      ];
      
      if (this.progressCallback) {
        this.progressCallback.success(`Batch ${this.batchNumber} completed`);
      } else {
        successWithProgress(`Batch ${this.batchNumber} completed`);
      }
      
      return { context: newContext.slice(-6) }; // Keep last 3 exchanges
      
    } catch (err) {
      errorWithProgress(`Batch processing error: ${err.message}`);
      
      // Handle quota errors
      if (err.message.includes('quota') || err.message.includes('429')) {
        await this._handleQuotaError();
      }
      
      return null;
    }
  }
  
  async _processStreamingResponse(client, config, messages, currentStartLine) {
    return new Promise(async (resolve, reject) => {
      try {
        let fullResponse = '';
        let thoughts = '';
        let inThinking = false;
        
        const stream = await client.generateContentStream({
          ...config,
          contents: messages
        });
        
        for await (const chunk of stream.stream) {
          const chunkText = chunk.text();
          
          if (this.thinking) {
            if (chunkText.includes('<thinking>')) {
              inThinking = true;
            }
            
            if (inThinking) {
              if (chunkText.includes('</thinking>')) {
                const parts = chunkText.split('</thinking>');
                thoughts += parts[0].replace('<thinking>', '');
                fullResponse += parts[1] || '';
                inThinking = false;
              } else {
                thoughts += chunkText;
              }
            } else {
              fullResponse += chunkText;
            }
          } else {
            fullResponse += chunkText;
          }
          
          // Update progress
          if (this.progressCallback) {
            this.progressCallback.progressBar(currentStartLine - 1, this.totalLines, 'Processing...');
          } else {
            progressBar(
              currentStartLine - 1,
              this.totalLines,
              30,
              'Translating: ',
              '',
              '',
              null,
              false,
              true,
              false,
              false,
              fullResponse.length
            );
          }
        }
        
        resolve({ text: fullResponse, thoughts });
      } catch (err) {
        reject(err);
      }
    });
  }
  
  async _processTranslatedLines(responseText, originalBatch) {
    try {
      // Clean and parse response
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
      const repairedJson = jsonrepair(cleanedResponse);
      const translatedData = JSON.parse(repairedJson);
      
      if (!Array.isArray(translatedData)) {
        throw new Error('Response is not an array');
      }
      
      // Validate response
      const validatedLines = [];
      
      for (const item of translatedData) {
        if (!item.index || !item.content) {
          warningWithProgress(`Missing fields in translated item: ${JSON.stringify(item)}`);
          continue;
        }
        
        // Check if index exists in original batch
        const originalItem = originalBatch.find(o => o.index === item.index);
        if (!originalItem) {
          warningWithProgress(`Index ${item.index} not found in original batch`);
          continue;
        }
        
        validatedLines.push({
          index: item.index,
          content: this._processTextDirection(item.content)
        });
      }
      
      if (validatedLines.length === 0) {
        throw new Error('No valid translations found in response');
      }
      
      return validatedLines;
      
    } catch (err) {
      errorWithProgress(`Response parsing error: ${err.message}`);
      return null;
    }
  }
  
  _processTextDirection(text) {
    // Simple RTL detection (can be enhanced)
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/;
    if (rtlRegex.test(text)) {
      return `\u202B${text}\u202C`; // RTL embedding
    }
    return text;
  }
  
  async _loadSubtitles(filePath = null) {
    try {
      const file = filePath || this.inputFile;
      const content = fs.readFileSync(file, 'utf8');
      const parser = new SRTParser();
      return parser.fromSrt(content);
    } catch (err) {
      error(`Error loading subtitles: ${err.message}`);
      return null;
    }
  }
  
  async _saveSubtitles(subtitles) {
    try {
      // Update subtitles with translations
      for (const translated of this.translatedBatch) {
        const subtitle = subtitles.find(s => s.id === translated.index);
        if (subtitle) {
          subtitle.text = translated.content;
        }
      }
      
      // Convert back to SRT
      const parser = new SRTParser();
      const srtContent = parser.toSrt(subtitles);
      
      fs.writeFileSync(this.outputFile, srtContent, 'utf8');
      
      if (this.progressLog) {
        saveLogsToFile(this.logFilePath);
      }
      
    } catch (err) {
      error(`Error saving subtitles: ${err.message}`);
    }
  }
  
  _checkSavedProgress() {
    if (!this.inputFile) return;
    
    const progressFileName = `.${path.basename(this.inputFile)}.progress`;
    this.progressFile = path.join(path.dirname(this.inputFile), progressFileName);
    
    if (fs.existsSync(this.progressFile) && this.startLine === 1) {
      try {
        const progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
        if (progress.inputFile === this.inputFile) {
          const answer = inputPrompt(`Found saved progress at line ${progress.line}. Resume? (y/n): `);
          if (answer.toLowerCase() === 'y') {
            this.startLine = progress.line;
            info(`Resuming from line ${this.startLine}`);
          }
        }
      } catch (err) {
        // Ignore invalid progress file
      }
    }
  }
  
  async _saveProgress(line) {
    if (!this.progressFile) return;
    
    const progress = {
      line,
      inputFile: this.inputFile
    };
    
    fs.writeFileSync(this.progressFile, JSON.stringify(progress), 'utf8');
  }
  
  async _clearProgress() {
    if (this.progressFile && fs.existsSync(this.progressFile)) {
      fs.unlinkSync(this.progressFile);
    }
  }
  
  _setupSignalHandlers(subtitles) {
    const saveAndExit = () => {
      warning('\nInterrupted! Saving progress...');
      this._saveSubtitles(subtitles);
      this._saveProgress(this.startLine);
      process.exit(0);
    };
    
    process.on('SIGINT', saveAndExit);
    process.on('SIGTERM', saveAndExit);
  }
  
  _getClient() {
    const genAI = new GoogleGenerativeAI(this.currentApiKey);
    return genAI.getGenerativeModel({ model: this.modelName });
  }
  
  _getConfig() {
    const config = {
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: getResponseSchema()
      },
      systemInstruction: getInstruction(
        this.targetLanguage,
        this.description,
        this.thinking,
        this._isThinkingCompatible()
      ),
      safetySettings: getSafetySettings()
    };
    
    if (this.temperature !== null) {
      config.generationConfig.temperature = this.temperature;
    }
    if (this.topP !== null) {
      config.generationConfig.topP = this.topP;
    }
    if (this.topK !== null) {
      config.generationConfig.topK = this.topK;
    }
    if (this.thinking && this._isThinkingCompatible()) {
      config.generationConfig.maxThinkingTokens = this.thinkingBudget;
    }
    
    return config;
  }
  
  _isThinkingCompatible() {
    const thinkingModels = ['gemini-2.5-flash-thinking', 'gemini-2.5-pro-thinking'];
    return thinkingModels.some(model => this.modelName.includes(model));
  }
  
  async _validateTokenSize(batch, context) {
    try {
      if (!this.tokenLimit) {
        const models = await this.getModels();
        // Estimate token limit based on model (simplified)
        this.tokenLimit = this.modelName.includes('pro') ? 1000000 : 100000;
      }
      
      // Rough token estimation
      const batchText = JSON.stringify(batch);
      const contextText = JSON.stringify(context);
      const estimatedTokens = (batchText.length + contextText.length) / 4; // ~4 chars per token
      
      if (estimatedTokens > this.tokenLimit * 0.8) {
        const newBatchSize = Math.floor(this.batchSize * 0.75);
        warningWithProgress(`Token limit approaching. Reduce batch size to ${newBatchSize}?`);
        
        const answer = await inputPromptWithProgress('(y/n): ');
        if (answer.toLowerCase() === 'y') {
          this.batchSize = newBatchSize;
          return false; // Retry with smaller batch
        }
      }
      
      return true;
    } catch (err) {
      // Continue without validation
      return true;
    }
  }
  
  async _handleQuotaError() {
    if (this.geminiApiKey2 && this.currentApiNumber === 1) {
      info('Switching to backup API key...');
      this._switchApi();
    } else if (this.geminiApiKey && this.currentApiNumber === 2) {
      info('Switching back to primary API key...');
      this._switchApi();
    } else {
      warning('All API quotas exhausted. Waiting 60 seconds...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
  
  _switchApi() {
    if (this.currentApiNumber === 1) {
      this.currentApiKey = this.geminiApiKey2;
      this.currentApiNumber = 2;
      this.backupApiNumber = 1;
    } else {
      this.currentApiKey = this.geminiApiKey;
      this.currentApiNumber = 1;
      this.backupApiNumber = 2;
    }
  }
}