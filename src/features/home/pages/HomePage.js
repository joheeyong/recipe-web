import { useState, useEffect } from 'react';
import mealApi from '../api/mealApi';
import RecipeCard from '../../../shared/components/RecipeCard';
import './HomePage.css';

const CATEGORIES = ['Chicken', 'Beef', 'Seafood', 'Pasta', 'Dessert', 'Vegetarian', 'Pork', 'Starter', 'Breakfast', 'Lamb'];

function HomePage() {
  const [meals, setMeals] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Chicken');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mealApi.getByCategory(activeCategory)
      .then((data) => setMeals(data))
      .catch(() => setMeals([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">Recipe</h1>
        <p className="home-subtitle">What would you like to cook?</p>
      </header>

      <div className="category-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="home-loading">
          <div className="home-spinner" />
        </div>
      ) : (
        <div className="recipe-grid">
          {meals.map((meal) => (
            <RecipeCard key={meal.idMeal} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
