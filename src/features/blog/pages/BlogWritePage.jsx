import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../../../core/api/apiClient';
import './BlogWritePage.css';

function BlogWritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [recipes, setRecipes] = useState([]);
  const [recipeId, setRecipeId] = useState(searchParams.get('recipeId') || '');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // { file, preview, type }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    // 레시피 목록 불러오기
    apiClient.get('/api/recipes?size=100')
      .then((data) => setRecipes(data.content || []))
      .catch(() => {});
  }, [user, navigate]);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    const newFiles = selected.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'video' : 'image',
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10)); // 최대 10개
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeId || !content.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('recipeId', recipeId);
      formData.append('content', content.trim());
      files.forEach((f) => formData.append('files', f.file));

      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/blog`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      navigate(`/blog/${data.id}`);
    } catch {
      alert('등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="blog-write-page">
      <div className="blog-write-header">
        <button className="blog-write-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="blog-write-title">블로그 작성</h1>
      </div>

      <form className="blog-write-form" onSubmit={handleSubmit}>
        <div>
          <div className="blog-field-label">레시피 선택</div>
          <select
            className="blog-recipe-select"
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
          >
            <option value="">레시피를 선택하세요</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>

        <div className="blog-media-section">
          <div className="blog-field-label">사진 / 영상</div>
          <div className="blog-media-grid">
            {files.map((f, i) => (
              <div key={i} className="blog-media-preview">
                {f.type === 'video' ? (
                  <video src={f.preview} />
                ) : (
                  <img src={f.preview} alt="" />
                )}
                <button type="button" className="blog-media-remove" onClick={() => removeFile(i)}>✕</button>
              </div>
            ))}
            {files.length < 10 && (
              <div className="blog-media-add" onClick={() => fileInputRef.current?.click()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>추가</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="blog-media-input"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
          />
        </div>

        <div>
          <div className="blog-field-label">내용</div>
          <textarea
            className="blog-content-textarea"
            placeholder="요리 후기, 나만의 팁, 변형 레시피 등을 자유롭게 작성해보세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="blog-submit-btn"
          disabled={!recipeId || !content.trim() || submitting}
        >
          {submitting ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}

export default BlogWritePage;
