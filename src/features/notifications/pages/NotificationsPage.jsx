import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../../../core/api/apiClient';
import './NotificationsPage.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadNotifications();
  }, [user]);

  async function loadNotifications() {
    try {
      const data = await apiClient.get('/api/notifications');
      setNotifications(data);
      // 전체 읽음 처리
      await apiClient.put('/api/notifications/read-all');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await apiClient.del(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  }

  function handleClick(noti) {
    if (noti.recipeId) navigate(`/recipes/${noti.recipeId}`);
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="notifications-title">알림</h1>
      </div>

      {loading ? (
        <div className="notifications-loading">
          <div className="notif-spinner" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <p>알림이 없습니다</p>
        </div>
      ) : (
        <ul className="notifications-list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notification-item${n.read ? '' : ' unread'}`}
              onClick={() => handleClick(n)}
            >
              <div className="notification-icon">
                {n.type === 'REVIEW' ? '⭐' : '📝'}
              </div>
              <div className="notification-content">
                <p className="notification-text">
                  <strong>{n.actorName}</strong>님이{' '}
                  <em>"{n.recipeTitle}"</em>에{' '}
                  {n.type === 'REVIEW' ? '리뷰를 남겼어요' : '블로그를 작성했어요'}
                </p>
                <span className="notification-time">{timeAgo(n.createdAt)}</span>
              </div>
              <button
                className="notification-delete"
                onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsPage;
