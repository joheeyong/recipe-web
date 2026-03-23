import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

function RecipeCard({ meal }) {
  const navigate = useNavigate();

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipes/${meal.idMeal}`)}>
      <div className="recipe-card-img-wrap">
        <img
          src={meal.strMealThumb + '/preview'}
          alt={meal.strMeal}
          className="recipe-card-img"
          loading="lazy"
        />
      </div>
      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{meal.strMeal}</h3>
        {meal.strArea && (
          <span className="recipe-card-area">{meal.strArea}</span>
        )}
      </div>
    </div>
  );
}

export default RecipeCard;
