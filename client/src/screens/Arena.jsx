import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const TABS = [
  { key: 'all',   label: 'הכל' },
  { key: 'radar', label: '🚨 רדאר' },
  { key: 'polls', label: '📊 סקרים' },
  { key: 'wins',  label: '🏆 נצחונות' },
];

function RadarCard({ companies }) {
  if (!companies?.length) return null;
  return (
    <div style={{ background: '#FEE2E2', borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #FCA5A5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>🚨</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>רדאר זעם — הכי חמות עכשיו</div>
          <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, marginTop: 2 }}>
            {companies.length} חברות בציון גבוה
          </div>
        </div>
      </div>
      {companies.map((co, i) => (
        <div key={co.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', borderBottom: i < companies.length - 1 ? '1px solid #FEE2E2' : 'none',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: co.anger_score >= 90 ? '#EF4444' : co.anger_score >= 70 ? '#F97316' : '#F59E0B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 900,
          }}>{co.anger_score}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{co.name}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>{co.category_name} • {(co.total_shouts || 0).toLocaleString('he-IL')} צעקות</div>
          </div>
          <span style={{
            background: 'rgba(239,68,68,0.12)', color: 'var(--red)',
            borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
          }}>
            {co.anger_score >= 90 ? '🔴 קריטי' : co.anger_score >= 70 ? '🟠 גבוה' : '🟡 בינוני'}
          </span>
        </div>
      ))}
    </div>
  );
}

function QueenCard({ queen }) {
  if (!queen) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFC300 0%, #FF6B35 100%)',
      borderRadius: 16, padding: 16, marginBottom: 12,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(0,0,0,0.6)', marginBottom: 6 }}>
        👑 QUEEN SHOUT — הצעקה הכי חמה
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)', lineHeight: 1.5, direction: 'rtl' }}>
        {queen.content}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>🔥 {(queen.echoes || 0).toLocaleString('he-IL')} הזדהו</span>
        {queen.company_name && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>🏢 {queen.company_name}</span>}
      </div>
    </div>
  );
}

