import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import recipeApi from '../../home/api/recipeApi';
import './RecipeDetailPage.css';

const DIFFICULTY_LABEL = ['', '쉬움', '보통', '어려움'];

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recipeApi.detail(id)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="detail-spinner" />
      </div>
    );
  }

  if (!data || !data.recipe) {
    return (
      <div className="detail-loading">
        <p>레시피를 찾을 수 없습니다</p>
        <button className="detail-back-btn" onClick={() => navigate('/')}>홈으로</button>
      </div>
    );
  }

  const { recipe, ingredients, steps } = data;

  return (
    <div className="detail-page">
      <div className="detail-hero">
        <img src={recipe.imageUrl} alt={recipe.title} className="detail-hero-img" />
        <button className="detail-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className="detail-content">
        <h1 className="detail-title">{recipe.title}</h1>
        <p className="detail-desc">{recipe.description}</p>

        <div className="detail-meta">
          {recipe.cookTimeMinutes > 0 && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">조리시간</span>
              <span className="detail-meta-value">{recipe.cookTimeMinutes}분</span>
            </div>
          )}
          <div className="detail-meta-item">
            <span className="detail-meta-label">난이도</span>
            <span className="detail-meta-value">{DIFFICULTY_LABEL[recipe.difficulty]}</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">인분</span>
            <span className="detail-meta-value">{recipe.servingSize}인분</span>
          </div>
          {recipe.calories > 0 && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">칼로리</span>
              <span className="detail-meta-value">{recipe.calories}kcal</span>
            </div>
          )}
        </div>

        {recipe.tags && (
          <div className="detail-tags">
            {recipe.tags.split(',').map((tag) => (
              <span key={tag} className="detail-tag">{tag.trim()}</span>
            ))}
          </div>
        )}

        {ingredients && ingredients.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section-title">재료</h2>
            <ul className="detail-ingredients">
              {ingredients.map((ing) => (
                <li key={ing.id} className={`detail-ingredient ${ing.optional ? 'optional' : ''}`}>
                  <span className="ingredient-name">
                    {ing.name}
                    {ing.optional && <span className="ingredient-optional">선택</span>}
                  </span>
                  <span className="ingredient-measure">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {steps && steps.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section-title">만드는 법</h2>
            <ol className="detail-steps">
              {steps.map((step) => (
                <li key={step.id} className="detail-step">
                  <div className="step-instruction">{step.instruction}</div>
                  {step.tip && (
                    <div className="step-tip">💡 {step.tip}</div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}

export default RecipeDetailPage;
