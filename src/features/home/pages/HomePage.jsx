import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import recipeApi from '../api/recipeApi';
import RecipeCard from '../../../shared/components/RecipeCard';
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('default');
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

  const recipes = sortRecipes(recipePage?.content || [], activeSort);

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">Recipe</h1>
        <p className="home-subtitle">오늘 뭐 해먹지?</p>
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

      <div className="sort-bar">
        {SORTS.map((s) => (
          <button
            key={s.key}
            className={`sort-chip ${activeSort === s.key ? 'active' : ''}`}
            onClick={() => setActiveSort(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="home-loading">
          <div className="home-spinner" />
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
