import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import mealApi from '../../home/api/mealApi';
import './RecipeDetailPage.css';

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mealApi.getDetail(id)
      .then((data) => setMeal(data))
      .catch(() => setMeal(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="detail-spinner" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="detail-loading">
        <p>Recipe not found</p>
        <button className="detail-back-btn" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ name: ing.trim(), measure: measure?.trim() || '' });
    }
  }

  const steps = meal.strInstructions
    ? meal.strInstructions.split(/\r?\n/).filter((s) => s.trim())
    : [];

  return (
    <div className="detail-page">
      <div className="detail-hero">
        <img src={meal.strMealThumb} alt={meal.strMeal} className="detail-hero-img" />
        <button className="detail-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className="detail-content">
        <h1 className="detail-title">{meal.strMeal}</h1>

        <div className="detail-meta">
          {meal.strArea && <span className="detail-tag">{meal.strArea}</span>}
          {meal.strCategory && <span className="detail-tag">{meal.strCategory}</span>}
          {meal.strTags && meal.strTags.split(',').map((tag) => (
            <span key={tag} className="detail-tag">{tag.trim()}</span>
          ))}
        </div>

        <section className="detail-section">
          <h2 className="detail-section-title">Ingredients</h2>
          <ul className="detail-ingredients">
            {ingredients.map((ing, i) => (
              <li key={i} className="detail-ingredient">
                <span className="ingredient-name">{ing.name}</span>
                <span className="ingredient-measure">{ing.measure}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h2 className="detail-section-title">Instructions</h2>
          <ol className="detail-steps">
            {steps.map((step, i) => (
              <li key={i} className="detail-step">{step}</li>
            ))}
          </ol>
        </section>

        {meal.strYoutube && (
          <section className="detail-section">
            <h2 className="detail-section-title">Video</h2>
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-youtube-link"
            >
              Watch on YouTube
            </a>
          </section>
        )}
      </div>
    </div>
  );
}

export default RecipeDetailPage;
