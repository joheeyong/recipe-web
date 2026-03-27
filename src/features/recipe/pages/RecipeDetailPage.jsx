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

function BlogSection({ recipeId, recipeTitle }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    apiClient.get(`/api/blog/recipe/${recipeId}`)
      .then((data) => setPosts(data || []))
      .catch(() => {});
  }, [recipeId]);

  return (
    <section className="detail-section">
      <div className="blog-list-header">
        <h2 className="detail-section-title">블로그</h2>
        <button
          className="blog-write-link"
          onClick={() => navigate(`/blog/write?recipeId=${recipeId}`)}
        >
          글쓰기
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="review-empty">아직 블로그 글이 없습니다. 첫 글을 작성해보세요!</p>
      ) : (
        <div className="blog-list">
          {posts.map((post) => (
            <div
              key={post.id}
              className="blog-list-item"
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="blog-list-thumb">
                  <img src={post.mediaUrls[0]} alt="" />
                  {post.mediaUrls.length > 1 && (
                    <span className="blog-list-thumb-count">+{post.mediaUrls.length - 1}</span>
                  )}
                </div>
              )}
              <div className="blog-list-body">
                <div className="blog-list-user">{post.userName || '익명'}</div>
                <p className="blog-list-content">{post.content}</p>
                <span className="blog-list-date">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
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

function BookmarkButton({ recipeId }) {
  const { user } = useSelector((state) => state.auth);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiClient.get(`/api/bookmarks/${recipeId}/check`)
      .then((data) => setBookmarked(data.bookmarked))
      .catch(() => {});
  }, [recipeId, user]);

  const toggle = () => {
    if (!user) return;
    const req = bookmarked
      ? apiClient.del(`/api/bookmarks/${recipeId}`)
      : apiClient.post(`/api/bookmarks/${recipeId}`);
    req.then((data) => setBookmarked(data.bookmarked)).catch(() => {});
  };

  if (!user) return null;

  return (
    <button className={`detail-bookmark-btn ${bookmarked ? 'active' : ''}`} onClick={toggle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill={bookmarked ? 'var(--accent)' : 'none'} stroke={bookmarked ? 'var(--accent)' : 'currentColor'} strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span>{bookmarked ? '저장됨' : '저장'}</span>
    </button>
  );
}

function scaleAmount(amount, ratio) {
  if (!amount || ratio === 1) return amount;
  const qualitative = ['약간', '적당량', '조금', '적당히', '소량', '취향껏', '기호에 맞게'];
  if (qualitative.some((q) => amount.includes(q))) return amount;

  // "1/2큰술", "200g", "2.5컵" 등 파싱
  const match = amount.match(/^(\d+\/\d+|\d+\.?\d*)\s*(.*)/);
  if (!match) return amount;

  let num;
  if (match[1].includes('/')) {
    const [a, b] = match[1].split('/');
    num = Number(a) / Number(b);
  } else {
    num = Number(match[1]);
  }

  if (isNaN(num)) return amount;

  const scaled = num * ratio;
  const unit = match[2];

  // 깔끔한 숫자 표시
  const display = scaled % 1 === 0
    ? String(scaled)
    : scaled.toFixed(1).replace(/\.0$/, '');

  return `${display}${unit}`;
}

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(null);

  useEffect(() => {
    recipeApi.detail(id)
      .then((res) => {
        setData(res);
        setServings(res?.recipe?.servingSize || 2);
      })
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
  const baseServings = recipe.servingSize || 2;
  const currentServings = servings || baseServings;
  const servingRatio = currentServings / baseServings;

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
        <div className="detail-title-row">
          <h1 className="detail-title">{recipe.title}</h1>
          <BookmarkButton recipeId={recipe.id} />
        </div>
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
            <div className="serving-selector">
              <button
                className="serving-btn"
                onClick={() => setServings(Math.max(1, currentServings - 1))}
                disabled={currentServings <= 1}
              >-</button>
              <span className="serving-value">{currentServings}</span>
              <button
                className="serving-btn"
                onClick={() => setServings(currentServings + 1)}
                disabled={currentServings >= 20}
              >+</button>
            </div>
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
            <div className="ingredient-header">
              <h2 className="detail-section-title">재료</h2>
              {servingRatio !== 1 && (
                <span className="ingredient-ratio-badge">
                  {baseServings}인분 기준 x{servingRatio % 1 === 0 ? servingRatio : servingRatio.toFixed(1)}
                </span>
              )}
            </div>
            <ul className="detail-ingredients">
              {ingredients.map((ing) => (
                <li key={ing.id} className={`detail-ingredient ${ing.optional ? 'optional' : ''} ${ing.adjusted ? 'adjusted' : ''}`}>
                  <span className="ingredient-name">
                    {ing.name}
                    {ing.optional && <span className="ingredient-optional">선택</span>}
                    {ing.adjusted && <span className="ingredient-adjusted-badge">조정됨</span>}
                  </span>
                  <span className="ingredient-measure">
                    {scaleAmount(ing.amount, servingRatio)}
                    {ing.adjusted && ing.originalAmount && (
                      <span className="ingredient-original">(원래 {scaleAmount(ing.originalAmount, servingRatio)})</span>
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

        <BlogSection recipeId={recipe.id} recipeTitle={recipe.title} />
      </div>
    </div>
  );
}

export default RecipeDetailPage;
