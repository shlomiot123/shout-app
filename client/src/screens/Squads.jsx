import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EF4444','#F59E0B','#06B6D4'];
const GOAL_ICONS = { legal: '⚖️', public: '📢', regulatory: '🏛️', investor: '📈' };

function SquadCard({ squad: initial }) {
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
          <span>{squad.target_members.toLocaleString('he-IL')} דרושים</span>
          <span style={{ fontWeight: 700 }}>{pct}%</span>
        </div>

        {/* Members */}
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

        {/* Join button */}
        {!squad.is_success ? (
          <button
            className={`squad-join-btn${squad.joined ? ' joined' : ''}`}
            onClick={handleJoin}
          >
            {squad.joined ? '✓ עמד בקבוצת הלחץ' : 'היכנס לעמוד קבוצת הלחץ'}
          </button>
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

export default function Squads({ onCreateShout }) {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // active | success | mine
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
          <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            🏆 נצחונות המאבק
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
        <div style={{ display: 'flex', gap: 4, paddingBottom: 0 }}>
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
          <div className="empty-state-sub">לחץ על 📣 כדי ליצור קבוצת לחץ חדשה</div>
        </div>
      ) : (
        filtered.map(s => <SquadCard key={s.id} squad={s} />)
      )}

      {/* FAB - yellow circle with megaphone */}
      <button
        className="squads-fab"
        onClick={onCreateShout}
        aria-label="צור קבוצת לחץ"
      >
        📣
      </button>
    </>
  );
}
