import { useState } from 'react';

const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EF4444'];

function ShareSheet({ onClose }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard?.writeText('https://shout.app/invite');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({
        title: 'Shout – זירת הצרכנים',
        text: 'הצטרף/י למאבק שלי ב-Shout!',
        url: 'https://shout.app/invite',
      });
    }
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', borderRadius: '20px 20px 0 0', padding: '20px', paddingBottom: 30 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, textAlign: 'right' }}>הזמן חברים ל-Shout</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 16, textAlign: 'right' }}>
          עוד חברים = עוד כוח במאבק!
        </div>
        {navigator.share && (
          <button onClick={shareNative} style={{
            width: '100%', padding: 13, marginBottom: 10,
            background: 'var(--yellow)', border: 'none', borderRadius: 12,
            fontFamily: 'Heebo', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            📤 שתף עכשיו
          </button>
        )}
        <button onClick={copyLink} style={{
          width: '100%', padding: 13, marginBottom: 10,
          background: copied ? 'var(--green)' : 'var(--gray-100)',
          border: 'none', borderRadius: 12,
          fontFamily: 'Heebo', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          color: copied ? '#fff' : 'var(--dark)',
        }}>
          {copied ? '✓ הקישור הועתק!' : '🔗 העתק קישור הזמנה'}
        </button>
        <a
          href={'https://wa.me/?text=' + encodeURIComponent('הצטרף/י למאבק שלי ב-Shout! https://shout.app/invite')}
          target="_blank" rel="noreferrer"
          style={{
            display: 'block', padding: 13, textAlign: 'center',
            background: '#25D366', color: '#fff',
            borderRadius: 12, fontFamily: 'Heebo', fontSize: 14, fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          📲 שלח בוואטסאפ
        </a>
      </div>
    </div>
  );
}

export default function HamburgerMenu({ onClose, onNav }) {
  const [showShare, setShowShare] = useState(false);
  const nickname = localStorage.getItem('shout_nickname') || 'אנונימי_84';
  const avatarColor = AVATAR_COLORS[nickname.charCodeAt(0) % AVATAR_COLORS.length];
  const isLoggedIn = !!localStorage.getItem('shout_nickname');

  function handleLogout() {
    localStorage.removeItem('shout_nickname');
    localStorage.removeItem('shout_onboarded');
    localStorage.removeItem('shout_session');
    onClose();
    window.location.reload();
  }

  const PERSONAL_ACTIONS = [
    { icon: '⚡', label: 'מאבקים שיזמתי', bg: '#FEF9E7', action: () => { onNav('squads'); } },
    { icon: '🤝', label: 'מאבקים שהצטרפתי אליהם', bg: '#EFF6FF', action: () => { onNav('squads'); } },
    { icon: '📅', label: 'אירועים ביומן (וובינרים)', bg: '#F0FDF4', action: () => {} },
    { icon: '📣', label: 'הצעקות שלי', bg: '#FFF7ED', action: () => { onNav('profile'); } },
    { icon: '🏆', label: 'הישגים וניצחונות', bg: '#F5F3FF', action: () => { onNav('profile'); } },
    { icon: '👥', label: 'הזמן חברים ל-Shout', bg: '#FEF2F2', action: () => setShowShare(true) },
    { icon: '🔒', label: 'פרטים אישיים מאובטחים', bg: '#F8FAFC', action: () => { onNav('profile'); } },
  ];

  const INFO = [
    { icon: '💬', label: 'צור קשר', bg: '#F0FDF4' },
    { icon: '📋', label: 'תקנון ותנאי שימוש', bg: '#F5F5F5' },
    { icon: '❓', label: 'אודות Shout', bg: '#F5F5F5' },
  ];

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {/* Profile */}
        <div className="drawer-header">
          <div className="drawer-profile">
            <div className="drawer-avatar" style={{ background: avatarColor }}>
              {nickname.charAt(0)}
            </div>
            <div>
              <div className="drawer-username">{nickname}</div>
              <button
                className="drawer-view-profile"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Heebo', color: 'var(--orange)', textDecoration: 'underline', fontSize: 12 }}
                onClick={() => onNav('profile')}
              >
                צפה בפרופיל שלך →
              </button>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {/* Personal actions — label (not a button) */}
        <div style={{
          padding: '8px 16px 4px', fontSize: 11, fontWeight: 800,
          color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5,
          borderTop: '1px solid var(--gray-100)',
        }}>
          פעולות אישיות
        </div>

        {PERSONAL_ACTIONS.map((p, i) => (
          <button
            key={i}
            className="drawer-item"
            onClick={() => { p.action(); onClose(); }}
          >
            <div className="drawer-item-icon" style={{ background: p.bg }}>{p.icon}</div>
            {p.label}
          </button>
        ))}

        <div className="divider" style={{ margin: '8px 0' }} />

        {/* Info section */}
        <div style={{
          padding: '8px 16px 4px', fontSize: 11, fontWeight: 800,
          color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          עזרה ומידע
        </div>

        {INFO.map((item, i) => (
          <button key={i} className="drawer-item">
            <div className="drawer-item-icon" style={{ background: item.bg }}>{item.icon}</div>
            {item.label}
          </button>
        ))}

        {/* Logout */}
        {isLoggedIn && (
          <button
            className="drawer-item"
            onClick={handleLogout}
            style={{ color: 'var(--red)', marginTop: 4 }}
          >
            <div className="drawer-item-icon" style={{ background: '#FEF2F2' }}>🚪</div>
            התנתקות
          </button>
        )}

        <div style={{ height: 40 }} />
      </div>

      {showShare && <ShareSheet onClose={() => setShowShare(false)} />}
    </>
  );
}
