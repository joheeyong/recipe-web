import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './MyRecipeWritePage.css';

const CATEGORIES = [
  { value: 'main', label: '메인' },
  { value: 'soup', label: '국/탕' },
  { value: 'side', label: '반찬' },
  { value: 'snack', label: '간식' },
  { value: 'noodle', label: '면' },
  { value: 'rice', label: '밥' },
  { value: 'other', label: '기타' },
];

const SPICY_LEVELS = [
  { value: 0, label: '안매움' },
  { value: 1, label: '순한맛' },
  { value: 2, label: '약간매운' },
  { value: 3, label: '매운맛' },
  { value: 4, label: '아주매운' },
];

function MyRecipeWritePage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const imageInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('main');
  const [difficulty, setDifficulty] = useState(2);
  const [cookTime, setCookTime] = useState('');
  const [servingSize, setServingSize] = useState('2');
  const [calories, setCalories] = useState('');
  const [spicyLevel, setSpicyLevel] = useState(0);
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState([{ instruction: '', tip: '' }]);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addIngredient = () => setIngredients((prev) => [...prev, { name: '', amount: '' }]);
  const removeIngredient = (i) => setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i, key, val) => setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [key]: val } : ing));

  const addStep = () => setSteps((prev) => [...prev, { instruction: '', tip: '' }]);
  const removeStep = (i) => setSteps((prev) => prev.filter((_, idx) => idx !== i));
  const updateStep = (i, key, val) => setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    const validSteps = steps.filter((s) => s.instruction.trim());

    if (validIngredients.length === 0) { alert('재료를 1개 이상 입력해주세요'); return; }
    if (validSteps.length === 0) { alert('조리법을 1단계 이상 입력해주세요'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('difficulty', difficulty);
      formData.append('cookTimeMinutes', cookTime || 0);
      formData.append('servingSize', servingSize || 2);
      formData.append('calories', calories || 0);
      formData.append('spicyLevel', spicyLevel);
      formData.append('tags', tags.trim());
      if (image) formData.append('image', image);

      validIngredients.forEach((ing) => {
        formData.append('ingredientNames', ing.name.trim());
        formData.append('ingredientAmounts', ing.amount.trim());
      });
      validSteps.forEach((s) => {
        formData.append('stepInstructions', s.instruction.trim());
        formData.append('stepTips', s.tip.trim());
      });

      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || ''}/api/my-recipes`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      navigate(`/recipes/${data.id}`);
    } catch {
      alert('등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="recipe-write-page">
      <div className="recipe-write-header">
        <button className="recipe-write-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="recipe-write-title">유저 레시피 등록</h1>
      </div>

      <form className="recipe-write-form" onSubmit={handleSubmit}>
        {/* 대표 이미지 */}
        <div className="rw-field">
          <div className="rw-label">대표 이미지</div>
          <div className="rw-image-upload" onClick={() => imageInputRef.current?.click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="" />
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>사진 추가</span>
              </>
            )}
          </div>
          <input ref={imageInputRef} type="file" className="rw-image-input" accept="image/*" onChange={handleImageSelect} />
        </div>

        {/* 기본 정보 */}
        <div className="rw-field">
          <div className="rw-label">요리 이름 <span className="rw-required">*</span></div>
          <input className="rw-input" placeholder="예: 참치김치찌개" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="rw-field">
          <div className="rw-label">설명</div>
          <textarea className="rw-textarea" placeholder="요리에 대한 간단한 설명" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>

        <div className="rw-row">
          <div className="rw-field">
            <div className="rw-label">카테고리</div>
            <select className="rw-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="rw-field">
            <div className="rw-label">난이도</div>
            <select className="rw-select" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
              <option value={1}>쉬움</option>
              <option value={2}>보통</option>
              <option value={3}>어려움</option>
            </select>
          </div>
        </div>

        <div className="rw-row">
          <div className="rw-field">
            <div className="rw-label">조리시간 (분)</div>
            <input className="rw-input" type="number" placeholder="30" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
          </div>
          <div className="rw-field">
            <div className="rw-label">인분</div>
            <input className="rw-input" type="number" placeholder="2" value={servingSize} onChange={(e) => setServingSize(e.target.value)} />
          </div>
          <div className="rw-field">
            <div className="rw-label">칼로리</div>
            <input className="rw-input" type="number" placeholder="350" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </div>
        </div>

        <div className="rw-field">
          <div className="rw-label">매운맛</div>
          <div className="rw-spicy-group">
            {SPICY_LEVELS.map((s) => (
              <button key={s.value} type="button" className={`rw-spicy-btn ${spicyLevel === s.value ? 'active' : ''}`} onClick={() => setSpicyLevel(s.value)}>
                {s.value > 0 && '🌶️'.repeat(Math.min(s.value, 3)) + ' '}{s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rw-field">
          <div className="rw-label">태그</div>
          <input className="rw-input" placeholder="쉼표로 구분 (예: 찌개,매운,인기)" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        <div className="rw-divider" />

        {/* 재료 */}
        <div className="rw-field">
          <div className="rw-label">재료 <span className="rw-required">*</span></div>
          <div className="rw-dynamic-list">
            {ingredients.map((ing, i) => (
              <div key={i} className="rw-dynamic-row">
                <input className="rw-input" placeholder="재료명" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} />
                <input className="rw-input rw-input-small" placeholder="양" value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', e.target.value)} />
                {ingredients.length > 1 && <button type="button" className="rw-remove-btn" onClick={() => removeIngredient(i)}>✕</button>}
              </div>
            ))}
            <button type="button" className="rw-add-btn" onClick={addIngredient}>+ 재료 추가</button>
          </div>
        </div>

        <div className="rw-divider" />

        {/* 조리법 */}
        <div className="rw-field">
          <div className="rw-label">만드는 법 <span className="rw-required">*</span></div>
          <div className="rw-dynamic-list">
            {steps.map((step, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div className="rw-dynamic-row">
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, minWidth: 28 }}>{i + 1}단계</span>
                  <input className="rw-input" placeholder="조리 방법" value={step.instruction} onChange={(e) => updateStep(i, 'instruction', e.target.value)} />
                  {steps.length > 1 && <button type="button" className="rw-remove-btn" onClick={() => removeStep(i)}>✕</button>}
                </div>
                <div style={{ paddingLeft: 28, marginTop: 4 }}>
                  <input className="rw-input" placeholder="💡 팁 (선택)" value={step.tip} onChange={(e) => updateStep(i, 'tip', e.target.value)} style={{ fontSize: '0.8rem' }} />
                </div>
              </div>
            ))}
            <button type="button" className="rw-add-btn" onClick={addStep}>+ 단계 추가</button>
          </div>
        </div>

        <button type="submit" className="rw-submit-btn" disabled={!title.trim() || submitting}>
          {submitting ? '등록 중...' : '레시피 등록'}
        </button>
      </form>
    </div>
  );
}

export default MyRecipeWritePage;
