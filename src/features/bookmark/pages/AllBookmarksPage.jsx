import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../core/api/apiClient';
import './BookmarksPage.css';

const DIFFICULTY_LABEL = ['', '쉬움', '보통', '어려움'];

function AllBookmarksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => apiClient.get('/api/bookmarks'),
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (id) => apiClient.del(`/api/bookmarks/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['bookmarks'], (old) =>
        old ? old.filter((r) => r.id !== id) : []
      );
    },
  });

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeMutation.mutate(id);
  };

  return (
    <div className="collection-detail-page">
      <div className="collection-detail-header">
        <button className="collection-detail-back" onClick={() => navigate('/bookmarks')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="collection-detail-info">
          <div className="collection-detail-name">전체 저장</div>
          <div className="collection-detail-count">{recipes.length}개 레시피</div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="home-spinner" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="bookmarks-empty">
          저장한 레시피가 없습니다.<br />마음에 드는 레시피를 저장해보세요!
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
              <button className="bookmarks-remove-btn" onClick={(e) => handleRemove(e, r.id)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllBookmarksPage;
