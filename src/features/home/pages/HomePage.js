import { useState, useEffect } from 'react';
import recipeApi from '../api/recipeApi';
import RecipeCard from '../../../shared/components/RecipeCard';
import './HomePage.css';

const CATEGORIES = [
  { key: null, label: '전체' },
  { key: 'main', label: '메인' },
  { key: 'soup', label: '국/탕' },
  { key: 'side', label: '반찬' },
];

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    recipeApi.list({ category: activeCategory, size: 30 })
      .then((data) => setRecipes(data.content || []))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">Recipe</h1>
        <p className="home-subtitle">오늘 뭐 해먹지?</p>
      </header>

      <div className="category-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key || 'all'}
            className={`category-chip ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
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
