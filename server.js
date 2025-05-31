import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiSRTTranslator } from './src/translator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.srt') {
      cb(null, true);
    } else {
      cb(new Error('Only SRT files are allowed'));
    }
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    const translator = new GeminiSRTTranslator({ 
      geminiApiKey: req.query.apiKey || process.env.GEMINI_API_KEY 
    });
    const models = await translator.getModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Store active translations for progress tracking
const activeTranslations = new Map();

// SSE endpoint for translation progress
app.get('/api/translate/progress/:id', (req, res) => {
  const { id } = req.params;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n');

  // Store the response object for this client
  if (!activeTranslations.has(id)) {
    activeTranslations.set(id, { clients: [] });
  }
  activeTranslations.get(id).clients.push(res);

  // Clean up on client disconnect
  req.on('close', () => {
    const translation = activeTranslations.get(id);
    if (translation) {
      translation.clients = translation.clients.filter(client => client !== res);
      if (translation.clients.length === 0 && !translation.active) {
        activeTranslations.delete(id);
      }
    }
  });
});

// Upload and translate SRT file
app.post('/api/translate', upload.single('file'), async (req, res) => {
  const translationId = Date.now().toString();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      apiKey,
      apiKey2,
      targetLanguage,
      model,
      batchSize,
      streaming,
      thinking,
      thinkingBudget,
      temperature,
      topP,
      topK,
      description
    } = req.body;

    if (!apiKey || !targetLanguage) {
      return res.status(400).json({ error: 'API key and target language are required' });
    }

    const inputFile = req.file.path;
    const outputFile = path.join('uploads', `${req.file.filename}_${targetLanguage}.srt`);

    // Send translation ID to client
    res.json({ translationId });

    // Initialize translation tracking
    const translation = activeTranslations.get(translationId) || { clients: [] };
    translation.active = true;
    activeTranslations.set(translationId, translation);

    // Broadcast progress to all connected clients
    const broadcastProgress = (data) => {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      translation.clients.forEach(client => {
        client.write(message);
      });
    };

    // Create custom logger that broadcasts progress
    const progressLogger = {
      progressBar: (current, total, message) => {
        broadcastProgress({
          type: 'progress',
          current,
          total,
          percentage: Math.round((current / total) * 100),
          message
        });
      },
      success: (message) => {
        broadcastProgress({ type: 'success', message });
      },
      error: (message) => {
        broadcastProgress({ type: 'error', message });
      },
      info: (message) => {
        broadcastProgress({ type: 'info', message });
      }
    };

    // Create translator instance with progress callback
    const translator = new GeminiSRTTranslator({
      geminiApiKey: apiKey,
      geminiApiKey2: apiKey2,
      targetLanguage,
      inputFile,
      outputFile,
      modelName: model || 'gemini-2.0-flash-exp',
      batchSize: parseInt(batchSize) || 30,
      streaming: streaming !== 'false',
      thinking: thinking === 'true',
      thinkingBudget: parseInt(thinkingBudget) || 2048,
      temperature: parseFloat(temperature) || undefined,
      topP: parseFloat(topP) || undefined,
      topK: parseInt(topK) || undefined,
      description,
      useColors: false,
      progressCallback: progressLogger
    });

    // Start translation
    const success = await translator.translate();

    if (success) {
      // Read the translated file
      const translatedContent = fs.readFileSync(outputFile, 'utf8');
      
      // Clean up files
      fs.unlinkSync(inputFile);
      fs.unlinkSync(outputFile);
      
      // Send completion
      broadcastProgress({
        type: 'complete',
        success: true,
        translatedContent
      });
    } else {
      throw new Error('Translation failed');
    }

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Send error to clients
    const translation = activeTranslations.get(translationId);
    if (translation) {
      const message = `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`;
      translation.clients.forEach(client => {
        client.write(message);
      });
    }
  } finally {
    // Mark translation as inactive
    const translation = activeTranslations.get(translationId);
    if (translation) {
      translation.active = false;
      if (translation.clients.length === 0) {
        activeTranslations.delete(translationId);
      }
    }
  }
});

// Start server
app.listen(port, () => {
  console.log(`Gemini SRT Translator UI server running at http://localhost:${port}`);
});