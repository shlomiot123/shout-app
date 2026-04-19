import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EF4444','#F59E0B'];

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
        {!!shout.is_resolved && (
          <span style={{
            marginRight: 'auto', background: 'var(--green-light)', color: 'var(--green)',
            borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700,
          }}>✅ נפתר</span>
        )}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, direction: 'rtl' }}>{shout.content}</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>🔥 {shout.echoes || 0} הזדהו</span>
      </div>
    </div>
  );
}

const ANGER_COLOR = (score) =>
  score >= 80 ? 'var(--red)' :
  score >= 60 ? 'var(--orange)' :
  score >= 40 ? '#F59E0B' : 'var(--green)';

export default function CompanyLobby({ companyId, onBack, onCreateShout, requireLogin }) {
  const [company, setCompany] = useState(null);
  const [shouts, setShouts] = useState([]);
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('shouts');

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    API.get(`/api/companies/${companyId}`)
      .then(c => {
        setCompany(c);
        setShouts(c.shouts || []);
        setSquads(c.squads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [companyId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>🏢</div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>טוען...</div>
      </div>
    );
  }

  if (!company) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 40 }}>😕</div>
      <div style={{ marginTop: 12, color: 'var(--gray-500)' }}>לא נמצאה החברה</div>
      <button onClick={onBack} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--yellow)', fontFamily: 'Heebo', fontWeight: 700, cursor: 'pointer' }}>חזור</button>
    </div>
  );

  const angerColor = ANGER_COLOR(company.anger_score);
  const responseOk = (company.response_rate || 0) > 40;

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
        <div style={{ fontWeight: 800, fontSize: 16 }}>לובי החברה</div>
      </div>

      {/* Hero */}
      <div style={{
        background: `${angerColor}18`,
        padding: '24px 16px', textAlign: 'center',
        borderBottom: `3px solid ${angerColor}`,
      }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🏢</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--dark)' }}>{company.name}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>{company.category_name}</div>

        {/* Anger score ring */}
        <div style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
          background: 'var(--white)', borderRadius: 16, padding: '12px 24px',
          border: `2px solid ${angerColor}`,
        }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: angerColor }}>{company.anger_score}</div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>ציון זעם</div>
        </div>
      </div>

      <div style={{ padding: '12px 12px 0' }}>
        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8, marginBottom: 10,
        }}>
          {[
            { icon: '📣', val: company.total_shouts?.toLocaleString('he-IL') || '0', label: 'צעקות', color: 'var(--red)' },
            { icon: '💬', val: `${company.response_rate || 0}%`, label: 'תגובות', color: responseOk ? 'var(--green)' : 'var(--orange)' },
            { icon: '✅', val: company.resolved_shouts?.toLocaleString('he-IL') || '0', label: 'נפתרו', color: 'var(--green)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--white)', borderRadius: 12, padding: '12px 8px',
              textAlign: 'center', border: '1.5px solid var(--gray-200)',
            }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: s.color, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Anger bar */}
        <div style={{
          background: 'var(--white)', borderRadius: 12, padding: 14,
          border: '1.5px solid var(--gray-200)', marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>נמוך</span>
            <span style={{ fontWeight: 700 }}>מד הזעם</span>
            <span style={{ color: 'var(--red)', fontWeight: 600 }}>גבוה</span>
          </div>
          <div style={{ height: 8, background: 'var(--gray-200)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 20, background: angerColor,
              width: `${company.anger_score}%`, transition: 'width 0.8s ease',
            }} />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => requireLogin ? requireLogin(onCreateShout) : onCreateShout?.()}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: 'var(--dark)', fontFamily: 'Heebo', fontWeight: 800,
            fontSize: 15, cursor: 'pointer', color: 'var(--yellow)', marginBottom: 16,
          }}
        >
          📣 צעק על {company.name}
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'var(--white)', borderRadius: 12, padding: 4, border: '1.5px solid var(--gray-200)' }}>
          {[
            { key: 'shouts', label: `📣 צעקות (${shouts.length})` },
            { key: 'squads', label: `⚡ קבוצות (${squads.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: tab === t.key ? 'var(--dark)' : 'transparent',
                color: tab === t.key ? 'var(--yellow)' : 'var(--gray-600)',
                fontFamily: 'Heebo', fontWeight: 700, fontSize: 12,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'shouts' && (
          shouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
              עדיין אין צעקות על חברה זו
            </div>
          ) : shouts.map(s => <ShoutItem key={s.id} shout={s} />)
        )}

        {tab === 'squads' && (
          squads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
              עדיין אין קבוצות לחץ על חברה זו
            </div>
          ) : squads.map(sq => (
            <div key={sq.id} style={{
              background: 'var(--white)', borderRadius: 12, padding: 14,
              border: '1.5px solid var(--gray-200)', marginBottom: 8,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{sq.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                👥 {sq.current_members.toLocaleString('he-IL')} חברים
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
