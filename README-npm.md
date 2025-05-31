# Gemini SRT Translator (Node.js)

[한국어](README_ko.md) | English

A Node.js tool to translate SRT subtitle files using Google's Gemini AI API. It maintains exact timestamps, supports batch processing, and provides resume capabilities for interrupted translations.

## Features

- ✨ High-quality translation using Google Gemini AI
- 📝 Preserves SRT format with exact timestamps
- 🔄 Resume capability for interrupted translations
- 🧠 "Thinking" mode for better context understanding (Gemini 2.5 models)
- 📦 Batch processing for large subtitle files
- 📊 Real-time progress tracking
- 🔑 Multiple API key support for quota management
- 🌈 Colorful terminal UI
- 🌐 Web UI for easy file uploads and translation

## Installation

### Install from npm
```bash
# Global installation
npm install -g gemini-srt-translator

# Local installation
npm install gemini-srt-translator
```

### Install from GitHub
```bash
# Install directly from GitHub
npm install -g github:DHKIM0207/gemini-srt-translator-js

# Or clone and install
git clone https://github.com/DHKIM0207/gemini-srt-translator-js.git
cd gemini-srt-translator-js
npm install
npm link  # For global CLI usage
```

## Usage

### CLI Usage

#### Basic Translation
```bash
gemini-srt-translator translate -k YOUR_API_KEY -l Korean -i subtitle.srt
```

#### With All Options
```bash
gemini-srt-translator translate \
  -k YOUR_API_KEY \
  -k2 YOUR_BACKUP_KEY \
  -l Korean \
  -i subtitle.srt \
  -o subtitle_kr.srt \
  -s 100 \
  -d "Technical documentary about AI" \
  -m gemini-2.0-flash-exp \
  -b 250 \
  --temperature 0.3 \
  --top-p 0.95 \
  --top-k 40 \
  --progress-log \
  --thoughts-log
```

#### Batch Translation
```bash
gemini-srt-translator batch -k YOUR_API_KEY -l Spanish -i "*.srt"
```

#### List Available Models
```bash
gemini-srt-translator listmodels -k YOUR_API_KEY
```

### Programmatic Usage

```javascript
import gst from 'gemini-srt-translator';

// Basic usage
gst.geminiApiKey = "YOUR_API_KEY";
gst.targetLanguage = "Korean";
gst.inputFile = "subtitle.srt";

await gst.translate();
```

#### Advanced Usage
```javascript
import gst from 'gemini-srt-translator';

// Set all options
gst.geminiApiKey = "YOUR_API_KEY";
gst.geminiApiKey2 = "YOUR_BACKUP_KEY"; // Backup API key
gst.targetLanguage = "Korean";
gst.inputFile = "subtitle.srt";
gst.outputFile = "subtitle_kr.srt";
gst.startLine = 100; // Start from line 100
gst.description = "Technical documentary about AI";
gst.modelName = "gemini-2.0-flash-exp";
gst.batchSize = 250;
gst.streaming = true;
gst.thinking = true;
gst.thinkingBudget = 2048;
gst.temperature = 0.3;
gst.topP = 0.95;
gst.topK = 40;
gst.progressLog = true;
gst.thoughtsLog = true;

await gst.translate();
```

#### Direct Class Usage
```javascript
import { GeminiSRTTranslator } from 'gemini-srt-translator';

const translator = new GeminiSRTTranslator({
  geminiApiKey: "YOUR_API_KEY",
  targetLanguage: "Korean",
  inputFile: "subtitle.srt",
  outputFile: "subtitle_kr.srt"
});

await translator.translate();
```

### Web UI Usage

The package includes a web interface for easy file uploads and translation:

```bash
# Start the web server
npm run ui

# Or if installed globally
gemini-srt-translator ui
```

Then open http://localhost:3000 in your browser.

## CLI Options

### translate Command
- `-k, --api-key <key>`: Gemini API key (required)
- `-k2, --api-key2 <key>`: Backup API key
- `-l, --target-language <language>`: Target language (required)
- `-i, --input <file>`: Input SRT file (required)
- `-o, --output <file>`: Output filename
- `-s, --start-line <number>`: Starting line number
- `-d, --description <text>`: Translation context
- `-m, --model <name>`: Gemini model name
- `-b, --batch-size <number>`: Batch size
- `--temperature <number>`: Temperature (0.0-2.0)
- `--top-p <number>`: Top-p sampling (0.0-1.0)
- `--top-k <number>`: Top-k sampling
- `--no-streaming`: Disable streaming
- `--no-thinking`: Disable thinking mode
- `--thinking-budget <number>`: Thinking token budget
- `--pro-quota`: Use pro quota (no delay)
- `--no-colors`: Disable colored output
- `--progress-log`: Save progress log
- `--thoughts-log`: Save AI thinking process
- `--skip-upgrade`: Skip version update check

## Environment Variables

You can set the API key as an environment variable:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

## Progress Saving and Resume

Translation progress is automatically saved when interrupted. Running the same command again will resume from where it left off.

Progress is saved as `.{filename}.progress` in the same directory as the input file.

## Supported Languages

Supports all languages available in Google Gemini AI, including:
- Korean (한국어)
- Japanese (日本語)  
- Chinese (中文)
- Spanish (Español)
- French (Français)
- German (Deutsch)
- And 100+ more languages

## Available Models

- `gemini-2.0-flash-exp` - Latest, fast model (default)
- `gemini-1.5-flash` - Fast and efficient
- `gemini-1.5-pro` - More accurate
- `gemini-2.5-flash-preview-05-20` - Preview with thinking capability
- `gemini-2.5-flash-thinking-latest` - With thinking mode
- `gemini-2.5-pro-preview-05-20` - Pro preview
- `gemini-2.5-pro-thinking-latest` - Pro with thinking mode

## Notes

1. **API Key**: Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Quotas**: Free tier has 2-second delays between requests. Use `--pro-quota` for pro tier
3. **File Size**: Large files are processed in batches. Default batch size is 300 subtitles
4. **Token Limits**: Be mindful of model token limits. Adjust batch size if needed

## Troubleshooting

### API Key Error
```bash
export GEMINI_API_KEY="your_actual_api_key"
```

### Quota Exceeded
- Use backup API key: `-k2` option
- Reduce batch size: `-b 100`
- Use pro quota: `--pro-quota`

### Out of Memory
- Reduce batch size
- Use streaming mode (default)

## Credits

This is a Node.js port of the original Python [gemini-srt-translator](https://github.com/MaKTaiL/gemini-srt-translator) by [Matheus Castro](mailto:matheuscastro@gmail.com).

## License

MIT License

## Contributing

Issues and PRs are always welcome!

## Original Project

This project is a Node.js port of the [Python version](https://github.com/MaKTaiL/gemini-srt-translator).