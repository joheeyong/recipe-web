import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
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

function HomePage() {
  const { user } = useSelector((state) => state.auth);
  const [recipes, setRecipes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // 맞춤 추천 로드
  useEffect(() => {
    if (!user) { setRecommendations([]); return; }
    recipeApi.recommendations(10)
      .then((data) => setRecommendations(Array.isArray(data) ? data : []))
      .catch(() => setRecommendations([]));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const filter = FILTERS.find((f) => f.key === activeFilter);
    const params = { size: 50 };
    if (filter && filter.userRecipe) {
      params.userRecipe = true;
    } else if (filter && filter.cuisine) {
      params.cuisine = filter.cuisine;
    }
    recipeApi.list(params)
      .then((data) => setRecipes(data.content || []))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">Recipe</h1>
        <p className="home-subtitle">오늘 뭐 해먹지?</p>
      </header>

      {/* 맞춤 추천 섹션 */}
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

      {loading ? (
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
