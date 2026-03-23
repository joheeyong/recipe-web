import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

const SPICY_LABEL = ['', '순한맛', '약간매운', '매운맛', '아주매운', '극매운'];
const DIFFICULTY_LABEL = ['', '쉬움', '보통', '어려움'];

function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipes/${recipe.id}`)}>
      <div className="recipe-card-img-wrap">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="recipe-card-img"
          loading="lazy"
        />
        {recipe.spicyLevel > 0 && (
          <span className="recipe-card-spicy">
            {'🌶️'.repeat(Math.min(recipe.spicyLevel, 3))}
          </span>
        )}
      </div>
      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <p className="recipe-card-desc">{recipe.description}</p>
        <div className="recipe-card-meta">
          {recipe.cookTimeMinutes > 0 && (
            <span className="recipe-card-tag">{recipe.cookTimeMinutes}분</span>
          )}
          {recipe.difficulty > 0 && (
            <span className="recipe-card-tag">{DIFFICULTY_LABEL[recipe.difficulty]}</span>
          )}
          {recipe.calories > 0 && (
            <span className="recipe-card-tag">{recipe.calories}kcal</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
