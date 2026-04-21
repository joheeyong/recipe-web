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

### Environment Variables

**중요:** Vercel 대시보드에 `VITE_API_BASE_URL`을 설정하지 않거나 비워두세요.
`vercel.json`의 rewrite 규칙이 `/api/*` 요청을 EC2로 프록시합니다.
(`.env.production`에 `VITE_API_BASE_URL=` 빈 값으로 설정되어 있음)

| Variable | Value |
|----------|-------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `VITE_NAVER_CLIENT_ID` | Naver OAuth Client ID |
| `VITE_KAKAO_CLIENT_ID` | Kakao REST API Key |

### Vercel Config

`vercel.json`:
- `/api/*` → `http://54.180.179.231:8081/api/*` (EC2 프록시)
- `/uploads/*` → `http://54.180.179.231:8081/uploads/*` (파일 프록시)
- 나머지 경로 → `/index.html` (SPA fallback)

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
├── index.html                  # HTML 엔트리포인트 (다크모드 flash 방지 인라인 스크립트 포함)
├── vite.config.js              # Vite 설정 (proxy, alias)
├── vercel.json                 # Vercel 배포 설정 (API 프록시 + SPA 라우팅)
├── middleware.js               # Vercel Edge Middleware (OG 태그 동적 삽입)
├── package.json                # 의존성 + 스크립트
├── .env                        # 환경변수 로컬 (gitignore)
├── .env.example                # 환경변수 템플릿
├── .env.production             # 빌드 타임 환경변수 (VITE_API_BASE_URL 빈 값)
└── src/
    ├── index.jsx               # 앱 엔트리 (React, Redux, Query, Router)
    ├── App.jsx                 # 라우트 정의
    ├── store.js                # Redux store
    ├── index.css               # 글로벌 스타일 + CSS 변수 + 다크모드
    ├── core/api/
    │   └── apiClient.js        # fetch 래퍼 (JWT, multipart 지원)
    ├── hooks/
    │   ├── useTheme.js         # 다크/라이트 모드
    │   └── useNotifications.js # 알림 폴링 (30초)
    ├── features/
    │   ├── auth/               # 로그인, OAuth 콜백, Redux slice
    │   ├── home/               # 홈, 레시피 API
    │   ├── recipe/             # 레시피 상세/목록
    │   ├── myrecipe/           # 유저 레시피 등록/수정
    │   ├── bookmark/           # 북마크, 컬렉션
    │   ├── blog/               # 블로그 작성/상세
    │   ├── profile/            # 프로필 페이지
    │   ├── notifications/      # 알림 목록
    │   └── onboarding/         # 입맛 설정
    └── shared/components/
        ├── RecipeCard.jsx      # 레시피 카드
        ├── RecipeCardSkeleton.jsx  # 스켈레톤 로딩 카드
        └── BottomNav.jsx       # 하단 네비게이션 (알림 뱃지)
```
