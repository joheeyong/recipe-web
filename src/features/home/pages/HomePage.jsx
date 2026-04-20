import { useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigationType } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import recipeApi from '../api/recipeApi';
import RecipeCard from '../../../shared/components/RecipeCard';
import RecipeCardSkeleton from '../../../shared/components/RecipeCardSkeleton';
import { useTheme } from '../../../hooks/useTheme';
import './HomePage.css';

const PAGE_SIZE = 12;

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'korean', label: '한식', cuisine: 'korean' },
  { key: 'western', label: '양식', cuisine: 'western' },
  { key: 'chinese', label: '중식', cuisine: 'chinese' },
  { key: 'japanese', label: '일식', cuisine: 'japanese' },
  { key: 'southeast_asian', label: '동남아', cuisine: 'southeast_asian' },
  { key: 'mexican', label: '멕시칸', cuisine: 'mexican' },
  { key: 'custom', label: '커스텀', userRecipe: true },
];

const SORTS = [
  { key: 'default', label: '기본' },
  { key: 'calories', label: '칼로리순' },
  { key: 'difficulty', label: '난이도순' },
  { key: 'time', label: '시간순' },
];

const DIFFICULTY_FILTERS = [
  { key: null, label: '전체' },
  { key: 1, label: '쉬움' },
  { key: 2, label: '보통' },
  { key: 3, label: '어려움' },
];

const CALORIE_FILTERS = [
  { key: null, label: '전체' },
  { key: 300, label: '~300kcal' },
  { key: 500, label: '~500kcal' },
  { key: 800, label: '~800kcal' },
];

function sortRecipes(recipes, sortKey) {
  if (sortKey === 'default') return recipes;
  const copy = [...recipes];
  if (sortKey === 'calories') return copy.sort((a, b) => a.calories - b.calories);
  if (sortKey === 'difficulty') return copy.sort((a, b) => a.difficulty - b.difficulty);
  if (sortKey === 'time') return copy.sort((a, b) => a.cookTimeMinutes - b.cookTimeMinutes);
  return copy;
}

const SCROLL_KEY = 'home-scroll';

function HomePage() {
  const { user } = useSelector((state) => state.auth);
  const { theme, toggle } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  const activeFilter = searchParams.get('cuisine') || 'all';
  const activeSort = searchParams.get('sort') || 'default';
  const difficultyFilter = searchParams.get('difficulty') ? Number(searchParams.get('difficulty')) : null;
  const calorieFilter = searchParams.get('calories') ? Number(searchParams.get('calories')) : null;

  const setParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === 'default' || value === 'all') next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });
  };

  const filter = FILTERS.find((f) => f.key === activeFilter);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['recipes', activeFilter],
    queryFn: ({ pageParam = 0 }) => {
      const params = { size: PAGE_SIZE, page: pageParam };
      if (filter?.userRecipe) params.userRecipe = true;
      else if (filter?.cuisine) params.cuisine = filter.cuisine;
      return recipeApi.list(params);
    },
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => recipeApi.recommendations(10),
    enabled: !!user,
    select: (data) => (Array.isArray(data) ? data : []),
  });

  // 모든 페이지 합산 후 클라이언트 필터/정렬 적용
  const allRecipes = sortRecipes(
    (data?.pages ?? []).flatMap((p) => p.content ?? []),
    activeSort
  )
    .filter((r) => difficultyFilter === null || r.difficulty === difficultyFilter)
    .filter((r) => calorieFilter === null || r.calories <= calorieFilter);

  // sentinel 감지 → 다음 페이지 로드
  const onIntersect = useCallback((entries) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(onIntersect, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect]);

  // 페이지 떠날 때 스크롤 위치 저장
  useEffect(() => {
    return () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };
  }, []);

  // 뒤로가기(POP)로 돌아왔을 때 로딩 완료 후 스크롤 복원
  useEffect(() => {
    if (navigationType === 'POP' && !isLoading) {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) {
        requestAnimationFrame(() => window.scrollTo(0, Number(saved)));
        sessionStorage.removeItem(SCROLL_KEY);
      }
    }
  }, [navigationType, isLoading]);

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <h1 className="home-title">Recipe</h1>
          <p className="home-subtitle">오늘 뭐 해먹지?</p>
        </div>
        <button className="theme-toggle" onClick={toggle} aria-label="테마 변경">
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      {user && recommendations.length > 0 && (
        <div className="recommend-section">
          <div className="recommend-header">
            <h2 className="recommend-title">맞춤 추천</h2>
            <p className="recommend-desc">입맛 설정 기반 추천 레시피</p>
          </div>
          <div className="recommend-scroll" ref={scrollRef}>
            {recommendations.map((recipe) => (
              <div key={recipe.id} className="recommend-card-wrap">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="filter-row">
        <div className="category-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`category-chip ${activeFilter === f.key ? 'active' : ''}`}
              onClick={() => setParam('cuisine', f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={activeSort}
          onChange={(e) => setParam('sort', e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="sub-filter-row">
        <div className="sub-filter-group">
          <span className="sub-filter-label">난이도</span>
          {DIFFICULTY_FILTERS.map((f) => (
            <button
              key={String(f.key)}
              className={`sub-filter-chip ${difficultyFilter === f.key ? 'active' : ''}`}
              onClick={() => setParam('difficulty', f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sub-filter-group">
          <span className="sub-filter-label">칼로리</span>
          {CALORIE_FILTERS.map((f) => (
            <button
              key={String(f.key)}
              className={`sub-filter-chip ${calorieFilter === f.key ? 'active' : ''}`}
              onClick={() => setParam('calories', f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="recipe-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : allRecipes.length === 0 ? (
        <div className="home-empty">
          <p>레시피가 없습니다</p>
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {allRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <div ref={sentinelRef} className="infinite-sentinel">
            {isFetchingNextPage && (
              <div className="recipe-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <RecipeCardSkeleton key={i} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
