import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import recipeApi from '../api/recipeApi';
import RecipeCard from '../../../shared/components/RecipeCard';
import RecipeCardSkeleton from '../../../shared/components/RecipeCardSkeleton';
import { useTheme } from '../../../hooks/useTheme';
import './HomePage.css';

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

function HomePage() {
  const { user } = useSelector((state) => state.auth);
  const { theme, toggle } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('default');
  const [difficultyFilter, setDifficultyFilter] = useState(null);
  const [calorieFilter, setCalorieFilter] = useState(null);
  const scrollRef = useRef(null);

  const filter = FILTERS.find((f) => f.key === activeFilter);
  const params = { size: 50 };
  if (filter?.userRecipe) params.userRecipe = true;
  else if (filter?.cuisine) params.cuisine = filter.cuisine;

  const { data: recipePage, isLoading } = useQuery({
    queryKey: ['recipes', activeFilter],
    queryFn: () => recipeApi.list(params),
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => recipeApi.recommendations(10),
    enabled: !!user,
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const recipes = sortRecipes(recipePage?.content || [], activeSort)
    .filter((r) => difficultyFilter === null || r.difficulty === difficultyFilter)
    .filter((r) => calorieFilter === null || r.calories <= calorieFilter);

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
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={activeSort}
          onChange={(e) => setActiveSort(e.target.value)}
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
              onClick={() => setDifficultyFilter(f.key)}
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
              onClick={() => setCalorieFilter(f.key)}
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
      ) : recipes.length === 0 ? (
        <div className="home-empty">
          <p>레시피가 없습니다</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
