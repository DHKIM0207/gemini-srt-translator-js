# Gemini SRT Translator (Node.js)

Node.js 버전의 Gemini SRT Translator - Google Gemini AI를 사용하여 SRT 자막 파일을 번역하는 도구입니다.

## 특징

- ✨ Google Gemini AI를 사용한 고품질 번역
- 📝 SRT 포맷 보존 (타임스탬프 유지)
- 🔄 중단된 번역 재개 기능
- 🧠 "Thinking" 모드로 문맥 파악 향상 (Gemini 2.5 모델)
- 📦 배치 처리로 대용량 자막 지원
- 📊 실시간 진행률 표시
- 🔑 다중 API 키 지원으로 할당량 관리
- 🌈 컬러풀한 터미널 UI

## 설치

### npm으로 설치 (npm 퍼블리시 후)
```bash
# 글로벌 설치
npm install -g gemini-srt-translator

# 로컬 설치
npm install gemini-srt-translator
```

### GitHub에서 설치
```bash
# GitHub에서 직접 설치
npm install -g github:DHKIM0207/gemini-srt-translator-js

# 또는 git clone 후 설치
git clone https://github.com/DHKIM0207/gemini-srt-translator-js.git
cd gemini-srt-translator-js
npm install
npm link  # 전역 CLI 사용을 위해
```

## 사용법

### CLI 사용

#### 기본 번역
```bash
gemini-srt-translator translate -k YOUR_API_KEY -l Korean -i subtitle.srt
```

#### 모든 옵션 사용
```bash
gemini-srt-translator translate \
  -k YOUR_API_KEY \
  -k2 YOUR_BACKUP_KEY \
  -l Korean \
  -i subtitle.srt \
  -o subtitle_kr.srt \
  -s 100 \
  -d "Technical documentary about AI" \
  -m gemini-2.5-flash-preview-05-20 \
  -b 250 \
  --temperature 0.3 \
  --top-p 0.95 \
  --top-k 40 \
  --progress-log \
  --thoughts-log
```

#### 배치 번역
```bash
gemini-srt-translator batch -k YOUR_API_KEY -l Spanish -i "*.srt"
```

#### 사용 가능한 모델 확인
```bash
gemini-srt-translator listmodels -k YOUR_API_KEY
```

### 프로그래밍 방식 사용

```javascript
import gst from 'gemini-srt-translator';

// 기본 사용
gst.geminiApiKey = "YOUR_API_KEY";
gst.targetLanguage = "Korean";
gst.inputFile = "subtitle.srt";

await gst.translate();
```

#### 고급 사용
```javascript
import gst from 'gemini-srt-translator';

// 모든 옵션 설정
gst.geminiApiKey = "YOUR_API_KEY";
gst.geminiApiKey2 = "YOUR_BACKUP_KEY"; // 백업 API 키
gst.targetLanguage = "Korean";
gst.inputFile = "subtitle.srt";
gst.outputFile = "subtitle_kr.srt";
gst.startLine = 100; // 100번째 줄부터 시작
gst.description = "Technical documentary about AI";
gst.modelName = "gemini-2.5-flash-preview-05-20";
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

#### 클래스 직접 사용
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

## CLI 옵션

### translate 명령어
- `-k, --api-key <key>`: Gemini API 키 (필수)
- `-k2, --api-key2 <key>`: 백업 API 키
- `-l, --target-language <language>`: 대상 언어 (필수)
- `-i, --input <file>`: 입력 SRT 파일 (필수)
- `-o, --output <file>`: 출력 파일명
- `-s, --start-line <number>`: 시작 줄 번호
- `-d, --description <text>`: 번역 컨텍스트
- `-m, --model <name>`: Gemini 모델명
- `-b, --batch-size <number>`: 배치 크기
- `--temperature <number>`: 온도 (0.0-2.0)
- `--top-p <number>`: Top-p 샘플링 (0.0-1.0)
- `--top-k <number>`: Top-k 샘플링
- `--no-streaming`: 스트리밍 비활성화
- `--no-thinking`: Thinking 모드 비활성화
- `--thinking-budget <number>`: Thinking 토큰 예산
- `--pro-quota`: Pro 할당량 사용 (지연 없음)
- `--no-colors`: 컬러 출력 비활성화
- `--progress-log`: 진행 상황 로그 저장
- `--thoughts-log`: AI 사고 과정 로그 저장
- `--skip-upgrade`: 버전 업데이트 확인 건너뛰기

## 환경 변수

API 키를 환경 변수로 설정할 수 있습니다:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

## 진행 상황 저장 및 재개

번역이 중단되면 자동으로 진행 상황이 저장됩니다. 같은 명령을 다시 실행하면 중단된 지점부터 재개할 수 있습니다.

진행 상황은 입력 파일과 같은 디렉토리에 `.{filename}.progress` 파일로 저장됩니다.

## 지원 언어

Google Gemini AI가 지원하는 모든 언어로 번역할 수 있습니다. 예시:
- Korean (한국어)
- Japanese (日本語)
- Chinese (中文)
- Spanish (Español)
- French (Français)
- German (Deutsch)
- 그 외 100개 이상의 언어

## 주의사항

1. **API 키**: Google AI Studio에서 Gemini API 키를 발급받아야 합니다.
2. **할당량**: 무료 할당량 사용 시 요청 간 2초 지연이 있습니다. Pro 할당량은 `--pro-quota` 옵션으로 사용할 수 있습니다.
3. **파일 크기**: 대용량 파일은 배치로 나누어 처리됩니다. 기본 배치 크기는 300개 자막입니다.
4. **토큰 제한**: 모델의 토큰 제한에 주의하세요. 필요시 배치 크기를 조정하세요.

## 문제 해결

### API 키 오류
```bash
export GEMINI_API_KEY="your_actual_api_key"
```

### 할당량 초과
- 백업 API 키 사용: `-k2` 옵션
- 배치 크기 줄이기: `-b 100`
- Pro 할당량 사용: `--pro-quota`

### 메모리 부족
- 배치 크기 줄이기
- 스트리밍 모드 사용 (기본값)

## Credits

This is a Node.js port of the original Python [gemini-srt-translator](https://github.com/MaKTaiL/gemini-srt-translator) by [Matheus Castro](mailto:matheuscastro@gmail.com).

## 라이선스

MIT License

## 기여

이슈 및 PR은 언제나 환영합니다!

## 원본 프로젝트

이 프로젝트는 [Python 버전](https://github.com/MaKTaiL/gemini-srt-translator)의 Node.js 포팅입니다.