import { useParams } from 'react-router-dom';

function RecipeDetailPage() {
  const { id } = useParams();

  return (
    <div className="page" style={{ padding: 24 }}>
      <h1>Recipe #{id}</h1>
      <p>Recipe detail will be implemented here</p>
    </div>
  );
}

export default RecipeDetailPage;
