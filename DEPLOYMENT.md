# 배포 가이드

## 환경 변수 설정

각 플랫폼에서 다음 환경 변수를 설정하세요:

```
PORT=3000
NODE_ENV=production
```

## 무료 호스팅 비교

| 서비스 | 장점 | 단점 | 추천도 |
|--------|------|------|--------|
| Vercel | 빠른 속도, 간편한 배포 | 서버리스 제한 | ⭐⭐⭐⭐⭐ |
| Render | Express 완벽 지원 | 무료 플랜 슬립 모드 | ⭐⭐⭐⭐ |
| Railway | 매우 쉬운 설정 | 월 500시간 제한 | ⭐⭐⭐⭐ |
| Glitch | 온라인 에디터 | 성능 제한 | ⭐⭐⭐ |

## 커스텀 도메인 설정

### Vercel
1. 프로젝트 설정 → Domains
2. 도메인 추가
3. DNS 레코드 추가:
   - Type: CNAME
   - Name: translate (또는 원하는 서브도메인)
   - Value: cname.vercel-dns.com

### Render
1. Settings → Custom Domains
2. 도메인 추가
3. DNS 레코드 추가:
   - Type: CNAME
   - Name: translate
   - Value: [your-app].onrender.com

### Railway
1. Settings → Domains
2. Custom domain 추가
3. 제공된 CNAME 레코드 추가

## 주의사항

1. **파일 크기 제한**: 대부분의 무료 호스팅은 요청 크기에 제한이 있습니다 (보통 5-10MB)
2. **실행 시간 제한**: Vercel은 5분, Render/Railway는 더 긴 시간 허용
3. **월 사용량**: 무료 플랜은 월별 제한이 있으므로 모니터링 필요

## 배포 후 테스트

```bash
curl -X POST https://your-domain.com/api/translate \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.srt" \
  -F "apiKey=YOUR_API_KEY" \
  -F "targetLanguage=Korean"
```