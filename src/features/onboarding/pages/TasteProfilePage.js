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

const DEFAULT_PREFS = {
  spicyLevel: 5,
  sweetnessLevel: 5,
  saltinessLevel: 5,
  sournessLevel: 5,
  umamiLevel: 5,
  oilinessLevel: 5,
};

function TasteProfilePage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
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
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleChange = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = () => {
    setSaving(true);
    apiClient.put('/api/preferences', prefs)
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
