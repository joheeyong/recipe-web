import { useState, useEffect } from 'react';
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
  const [recipes, setRecipes] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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
