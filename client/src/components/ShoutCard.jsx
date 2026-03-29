import { useState } from 'react';
import { API } from '../App.jsx';

const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EF4444','#F59E0B','#06B6D4','#84CC16'];

function getColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function Flames({ level }) {
  return (
    <span className="anger-flames">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`flame${i <= level ? ' active' : ''}`}>🔥</span>
      ))}
    </span>
  );
}

export default function ShoutCard({ shout: initial, onCreateSquad }) {
  const [shout, setShout] = useState(initial);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleEcho() {
    const res = await API.post(`/api/shouts/${shout.id}/echo`);
    setShout(s => ({
      ...s,
      echoed: res.echoed,
      echoes: res.echoed ? s.echoes + 1 : s.echoes - 1,
    }));
  }

  async function handleBoost() {
    const res = await API.post(`/api/shouts/${shout.id}/boost`);
    setShout(s => ({
      ...s,
      boosted: res.boosted,
      boosts: res.boosted ? s.boosts + 1 : s.boosts - 1,
    }));
  }

  async function handleReply() {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    await API.post(`/api/shouts/${shout.id}/respond`, { content: replyText, author: 'אנונימי_84' });
    setReplyText('');
    setShowReply(false);
    setSubmitting(false);
    // optimistically add response
    setShout(s => ({
      ...s,
      responses: [...(s.responses || []), {
        id: Date.now(),
        author: 'אנונימי_84',
        content: replyText,
        is_official: 0,
        time_ago: 'עכשיו',
      }],
    }));
  }

  const avatarColor = getColor(shout.username || '');
  const initials = (shout.username || '?').charAt(0);
  const officialResponse = shout.responses?.find(r => r.is_official);
  const userResponses = shout.responses?.filter(r => !r.is_official) || [];
  const totalResponses = (shout.responses || []).length;

  return (
    <div className={`shout-card${shout.is_resolved ? ' resolved' : ''}`}>
      {/* Header */}
      <div className="shout-header">
        <div className="shout-meta">
          <div className="user-avatar" style={{ background: avatarColor }}>
            {initials}
          </div>
          <div className="shout-user-info">
            <div className="shout-user-name">
              {shout.username}
              {shout.company_name && (
                <>
                  <span style={{ color: 'var(--gray-300)' }}>›</span>
                  <span className="shout-company-link">{shout.company_name}</span>
                </>
              )}
            </div>
            <div className="shout-time">
              <span>🕐</span>
              {shout.time_ago}
              {shout.has_proof ? <span className="verified-badge">✓ לקוח מאומת</span> : null}
            </div>
          </div>
        </div>
        <button className="shout-more-btn">⋯</button>
      </div>

      {/* Content */}
      <div className="shout-content">
        {shout.content}
        <Flames level={shout.anger_level} />
      </div>

      {/* Proof */}
      {shout.has_proof && (
        <div className="proof-badge">
          📎 צורפה אסמכתה בנקאית (PDF)
        </div>
      )}

      {/* Official response */}
      {officialResponse && (
        <div className="official-response">
          <div className="official-response-header">
            <div className="official-label">
              🏢 תגובה רשמית מ{shout.company_name}
            </div>
            {officialResponse.is_resolved || shout.is_resolved ? (
              <span className="resolved-badge">✅ הבעיה נפתרה</span>
            ) : null}
          </div>
          <div className="official-response-text">{officialResponse.content}</div>
        </div>
      )}

      {/* User responses preview */}
      {userResponses.slice(0, 1).map(r => (
        <div key={r.id} style={{
          margin: '0 14px 10px',
          background: 'var(--gray-50)',
          borderRadius: 10,
          padding: '10px 12px',
          fontSize: 13,
          color: 'var(--gray-700)',
          borderRight: '3px solid var(--gray-200)',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{r.author}: </span>
          {r.content}
        </div>
      ))}

      {/* Stats */}
      <div className="shout-stats">
        <span className="stat-item">
          {shout.echoes.toLocaleString('he-IL')} הדהודים
        </span>
        <span className="stat-dot" />
        <span className="stat-item">
          כעס {shout.anger_level}.{Math.floor(Math.random() * 9)} / 5
        </span>
        {totalResponses > 0 && (
          <>
            <span className="stat-dot" />
            <span className="stat-item">{totalResponses} תגובות</span>
          </>
        )}
      </div>

      {/* Reply box */}
      {showReply && (
        <div style={{ padding: '0 14px 10px', display: 'flex', gap: 8 }}>
          <input
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 10,
              border: '1.5px solid var(--yellow)', outline: 'none',
              fontFamily: 'Heebo', fontSize: 13, direction: 'rtl', textAlign: 'right',
            }}
            placeholder="הוסף תגובה..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReply()}
            autoFocus
          />
          <button
            onClick={handleReply}
            disabled={submitting || !replyText.trim()}
            style={{
              background: 'var(--yellow)', border: 'none', borderRadius: 10,
              padding: '8px 14px', fontFamily: 'Heebo', fontWeight: 700,
              cursor: 'pointer', fontSize: 13, opacity: replyText.trim() ? 1 : 0.4,
            }}
          >
            שלח
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="shout-actions">
        <button
          className={`action-btn${shout.echoed ? ' echoed' : ''}`}
          onClick={handleEcho}
        >
          <span className="action-icon">{shout.echoed ? '🤝' : '🤜'}</span>
          {shout.echoed ? 'הדהדתי' : 'קרה גם לי'}
        </button>
        <button
          className={`action-btn${shout.boosted ? ' boosted' : ''}`}
          onClick={handleBoost}
        >
          <span className="action-icon">📈</span>
          {shout.boosts > 0 ? `בוסט (${shout.boosts})` : 'בוסט'}
        </button>
        <button
          className="action-btn"
          onClick={() => setShowReply(r => !r)}
        >
          <span className="action-icon">💬</span>
          תגובה
        </button>
        <button
          className="action-btn"
          onClick={() => onCreateSquad && onCreateSquad(shout)}
        >
          <span className="action-icon">⚡</span>
          קבוצת לחץ
        </button>
      </div>
    </div>
  );
}
