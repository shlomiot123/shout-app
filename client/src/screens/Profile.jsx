const BADGES = [
  { icon: '🔥', label: 'שואג ראשוני', desc: 'פרסמת את הצעקה הראשונה שלך', locked: false },
  { icon: '⚡', label: 'לוחם מאבק', desc: 'הצטרפת ל-3 קבוצות לחץ', locked: false },
  { icon: '📣', label: 'נגן עיקרי', desc: 'קיבלת 100 הדהודים', locked: false },
  { icon: '🏆', label: 'מנצח', desc: 'השתתפת במאבק שנגמר בניצחון', locked: false },
  { icon: '🎯', label: 'מדויק', desc: 'שלחת 5 צעקות עם אסמכתה', locked: true },
  { icon: '👑', label: 'מנהיג מאבק', desc: 'יצרת קבוצת לחץ', locked: true },
];

const MY_SHOUTS = [
  { id: 1, company: 'הוט', text: 'חסמו לי את השירות ביום לפני חגים...', echoes: 312, time: 'לפני 3 ימים' },
  { id: 2, company: 'רכבת ישראל', text: 'ביטול לא מוצדק ברגע האחרון...', echoes: 88, time: 'לפני שבוע' },
  { id: 3, company: 'הראל ביטוח', text: 'סרבו לתביעה עם כל המסמכים...', echoes: 45, time: 'לפני 2 שבועות' },
];

export default function Profile({ onClose, onNav }) {
  const nickname = localStorage.getItem('shout_nickname') || 'אנונימי_84';
  const initial = nickname.charAt(0);

  const stats = [
    { label: 'צעקות', value: '3', icon: '📣' },
    { label: 'הדהודים', value: '1.2K', icon: '🤝' },
    { label: 'קבוצות', value: '2', icon: '⚡' },
    { label: 'נקודות', value: '480', icon: '⭐' },
  ];

  return (
    <div style={{ background: 'var(--gray-100)', minHeight: '100%', paddingBottom: 40 }}>
      {/* Profile header */}
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
        >
          ✕
        </button>
        <div className="profile-avatar-large">{initial}</div>
        <div className="profile-nickname">{nickname}</div>
        <div className="profile-since">חבר מאז ינואר 2024 · צרכן פעיל</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '12px 12px 0' }}>
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center', padding: '12px 6px',
              background: 'var(--white)', borderRadius: 12,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Data wallet */}
      <div style={{ margin: '12px 12px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1C1C1E 0%, #374151 100%)',
          borderRadius: 16, padding: '16px', color: '#fff',
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>🪙 ארנק הנתונים</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 12, lineHeight: 1.5 }}>
            הנתונים שלך שמורים בצורה מוצפנת. ניתן לאשר שיתוף מחקרי אנונימי ולצבור נקודות.
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.1)', borderRadius: 10,
            padding: '10px 12px', marginBottom: 12,
          }}>
            <span style={{ fontSize: 13 }}>נקודות נצברות</span>
            <span style={{ color: 'var(--yellow)', fontWeight: 800, fontSize: 15 }}>480 pts</span>
          </div>
          <button style={{
            width: '100%', padding: '11px',
            background: 'var(--yellow)', border: 'none', borderRadius: 10,
            fontFamily: 'Heebo', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            color: 'var(--black)',
          }}>
            🔓 אשר שיתוף מחקרי אנונימי
          </button>
        </div>
      </div>

      {/* Badges */}
      <div style={{ padding: '16px 12px 0' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>🏅 תגים והישגים</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {BADGES.map((b, i) => (
            <div
              key={i}
              style={{
                background: b.locked ? 'var(--gray-50)' : 'var(--white)',
                borderRadius: 12, padding: '12px',
                border: '1.5px solid',
                borderColor: b.locked ? 'var(--gray-200)' : 'var(--yellow)',
                opacity: b.locked ? 0.55 : 1,
                boxShadow: b.locked ? 'none' : 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{b.locked ? '🔒' : b.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{b.label}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', marginTop: 2, lineHeight: 1.4 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My shouts */}
      <div style={{ padding: '16px 12px 0' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>📣 הצעקות שלי</div>
        {MY_SHOUTS.map(s => (
          <div
            key={s.id}
            style={{
              background: 'var(--white)', borderRadius: 12,
              padding: '12px 14px', marginBottom: 8,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{
                background: 'var(--red)', color: '#fff',
                borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700,
              }}>
                {s.company}
              </span>
              <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{s.time}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 6 }}>{s.text}</div>
            <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>
              🤝 {s.echoes} הדהודים
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