function Top5Card({ top5 }) {
  if (!top5?.length) return null;
  return (
    <div style={{ background: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #FCA5A5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>🔥</span>
        <span style={{ fontWeight: 800, fontSize: 14 }}>5 החברות עם ציון הזעם הגבוה ביותר</span>
      </div>
      {top5.map((co, i) => (
        <div key={co.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', borderBottom: i < top5.length - 1 ? '1px solid #FEE2E2' : 'none',
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            background: i === 0 ? '#EF4444' : i === 1 ? '#F97316' : '#F59E0B',
            color: '#fff', fontSize: 12, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{i + 1}</span>
          <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{co.name}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--red)' }}>{co.anger_score}</span>
        </div>
      ))}
    </div>
  );
}

function VsCard({ vs }) {
  const [pick, setPick] = useState(null);
  if (!vs || vs.length < 2) return null;
  return (
    <div style={{ background: '#FFF7ED', borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #FED7AA' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>⚔️</span>
        <span style={{ fontWeight: 800, fontSize: 14 }}>מי גרוע יותר?</span>
        <span style={{ fontSize: 11, color: 'var(--gray-500)', marginRight: 'auto' }}>{vs[0].category_name}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {vs.slice(0, 2).map((side, i) => (
          <button
            key={side.id}
            onClick={() => setPick(i)}
            style={{
              flex: 1, padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
              border: pick === i ? '2.5px solid var(--red)' : '1.5px solid var(--gray-200)',
              background: pick === i ? '#FEE2E2' : 'var(--white)',
              fontFamily: 'Heebo', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900 }}>{side.name}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--red)', marginTop: 4 }}>{side.anger_score}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>ציון זעם</div>
          </button>
        ))}
      </div>
      {pick !== null && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--orange)', fontWeight: 700, marginTop: 8 }}>
          הצבעת על {vs[pick].name}!
        </div>
      )}
      {pick === null && (
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>לחץ כדי להצביע</div>
      )}
    </div>
  );
}

function PollCard({ poll }) {
  const [voted, setVoted] = useState(null);
  if (!poll?.length) return null;
  return (
    <div style={{ background: '#EFF6FF', borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #BFDBFE' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>📊</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>סקר: באיזה תחום הכי הרבה תלונות?</div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>
            {poll.reduce((a, c) => a + c.count, 0).toLocaleString('he-IL')} צעקות סה״כ
          </div>
        </div>
      </div>
      {poll.map((opt, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
            <span style={{ fontWeight: voted === i ? 700 : 400 }}>{opt.label}</span>
            {voted !== null && <span style={{ fontWeight: 700 }}>{opt.pct}%</span>}
          </div>
          <div
            style={{ height: 8, background: '#E5E7EB', borderRadius: 20, cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => setVoted(i)}
          >
            {voted !== null && (
              <div style={{
                height: '100%', borderRadius: 20,
                background: voted === i ? 'var(--yellow)' : '#9CA3AF',
                width: `${opt.pct}%`, transition: 'width 0.4s ease',
              }} />
            )}
          </div>
        </div>
      ))}
      {voted === null && (
        <div style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 4 }}>לחץ כדי להצביע</div>
      )}
    </div>
  );
}

function WinCard({ win }) {
  return (
    <div style={{ background: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #86EFAC' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 28 }}>🏆</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{win.name}</div>
          {win.goal_description && (
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>{win.goal_description}</div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {win.company_name && (
              <span style={{
                background: 'rgba(16,185,129,0.15)', color: 'var(--green)',
                borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
              }}>{win.company_name}</span>
            )}
            <span style={{
              background: 'rgba(16,185,129,0.15)', color: 'var(--green)',
              borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
            }}>👥 {(win.current_members || 0).toLocaleString('he-IL')} חברים</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsBar({ stats }) {
  if (!stats) return null;
  return (
    <div style={{
      background: 'var(--dark)', borderRadius: 16, padding: 16, marginBottom: 12,
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center',
    }}>
      {[
        { val: (stats.total_shouts || 0).toLocaleString('he-IL'), label: 'צעקות', icon: '📣' },
        { val: (stats.total_squads || 0).toLocaleString('he-IL'), label: 'קבוצות', icon: '⚡' },
        { val: (stats.resolved || 0).toLocaleString('he-IL'), label: 'נפתרו', icon: '✅' },
      ].map((s, i) => (
        <div key={i}>
          <div style={{ fontSize: 16 }}>{s.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--yellow)' }}>{s.val}</div>
          <div style={{ fontSize: 10, color: '#9CA3AF' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Arena() {
  const [tab, setTab] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/arena')
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--white)', padding: '16px 12px 0', marginBottom: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>הזירה</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>
          טרנדים, סקרים, ונצחונות של הצרכנים
        </div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: tab === t.key ? 'var(--dark)' : 'var(--gray-100)',
                color: tab === t.key ? 'var(--white)' : 'var(--gray-600)',
                fontFamily: 'Heebo', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                borderBottom: tab === t.key ? '2.5px solid var(--yellow)' : '2.5px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-400)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
            טוען נתוני זירה...
          </div>
        ) : !data ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-400)' }}>שגיאה בטעינת הנתונים</div>
        ) : (
          <>
            {(tab === 'all' || tab === 'radar') && <RadarCard companies={data.radar} />}
            {(tab === 'all') && <QueenCard queen={data.queen} />}
            {(tab === 'all' || tab === 'radar') && <Top5Card top5={data.top5} />}
            {(tab === 'all') && <StatsBar stats={data.stats} />}
            {(tab === 'all' || tab === 'polls') && <VsCard vs={data.vs} />}
            {(tab === 'all' || tab === 'polls') && <PollCard poll={data.categoryPoll} />}
            {(tab === 'all' || tab === 'wins') && data.wins?.map(w => <WinCard key={w.id} win={w} />)}
            {tab === 'wins' && !data.wins?.length && (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-400)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
                עדיין אין נצחונות רשומים
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
