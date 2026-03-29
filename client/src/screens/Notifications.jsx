import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

export default function Notifications() {
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/notifications').then(d => { setData(d); setLoading(false); });
  }, []);

  async function markAllRead() {
    await API.post('/api/notifications/read-all');
    setData(d => ({
      ...d,
      unread: 0,
      notifications: d.notifications.map(n => ({ ...n, is_read: 1 })),
    }));
  }

  return (
    <>
      <div className="notif-header">
        <div className="notif-title">התראות</div>
        {data.unread > 0 && (
          <button className="notif-read-all" onClick={markAllRead}>
            סמן הכל כנקרא
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>טוען...</div>
      ) : data.notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-title">אין התראות</div>
          <div className="empty-state-sub">כשיהיו עדכונים למאבקים שלך – הם יופיעו כאן</div>
        </div>
      ) : (
        data.notifications.map(n => (
          <div key={n.id} className={`notif-item${!n.is_read ? ' unread' : ''}`}>
            <div className="notif-icon-wrap">{n.icon}</div>
            <div className="notif-content">
              <div className="notif-message">{n.message}</div>
              <div className="notif-time">{n.time_ago}</div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
