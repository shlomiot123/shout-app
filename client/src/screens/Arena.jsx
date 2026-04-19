import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const TABS = [
  { key: 'all',     label: 'הכל' },
  { key: 'radar',   label: '🚨 רדאר' },
  { key: 'polls',   label: '📊 סקרים' },
  { key: 'wins',    label: '🏆 נצחונות' },
];

const MOCK_ITEMS = [
  {
    id: 1, type: 'radar',
    title: 'טרנד חם: תלונות על עלייה בתעריפי סלולר',
    sub: '🔴 847 צעקות ב-48 שעות אחרונות',
    company: 'חברות סלולר', icon: '🚨',
    tags: ['בזק', 'HOT', 'Partner'],
    color: '#FEE2E2',
  },
  {
    id: 2, type: 'poll',
    title: 'סקר: מה השירות הגרוע ביותר שחווית?',
    sub: '2,341 הצביעו עד כה',
    icon: '📊',
    options: [
      { label: 'בנקים', pct: 38 },
      { label: 'ביטוח', pct: 27 },
      { label: 'סלולר', pct: 22 },
      { label: 'אחר', pct: 13 },
    ],
    color: '#EFF6FF',
  },
  {
    id: 3, type: 'vs',
    title: 'מי גרוע יותר?',
    icon: '⚔️',
    left: { name: 'כאל', score: 73 },
    right: { name: 'ישראכרט', score: 68 },
    votes: 1204,
    color: '#FFF7ED',
  },
  {
    id: 4, type: 'top5',
    title: '5 החברות המביכות השבוע',
    icon: '🔥',
    items: ['הפניקס', 'HOT', 'בנק לאומי', 'שטראוס', 'רכבת ישראל'],
    color: '#FEF2F2',
  },
  {
    id: 5, type: 'win',
    title: 'נצחון! חברת הביטוח שילמה פיצוי לאחר קמפיין ב-Shout',
    sub: '3,200 חברי קבוצה לחצו על החברה',
    icon: '🏆',
    company: 'הפניקס',
    color: '#F0FDF4',
  },
  {
    id: 6, type: 'tip',
    title: 'טיפ של היום: כיצד לבטל חוזה ללא קנס',
    sub: 'המדריך שכולם חיפשו',
    icon: '💡',
    color: '#FFFBEB',
  },
  {
    id: 7, type: 'tzaddik',
    title: 'צדיק החודש: סלקום שיפרה את שירות הלקוחות',
    sub: 'ציון עלה מ-41 ל-67 בחודש אחד',
    icon: '😇',
    color: '#F0FDF4',
  },
  {
    id: 8, type: 'lesson',
    title: 'לקח היום: חוק הגנת הצרכן — מה מגיע לך?',
    sub: 'הכר את הזכויות שלך',
    icon: '📚',
    color: '#FAF5FF',
  },
];

function RadarCard({ item }) {
  return (
    <div style={{ background: item.color, borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #FCA5A5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{item.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
          <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginTop: 2 }}>{item.sub}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {item.tags?.map(t => (
          <span key={t} style={{
            background: 'rgba(239,68,68,0.12)', color: 'var(--red)',
            borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function PollCard({ item }) {
  const [voted, setVoted] = useState(null);
  return (
    <div style={{ background: item.color, borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #BFDBFE' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{item.icon}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{item.sub}</div>
        </div>
      </div>
      {item.options.map((opt, i) => (
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

function VsCard({ item }) {
  const [pick, setPick] = useState(null);
  return (
    <div style={{ background: item.color, borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #FED7AA' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[item.left, item.right].map((side, i) => (
          <button
            key={i}
            onClick={() => setPick(i)}
            style={{
              flex: 1, padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
              border: pick === i ? '2.5px solid var(--red)' : '1.5px solid var(--gray-200)',
              background: pick === i ? '#FEE2E2' : 'var(--white)',
              fontFamily: 'Heebo', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900 }}>{side.name}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--red)', marginTop: 4 }}>{side.score}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>ציון זעם</div>
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>
        {item.votes.toLocaleString('he-IL')} הצביעו
      </div>
    </div>
  );
}

function Top5Card({ item }) {
  return (
    <div style={{ background: item.color, borderRadius: 16, padding: 16, marginBottom: 12, border: '1.5px solid #FCA5A5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{item.icon}</span>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</span>
      </div>
      {item.items.map((name, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', borderBottom: i < item.items.length - 1 ? '1px solid #FEE2E2' : 'none',
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            background: i === 0 ? '#EF4444' : i === 1 ? '#F97316' : '#F59E0B',
            color: '#fff', fontSize: 12, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{i + 1}</span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

function GenericCard({ item }) {
  const borderColors = { win: '#86EFAC', tip: '#FDE68A', tzaddik: '#86EFAC', lesson: '#C4B5FD' };
  return (
    <div style={{
      background: item.color, borderRadius: 16, padding: 16, marginBottom: 12,
      border: `1.5px solid ${borderColors[item.type] || 'var(--gray-200)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 28 }}>{item.icon}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
          {item.sub && <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{item.sub}</div>}
          {item.company && (
            <span style={{
              display: 'inline-block', marginTop: 6,
              background: 'rgba(16,185,129,0.15)', color: 'var(--green)',
              borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
            }}>{item.company}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ArenaItem({ item }) {
  if (item.type === 'radar') return <RadarCard item={item} />;
  if (item.type === 'poll')  return <PollCard item={item} />;
  if (item.type === 'vs')    return <VsCard item={item} />;
  if (item.type === 'top5')  return <Top5Card item={item} />;
  return <GenericCard item={item} />;
}

export default function Arena() {
  const [tab, setTab] = useState('all');
  const [shouts, setShouts] = useState([]);

  useEffect(() => {
    API.get('/api/shouts').then(d => setShouts(d.slice(0, 5))).catch(() => {});
  }, []);

  const shown = tab === 'all' ? MOCK_ITEMS
    : MOCK_ITEMS.filter(i =>
        tab === 'radar' ? i.type === 'radar'
        : tab === 'polls' ? i.type === 'poll' || i.type === 'vs'
        : i.type === 'win'
      );

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--white)', padding: '16px 12px 0', marginBottom: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>הזירה</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>
          טרנדים, סקרים, ונצחונות של הצרכנים
        </div>

        {/* Tabs */}
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
                marginBottom: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 12px' }}>
        {shown.map(item => <ArenaItem key={item.id} item={item} />)}

        {/* Queen Shout — top trending real shout */}
        {tab === 'all' && shouts.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #FFC300 0%, #FF6B35 100%)',
            borderRadius: 16, padding: 16, marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(0,0,0,0.6)', marginBottom: 8 }}>
              👑 QUEEN SHOUT — הצעקה הכי חמה
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)' }}>
              {shouts[0].content}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 6 }}>
              🔥 {shouts[0].boost_count || 0} הזדהו
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
