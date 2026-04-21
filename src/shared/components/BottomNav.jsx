import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNotifications } from '../../hooks/useNotifications';
import './BottomNav.css';

function BottomNav() {
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useNotifications();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        <span>홈</span>
      </NavLink>
      <NavLink to="/my-recipes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <span>유저</span>
      </NavLink>
      <NavLink to="/recipes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>검색</span>
      </NavLink>
      <NavLink to="/bookmarks" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span>저장</span>
      </NavLink>
      <NavLink to={user ? '/profile' : '/login'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <div className="nav-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {user && unreadCount > 0 && (
            <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </div>
        <span>{user ? '마이' : '로그인'}</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
