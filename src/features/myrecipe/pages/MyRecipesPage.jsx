import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../../../core/api/apiClient';
import './MyRecipesPage.css';

const DIFFICULTY_LABEL = ['', '쉬움', '보통', '어려움'];

function MyRecipesPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/my-recipes/all`)
      .then((res) => res.json())
      .then((data) => setRecipes(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('레시피를 삭제하시겠습니까?')) return;
    apiClient.del(`/api/my-recipes/${id}`)
      .then(() => setRecipes((prev) => prev.filter((r) => r.id !== id)))
      .catch(() => alert('삭제에 실패했습니다'));
  };

  return (
    <div className="myrecipe-page">
      <div className="myrecipe-header">
        <h1 className="myrecipe-title">유저 레시피</h1>
        {user && (
          <button className="myrecipe-add-btn" onClick={() => navigate('/my-recipes/write')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            등록
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="home-spinner" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="myrecipe-empty">
          아직 등록된 유저 레시피가 없습니다.<br />나만의 레시피를 등록해보세요!
        </div>
      ) : (
        <div className="myrecipe-list">
          {recipes.map((r) => (
            <div key={r.id} className="myrecipe-item" onClick={() => navigate(`/recipes/${r.id}`)}>
              <div className="myrecipe-thumb">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.title} />
                ) : (
                  <span className="myrecipe-thumb-fallback">{r.title.charAt(0)}</span>
                )}
              </div>
              <div className="myrecipe-info">
                <div className="myrecipe-item-title">{r.title}</div>
                <div className="myrecipe-item-author">{r.userName}</div>
                {r.description && <div className="myrecipe-item-desc">{r.description}</div>}
                <div className="myrecipe-item-meta">
                  {r.cookTimeMinutes > 0 && <span className="myrecipe-item-tag">{r.cookTimeMinutes}분</span>}
                  {r.difficulty > 0 && <span className="myrecipe-item-tag">{DIFFICULTY_LABEL[r.difficulty]}</span>}
                </div>
              </div>
              {user && user.id === r.userId && (
                <button className="myrecipe-delete-btn" onClick={(e) => handleDelete(e, r.id)}>삭제</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRecipesPage;
