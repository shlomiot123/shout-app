import { useState } from 'react';

const DEMO_COMPANIES = [
  { id: 'HOT01', name: 'הוט', color: '#EF4444', anger: 95, open: 142, resolved: 28, response: 18 },
  { id: 'PAR01', name: 'פרטנר', color: '#F97316', anger: 88, open: 98, resolved: 41, response: 22 },
  { id: 'CEL01', name: 'סלקום', color: '#3B82F6', anger: 91, open: 115, resolved: 33, response: 15 },
];

const DEMO_SHOUTS = [
  { id: 1, user: 'אנונימי_78', text: 'ניתקתם אותי שוב לאחר תשלום מלא. שלוש פעמים בחודש זה מקובל?', anger: 5, time: 'לפני 2 שעות' },
  { id: 2, user: 'אנונימי_44', text: 'לא ניתן להגיע לנציג אנושי. בוט אחרי בוט. אבדתי 40 דקות.', anger: 4, time: 'לפני 4 שעות' },
  { id: 3, user: 'אנונימי_12', text: 'עלייה פתאומית בחיוב ב-80 שקל בלי הסבר. מה הולך כאן?', anger: 3, time: 'לפני 6 שעות' },
  { id: 4, user: 'אנונימי_99', text: 'הבטחתם להחזיר לי כסף. 3 שבועות עברו ואין שום דבר.', anger: 4, time: 'לפני 8 שעות' },
];

