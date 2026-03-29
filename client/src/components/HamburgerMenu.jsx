const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EF4444'];
const username = 'אנונימי_84';
const avatarColor = AVATAR_COLORS[2];

const SQUADS = [
  { label: 'אגד – עוצרים את דילוגי קו 480' },
  { label: 'הראל ביטוח – מסורבי סיעוד' },
];

const BATTLES = [
  { label: 'יס/סלקום – מבצעים גם ללקוחות נאמנים 3+ שנים!' },
];

const PERSONAL = [
  { icon: '🔖', label: 'צעקות ששמרתי', bg: '#FEF9E7' },
  { icon: '🪙', label: 'ארנק הנתונים', sub: 'שמירת מזהים להתלונות אנונימיות', bg: '#F0F9FF' },
  { icon: '🏆', label: 'הישגים ותגים', bg: '#F5F3FF' },
  { icon: '👥', label: 'הזמן חברים למאבק', bg: '#FEF2F2' },
];

const INFO = [
  { icon: '💬', label: 'צור קשר', bg: '#F0FDF4' },
  { icon: '📋', label: 'תקנון ותנאי שימוש', bg: '#F5F5F5' },
  { icon: '❓', label: 'פרטים על האפליקציה', bg: '#F5F5F5' },
];

export default function HamburgerMenu({ onClose, onNav }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {/* Profile */}
        <div className="drawer-header">
          <div className="drawer-profile">
            <div className="drawer-avatar" style={{ background: avatarColor }}>
              👤
            </div>
            <div>
              <div className="drawer-username">{username}</div>
              <div className="drawer-view-profile">צפה בפרופיל שלך</div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {/* My squads */}
        <div className="drawer-section-label">קבוצות לחץ וייחזמות שלי</div>
        {SQUADS.map((s, i) => (
          <button key={i} className="drawer-item" onClick={() => onNav('squads')}>
            <div className="drawer-item-icon" style={{ background: '#FEF9E7', fontSize: 18 }}>⚡</div>
            {s.label}
          </button>
        ))}

        <div className="drawer-section-label">ייחזמות מאבק שיצרתי</div>
        {BATTLES.map((b, i) => (
          <button key={i} className="drawer-item" onClick={() => onNav('squads')}>
            <div className="drawer-item-icon" style={{ background: '#FEF2F2', fontSize: 18 }}>🔥</div>
            {b.label}
          </button>
        ))}

        {/* Yellow section header */}
        <button className="drawer-section-btn" onClick={() => onNav('feed')}>
          פעולות אישיות
        </button>

        {PERSONAL.map((p, i) => (
          <button key={i} className="drawer-item">
            <div className="drawer-item-icon" style={{ background: p.bg }}>{p.icon}</div>
            <div style={{ textAlign: 'right' }}>
              {p.label}
              {p.sub && <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{p.sub}</div>}
            </div>
          </button>
        ))}

        <div className="divider" style={{ margin: '8px 0' }} />

        <button className="drawer-section-btn" style={{ background: 'var(--black)', color: '#fff' }}>
          עזרה ומידע
        </button>

        {INFO.map((item, i) => (
          <button key={i} className="drawer-item">
            <div className="drawer-item-icon" style={{ background: item.bg }}>{item.icon}</div>
            {item.label}
          </button>
        ))}

        <div style={{ height: 40 }} />
      </div>
    </>
  );
}
