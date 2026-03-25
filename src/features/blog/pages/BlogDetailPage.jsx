import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../../core/api/apiClient';
import './BlogDetailPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
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

function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/api/blog/${id}`)
      .then((data) => setPost(data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    if (!window.confirm('블로그 글을 삭제하시겠습니까?')) return;
    apiClient.del(`/api/blog/${id}`)
      .then(() => navigate(-1))
      .catch(() => alert('삭제에 실패했습니다'));
  };

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-loading"><div className="blog-detail-spinner" /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-detail-page">
        <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
          글을 찾을 수 없습니다
        </p>
      </div>
    );
  }

  const isOwner = user && user.id === post.userId;

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-header">
        <button className="blog-detail-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {post.recipeName && (
        <span
          className="blog-detail-recipe-tag"
          onClick={() => navigate(`/recipes/${post.recipeId}`)}
        >
          {post.recipeName}
        </span>
      )}

      <div className="blog-detail-user">
        {post.userProfileImage ? (
          <img src={post.userProfileImage} alt="" className="blog-detail-avatar" />
        ) : (
          <div className="blog-detail-avatar-fallback">
            {(post.userName || '?').charAt(0)}
          </div>
        )}
        <div className="blog-detail-user-info">
          <div className="blog-detail-user-name">{post.userName || '익명'}</div>
          <div className="blog-detail-date">{formatDate(post.createdAt)}</div>
        </div>
        {isOwner && (
          <button className="blog-detail-delete" onClick={handleDelete}>삭제</button>
        )}
      </div>

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <>
          <div className="blog-media-slider">
            {post.mediaUrls.map((url, i) => (
              <div key={i} className="blog-media-slide">
                {url.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={url} controls playsInline />
                ) : (
                  <img src={url} alt="" />
                )}
              </div>
            ))}
          </div>
          {post.mediaUrls.length > 1 && (
            <div className="blog-media-count">{post.mediaUrls.length}장</div>
          )}
        </>
      )}

      <div className="blog-detail-content">{post.content}</div>
    </div>
  );
}

export default BlogDetailPage;
