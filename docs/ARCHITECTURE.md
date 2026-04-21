# Frontend Architecture

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| UI Library | React | 19.2 |
| Build Tool | Vite | 8.0 |
| State (Server) | TanStack Query | 5.x |
| State (Client) | Redux Toolkit | 2.11 |
| Routing | React Router | 7.13 |
| Styling | Plain CSS + CSS Custom Properties | - |
| Language | JavaScript (JSX) | ES2022 |
| Deployment | Vercel | - |

## Project Structure

**Feature-based 아키텍처:**

```
src/
├── core/                          # 공통 인프라
│   └── api/
│       └── apiClient.js           # fetch 래퍼 (JWT 자동 첨부, 401 리다이렉트)
│
├── features/                      # 기능별 모듈
│   ├── auth/                      # 인증
│   │   ├── api/authApi.js         # OAuth API 호출
│   │   ├── slice/authSlice.js     # Redux 슬라이스 (token, user)
│   │   └── pages/
│   │       ├── LoginPage.jsx      # 소셜 로그인 UI
│   │       └── OAuthCallbackPage.jsx  # OAuth 콜백 처리
│   │
│   ├── home/                      # 홈
│   │   ├── api/recipeApi.js       # 레시피 API (list, detail, search, recommendations)
│   │   ├── api/mealApi.js         # 식사 계획 API
│   │   └── pages/HomePage.jsx     # 메인 홈 (추천 + 카테고리/난이도/칼로리 필터 + 무한 스크롤)
│   │
│   ├── recipe/                    # 레시피 상세/목록
│   │   └── pages/
│   │       ├── RecipeDetailPage.jsx   # 상세 (재료, 조리법, 입맛 조정, 북마크, 리뷰+사진, 블로그)
│   │       └── RecipeListPage.jsx     # 검색 결과 목록
│   │
│   ├── myrecipe/                  # 유저 레시피
│   │   └── pages/
│   │       ├── MyRecipesPage.jsx      # 내 레시피 목록 (등록/수정일 표시)
│   │       └── MyRecipeWritePage.jsx  # 레시피 등록 + 수정 폼
│   │
│   ├── bookmark/                  # 북마크
│   │   └── pages/
│   │       ├── BookmarksPage.jsx      # 저장한 레시피 + 컬렉션
│   │       ├── AllBookmarksPage.jsx   # 전체 북마크 목록
│   │       └── CollectionDetailPage.jsx  # 컬렉션 상세
│   │
│   ├── blog/                      # 블로그
│   │   └── pages/
│   │       ├── BlogWritePage.jsx      # 블로그 글 작성 (이미지/동영상 첨부)
│   │       └── BlogDetailPage.jsx     # 블로그 글 상세
│   │
│   ├── profile/                   # 마이페이지
│   │   └── pages/ProfilePage.jsx      # 프로필, 알림/설정 링크
│   │
│   ├── notifications/             # 알림
│   │   └── pages/NotificationsPage.jsx  # 알림 목록 (읽음 처리, 삭제)
│   │
│   └── onboarding/                # 온보딩
│       └── pages/TasteProfilePage.jsx # 입맛 설정 (슬라이더 + 카테고리)
│
├── shared/                        # 공유 컴포넌트
│   └── components/
│       ├── RecipeCard.jsx         # 레시피 카드 (이미지, 제목, 메타)
│       ├── RecipeCardSkeleton.jsx # 스켈레톤 로딩 카드 (shimmer 애니메이션)
│       └── BottomNav.jsx          # 하단 네비게이션 바 (알림 뱃지 포함)
│
├── hooks/                         # 커스텀 훅
│   ├── useTheme.js                # 다크/라이트 모드 토글 (localStorage 영속화)
│   └── useNotifications.js       # 알림 폴링 훅 (30초 간격)
│
├── App.jsx                        # 라우트 정의 + 레이아웃
├── index.jsx                      # 엔트리포인트 (QueryClient, Redux, Router)
├── store.js                       # Redux store 설정
└── index.css                      # 글로벌 스타일 + CSS 변수 + 다크모드
```

## State Management

### Server State: TanStack Query
API에서 가져오는 데이터는 `useQuery` / `useInfiniteQuery` / `useMutation`으로 관리.

```jsx
// 무한 스크롤 (HomePage)
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['recipes', activeFilter],
  queryFn: ({ pageParam = 0 }) => recipeApi.list({ page: pageParam, size: 12, ...activeFilter }),
  getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
});

// 일반 쿼리 (자동 캐싱 5분)
const { data, isLoading } = useQuery({
  queryKey: ['recipes', activeFilter],
  queryFn: () => recipeApi.list(params),
});
```

- **캐시 키**: 쿼리 파라미터를 포함하여 자동 무효화
- **staleTime**: 5분 (동일 데이터 재요청 방지)
- **Mutations**: 북마크 토글 시 `useMutation` + optimistic update

