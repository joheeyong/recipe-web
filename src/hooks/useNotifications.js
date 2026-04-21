import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../core/api/apiClient';

const POLL_INTERVAL = 30000;

export function useNotifications() {
  const { user } = useSelector((state) => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiClient.get('/api/notifications/unread-count');
      setUnreadCount(data.count || 0);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    if (!user) return;
    const timer = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchUnreadCount, user]);

  return { unreadCount, refetch: fetchUnreadCount };
}
