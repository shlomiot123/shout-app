import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

export default function Profile({ onClose, onNav, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/profile')
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const nickname = data?.nickname || localStorage.getItem('shout_nickname') || 'אנונימי';
  const avatarColor = data?.avatar_color || localStorage.getItem('shout_avatar_color') || '#F97316';
  const initial = nickname.charAt(0);

  const badges = [
    { icon: '🔥', label: 'שואג ראשוני', desc: 'פרסמת את הצעקה הראשונה שלך', earned: (data?.stats?.shouts || 0) >= 1 },
    { icon: '⚡', label: 'לוחם מאבק', desc: 'הצטרפת ל-3 קבוצות לחץ', earned: (data?.stats?.squads || 0) >= 3 },
    { icon: '📣', label: 'נגן עיקרי', desc: 'קיבלת 100 הזדהויות', earned: (data?.stats?.echoes || 0) >= 100 },
    { icon: '👑', label: 'מנהיג מאבק', desc: 'יצרת קבוצת לחץ', earned: (data?.stats?.squads_created || 0) >= 1 },
    { icon: '🎯', label: 'מדויק', desc: 'שלחת 5 צעקות עם אסמכתה', earned: false },
    { icon: '🏆', label: 'מנצח', desc: 'השתתפת במאבק מנצח', earned: false },
  ];

  const isLoggedIn = !!localStorage.getItem('shout_logged_in');

  return (
    <div style={{ background: 'var(--gray-100)', minHeight: '100%', paddingBottom: 40 }}>
      {/* Header */}
      <div className="profile-header">
        <button
          onClick={onClose}
          style={{
            position: 'absolute', left: 16, top: 16,
            background: 'rgba(255,255,255,0.2)', border: 'none',
            borderRadius: '50%', width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, cursor: 'pointer', color: '#fff',
          }}
        >✕</button>
        <div
          className="profile-avatar-large"
          style={{ background: avatarColor }}
        >{initial}</div>
        <div className="profile-nickname">{nickname}</div>
        <div className="profile-since">
          {loading ? '...' : `חבר ${data?.member_since} · צרכן פעיל`}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '12px 12px 0' }}>
        {[
          { label: 'צעקות',    value: loading ? '…' : (data?.stats?.shouts || 0),               icon: '📣' },
          { label: 'הזדהויות', value: loading ? '…' : (data?.stats?.echoes || 0).toLocaleString('he-IL'), icon: '🤝' },
          { label: 'קבוצות',   value: loading ? '…' : (data?.stats?.squads || 0),                icon: '⚡' },
          { label: 'יצרתי',    value: loading ? '…' : (data?.stats?.squads_created || 0),        icon: '👑' },
        ].map((s, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '12px 6px',
            background: 'var(--white)', borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Privacy notice */}
      <div style={{ margin: '12px 12px 0', padding: '10px 14px', background: '#F0FDF4', borderRadius: 12, border: '1px solid #86EFAC', fontSize: 12, color: '#15803D', direction: 'rtl' }}>
        🔒 הפרופיל שלך פרטי. אנשים אחרים רואים רק את הכינוי שלך וספירת הצעקות.
      </div>

      {/* Badges */}
      <div style={{ padding: '16px 12px 0' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>🏅 תגים והישגים</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {badges.map((b, i) => (
            <div key={i} style={{
              background: b.earned ? 'var(--white)' : 'var(--gray-50)',
              borderRadius: 12, padding: '12px',
              border: `1.5px solid ${b.earned ? 'var(--yellow)' : 'var(--gray-200)'}`,
              opacity: b.earned ? 1 : 0.55,
              boxShadow: b.earned ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{b.earned ? b.icon : '🔒'}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{b.label}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', marginTop: 2, lineHeight: 1.4 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My shouts */}
      <div style={{ padding: '16px 12px 0' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>📣 הצעקות שלי</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>טוען...</div>
        ) : !data?.shouts?.length ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            עדיין לא פרסמת צעקות
          </div>
        ) : data.shouts.map(s => (
          <div key={s.id} style={{
            background: 'var(--white)', borderRadius: 12,
            padding: '12px 14px', marginBottom: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              {s.company_name ? (
                <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  {s.company_name}
                </span>
              ) : <span />}
              <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{s.time_ago}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 6, direction: 'rtl', lineHeight: 1.5 }}>
              {s.content.length > 120 ? s.content.slice(0, 120) + '…' : s.content}
            </div>
            <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>
              🤝 {s.echoes || 0} הזדהו
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      {isLoggedIn && (
        <div style={{ padding: '16px 12px 0' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', padding: 13, borderRadius: 12, border: '1.5px solid var(--gray-200)',
              background: 'var(--white)', fontFamily: 'Heebo', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', color: 'var(--red)',
            }}
          >
            🚪 התנתקות
          </button>
        </div>
      )}
    </div>
  );
}
