import chalk from 'chalk';
import ora from 'ora';
import readline from 'readline';
import fs from 'fs';
import { createWriteStream } from 'fs';

// Global variables
let _useColors = true;
const _loadingBars = ['—', '\\', '|', '/'];
let _loadingBarsIndex = -1;
let _thoughtsList = [];

// Progress bar state
let _lastProgress = null;
let _hasStarted = false;
let _previousMessages = [];
let _lastChunkSize = 0;

// Ora spinner instance
let _spinner = null;

export function setColorMode(enabled) {
  _useColors = enabled;
  if (!enabled) {
    chalk.level = 0;
  }
}

export function info(message) {
  if (_useColors) {
    console.log(chalk.cyan(message));
  } else {
    console.log(message);
  }
}

export function warning(message) {
  if (_useColors) {
    console.log(chalk.yellow(message));
  } else {
    console.log(message);
  }
}

export function error(message) {
  if (_useColors) {
    console.log(chalk.red(message));
  } else {
    console.log(message);
  }
}

export function success(message) {
  if (_useColors) {
    console.log(chalk.green(message));
  } else {
    console.log(message);
  }
}

export function progress(message) {
  if (_useColors) {
    console.log(chalk.blue(message));
  } else {
    console.log(message);
  }
}

export function highlight(message) {
  if (_useColors) {
    console.log(chalk.magenta.bold(message));
  } else {
    console.log(message);
  }
}

export async function inputPrompt(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    const prompt = _useColors ? chalk.white.bold(message) : message;
    rl.question(prompt, resolve);
  });

  rl.close();
  return answer;
}

export function updateLoadingAnimation() {
  _loadingBarsIndex = (_loadingBarsIndex + 1) % _loadingBars.length;
  return _loadingBars[_loadingBarsIndex];
}

export function getLastChunkSize() {
  return _lastChunkSize;
}

function getTerminalWidth() {
  return process.stdout.columns || 80;
}

