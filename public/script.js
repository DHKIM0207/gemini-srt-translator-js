// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const apiKey2Input = document.getElementById('apiKey2');
const targetLanguageSelect = document.getElementById('targetLanguage');
const modelSelect = document.getElementById('model');
const descriptionTextarea = document.getElementById('description');
const batchSizeInput = document.getElementById('batchSize');
const temperatureInput = document.getElementById('temperature');
const topPInput = document.getElementById('topP');
const topKInput = document.getElementById('topK');
const streamingCheckbox = document.getElementById('streaming');
const thinkingCheckbox = document.getElementById('thinking');
const thinkingBudgetInput = document.getElementById('thinkingBudget');
const thinkingBudgetGroup = document.getElementById('thinkingBudgetGroup');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const translateBtn = document.getElementById('translateBtn');
const progressArea = document.getElementById('progressArea');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressStatus = document.getElementById('progressStatus');
const resultArea = document.getElementById('resultArea');
const downloadBtn = document.getElementById('downloadBtn');
const previewBtn = document.getElementById('previewBtn');
const previewContent = document.getElementById('previewContent');
const errorArea = document.getElementById('errorArea');
const errorMessage = document.getElementById('errorMessage');

let selectedFile = null;
let translatedContent = null;

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
translateBtn.addEventListener('click', handleTranslate);
downloadBtn.addEventListener('click', handleDownload);
previewBtn.addEventListener('click', handlePreview);
thinkingCheckbox.addEventListener('change', handleThinkingToggle);

// Enable/disable translate button based on requirements
function updateTranslateButton() {
    const hasApiKey = apiKeyInput.value.trim() !== '';
    const hasLanguage = targetLanguageSelect.value !== '';
    const hasFile = selectedFile !== null;
    
    translateBtn.disabled = !(hasApiKey && hasLanguage && hasFile);
}

apiKeyInput.addEventListener('input', updateTranslateButton);
targetLanguageSelect.addEventListener('change', updateTranslateButton);

// File handling
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.srt')) {
            selectedFile = file;
            updateFileInfo();
        } else {
            showError('SRT 파일만 업로드할 수 있습니다.');
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        updateFileInfo();
    }
}

function updateFileInfo() {
    if (selectedFile) {
        fileInfo.textContent = `선택된 파일: ${selectedFile.name} (${formatFileSize(selectedFile.size)})`;
        updateTranslateButton();
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Thinking mode toggle
function handleThinkingToggle() {
    thinkingBudgetGroup.style.display = thinkingCheckbox.checked ? 'block' : 'none';
}

// Translation
async function handleTranslate() {
    if (!selectedFile) return;
    
    // Reset UI
    hideError();
    resultArea.style.display = 'none';
    progressArea.style.display = 'block';
    translateBtn.disabled = true;
    
    // Show loading state
    translateBtn.querySelector('.btn-text').style.display = 'none';
    translateBtn.querySelector('.btn-loading').style.display = 'flex';
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('apiKey', apiKeyInput.value);
    formData.append('apiKey2', apiKey2Input.value);
    formData.append('targetLanguage', targetLanguageSelect.value);
    formData.append('model', modelSelect.value);
    formData.append('batchSize', batchSizeInput.value);
    formData.append('streaming', streamingCheckbox.checked);
    formData.append('thinking', thinkingCheckbox.checked);
    formData.append('thinkingBudget', thinkingBudgetInput.value);
    formData.append('temperature', temperatureInput.value);
    formData.append('topP', topPInput.value);
    formData.append('topK', topKInput.value);
    formData.append('description', descriptionTextarea.value);
    
    try {
        // Start translation and get ID
        const response = await fetch('/api/translate', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '번역 중 오류가 발생했습니다.');
        }
        
        const { translationId } = await response.json();
        
        // Connect to SSE for progress updates
        const eventSource = new EventSource(`/api/translate/progress/${translationId}`);
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'progress':
                    progressStatus.textContent = `${data.current}/${data.total}`;
                    const progressText = data.message || `Processing batch...`;
                    updateProgress(data.percentage, progressText);
                    break;
                    
                case 'success':
                    console.log(data.message);
                    progressText.textContent = data.message;
                    break;
                    
                case 'complete':
                    eventSource.close();
                    translatedContent = data.translatedContent;
                    updateProgress(100, '번역 완료!');
                    
                    // Show result
                    setTimeout(() => {
                        progressArea.style.display = 'none';
                        resultArea.style.display = 'block';
                    }, 1000);
                    break;
                    
                case 'error':
                    eventSource.close();
                    throw new Error(data.message);
            }
        };
        
        eventSource.onerror = (error) => {
            eventSource.close();
            showError('연결이 끊어졌습니다. 다시 시도해주세요.');
            progressArea.style.display = 'none';
        };
        
    } catch (error) {
        showError(error.message);
        progressArea.style.display = 'none';
    } finally {
        // Reset button
        translateBtn.disabled = false;
        translateBtn.querySelector('.btn-text').style.display = 'inline';
        translateBtn.querySelector('.btn-loading').style.display = 'none';
        updateTranslateButton();
    }
}

function updateProgress(percent, text) {
    progressFill.style.width = percent + '%';
    progressFill.setAttribute('data-percent', percent + '%');
    progressText.textContent = text;
}

// Download translated file
function handleDownload() {
    if (!translatedContent) return;
    
    const blob = new Blob([translatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const originalName = selectedFile.name.replace('.srt', '');
    a.href = url;
    a.download = `${originalName}_${targetLanguageSelect.value}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Preview translated content
function handlePreview() {
    if (!translatedContent) return;
    
    const isVisible = previewContent.style.display !== 'none';
    if (isVisible) {
        previewContent.style.display = 'none';
        previewBtn.textContent = '미리보기';
    } else {
        // Show first 50 subtitles as preview
        const lines = translatedContent.split('\n');
        const previewLines = lines.slice(0, 150);
        if (lines.length > 150) {
            previewLines.push('...\n[전체 내용은 다운로드하여 확인하세요]');
        }
        previewContent.textContent = previewLines.join('\n');
        previewContent.style.display = 'block';
        previewBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            미리보기 닫기
        `;
    }
}

// Error handling
function showError(message) {
    errorMessage.textContent = message;
    errorArea.style.display = 'block';
}

function hideError() {
    errorArea.style.display = 'none';
}

// Load available models on page load
window.addEventListener('load', async () => {
    // You can optionally load models dynamically if API key is saved in localStorage
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        updateTranslateButton();
    }
});

// Save API key to localStorage when changed
apiKeyInput.addEventListener('change', () => {
    if (apiKeyInput.value) {
        localStorage.setItem('geminiApiKey', apiKeyInput.value);
    }
});