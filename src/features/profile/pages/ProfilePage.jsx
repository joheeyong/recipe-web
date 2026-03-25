import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { logout } from '../../auth/slice/authSlice';
import './ProfilePage.css';

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const providerLabel = {
    google: 'Google',
    naver: 'Naver',
    kakao: 'Kakao',
  }[user.provider] || user.provider;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.profileImage ? (
            <img src={user.profileImage} alt="" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-fallback">
              {(user.name || user.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="profile-name">{user.name || '사용자'}</h1>
        <p className="profile-email">{user.email}</p>

        {user.provider && (
          <span className="profile-provider">{providerLabel} 계정</span>
        )}

        <div className="profile-menu">
          <div className="profile-menu-item" onClick={() => navigate('/onboarding')}>
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <span>입맛 설정</span>
            <span className="profile-menu-arrow">&rsaquo;</span>
          </div>

          <div className="profile-menu-item" onClick={() => navigate('/bookmarks')}>
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <span>저장한 레시피</span>
            <span className="profile-menu-arrow">&rsaquo;</span>
          </div>
        </div>

        <button className="profile-logout-btn" onClick={handleLogout}>
          로그아웃
        </button>

        <p className="profile-version">Recipe v1.0.0</p>
      </div>
    </div>
  );
}

export default ProfilePage;
