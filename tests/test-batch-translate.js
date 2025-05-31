import gst from '../src/index.js';
import fs from 'fs';
import path from 'path';

// Configure translation
gst.geminiApiKey = process.env.GEMINI_API_KEY || "";
gst.targetLanguage = "Spanish";

// Find all SRT files in current directory
const files = fs.readdirSync('.')
  .filter(file => file.endsWith('.srt'))
  .map(file => path.resolve(file));

console.log(`Found ${files.length} SRT files to translate`);

// Translate each file
for (const file of files) {
  console.log(`\nTranslating: ${file}`);
  
  gst.inputFile = file;
  gst.outputFile = file.replace('.srt', '_Spanish.srt');
  
  try {
    await gst.translate();
    console.log(`Successfully translated: ${file}`);
  } catch (error) {
    console.error(`Failed to translate ${file}:`, error.message);
  }
}