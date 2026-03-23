import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import recipeApi from '../../home/api/recipeApi';
import apiClient from '../../../core/api/apiClient';
import './RecipeDetailPage.css';

const DIFFICULTY_LABEL = ['', '쉬움', '보통', '어려움'];

function StarRating({ value, onChange, readonly }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= value ? 'filled' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ recipeId }) {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const loadReviews = useCallback(() => {
    apiClient.get(`/api/recipes/${recipeId}/reviews`)
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setReviewCount(data.reviewCount || 0);
        // 내 리뷰가 있으면 세팅
        if (user) {
          const mine = (data.reviews || []).find((r) => r.userId === user.id);
          if (mine) {
            setMyRating(mine.rating);
            setMyComment(mine.comment || '');
          }
        }
      })
      .catch(() => {});
  }, [recipeId, user]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!myRating) return;
    setSubmitting(true);
    apiClient.post(`/api/recipes/${recipeId}/reviews`, {
      rating: myRating,
      comment: myComment.trim(),
    })
      .then(() => {
        setEditMode(false);
        loadReviews();
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (reviewId) => {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;
    apiClient.del(`/api/recipes/${recipeId}/reviews/${reviewId}`)
      .then(() => {
        setMyRating(0);
        setMyComment('');
        loadReviews();
      })
      .catch(() => {});
  };

  const myReview = user ? reviews.find((r) => r.userId === user.id) : null;

  return (
    <section className="detail-section">
      <div className="review-header">
        <h2 className="detail-section-title">후기</h2>
        <div className="review-summary">
          <span className="review-avg-star">★ {avgRating}</span>
          <span className="review-count">({reviewCount}개)</span>
        </div>
      </div>

      {/* 리뷰 작성 폼 */}
      {user && (!myReview || editMode) && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-rating">
            <span className="review-form-label">별점</span>
            <StarRating value={myRating} onChange={setMyRating} />
          </div>
          <textarea
            className="review-textarea"
            placeholder="후기를 작성해주세요 (선택)"
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            rows={3}
          />
          <div className="review-form-actions">
            {editMode && (
              <button type="button" className="review-cancel-btn" onClick={() => setEditMode(false)}>
                취소
              </button>
            )}
            <button type="submit" className="review-submit-btn" disabled={!myRating || submitting}>
              {submitting ? '저장 중...' : myReview ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      )}

      {/* 내 리뷰 (작성 완료 상태) */}
      {user && myReview && !editMode && (
        <div className="review-item my-review">
          <div className="review-item-header">
            <div className="review-user">
              {myReview.userProfileImage ? (
                <img src={myReview.userProfileImage} alt="" className="review-avatar" />
              ) : (
                <div className="review-avatar-fallback">{(myReview.userName || '나').charAt(0)}</div>
              )}
              <div>
                <div className="review-user-name">{myReview.userName || '나'} <span className="review-mine-badge">내 후기</span></div>
                <StarRating value={myReview.rating} readonly />
              </div>
            </div>
            <div className="review-actions">
              <button className="review-edit-btn" onClick={() => setEditMode(true)}>수정</button>
              <button className="review-delete-btn" onClick={() => handleDelete(myReview.id)}>삭제</button>
            </div>
          </div>
          {myReview.comment && <p className="review-comment">{myReview.comment}</p>}
          <span className="review-date">{formatDate(myReview.createdAt)}</span>
        </div>
      )}

      {/* 다른 사람 리뷰 목록 */}
      {reviews.filter((r) => !user || r.userId !== user.id).map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-item-header">
            <div className="review-user">
              {review.userProfileImage ? (
                <img src={review.userProfileImage} alt="" className="review-avatar" />
              ) : (
                <div className="review-avatar-fallback">{(review.userName || '?').charAt(0)}</div>
              )}
              <div>
                <div className="review-user-name">{review.userName || '익명'}</div>
                <StarRating value={review.rating} readonly />
              </div>
            </div>
          </div>
          {review.comment && <p className="review-comment">{review.comment}</p>}
          <span className="review-date">{formatDate(review.createdAt)}</span>
        </div>
      ))}

      {reviews.length === 0 && (
        <p className="review-empty">아직 후기가 없습니다. 첫 후기를 남겨보세요!</p>
      )}

      {!user && (
        <p className="review-login-hint">후기를 작성하려면 로그인해주세요</p>
      )}
    </section>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  // 서버가 KST(Asia/Seoul)인데 타임존 없이 보내므로 +09:00 붙여서 파싱
  const raw = dateStr.includes('+') || dateStr.includes('Z') ? dateStr : dateStr + '+09:00';
  const d = new Date(raw);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return '방금 전';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

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

  const { recipe, ingredients, steps, adjustmentNotes, tasteAdjusted } = data;

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

        {tasteAdjusted && adjustmentNotes && adjustmentNotes.length > 0 && (
          <div className="detail-adjustment">
            <div className="detail-adjustment-title">나의 입맛에 맞게 조정됨</div>
            {adjustmentNotes.map((note, i) => (
              <div key={i} className="detail-adjustment-note">{note}</div>
            ))}
          </div>
        )}

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
                <li key={ing.id} className={`detail-ingredient ${ing.optional ? 'optional' : ''} ${ing.adjusted ? 'adjusted' : ''}`}>
                  <span className="ingredient-name">
                    {ing.name}
                    {ing.optional && <span className="ingredient-optional">선택</span>}
                    {ing.adjusted && <span className="ingredient-adjusted-badge">조정됨</span>}
                  </span>
                  <span className="ingredient-measure">
                    {ing.amount}
                    {ing.adjusted && ing.originalAmount && (
                      <span className="ingredient-original">(원래 {ing.originalAmount})</span>
                    )}
                  </span>
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

        <ReviewSection recipeId={recipe.id} />
      </div>
    </div>
  );
}

export default RecipeDetailPage;
