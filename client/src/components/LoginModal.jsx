import { useState } from 'react';

const SUGGESTED = 'אנונימי_' + (Math.floor(Math.random() * 900) + 100);

export default function LoginModal({ onClose, onLoggedIn }) {
  const [nickname, setNickname] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  function handleLogin() {
    if (!acceptTerms) return;
    const name = nickname.trim() || SUGGESTED;
    localStorage.setItem('shout_nickname', name);
    localStorage.setItem('shout_onboarded', '1');
    onLoggedIn(name);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ padding: '24px 20px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📣</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>כניסה לזירה</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>
            כדי לכתוב, לבסט ולהצטרף למאבקים, יש להתחבר תחילה.
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
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
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
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
          style={{ width: '100%', padding: 14, fontSize: 15 }}
          disabled={!acceptTerms}
          onClick={handleLogin}
        >
          📣 כניסה לזירה!
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 10, padding: 12, background: 'none',
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
