import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { GeminiSRTTranslator } from '../src/translator.js';
import EventEmitter from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// 업로드 설정
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// SSE 연결 관리
const clients = new Map();
const progressEmitter = new EventEmitter();

// 진행률 업데이트 리스너
progressEmitter.on('progress', (data) => {
    const { clientId, ...progress } = data;
    const client = clients.get(clientId);
    if (client && !client.closed) {
        client.write(`data: ${JSON.stringify(progress)}\n\n`);
    }
});

app.get('/api/progress/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    clients.set(clientId, res);
    
    req.on('close', () => {
        clients.delete(clientId);
    });
});

app.post('/api/translate', upload.single('file'), async (req, res) => {
    try {
        const {
            apiKey,
            apiKey2,
            targetLanguage,
            model,
            batchSize,
            description,
            temperature,
            topP,
            topK,
            streaming,
            thinking,
            thinkingBudget,
            clientId
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: '파일이 없습니다.' });
        }

        // 파일 내용을 임시 파일로 저장
        const tempPath = `/tmp/${Date.now()}-${req.file.originalname}`;
        await fs.writeFile(tempPath, req.file.buffer);

        const outputPath = tempPath.replace('.srt', `_${targetLanguage.toLowerCase()}.srt`);

        const translator = new GeminiSRTTranslator({
            geminiApiKey: apiKey,
            geminiApiKey2: apiKey2,
            targetLanguage,
            inputFile: tempPath,
            outputFile: outputPath,
            modelName: model || 'gemini-2.0-flash-exp',
            batchSize: parseInt(batchSize) || 30,
            description,
            temperature: temperature ? parseFloat(temperature) : undefined,
            topP: topP ? parseFloat(topP) : undefined,
            topK: topK ? parseInt(topK) : undefined,
            streaming: streaming !== 'false',
            thinking: thinking === 'true',
            thinkingBudget: thinkingBudget ? parseInt(thinkingBudget) : 2048,
            progressCallback: (progress) => {
                progressEmitter.emit('progress', { clientId, ...progress });
            }
        });

        await translator.translate();
        
        const translatedContent = await fs.readFile(outputPath, 'utf-8');
        
        // 임시 파일 삭제
        await fs.unlink(tempPath);
        await fs.unlink(outputPath);
        
        res.json({
            success: true,
            content: translatedContent,
            filename: req.file.originalname.replace('.srt', `_${targetLanguage.toLowerCase()}.srt`)
        });
        
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({
            error: error.message || '번역 중 오류가 발생했습니다.'
        });
    }
});

// Vercel serverless function으로 export
export default app;