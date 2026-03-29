import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../core/api/apiClient';
import './BookmarksPage.css';

const EMOJI_OPTIONS = ['📁', '🍽️', '💪', '🎉', '❤️', '🔥', '🥗', '🍜', '🍰', '🧑‍🍳', '🏠', '⭐'];

function BookmarksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [newDesc, setNewDesc] = useState('');

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => apiClient.get('/api/bookmarks'),
    enabled: !!user,
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => apiClient.get('/api/collections'),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (body) => apiClient.post('/api/collections', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setShowCreate(false);
      setNewName('');
      setNewEmoji('📁');
      setNewDesc('');
    },
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName.trim(), emoji: newEmoji, description: newDesc.trim() });
  };

  if (!user) {
    return (
      <div className="bookmarks-page">
        <h1 className="bookmarks-title">저장한 레시피</h1>
        <div className="bookmarks-login-hint">
          <p>레시피를 저장하려면</p>
          <p><a href="/login">로그인</a>해주세요</p>
        </div>
      </div>
    );
  }

  const isLoading = bookmarksLoading || collectionsLoading;

  return (
    <div className="bookmarks-page">
      <h1 className="bookmarks-title">저장한 레시피</h1>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="home-spinner" />
        </div>
      ) : (
        <>
          {/* 전체 북마크 카드 */}
          <div
            className="collection-card collection-all"
            onClick={() => navigate('/bookmarks/all')}
          >
            <div className="collection-all-thumbs">
              {bookmarks.slice(0, 4).map((r) => (
                <div key={r.id} className="collection-all-thumb">
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt={r.title} />
                  ) : (
                    <span className="collection-thumb-fallback">{r.title.charAt(0)}</span>
                  )}
                </div>
              ))}
              {bookmarks.length === 0 && (
                <div className="collection-all-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="collection-card-info">
              <div className="collection-card-name">전체 저장</div>
              <div className="collection-card-count">{bookmarks.length}개 레시피</div>
            </div>
          </div>

          {/* 컬렉션 그리드 */}
          <div className="collection-section-header">
            <h2 className="collection-section-title">컬렉션</h2>
            <button className="collection-add-btn" onClick={() => setShowCreate(true)}>
              + 새 컬렉션
            </button>
          </div>

          {showCreate && (
            <div className="collection-create-form">
              <div className="collection-emoji-picker">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    className={`collection-emoji-btn ${e === newEmoji ? 'active' : ''}`}
                    onClick={() => setNewEmoji(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                className="collection-create-input"
                placeholder="컬렉션 이름 (예: 다이어트용)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={50}
              />
              <input
                className="collection-create-input"
                placeholder="설명 (선택)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                maxLength={200}
              />
              <div className="collection-create-actions">
                <button className="collection-create-cancel" onClick={() => setShowCreate(false)}>
                  취소
                </button>
                <button
                  className="collection-create-submit"
                  onClick={handleCreate}
                  disabled={!newName.trim() || createMutation.isPending}
                >
                  만들기
                </button>
              </div>
            </div>
          )}

          <div className="collection-grid">
            {collections.map((c) => (
              <div
                key={c.id}
                className="collection-card"
                onClick={() => navigate(`/collections/${c.id}`)}
              >
                <div className="collection-card-cover">
                  {c.thumbnails && c.thumbnails.length > 0 ? (
                    <div className="collection-cover-grid">
                      {c.thumbnails.slice(0, 4).map((url, i) => (
                        <img key={i} src={url} alt="" className="collection-cover-img" />
                      ))}
                    </div>
                  ) : (
                    <div className="collection-cover-empty">
                      <span className="collection-cover-emoji">{c.emoji}</span>
                    </div>
                  )}
                </div>
                <div className="collection-card-info">
                  <div className="collection-card-name">
                    <span className="collection-card-emoji">{c.emoji}</span>
                    {c.name}
                  </div>
                  <div className="collection-card-count">{c.recipeCount}개 레시피</div>
                </div>
              </div>
            ))}
          </div>

          {collections.length === 0 && !showCreate && (
            <div className="collection-empty-hint">
              테마별로 레시피를 정리해보세요!
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BookmarksPage;
