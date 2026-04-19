import { useState } from 'react';
import { API } from '../App.jsx';

const SUGGESTED = 'אנונימי_' + (Math.floor(Math.random() * 900) + 100);

const SOCIAL_BTN = {
  google:   { label: 'המשך עם Google',   icon: '🔵', bg: '#fff',    color: '#3C4043', border: '#dadce0' },
  apple:    { label: 'המשך עם Apple',    icon: '🍎', bg: '#000',    color: '#fff',    border: '#000' },
  facebook: { label: 'המשך עם Facebook', icon: '📘', bg: '#1877F2', color: '#fff',    border: '#1877F2' },
};

export default function LoginModal({ onClose, onLoggedIn }) {
  const [tab, setTab] = useState('social'); // social | nickname
  const [nickname, setNickname] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleNicknameLogin() {
    if (!acceptTerms) return;
    const name = nickname.trim() || SUGGESTED;
    setLoading(true);
    try {
      const { user } = await API.post('/api/auth/login', { nickname: name });
      localStorage.setItem('shout_nickname', user.nickname);
      localStorage.setItem('shout_user_id', user.id);
      localStorage.setItem('shout_avatar_color', user.avatar_color);
      localStorage.setItem('shout_logged_in', '1');
      onLoggedIn(user);
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider) {
    if (provider === 'google') {
      // Real OAuth redirect — server handles callback
      window.location.href = `/api/auth/google`;
      return;
    }
    // Mock for Apple/Facebook — creates user with provider name
    setLoading(true);
    try {
      const name = provider === 'apple' ? 'משתמש Apple' : 'משתמש Facebook';
      const { user } = await API.post('/api/auth/social', {
        provider,
        provider_id: `${provider}_${Math.random().toString(36).slice(2)}`,
        name,
      });
      localStorage.setItem('shout_nickname', user.nickname);
      localStorage.setItem('shout_user_id', user.id);
      localStorage.setItem('shout_avatar_color', user.avatar_color);
      localStorage.setItem('shout_logged_in', '1');
      onLoggedIn(user);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ padding: '24px 20px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📣</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>כניסה לזירה</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>
            כדי לצעוק, לבסט ולהצטרף למאבקים
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'flex', background: 'var(--gray-100)', borderRadius: 10,
          padding: 4, marginBottom: 20,
        }}>
          {[{ key: 'social', label: 'חשבון חברתי' }, { key: 'nickname', label: 'כינוי אנונימי' }].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t.key ? 'var(--white)' : 'transparent',
                fontFamily: 'Heebo', fontWeight: 700, fontSize: 12,
                color: tab === t.key ? 'var(--dark)' : 'var(--gray-500)',
                boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
              }}
            >{t.label}</button>
          ))}
        </div>

        {tab === 'social' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {Object.entries(SOCIAL_BTN).map(([provider, cfg]) => (
              <button
                key={provider}
                disabled={loading}
                onClick={() => handleSocial(provider)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '13px', borderRadius: 12,
                  background: cfg.bg, color: cfg.color,
                  border: `1.5px solid ${cfg.border}`,
                  fontFamily: 'Heebo', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                {cfg.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>כינוי (אנונימי)</div>
            <input
              className="company-search"
              placeholder={SUGGESTED}
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>
              ריק = {SUGGESTED}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--yellow)', width: 16, height: 16 }}
              />
              <span style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.5 }}>
                קראתי ומסכים/ה לתנאי השימוש ולמדיניות הפרטיות
              </span>
            </label>

            <button
              className="btn-primary yellow"
              style={{ width: '100%', padding: 14, fontSize: 15, marginTop: 16, opacity: loading ? 0.6 : 1 }}
              disabled={!acceptTerms || loading}
              onClick={handleNicknameLogin}
            >
              {loading ? '...' : '📣 כניסה לזירה!'}
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', marginBottom: 12 }}>
          הכניסה החברתית מאובטחת ואינה חולקת סיסמאות
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: 12, background: 'none',
            border: 'none', fontFamily: 'Heebo', fontSize: 13, color: 'var(--gray-500)',
            cursor: 'pointer',
          }}
        >
          אולי אחר כך
        </button>
      </div>
    </div>
  );
}
