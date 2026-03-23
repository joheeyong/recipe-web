import { useState, useEffect } from 'react';
import recipeApi from '../api/recipeApi';
import RecipeCard from '../../../shared/components/RecipeCard';
import './HomePage.css';

const CATEGORIES = [
  { key: null, label: '전체', userRecipe: null },
  { key: 'main', label: '메인', userRecipe: null },
  { key: 'soup', label: '국/탕', userRecipe: null },
  { key: 'side', label: '반찬', userRecipe: null },
  { key: 'custom', label: '커스텀', userRecipe: true },
];

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const cat = CATEGORIES.find((c) => (c.key || 'all') === activeFilter);
    const params = { size: 30 };
    if (cat && cat.userRecipe) {
      params.userRecipe = true;
    } else if (cat && cat.key) {
      params.category = cat.key;
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

      <div className="category-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key || 'all'}
            className={`category-chip ${activeFilter === (cat.key || 'all') ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat.key || 'all')}
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