export function progressBar(
  current,
  total,
  barLength = 30,
  prefix = '',
  suffix = '',
  message = '',
  messageColor = null,
  isPrompt = false,
  isLoading = false,
  isSending = false,
  isThinking = false,
  chunkSize = 0
) {
  _lastProgress = {
    current,
    total,
    barLength,
    prefix,
    suffix,
    message,
    messageColor,
    isPrompt,
    isLoading,
    isSending,
    isThinking,
    chunkSize
  };

  _lastChunkSize = chunkSize;

  // Clear previous output
  if (_hasStarted) {
    const terminalWidth = getTerminalWidth();
    let linesToClear = 1; // Progress bar line

    // Calculate lines for each previous message
    for (const msg of _previousMessages) {
      const msgLength = msg.replace(/\x1b\[[0-9;]*m/g, '').length;
      linesToClear += Math.ceil(msgLength / terminalWidth);
    }

    // Move cursor up and clear lines
    for (let i = 0; i < linesToClear; i++) {
      process.stdout.write('\x1b[F\x1b[K');
    }
  }

  // Calculate progress with bounds checking
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.max(0, Math.min(current, safeTotal));
  const safeChunkSize = Math.max(0, chunkSize);
  
  const progressRatio = Math.min(1, Math.max(0, (safeCurrent + safeChunkSize) / safeTotal));
  const filledLength = Math.max(0, Math.min(barLength, Math.floor(barLength * progressRatio)));
  const percentage = Math.floor(100 * progressRatio);

  // Build the bar
  const filledCount = Math.max(0, filledLength);
  const emptyCount = Math.max(0, barLength - filledLength);
  const filledBar = _useColors ? chalk.green('█'.repeat(filledCount)) : '█'.repeat(filledCount);
  const emptyBar = '░'.repeat(emptyCount);
  const bar = filledBar + emptyBar;

  // Build status
  let status = '';
  if (isLoading) {
    status = ` ${updateLoadingAnimation()} Processing`;
  } else if (isThinking) {
    status = ' Thinking';
  } else if (isSending) {
    status = ' Sending batch ↑↑↑';
  }

  // Build the complete progress line
  const progressLine = `${prefix}|${bar}| ${percentage}% (${safeCurrent}/${safeTotal})${status}${suffix}`;
  process.stdout.write(progressLine + '\n');

  // Store and display messages
  if (message && !isPrompt) {
    if (!_previousMessages.includes(message)) {
      _previousMessages.push(message);
    }
  }

  // Display all messages
  for (const msg of _previousMessages) {
    process.stdout.write(msg + '\n');
  }

  _hasStarted = true;
}

// Progress bar with message functions
export function infoWithProgress(message) {
  if (_lastProgress) {
    progressBar(
      _lastProgress.current,
      _lastProgress.total,
      _lastProgress.barLength,
      _lastProgress.prefix,
      _lastProgress.suffix,
      _useColors ? chalk.cyan(message) : message,
      'cyan',
      false,
      _lastProgress.isLoading,
      _lastProgress.isSending,
      _lastProgress.isThinking,
      _lastProgress.chunkSize
    );
  }
}

export function warningWithProgress(message) {
  if (_lastProgress) {
    progressBar(
      _lastProgress.current,
      _lastProgress.total,
      _lastProgress.barLength,
      _lastProgress.prefix,
      _lastProgress.suffix,
      _useColors ? chalk.yellow(message) : message,
      'yellow',
      false,
      _lastProgress.isLoading,
      _lastProgress.isSending,
      _lastProgress.isThinking,
      _lastProgress.chunkSize
    );
  }
}

export function errorWithProgress(message) {
  if (_lastProgress) {
    progressBar(
      _lastProgress.current,
      _lastProgress.total,
      _lastProgress.barLength,
      _lastProgress.prefix,
      _lastProgress.suffix,
      _useColors ? chalk.red(message) : message,
      'red',
      false,
      _lastProgress.isLoading,
      _lastProgress.isSending,
      _lastProgress.isThinking,
      _lastProgress.chunkSize
    );
  }
}

export function successWithProgress(message) {
  if (_lastProgress) {
    progressBar(
      _lastProgress.current,
      _lastProgress.total,
      _lastProgress.barLength,
      _lastProgress.prefix,
      _lastProgress.suffix,
      _useColors ? chalk.green(message) : message,
      'green',
      false,
      _lastProgress.isLoading,
      _lastProgress.isSending,
      _lastProgress.isThinking,
      _lastProgress.chunkSize
    );
  }
}

export function highlightWithProgress(message) {
  if (_lastProgress) {
    progressBar(
      _lastProgress.current,
      _lastProgress.total,
      _lastProgress.barLength,
      _lastProgress.prefix,
      _lastProgress.suffix,
      _useColors ? chalk.magenta.bold(message) : message,
      'magenta',
      false,
      _lastProgress.isLoading,
      _lastProgress.isSending,
      _lastProgress.isThinking,
      _lastProgress.chunkSize
    );
  }
}

export async function inputPromptWithProgress(message) {
  if (_lastProgress) {
    progressBar(
      _lastProgress.current,
      _lastProgress.total,
      _lastProgress.barLength,
      _lastProgress.prefix,
      _lastProgress.suffix,
      _useColors ? chalk.white.bold(message) : message,
      null,
      true,
      _lastProgress.isLoading,
      _lastProgress.isSending,
      _lastProgress.isThinking,
      _lastProgress.chunkSize
    );
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('', resolve);
  });

  rl.close();

  // Clear the input line
  process.stdout.write('\x1b[F\x1b[K');

  return answer;
}

export function saveLogsToFile(logFilePath) {
  if (!_lastProgress || !_previousMessages.length) return;

  const logContent = [
    `Progress: ${_lastProgress.current}/${_lastProgress.total} (${Math.floor((_lastProgress.current / _lastProgress.total) * 100)}%)`,
    '',
    'Messages:',
    ..._previousMessages.map(msg => msg.replace(/\x1b\[[0-9;]*m/g, ''))
  ].join('\n');

  fs.writeFileSync(logFilePath, logContent, 'utf8');
}

export function saveThoughtsToFile(thoughts, filePath, retry) {
  _thoughtsList.push({ text: thoughts, retry });

  const stream = createWriteStream(filePath, { flags: 'a' });
  
  const batchNumber = retry > 0 
    ? `${_thoughtsList.length}.${retry}` 
    : _thoughtsList.length;
  
  const header = retry > 0
    ? `Batch ${batchNumber} thoughts (retry):`
    : `Batch ${batchNumber} thoughts:`;

  stream.write('\n' + '='.repeat(80) + '\n\n');
  stream.write(header + '\n\n');
  stream.write('='.repeat(80) + '\n\n');
  stream.write(thoughts + '\n');
  stream.write('\n');
  
  stream.end();
}