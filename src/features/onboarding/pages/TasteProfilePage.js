import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../../../core/api/apiClient';
import './TasteProfilePage.css';

const TASTE_ITEMS = [
  { key: 'spicyLevel', label: '매운맛', icon: '🌶️', low: '순한맛', high: '아주매운' },
  { key: 'sweetnessLevel', label: '단맛', icon: '🍯', low: '안달게', high: '아주달게' },
  { key: 'saltinessLevel', label: '짠맛', icon: '🧂', low: '싱겁게', high: '아주짜게' },
  { key: 'sournessLevel', label: '신맛', icon: '🍋', low: '안시게', high: '아주시게' },
  { key: 'umamiLevel', label: '감칠맛', icon: '🍄', low: '담백하게', high: '진하게' },
  { key: 'oilinessLevel', label: '기름기', icon: '🫒', low: '담백하게', high: '기름지게' },
];

const CUISINE_OPTIONS = [
  { key: 'korean', label: '한식', icon: '🍚' },
  { key: 'western', label: '양식', icon: '🍝' },
  { key: 'chinese', label: '중식', icon: '🥟' },
  { key: 'japanese', label: '일식', icon: '🍱' },
  { key: 'sashimi', label: '회&초밥', icon: '🍣' },
  { key: 'dessert', label: '디저트', icon: '🍰' },
  { key: 'fastfood', label: '패스트푸드', icon: '🍔' },
  { key: 'southeast_asian', label: '동남아', icon: '🍜' },
  { key: 'mexican', label: '멕시칸', icon: '🌮' },
  { key: 'salad', label: '샐러드', icon: '🥗' },
];

const DEFAULT_PREFS = {
  spicyLevel: 5,
  sweetnessLevel: 5,
  saltinessLevel: 5,
  sournessLevel: 5,
  umamiLevel: 5,
  oilinessLevel: 5,
  preferredCuisines: '',
};

function TasteProfilePage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    apiClient.get('/api/preferences')
      .then((data) => {
        setPrefs({
          spicyLevel: data.spicyLevel ?? 5,
          sweetnessLevel: data.sweetnessLevel ?? 5,
          saltinessLevel: data.saltinessLevel ?? 5,
          sournessLevel: data.sournessLevel ?? 5,
          umamiLevel: data.umamiLevel ?? 5,
          oilinessLevel: data.oilinessLevel ?? 5,
          preferredCuisines: data.preferredCuisines || '',
        });
        if (data.preferredCuisines) {
          setSelectedCuisines(data.preferredCuisines.split(',').filter(Boolean));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleChange = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const toggleCuisine = (key) => {
    setSelectedCuisines((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    setSaving(true);
    const payload = { ...prefs, preferredCuisines: selectedCuisines.join(',') };
    apiClient.put('/api/preferences', payload)
      .then(() => {
        setToast('저장되었습니다');
        setTimeout(() => navigate('/profile'), 1000);
      })
      .catch(() => {
        setToast('저장에 실패했습니다');
        setTimeout(() => setToast(''), 2000);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="taste-page">
        <div className="taste-loading"><div className="taste-spinner" /></div>
      </div>
    );
  }

  return (
    <div className="taste-page">
      <div className="taste-header">
        <button className="taste-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="taste-title">입맛 설정</h1>
      </div>
      <p className="taste-subtitle">나의 맛 선호도를 설정하면 맞춤 레시피를 추천해드려요</p>

      {/* 좋아하는 음식 카테고리 */}
      <div className="taste-category-section">
        <div className="taste-category-title">좋아하는 음식 카테고리</div>
        <div className="taste-category-grid">
          {CUISINE_OPTIONS.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`taste-category-chip ${selectedCuisines.includes(c.key) ? 'active' : ''}`}
              onClick={() => toggleCuisine(c.key)}
            >
              <span className="taste-category-icon">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="taste-divider" />

      {/* 맛 슬라이더 */}
      {TASTE_ITEMS.map((item) => (
        <div key={item.key} className="taste-section">
          <div className="taste-label">
            <span className="taste-label-name">
              {item.icon} {item.label}
            </span>
            <span className="taste-label-value">{prefs[item.key]}</span>
          </div>
          <div className="taste-slider-wrap">
            <input
              type="range"
              className="taste-slider"
              min="1"
              max="10"
              value={prefs[item.key]}
              onChange={(e) => handleChange(item.key, e.target.value)}
            />
            <div className="taste-scale">
              <span>{item.low}</span>
              <span>{item.high}</span>
            </div>
          </div>
        </div>
      ))}

      <div className="taste-divider" />

      <button
        className="taste-save-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? '저장 중...' : '저장하기'}
      </button>

      {toast && <div className="taste-toast">{toast}</div>}
    </div>
  );
}

export default TasteProfilePage;
