#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import gst from '../src/index.js';
import { info, error, highlight } from '../src/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program
  .name('gemini-srt-translator')
  .description('Translate SRT subtitle files using Google Gemini AI')
  .version(packageJson.version);

// Translate command
program
  .command('translate', { isDefault: true })
  .description('Translate subtitle files')
  .requiredOption('-k, --api-key <key>', 'Gemini API key (or use GEMINI_API_KEY env var)')
  .option('-k2, --api-key2 <key>', 'Secondary Gemini API key for quota management')
  .requiredOption('-l, --target-language <language>', 'Target language for translation')
  .requiredOption('-i, --input <file>', 'Input SRT file path')
  .option('-o, --output <file>', 'Output SRT file path (default: input_language.srt)')
  .option('-s, --start-line <number>', 'Line number to start translation from', (value) => parseInt(value, 10), 1)
  .option('-d, --description <text>', 'Additional context for translation')
  .option('-m, --model <name>', 'Gemini model name', 'gemini-2.5-flash-preview-05-20')
  .option('-b, --batch-size <number>', 'Number of subtitles per batch', (value) => parseInt(value, 10), 300)
  .option('--no-streaming', 'Disable streaming responses')
  .option('--no-thinking', 'Disable thinking mode')
  .option('--thinking-budget <number>', 'Token budget for thinking mode', (value) => parseInt(value, 10), 2048)
  .option('--temperature <number>', 'Model temperature (0.0-2.0)', parseFloat)
  .option('--top-p <number>', 'Top-p sampling (0.0-1.0)', parseFloat)
  .option('--top-k <number>', 'Top-k sampling', (value) => parseInt(value, 10))
  .option('--pro-quota', 'Use pro quota settings (no delays)')
  .option('--no-colors', 'Disable colored output')
  .option('--progress-log', 'Save progress to log file')
  .option('--thoughts-log', 'Save AI thoughts to log file')
  .option('--skip-upgrade', 'Skip version update check')
  .action(async (options) => {
    try {
      // Set API key from env if not provided
      const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        error('Error: Gemini API key is required. Use -k option or set GEMINI_API_KEY environment variable.');
        process.exit(1);
      }

      // Generate output filename if not provided
      let outputFile = options.output;
      if (!outputFile) {
        const inputBase = path.basename(options.input, '.srt');
        const inputDir = path.dirname(options.input);
        outputFile = path.join(inputDir, `${inputBase}_${options.targetLanguage}.srt`);
      }

      // Configure gst module
      gst.geminiApiKey = apiKey;
      gst.geminiApiKey2 = options.apiKey2;
      gst.targetLanguage = options.targetLanguage;
      gst.inputFile = options.input;
      gst.outputFile = outputFile;
      gst.startLine = options.startLine;
      gst.description = options.description;
      gst.modelName = options.model;
      gst.batchSize = options.batchSize;
      gst.streaming = options.streaming;
      gst.thinking = options.thinking;
      gst.thinkingBudget = options.thinkingBudget;
      gst.temperature = options.temperature;
      gst.topP = options.topP;
      gst.topK = options.topK;
      gst.freeQuota = !options.proQuota;
      gst.useColors = options.colors;
      gst.progressLog = options.progressLog;
      gst.thoughtsLog = options.thoughtsLog;
      gst.skipUpgrade = options.skipUpgrade;

      // Show configuration
      highlight('Translation Configuration:');
      info(`Input: ${options.input}`);
      info(`Output: ${outputFile}`);
      info(`Target Language: ${options.targetLanguage}`);
      info(`Model: ${options.model}`);
      info(`Batch Size: ${options.batchSize}`);
      if (options.startLine > 1) {
        info(`Starting from line: ${options.startLine}`);
      }
      console.log('');

      // Start translation
      const success = await gst.translate();
      process.exit(success ? 0 : 1);
    } catch (err) {
      error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// List models command
program
  .command('listmodels')
  .description('List available Gemini models')
  .option('-k, --api-key <key>', 'Gemini API key (or use GEMINI_API_KEY env var)')
  .action(async (options) => {
    try {
      const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        error('Error: Gemini API key is required. Use -k option or set GEMINI_API_KEY environment variable.');
        process.exit(1);
      }

      gst.geminiApiKey = apiKey;
      await gst.listModels();
    } catch (err) {
      error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// Batch translate command (process multiple files)
program
  .command('batch')
  .description('Translate multiple SRT files')
  .requiredOption('-k, --api-key <key>', 'Gemini API key (or use GEMINI_API_KEY env var)')
  .option('-k2, --api-key2 <key>', 'Secondary Gemini API key for quota management')
  .requiredOption('-l, --target-language <language>', 'Target language for translation')
  .requiredOption('-i, --input <pattern>', 'Input file pattern (e.g., "*.srt" or "subtitles/*.srt")')
  .option('-o, --output-dir <dir>', 'Output directory (default: same as input files)')
  .option('--model <name>', 'Gemini model name', 'gemini-2.5-flash-preview-05-20')
  .option('--batch-size <number>', 'Number of subtitles per batch', (value) => parseInt(value, 10), 300)
  .option('--no-streaming', 'Disable streaming responses')
  .option('--no-thinking', 'Disable thinking mode')
  .option('--pro-quota', 'Use pro quota settings (no delays)')
  .option('--no-colors', 'Disable colored output')
  .option('--skip-upgrade', 'Skip version update check')
  .action(async (options) => {
    try {
      const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        error('Error: Gemini API key is required. Use -k option or set GEMINI_API_KEY environment variable.');
        process.exit(1);
      }

      // Find matching files
      const glob = await import('glob');
      const files = await glob.glob(options.input);
      
      if (files.length === 0) {
        error(`No files found matching pattern: ${options.input}`);
        process.exit(1);
      }

      highlight(`Found ${files.length} files to translate`);
      
      let successCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        info(`\n[${i + 1}/${files.length}] Processing: ${file}`);
        
        // Generate output path
        const outputDir = options.outputDir || path.dirname(file);
        const baseName = path.basename(file, '.srt');
        const outputFile = path.join(outputDir, `${baseName}_${options.targetLanguage}.srt`);
        
        // Configure gst
        gst.geminiApiKey = apiKey;
        gst.geminiApiKey2 = options.apiKey2;
        gst.targetLanguage = options.targetLanguage;
        gst.inputFile = file;
        gst.outputFile = outputFile;
        gst.modelName = options.model;
        gst.batchSize = options.batchSize;
        gst.streaming = options.streaming;
        gst.thinking = options.thinking;
        gst.freeQuota = !options.proQuota;
        gst.useColors = options.colors;
        gst.skipUpgrade = true; // Don't check for updates on each file
        
        const success = await gst.translate();
        if (success) {
          successCount++;
        }
      }
      
      highlight(`\nBatch translation complete: ${successCount}/${files.length} files translated successfully`);
      process.exit(successCount === files.length ? 0 : 1);
    } catch (err) {
      error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}