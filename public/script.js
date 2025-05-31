// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const apiKey2Input = document.getElementById('apiKey2');
const targetLanguageSelect = document.getElementById('targetLanguage');
const languageSearch = document.getElementById('languageSearch');
const languageDropdown = document.getElementById('languageDropdown');
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

// 지원 언어 목록
const languages = [
    { native: '한국어', english: 'Korean', code: 'Korean' },
    { native: 'English', english: 'English', code: 'English' },
    { native: '日本語', english: 'Japanese', code: 'Japanese' },
    { native: '中文', english: 'Chinese', code: 'Chinese' },
    { native: 'Español', english: 'Spanish', code: 'Spanish' },
    { native: 'Français', english: 'French', code: 'French' },
    { native: 'Deutsch', english: 'German', code: 'German' },
    { native: 'Italiano', english: 'Italian', code: 'Italian' },
    { native: 'Português', english: 'Portuguese', code: 'Portuguese' },
    { native: 'Русский', english: 'Russian', code: 'Russian' },
    { native: 'العربية', english: 'Arabic', code: 'Arabic' },
    { native: 'हिन्दी', english: 'Hindi', code: 'Hindi' },
    { native: 'Türkçe', english: 'Turkish', code: 'Turkish' },
    { native: 'Polski', english: 'Polish', code: 'Polish' },
    { native: 'Nederlands', english: 'Dutch', code: 'Dutch' },
    { native: 'Svenska', english: 'Swedish', code: 'Swedish' },
    { native: 'Norsk', english: 'Norwegian', code: 'Norwegian' },
    { native: 'Dansk', english: 'Danish', code: 'Danish' },
    { native: 'Suomi', english: 'Finnish', code: 'Finnish' },
    { native: 'Ελληνικά', english: 'Greek', code: 'Greek' },
    { native: 'Čeština', english: 'Czech', code: 'Czech' },
    { native: 'Magyar', english: 'Hungarian', code: 'Hungarian' },
    { native: 'Română', english: 'Romanian', code: 'Romanian' },
    { native: 'Български', english: 'Bulgarian', code: 'Bulgarian' },
    { native: 'Hrvatski', english: 'Croatian', code: 'Croatian' },
    { native: 'Slovenčina', english: 'Slovak', code: 'Slovak' },
    { native: 'Slovenščina', english: 'Slovenian', code: 'Slovenian' },
    { native: 'Lietuvių', english: 'Lithuanian', code: 'Lithuanian' },
    { native: 'Latviešu', english: 'Latvian', code: 'Latvian' },
    { native: 'Eesti', english: 'Estonian', code: 'Estonian' },
    { native: 'Српски', english: 'Serbian', code: 'Serbian' },
    { native: 'Українська', english: 'Ukrainian', code: 'Ukrainian' },
    { native: 'עברית', english: 'Hebrew', code: 'Hebrew' },
    { native: 'فارسی', english: 'Persian', code: 'Persian' },
    { native: 'اردو', english: 'Urdu', code: 'Urdu' },
    { native: 'বাংলা', english: 'Bengali', code: 'Bengali' },
    { native: 'தமிழ்', english: 'Tamil', code: 'Tamil' },
    { native: 'తెలుగు', english: 'Telugu', code: 'Telugu' },
    { native: 'मराठी', english: 'Marathi', code: 'Marathi' },
    { native: 'ગુજરાતી', english: 'Gujarati', code: 'Gujarati' },
    { native: 'ಕನ್ನಡ', english: 'Kannada', code: 'Kannada' },
    { native: 'മലയാളം', english: 'Malayalam', code: 'Malayalam' },
    { native: 'ਪੰਜਾਬੀ', english: 'Punjabi', code: 'Punjabi' },
    { native: 'ไทย', english: 'Thai', code: 'Thai' },
    { native: 'Tiếng Việt', english: 'Vietnamese', code: 'Vietnamese' },
    { native: 'Bahasa Indonesia', english: 'Indonesian', code: 'Indonesian' },
    { native: 'Bahasa Melayu', english: 'Malay', code: 'Malay' },
    { native: 'Filipino', english: 'Filipino', code: 'Filipino' },
    { native: 'မြန်မာဘာသာ', english: 'Burmese', code: 'Burmese' },
    { native: 'ភាសាខ្មែរ', english: 'Khmer', code: 'Khmer' },
    { native: 'ລາວ', english: 'Lao', code: 'Lao' },
    { native: 'ქართული', english: 'Georgian', code: 'Georgian' },
    { native: 'Հայերեն', english: 'Armenian', code: 'Armenian' },
    { native: 'Azərbaycan', english: 'Azerbaijani', code: 'Azerbaijani' },
    { native: 'Қазақ', english: 'Kazakh', code: 'Kazakh' },
    { native: 'Кыргыз', english: 'Kyrgyz', code: 'Kyrgyz' },
    { native: 'Тоҷикӣ', english: 'Tajik', code: 'Tajik' },
    { native: 'Türkmen', english: 'Turkmen', code: 'Turkmen' },
    { native: 'O\'zbek', english: 'Uzbek', code: 'Uzbek' },
    { native: 'नेपाली', english: 'Nepali', code: 'Nepali' },
    { native: 'සිංහල', english: 'Sinhala', code: 'Sinhala' },
    { native: 'አማርኛ', english: 'Amharic', code: 'Amharic' },
    { native: 'Kiswahili', english: 'Swahili', code: 'Swahili' },
    { native: 'Afrikaans', english: 'Afrikaans', code: 'Afrikaans' },
    { native: 'isiZulu', english: 'Zulu', code: 'Zulu' },
    { native: 'isiXhosa', english: 'Xhosa', code: 'Xhosa' },
    { native: 'Yorùbá', english: 'Yoruba', code: 'Yoruba' },
    { native: 'Igbo', english: 'Igbo', code: 'Igbo' },
    { native: 'Hausa', english: 'Hausa', code: 'Hausa' },
    { native: 'Català', english: 'Catalan', code: 'Catalan' },
    { native: 'Euskera', english: 'Basque', code: 'Basque' },
    { native: 'Galego', english: 'Galician', code: 'Galician' },
    { native: 'Íslenska', english: 'Icelandic', code: 'Icelandic' },
    { native: 'Gaeilge', english: 'Irish', code: 'Irish' },
    { native: 'Cymraeg', english: 'Welsh', code: 'Welsh' },
    { native: 'Gàidhlig', english: 'Scottish Gaelic', code: 'Scottish Gaelic' },
    { native: 'Malti', english: 'Maltese', code: 'Maltese' },
    { native: 'Shqip', english: 'Albanian', code: 'Albanian' },
    { native: 'Македонски', english: 'Macedonian', code: 'Macedonian' },
    { native: 'Bosanski', english: 'Bosnian', code: 'Bosnian' },
    { native: 'Беларуская', english: 'Belarusian', code: 'Belarusian' },
    { native: 'Монгол', english: 'Mongolian', code: 'Mongolian' },
    { native: 'မြန်မာ', english: 'Myanmar', code: 'Myanmar' },
    { native: 'Esperanto', english: 'Esperanto', code: 'Esperanto' },
    { native: 'Latina', english: 'Latin', code: 'Latin' }
];

