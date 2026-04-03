import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const FILTER_TYPES = ['הכל', 'צעקה', 'קבוצה', 'חברה', 'קטגוריה'];

function getNotifStyle(n) {
  const msg = (n.message || '').toLowerCase();
  const icon = n.icon || '';
  if (icon === '🚨' || msg.includes('מבזק')) return { borderColor: 'var(--red)', pulse: true };
  if (icon === '📈' || msg.includes('בוסט') || msg.includes('הדהד')) return { borderColor: 'var(--yellow)' };
  if (icon === '⚡' || msg.includes('קבוצה') || msg.includes('מאבק')) return { borderColor: 'var(--green)' };
  if (icon === '🏢' || msg.includes('רשמי') || msg.includes('תגובה')) return { borderColor: 'var(--blue)' };
  return {};
}

export default function Notifications() {
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('הכל');

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

  const filtered = data.notifications.filter(n => {
    const matchSearch = !search || (n.message || '').includes(search);
    const matchType = filterType === 'הכל' || true; // type filtering based on content is approximated
    return matchSearch && matchType;
  });

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

      {/* Search bar */}
      <div style={{ padding: '0 12px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--gray-100)', borderRadius: 10, padding: '8px 12px',
          border: '1.5px solid var(--gray-200)',
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, fontFamily: 'Heebo', flex: 1,
              direction: 'rtl', color: 'var(--dark)',
            }}
            placeholder="חפש צעקה, חברה, מאבק..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter type pills */}
      <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px', overflowX: 'auto' }}>
        {FILTER_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: 20,
              border: '1.5px solid',
              borderColor: filterType === t ? 'var(--yellow)' : 'var(--gray-200)',
              background: filterType === t ? 'var(--yellow)' : 'var(--white)',
              color: filterType === t ? 'var(--black)' : 'var(--gray-600)',
              fontFamily: 'Heebo',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-title">אין התראות</div>
          <div className="empty-state-sub">כשיהיו עדכונים למאבקים שלך – הם יופיעו כאן</div>
        </div>
      ) : (
        filtered.map(n => {
          const style = getNotifStyle(n);
          return (
            <div
              key={n.id}
              className={`notif-item${!n.is_read ? ' unread' : ''}${style.pulse ? ' notif-pulse' : ''}`}
              style={style.borderColor ? { borderRightColor: style.borderColor, borderRightWidth: 4 } : {}}
            >
              <div className="notif-icon-wrap">{n.icon}</div>
              <div className="notif-content">
                <div className="notif-message">{n.message}</div>
                <div className="notif-time">{n.time_ago}</div>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