function CorporateDashboard({ company, onLogout, onBack }) {
  const [tab, setTab] = useState('dashboard');
  const [replyTexts, setReplyTexts] = useState({});
  const [replied, setReplied] = useState({});
  const [webinarDate, setWebinarDate] = useState('');
  const [webinarScheduled, setWebinarScheduled] = useState(false);

  function handleReply(id) {
    if (!replyTexts[id]?.trim()) return;
    setReplied(r => ({ ...r, [id]: replyTexts[id] }));
    setReplyTexts(t => ({ ...t, [id]: '' }));
  }

  const stats = [
    { label: 'תלונות פתוחות', value: company.open.toString(), color: '#EF4444', icon: '📣' },
    { label: 'נפתרו השבוע', value: company.resolved.toString(), color: '#10B981', icon: '✅' },
    { label: 'שיעור מענה', value: company.response + '%', color: '#F97316', icon: '💬' },
    { label: 'מדד זעם', value: company.anger + '/100', color: '#EF4444', icon: '🔥' },
  ];

  return (
    <div className="corp-dashboard">
      <div className="corp-dash-header">
        <button className="corp-back-btn" onClick={onBack}>← יציאה</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: company.color, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 700,
          }}>
            {company.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{company.name}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>פורטל ניהול תלונות</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{ fontSize: 12, color: 'var(--gray-500)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          התנתקות
        </button>
      </div>

      {/* Tabs */}
      <div className="corp-tabs">
        {[
          { key: 'dashboard', label: 'לוח בקרה' },
          { key: 'shouts', label: `תלונות (${company.open})` },
          { key: 'webinar', label: 'עיריית שאוט' },
        ].map(t => (
          <button
            key={t.key}
            className={`corp-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {tab === 'dashboard' && (
          <div style={{ padding: 12 }}>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {stats.map((s, i) => (
                <div key={i} className="corp-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', textAlign: 'center' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Trend chart */}
            <div className="corp-trend-card">
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>📊 מגמת תלונות – 12 שבועות</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
                {[30, 45, 38, 62, 55, 80, 95, 72, 68, 85, 90, 95].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1, background: `hsl(${Math.max(0, 20 - i * 2)}, 90%, 55%)`,
                      borderRadius: '3px 3px 0 0',
                      height: `${(h / 100) * 60}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action banner */}
            <div className="corp-action-banner">
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>🚨 נדרשת פעולה מיידית</div>
              <div style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 12 }}>
                {company.open} תלונות לא נענו. שיעור המענה שלך ({company.response}%) נמוך מהממוצע (45%).
              </div>
              <button className="btn-primary yellow" style={{ fontSize: 13 }} onClick={() => setTab('shouts')}>
                עבור לניהול תלונות →
              </button>
            </div>

            {/* Tip */}
            <div style={{
              margin: '12px 0', padding: 12, background: 'var(--blue)', borderRadius: 12,
              color: '#fff', fontSize: 13,
            }}>
              <strong>💡 טיפ:</strong> חברות שמגיבות תוך 24 שעות רואות ירידה של 60% בהסלמת תלונות.
            </div>
          </div>
        )}

        {tab === 'shouts' && (
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--gray-700)' }}>
              {company.open} תלונות ממתינות לתגובה
            </div>
            {DEMO_SHOUTS.map(s => (
              <div key={s.id} className="corp-shout-card">
                <div className="corp-shout-header">
                  <span className="corp-shout-user">{s.user}</span>
                  <span className="corp-shout-time">{s.time}</span>
                  <span>{'🔥'.repeat(s.anger)}</span>
                </div>
                <div className="corp-shout-text">{s.text}</div>
                {replied[s.id] ? (
                  <div className="corp-replied">
                    ✅ תגובה רשמית נשלחה: <em>{replied[s.id]}</em>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input
                      className="corp-reply-input"
                      placeholder="כתוב תגובה רשמית..."
                      value={replyTexts[s.id] || ''}
                      onChange={e => setReplyTexts(t => ({ ...t, [s.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleReply(s.id)}
                    />
                    <button
                      className="btn-primary"
                      style={{ background: 'var(--dark)', color: '#fff', fontSize: 13, padding: '8px 14px', flexShrink: 0 }}
                      onClick={() => handleReply(s.id)}
                      disabled={!replyTexts[s.id]?.trim()}
                    >
                      שלח
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'webinar' && (
          <div style={{ padding: 12 }}>
            <div className="corp-webinar-card">
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>עיריית שאוט – Live</div>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16, lineHeight: 1.6 }}>
                ערוך שיחה ישירה עם הצרכנים. ענה על שאלות בזמן אמת ופתר מחלוקות בפומבי.
                עיריית שאוט מעלה את דירוג האמון שלך ב-35% בממוצע.
              </div>

              {webinarScheduled ? (
                <div style={{
                  background: 'var(--green-light)', border: '1.5px solid var(--green-border)',
                  borderRadius: 12, padding: 14, marginBottom: 14, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>✅</div>
                  <div style={{ fontWeight: 700, color: 'var(--green)' }}>עיריית שאוט נקבעה!</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>{webinarDate}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                    הצרכנים יקבלו התראה. הכן תגובות לנושאים הבוערים.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>
                      תאריך ושעה
                    </label>
                    <input
                      type="datetime-local"
                      className="corp-input"
                      value={webinarDate}
                      onChange={e => setWebinarDate(e.target.value)}
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                  <button
                    className="btn-primary yellow"
                    style={{ width: '100%', marginBottom: 8 }}
                    disabled={!webinarDate}
                    onClick={() => setWebinarScheduled(true)}
                  >
                    📅 תאם עיריית שאוט
                  </button>
                </>
              )}

              <button className="btn-ghost" style={{ width: '100%' }}>
                📺 צפה בארכיון עיריות
              </button>
            </div>

            <div style={{
              margin: '12px 0', padding: 12,
              background: 'var(--yellow-pale)', borderRadius: 12,
              fontSize: 13, color: 'var(--gray-700)',
            }}>
              <strong>📊 נתוני עיריות קודמות:</strong> חברות שערכו עיריית שאוט ראו ירידה ממוצעת של 42% בתלונות החדשות בשבועיים שלאחר מכן.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CorporatePortal({ onBack }) {
  const [screen, setScreen] = useState('login'); // login | dashboard
  const [email, setEmail] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedCompany, setLoggedCompany] = useState(null);
  const [error, setError] = useState('');

  function handleLogin() {
    const found = DEMO_COMPANIES.find(c => c.id === companyId.toUpperCase().trim());
    if (found && email.includes('@') && password.length >= 4) {
      setLoggedCompany(found);
      setScreen('dashboard');
    } else {
      setError('פרטי ההתחברות שגויים.');
      setTimeout(() => setError(''), 4000);
    }
  }

  if (screen === 'dashboard' && loggedCompany) {
    return (
      <CorporateDashboard
        company={loggedCompany}
        onLogout={() => { setScreen('login'); setLoggedCompany(null); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="corp-portal">
      <div className="corp-portal-header">
        <button className="corp-back-btn" onClick={onBack}>← חזור</button>
        <div className="corp-logo">🏢 כניסת נציגים</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="corp-login-card">
        <div style={{ fontSize: 30, marginBottom: 8 }}>🏢</div>
        <div className="corp-login-title">פורטל ניהול תלונות</div>
        <div className="corp-login-sub">כניסה לנציגי תאגידים בלבד</div>

        {error && <div className="corp-error">{error}</div>}

        <div className="corp-field">
          <label>כתובת מייל חברה</label>
          <input
            className="corp-input"
            type="email"
            placeholder="name@company.co.il"
            value={email}
            onChange={e => setEmail(e.target.value)}
            dir="ltr"
          />
        </div>

        <div className="corp-field">
          <label>מזהה חברה</label>
          <input
            className="corp-input"
            placeholder="לדוגמה: HOT01"
            value={companyId}
            onChange={e => setCompanyId(e.target.value.toUpperCase())}
            dir="ltr"
          />
        </div>

        <div className="corp-field">
          <label>סיסמה</label>
          <input
            className="corp-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          className="btn-primary"
          disabled={!email || !companyId || !password}
          onClick={handleLogin}
          style={{ background: 'var(--dark)', color: '#fff', width: '100%', marginTop: 8 }}
        >
          כניסה לפורטל
        </button>

        <div className="corp-demo-hint">
          <strong>דמו:</strong> HOT01 | any@email.com | 1234
        </div>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <button className="onboarding-back-link" onClick={onBack}>עוד לא נרשמת? צור קשר</button>
        </div>
      </div>
    </div>
  );
}
