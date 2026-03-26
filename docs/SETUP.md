# Development Setup

## Prerequisites

- Node.js 18+
- npm 9+

## Local Development

### 1. Clone

```bash
git clone https://github.com/joheeyong/recipe-web.git
cd recipe-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

`.env` 파일 생성 (`.env.example` 참고):

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
```

> `VITE_` prefix가 필수입니다. Vite에서 `import.meta.env.VITE_*`로 접근.

### 4. Run Dev Server

```bash
npm run dev
```

`http://localhost:3000`에서 시작. Vite HMR로 코드 변경 시 즉시 반영.

로컬에서 API 호출은 Vite proxy가 `localhost:8081`로 전달 (`vite.config.js`).

### 5. Build

```bash
npm run build
# → dist/ 디렉토리에 빌드 결과물 생성
```

### 6. Preview (Production Build)

```bash
npm run preview
```

## Deployment (Vercel)

### Auto Deploy

`main` 브랜치에 push 시 Vercel에서 자동 빌드 + 배포.

### Vercel Environment Variables

Vercel Dashboard > Settings > Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `http://54.180.179.231:8081` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `VITE_NAVER_CLIENT_ID` | Naver OAuth Client ID |
| `VITE_KAKAO_CLIENT_ID` | Kakao REST API Key |

### Vercel Config

`vercel.json`:
- API 요청(`/api/*`)은 EC2 백엔드로 프록시
- 파일 업로드(`/uploads/*`)도 EC2로 프록시
- SPA fallback: 나머지 경로 → `/index.html`

### Production URLs

- **Site**: https://recipe-web-rosy.vercel.app
- **API Proxy**: https://recipe-web-rosy.vercel.app/api/*

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 개발 서버 (port 3000, HMR) |
| `npm run build` | 프로덕션 빌드 (→ dist/) |
| `npm run preview` | 빌드 결과물 미리보기 |

## Project Structure

```
recipe-web/
├── docs/
│   ├── ARCHITECTURE.md         # 아키텍처 문서
│   └── SETUP.md                # 이 파일
├── index.html                  # HTML 엔트리포인트 (Vite)
├── vite.config.js              # Vite 설정 (proxy, alias)
├── vercel.json                 # Vercel 배포 설정
├── package.json                # 의존성 + 스크립트
├── .env                        # 환경변수 (gitignore)
├── .env.example                # 환경변수 템플릿
└── src/                        # 소스 코드
    ├── index.jsx               # 앱 엔트리 (React, Redux, Query, Router)
    ├── App.jsx                 # 라우트 정의
    ├── store.js                # Redux store
    ├── index.css               # 글로벌 스타일 + CSS 변수
    ├── core/api/               # API 클라이언트
    ├── features/               # 기능별 모듈 (auth, home, recipe, ...)
    └── shared/components/      # 공유 컴포넌트 (RecipeCard, BottomNav)
```
