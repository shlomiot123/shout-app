import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EF4444','#F59E0B','#06B6D4'];
const GOAL_ICONS = { legal: '⚖️', public: '📢', regulatory: '🏛️', investor: '📈' };

function SquadCard({ squad: initial, onCreateSquad }) {
  const [squad, setSquad] = useState(initial);

  async function handleJoin() {
    const res = await API.post(`/api/squads/${squad.id}/join`);
    setSquad(s => ({
      ...s,
      joined: res.joined,
      current_members: res.joined ? s.current_members + 1 : s.current_members - 1,
      progress: Math.round(((res.joined ? s.current_members + 1 : s.current_members - 1) / s.target_members) * 100),
    }));
  }

  const pct = Math.min(100, Math.round((squad.current_members / squad.target_members) * 100));
  const goalIcon = GOAL_ICONS[squad.goal_type] || '⚖️';
  const recentJoined = Math.floor(Math.random() * 15) + 1; // demo

  return (
    <div className={`squad-card${squad.is_success ? ' success' : ''}`}>
      <div className={`squad-banner${squad.is_success ? ' success' : ''}`}>
        {squad.is_success ? '🏆' : '⚡'}
        {squad.is_success && (
          <div className="squad-success-badge">✅ הצלחה!</div>
        )}
      </div>

      <div className="squad-body">
        <div className="squad-name">{squad.name}</div>
        <div className="squad-meta">
          <span>👥</span>
          {squad.category_name || 'כללי'}
          {squad.company_name && (
            <> • <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{squad.company_name}</span></>
          )}
        </div>

        {/* Status badge */}
        <div style={{
          display: 'inline-block', padding: '3px 10px',
          background: pct >= 100 ? 'var(--green-light)' : pct >= 70 ? '#FEF3C7' : 'var(--gray-100)',
          borderRadius: 20, fontSize: 11, fontWeight: 700,
          color: pct >= 100 ? 'var(--green)' : pct >= 70 ? '#B45309' : 'var(--gray-600)',
          marginBottom: 8,
        }}>
          {pct >= 100 ? '⚖️ לקראת תביעה' : pct >= 70 ? '🤝 במשא ומתן' : '📋 באיסוף עדויות'}
        </div>

        {squad.goal_description && (
          <div className="squad-goal">
            <span>{goalIcon}</span>
            {squad.goal_description}
          </div>
        )}

        {/* Progress */}
        <div className="progress-track">
          <div
            className={`progress-fill${pct >= 100 ? ' full' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="progress-label">
          <span>{squad.current_members.toLocaleString('he-IL')} / {squad.target_members.toLocaleString('he-IL')} חברים</span>
          <span style={{ fontWeight: 700 }}>{pct}%</span>
        </div>

        {/* Recent activity */}
        <div style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600, marginBottom: 8 }}>
          🔥 {recentJoined} הצטרפו ביממה האחרונה
        </div>

        {/* Member avatars */}
        <div className="squad-members-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="member-avatars">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="member-avatar"
                  style={{ background: AVATAR_COLORS[i] }}
                >
                  {['א','ב','ג'][i]}
                </div>
              ))}
            </div>
            <span className="squad-member-count">
              {squad.current_members.toLocaleString('he-IL')} חברים
            </span>
          </div>
        </div>

        {/* Actions */}
        {!squad.is_success ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className={`squad-join-btn${squad.joined ? ' joined' : ''}`}
              style={{ flex: 2 }}
              onClick={handleJoin}
            >
              {squad.joined ? '✓ הצטרפת לקבוצה' : '⚡ הצטרף למאבק'}
            </button>
            <button
              onClick={() => onCreateSquad && onCreateSquad()}
              style={{
                flex: 1, padding: '11px', border: '1.5px solid var(--gray-200)',
                borderRadius: 10, background: 'var(--white)', fontFamily: 'Heebo',
                fontSize: 12, cursor: 'pointer', fontWeight: 600,
              }}
            >
              📤 שתף
            </button>
          </div>
        ) : (
          <div style={{
            padding: '11px', textAlign: 'center', fontSize: 14,
            fontWeight: 700, color: 'var(--green)', borderRadius: 10,
            background: 'var(--green-light)',
          }}>
            ✅ הקבוצה השיגה את מטרתה!
          </div>
        )}
      </div>
    </div>
  );
}

export default function Squads({ onCreateSquad }) {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/api/squads').then(d => { setSquads(d); setLoading(false); });
  }, []);

  const filtered = squads.filter(s => {
    const matchTab = tab === 'success' ? s.is_success : tab === 'mine' ? s.joined : !s.is_success;
    const matchSearch = !search || s.name.includes(search) || s.company_name?.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <>
      {/* Header */}
      <div style={{ background: 'var(--white)', padding: '16px 12px 0', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>קבוצות לחץ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onCreateSquad}
              style={{
                background: 'var(--yellow)', border: 'none', borderRadius: 20,
                padding: '6px 12px', fontFamily: 'Heebo', fontSize: 12,
                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              ⚡ צור קבוצה חדשה
            </button>
            <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 700 }}>
              🏆 נצחונות המאבק
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--gray-100)', borderRadius: 10, padding: '8px 12px',
          marginBottom: 12, border: '1.5px solid var(--gray-200)',
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, fontFamily: 'Heebo', flex: 1,
              direction: 'rtl', color: 'var(--dark)',
            }}
            placeholder="חפש קבוצת לחץ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { key: 'active', label: 'פעילות' },
            { key: 'success', label: 'נצחונות ✅' },
            { key: 'mine', label: 'שלי' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '7px 14px', border: 'none', background: 'none',
                fontFamily: 'Heebo', fontSize: 13, fontWeight: 600,
                color: tab === t.key ? 'var(--black)' : 'var(--gray-500)',
                borderBottom: tab === t.key ? '2.5px solid var(--black)' : '2.5px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <div className="empty-state-title">אין קבוצות כאן</div>
          <div className="empty-state-sub">לחץ על "⚡ צור קבוצה חדשה" כדי להתחיל מאבק</div>
          <button
            className="btn-primary yellow"
            style={{ marginTop: 14 }}
            onClick={onCreateSquad}
          >
            ⚡ צור קבוצת לחץ חדשה
          </button>
        </div>
      ) : (
        filtered.map(s => <SquadCard key={s.id} squad={s} onCreateSquad={onCreateSquad} />)
      )}

      {/* FAB — ⚡ create squad */}
      <button
        className="squads-fab"
        onClick={onCreateSquad}
        aria-label="צור קבוצת לחץ"
        style={{ background: 'var(--yellow)' }}
      >
        ⚡
      </button>
    </>
  );
}