let selectedLanguage = 'Korean'; // 기본값 한국어

let selectedFile = null;
let translatedContent = null;

// 언어 검색 기능 초기화
function initLanguageSelector() {
    // 한국어를 기본값으로 설정
    languageSearch.value = '한국어 (Korean)';
    targetLanguageSelect.value = 'Korean';
    
    // 언어 검색 입력 이벤트
    languageSearch.addEventListener('input', handleLanguageSearch);
    languageSearch.addEventListener('focus', showAllLanguages);
    languageSearch.addEventListener('blur', (e) => {
        // 드롭다운 클릭 시 blur 이벤트 지연
        setTimeout(() => {
            if (!languageDropdown.contains(document.activeElement)) {
                languageDropdown.style.display = 'none';
            }
        }, 200);
    });
}

// 언어 검색 처리
function handleLanguageSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredLanguages = languages.filter(lang => 
        lang.native.toLowerCase().includes(searchTerm) ||
        lang.english.toLowerCase().includes(searchTerm)
    );
    showLanguages(filteredLanguages);
}

// 모든 언어 표시
function showAllLanguages() {
    showLanguages(languages);
}

// 언어 목록 표시
function showLanguages(languageList) {
    languageDropdown.innerHTML = '';
    languageDropdown.style.display = languageList.length > 0 ? 'block' : 'none';
    
    languageList.forEach(lang => {
        const option = document.createElement('div');
        option.className = 'language-option';
        if (lang.code === selectedLanguage) {
            option.classList.add('selected');
        }
        
        option.innerHTML = `
            <span class="language-native">${lang.native}</span>
            <span class="language-english">(${lang.english})</span>
        `;
        
        option.addEventListener('click', () => selectLanguage(lang));
        languageDropdown.appendChild(option);
    });
}

// 언어 선택
function selectLanguage(language) {
    selectedLanguage = language.code;
    languageSearch.value = `${language.native} (${language.english})`;
    targetLanguageSelect.value = language.code;
    languageDropdown.style.display = 'none';
    updateTranslateButton();
}

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
    const hasLanguage = selectedLanguage !== '';
    const hasFile = selectedFile !== null;
    
    translateBtn.disabled = !(hasApiKey && hasLanguage && hasFile);
}

apiKeyInput.addEventListener('input', updateTranslateButton);

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
    // 언어 선택기 초기화
    initLanguageSelector();
    
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