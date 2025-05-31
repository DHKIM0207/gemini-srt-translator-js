# Gemini SRT Translator - Web UI

Google Gemini AI를 사용하여 SRT 자막 파일을 번역하는 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 1. 프로젝트 클론
```bash
git clone https://github.com/DHKIM0207/gemini-srt-translator-js.git
cd gemini-srt-translator-js
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 웹 서버 실행
```bash
npm run ui
```

### 4. 브라우저에서 열기
http://localhost:3000 으로 접속하세요.

## 📸 스크린샷

<img width="600" alt="Gemini SRT Translator UI" src="https://github.com/DHKIM0207/gemini-srt-translator-js/assets/38580573/screenshot-placeholder">

## ✨ 주요 기능

- 🌐 **웹 인터페이스**: 브라우저에서 쉽게 사용
- 📁 **드래그 앤 드롭**: SRT 파일을 드래그해서 업로드
- 🔄 **실시간 진행률**: 번역 진행 상황을 실시간으로 확인
- 💾 **즉시 다운로드**: 번역 완료 후 바로 다운로드
- 👁️ **미리보기**: 번역된 내용을 다운로드 전에 확인

## 🛠️ 설정

### Gemini API 키 받기

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. "Create API Key" 클릭
3. 생성된 API 키 복사

### 웹 UI 사용법

1. **API 키 입력**: Gemini API 키를 입력란에 붙여넣기
2. **언어 선택**: 번역하고 싶은 대상 언어 선택
3. **파일 업로드**: SRT 파일을 드래그 앤 드롭 또는 클릭해서 선택
4. **번역 시작**: "번역 시작" 버튼 클릭
5. **다운로드**: 번역 완료 후 파일 다운로드

## 🎯 지원 언어

- 한국어 (Korean)
- 영어 (English)
- 일본어 (Japanese)
- 중국어 (Chinese)
- 스페인어 (Spanish)
- 프랑스어 (French)
- 독일어 (German)
- 이탈리아어 (Italian)
- 포르투갈어 (Portuguese)
- 러시아어 (Russian)
- 아랍어 (Arabic)
- 힌디어 (Hindi)
- 그 외 100개 이상의 언어

## 🤖 사용 가능한 모델

- **Gemini 2.0 Flash** (기본값) - 최신 고속 모델
- **Gemini 1.5 Flash** - 빠르고 효율적
- **Gemini 1.5 Pro** - 더 정확한 번역
- **Gemini 2.5 모델들** - Thinking 기능 포함 (고급 문맥 이해)

## ⚙️ 고급 설정

### 배치 크기
한 번에 처리할 자막 개수를 조절할 수 있습니다. (기본값: 30)

### Temperature
번역의 창의성을 조절합니다. (0-2, 낮을수록 일관성 있음)

### 스트리밍 모드
실시간으로 번역 결과를 받아볼 수 있습니다.

### Thinking 모드
Gemini 2.5 모델에서 사용 가능한 고급 문맥 이해 기능입니다.

## 🐛 문제 해결

### 서버가 시작되지 않을 때
```bash
# 포트 확인
lsof -i :3000
# 다른 포트로 실행
PORT=3001 npm run ui
```

### API 키 오류
- API 키가 올바른지 확인
- [Google AI Studio](https://makersuite.google.com/app/apikey)에서 키 상태 확인

### 파일 업로드 실패
- SRT 파일 형식이 올바른지 확인
- 파일 크기가 너무 크지 않은지 확인

## 📄 라이선스

MIT License

## 🙏 크레딧

원본 Python 버전: [gemini-srt-translator](https://github.com/MaKTaiL/gemini-srt-translator) by Matheus Castro

---

💡 **도움이 필요하신가요?** [이슈](https://github.com/DHKIM0207/gemini-srt-translator-js/issues)를 생성해주세요!