### Client State: Redux Toolkit
인증 상태만 Redux로 관리 (토큰, 사용자 정보).

```
store.auth = { user, token, loading }
```

- `localStorage`에 토큰 영속화
- OAuth 콜백 시 토큰 저장 → `fetchMe()`로 사용자 정보 로드
- 401 응답 시 자동 로그아웃 + 리다이렉트

## Routing

| Path | Component | Auth | Bottom Nav |
|------|-----------|------|------------|
| `/` | HomePage | - | O |
| `/login` | LoginPage | - | O |
| `/auth/:provider/callback` | OAuthCallbackPage | - | X |
| `/onboarding` | TasteProfilePage | Required | X |
| `/recipes` | RecipeListPage | - | O |
| `/recipes/:id` | RecipeDetailPage | - | X |
| `/my-recipes` | MyRecipesPage | - | O |
| `/my-recipes/write` | MyRecipeWritePage | Required | X |
| `/my-recipes/edit/:id` | MyRecipeWritePage | Required | X |
| `/blog/write` | BlogWritePage | Required | X |
| `/blog/:id` | BlogDetailPage | - | X |
| `/bookmarks` | BookmarksPage | Required | O |
| `/bookmarks/all` | AllBookmarksPage | - | X |
| `/collections/:id` | CollectionDetailPage | - | X |
| `/profile` | ProfilePage | Required | O |
| `/notifications` | NotificationsPage | Required | X |

## API Client

`src/core/api/apiClient.js`: fetch 기반 래퍼.

- `Authorization: Bearer <token>` 자동 첨부
- 401 응답 시 토큰 삭제 + `/login` 리다이렉트
- `get()`, `post()`, `postForm()`, `put()`, `del()` 메서드
- `postForm()`: multipart/form-data (이미지 업로드)

## Custom Hooks

### useTheme
다크/라이트 모드 관리.
- `localStorage`에 테마 영속화
- `document.documentElement`에 `data-theme` 속성 적용
- flash 방지: `index.html`에 인라인 스크립트로 초기 테마 즉시 적용

### useNotifications
알림 미읽음 수 폴링.
- 30초마다 `/api/notifications/unread-count` 호출
- 비로그인 시 폴링 중지
- BottomNav 뱃지, ProfilePage 뱃지에 공유

## Styling

**CSS Custom Properties (CSS Variables):**

```css
:root {
  --bg-primary: #fafafa;
  --accent: #ff6b35;
  --text-primary: #1a1a2e;
  --accent-light: rgba(255, 107, 53, 0.08);
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #0f0f1a;
  /* ... */
}
```

- 각 feature별 `.css` 파일 (BEM-like 네이밍)
- 다크모드 지원 (`data-theme` 속성, useTheme 훅)
- 모바일 퍼스트 반응형 (480px, 768px 브레이크포인트)

## Key Features

### 무한 스크롤 (HomePage)
`IntersectionObserver` + `useInfiniteQuery` 조합. 페이지 하단 sentinel 요소가 뷰포트에 진입하면 다음 페이지 로드. 서버 `Page.last == true`이면 중단.

### 스크롤 위치 복원
뒤로가기 시 목록 스크롤 위치 유지.
- 페이지 이탈 시 `sessionStorage`에 `scrollY` 저장
- `useNavigationType() === 'POP'`일 때만 복원 (신규 진입 시 복원 안 함)
- `requestAnimationFrame`으로 DOM 렌더 후 복원

### URL 상태 유지
카테고리/정렬/필터를 URL query param으로 관리 (`useSearchParams`).
새로고침, 공유, 뒤로가기 모두 필터 상태 유지.

### 스켈레톤 로딩
초기 로딩 시 스피너 대신 `RecipeCardSkeleton` shimmer 카드 표시.

### 리뷰 이미지
리뷰 작성 시 사진 첨부 가능 (multipart). 상세 페이지에서 사진 탭 시 전체화면 뷰어.

### 알림 시스템
내 레시피에 리뷰/블로그 작성 시 폴링으로 알림 수신. BottomNav 마이 탭에 빨간 뱃지.

## Authentication Flow

```
[LoginPage]
  → Redirect to OAuth Provider (Google/Naver/Kakao)
  → Provider login + consent
  → Redirect to /auth/:provider/callback?code=...

[OAuthCallbackPage]
  → POST /api/auth/:provider { code, redirectUri }
  → Receive { token, user }
  → Store token in localStorage
  → Redux: set user + token
  → Navigate to /

[Subsequent Requests]
  → apiClient auto-attaches Bearer token
  → 401 → clear token → /login
```

## Mobile Integration

Flutter WebView 지원:
- 로그인 시 `window.RecipeAuth?.postMessage(token)` 호출
- 네이티브 앱에서 토큰 수신 가능
