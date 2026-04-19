import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const SESSION = localStorage.getItem('shout_session') || '';

function WebinarBtn({ squadId }) {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function register() {
    setLoading(true);
    const nickname = localStorage.getItem('shout_nickname') || '';
    await API.post('/api/webinars/register', { squad_id: squadId, nickname });
    setRegistered(true);
    setLoading(false);
  }

  return (
    <button
      onClick={register}
      disabled={registered || loading}
      style={{
        background: registered ? 'var(--green)' : 'var(--yellow)',
        border: 'none', borderRadius: 10, padding: '8px 16px',
        fontFamily: 'Heebo', fontWeight: 700, fontSize: 12, cursor: 'pointer',
        color: registered ? '#fff' : 'var(--dark)', opacity: loading ? 0.6 : 1,
      }}
    >
      {registered ? '✅ נרשמת!' : loading ? '...' : 'הרשמה לוובינר ›'}
    </button>
  );
}

const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EF4444','#F59E0B'];
const GOAL_ICONS = { legal: '⚖️', public: '📢', regulatory: '🏛️', investor: '📈' };

function ShoutItem({ shout }) {
  const name = shout.username || shout.nickname || 'אנונימי';
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 12, padding: 14,
      border: '1.5px solid var(--gray-200)', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: AVATAR_COLORS[shout.id % AVATAR_COLORS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 12, fontWeight: 700,
        }}>
          {name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{name}</div>
          <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{shout.time_ago || ''}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, direction: 'rtl' }}>{shout.content}</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>🔥 {shout.boost_count || 0} הזדהו</span>
        <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>💬 {shout.comment_count || 0}</span>
      </div>
    </div>
  );
}

export default function SquadLobby({ squadId, onBack, onCreateShout, requireLogin }) {
  const [squad, setSquad] = useState(null);
  const [shouts, setShouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!squadId) return;
    API.get(`/api/squads/${squadId}`)
      .then(s => {
        setSquad(s);
        setJoined(s.joined || false);
        // load shouts for same company if exists
        const url = s.company_id ? `/api/shouts?company_id=${s.company_id}` : '/api/shouts';
        return API.get(url).then(sh => { setShouts(sh.slice(0, 6)); setLoading(false); });
      })
      .catch(() => setLoading(false));
  }, [squadId]);

  async function handleJoin() {
    const res = await API.post(`/api/squads/${squadId}/join`);
    setJoined(res.joined);
    setSquad(s => ({
      ...s,
      joined: res.joined,
      current_members: res.joined ? s.current_members + 1 : s.current_members - 1,
    }));
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ fontSize: 24, animation: 'spin 1s linear infinite' }}>⚡</div>
      </div>
    );
  }

  if (!squad) return null;

  const pct = Math.min(100, Math.round((squad.current_members / squad.target_members) * 100));
  const goalIcon = GOAL_ICONS[squad.goal_type] || '⚖️';

  return (
    <div style={{ paddingBottom: 100, minHeight: '100%', background: 'var(--gray-100)' }}>
      {/* Back header */}
      <div style={{
        background: 'var(--white)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--gray-200)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>‹</button>
        <div style={{ fontWeight: 800, fontSize: 16 }}>לובי הקבוצה</div>
      </div>

      {/* Banner */}
      <div style={{
        background: squad.is_success ? 'var(--green)' : 'var(--yellow)',
        padding: '24px 16px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>{squad.is_success ? '🏆' : '⚡'}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--dark)', marginBottom: 4 }}>
          {squad.name}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>
          {squad.category_name || 'כללי'}
          {squad.company_name && ` • ${squad.company_name}`}
        </div>
      </div>

      <div style={{ padding: '12px 12px 0' }}>
        {/* Progress card */}
        <div style={{ background: 'var(--white)', borderRadius: 16, padding: 16, marginBottom: 10, border: '1.5px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>התקדמות הקבוצה</div>
            <div style={{
              background: pct >= 100 ? 'var(--green-light)' : '#FEF3C7',
              color: pct >= 100 ? 'var(--green)' : '#B45309',
              borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
            }}>
              {pct >= 100 ? '⚖️ לקראת תביעה' : pct >= 70 ? '🤝 במשא ומתן' : '📋 באיסוף עדויות'}
            </div>
          </div>

          <div style={{ height: 10, background: 'var(--gray-200)', borderRadius: 20, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              height: '100%', borderRadius: 20,
              background: pct >= 100 ? 'var(--green)' : 'var(--yellow)',
              width: `${pct}%`, transition: 'width 0.8s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--gray-500)' }}>
              {squad.current_members.toLocaleString('he-IL')} / {squad.target_members.toLocaleString('he-IL')} חברים
            </span>
            <span style={{ fontWeight: 700, color: pct >= 100 ? 'var(--green)' : 'var(--orange)' }}>{pct}%</span>
          </div>

          {squad.goal_description && (
            <div style={{
              marginTop: 12, padding: '10px 12px',
              background: '#FEF2F2', borderRadius: 10, fontSize: 12,
              fontWeight: 600, color: 'var(--red)', direction: 'rtl',
            }}>
              {goalIcon} מטרה: {squad.goal_description}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8, marginBottom: 10,
        }}>
          {[
            { icon: '👥', val: squad.current_members.toLocaleString('he-IL'), label: 'חברים' },
            { icon: '📣', val: shouts.length, label: 'צעקות' },
            { icon: '🔥', val: Math.round(pct) + '%', label: 'התקדמות' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--white)', borderRadius: 12, padding: '12px 8px',
              textAlign: 'center', border: '1.5px solid var(--gray-200)',
            }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Webinar CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1F2937 100%)',
          borderRadius: 16, padding: 16, marginBottom: 10, color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--yellow)', marginBottom: 6 }}>
            🎙️ וובינר קרוב
          </div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
            פגישת קבוצה: עדכון על המאבק
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
            יום שלישי 20:00 • עורך דין רועי כהן
          </div>
          <WebinarBtn squadId={squadId} />
        </div>

        {/* Join / Leave */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => requireLogin ? requireLogin(handleJoin) : handleJoin()}
            style={{
              flex: 2, padding: '13px', borderRadius: 12, border: 'none',
              background: joined ? 'var(--gray-200)' : 'var(--yellow)',
              fontFamily: 'Heebo', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              color: 'var(--dark)',
            }}
          >
            {joined ? '✓ הצטרפתי לקבוצה' : '⚡ הצטרף למאבק'}
          </button>
          <button
            onClick={() => requireLogin ? requireLogin(onCreateShout) : onCreateShout?.()}
            style={{
              flex: 1, padding: '13px', borderRadius: 12, border: 'none',
              background: 'var(--dark)', fontFamily: 'Heebo', fontWeight: 700,
              fontSize: 14, cursor: 'pointer', color: 'var(--yellow)',
            }}
          >
            📣 צעק
          </button>
        </div>

        {/* Community feed */}
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
          💬 פיד הקבוצה
        </div>
        {shouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            עדיין אין צעקות בקבוצה זו
          </div>
        ) : (
          shouts.map(s => <ShoutItem key={s.id} shout={s} />)
        )}
      </div>
    </div>
  );
}
