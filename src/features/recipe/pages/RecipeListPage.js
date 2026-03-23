import { useState } from 'react';
import recipeApi from '../../home/api/recipeApi';
import RecipeCard from '../../../shared/components/RecipeCard';
import './RecipeListPage.css';

function RecipeListPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    recipeApi.search(query.trim())
      .then((data) => setResults(data.content || []))
      .catch(() => setResults([]))
      .finally(() => { setLoading(false); setSearched(true); });
  };

  return (
    <div className="search-page">
      <header className="search-header">
        <h1 className="search-title">레시피 검색</h1>
      </header>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="요리 이름이나 재료로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-btn" type="submit" disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {loading ? (
        <div className="home-loading"><div className="home-spinner" /></div>
      ) : searched && results.length === 0 ? (
        <div className="search-empty">검색 결과가 없습니다</div>
      ) : (
        <div className="recipe-grid">
          {results.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipeListPage;
