import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../core/api/apiClient';
import './BookmarksPage.css';

const DIFFICULTY_LABEL = ['', '쉬움', '보통', '어려움'];

function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => apiClient.get(`/api/collections/${id}/recipes`),
    enabled: !!user && !!id,
  });

  const collection = data?.collection;
  const recipes = data?.recipes || [];

  const removeMutation = useMutation({
    mutationFn: (recipeId) => apiClient.del(`/api/collections/${id}/recipes/${recipeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.del(`/api/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      navigate('/bookmarks');
    },
  });

  const handleRemoveRecipe = (e, recipeId) => {
    e.stopPropagation();
    removeMutation.mutate(recipeId);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteMutation.mutate();
  };

  if (!user) {
    return (
      <div className="collection-detail-page">
        <div className="bookmarks-login-hint">
          <p><a href="/login">로그인</a>이 필요합니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-detail-page">
      <div className="collection-detail-header">
        <button className="collection-detail-back" onClick={() => navigate('/bookmarks')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="collection-detail-info">
          {collection && (
            <>
              <div className="collection-detail-name">
                <span>{collection.emoji}</span>
                {collection.name}
              </div>
              {collection.description && (
                <div className="collection-detail-desc">{collection.description}</div>
              )}
              <div className="collection-detail-count">{recipes.length}개 레시피</div>
            </>
          )}
        </div>
        <div className="collection-detail-actions">
          <button className="collection-detail-delete-btn" onClick={handleDelete}>
            {confirmDelete ? '정말 삭제?' : '삭제'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="home-spinner" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="bookmarks-empty">
          아직 레시피가 없습니다.<br />레시피 상세에서 이 컬렉션에 추가해보세요!
        </div>
      ) : (
        <div className="bookmarks-list">
          {recipes.map((r) => (
            <div key={r.id} className="bookmarks-item" onClick={() => navigate(`/recipes/${r.id}`)}>
              <div className="bookmarks-thumb">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.title} />
                ) : (
                  <span className="bookmarks-thumb-fallback">{r.title.charAt(0)}</span>
                )}
              </div>
              <div className="bookmarks-info">
                <div className="bookmarks-item-title">{r.title}</div>
                {r.description && <div className="bookmarks-item-desc">{r.description}</div>}
                <div className="bookmarks-item-meta">
                  {r.cookTimeMinutes > 0 && <span className="bookmarks-item-tag">{r.cookTimeMinutes}분</span>}
                  {r.difficulty > 0 && <span className="bookmarks-item-tag">{DIFFICULTY_LABEL[r.difficulty]}</span>}
                </div>
              </div>
              <button className="bookmarks-remove-btn" onClick={(e) => handleRemoveRecipe(e, r.id)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollectionDetailPage;
