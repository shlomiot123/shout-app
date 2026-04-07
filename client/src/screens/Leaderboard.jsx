import { useState, useEffect, useRef } from 'react';
import { API } from '../App.jsx';
import { useReveal } from '../hooks/useReveal.js';

function RevealRow({ children, delay }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: delay }}>
      {children}
    </div>
  );
}

const CAT_ICONS = {
  banks: '🏦', insurance: '🛡️', health: '🩺', telecom: '📱',
  food: '🛒', transport: '🚌', aviation: '✈️', 'car-rental': '🚗',
};

function getAngerColor(score) {
  if (score >= 80) return '#EF4444';
  if (score >= 60) return '#F97316';
  if (score >= 40) return '#F59E0B';
  return '#10B981';
}

function getRankEmoji(rank) {
  if (rank === 1) return '🔴';
  if (rank === 2) return '🟠';
  if (rank === 3) return '🟡';
  return rank;
}

const CITY_POSTS = [
  { id: 1, author: 'אנונימי_22', text: 'הוט ניתקה אותי שוב לאחר תשלום. מי עוד חווה?', time: 'לפני 5 דק\'', likes: 34 },
  { id: 2, author: 'אנונימי_57', text: 'ביטוח לאומי – 3 שעות המתנה. זה לא תקין.', time: 'לפני 12 דק\'', likes: 18 },
  { id: 3, author: 'אנונימי_91', text: 'שופרסל חייבו פי שניים על מוצר שלא היה בסל.', time: 'לפני 20 דק\'', likes: 52 },
];

const DAILY_POLL = {
  question: 'איזה תחום הכי מאכזב אותך?',
  options: [
    { label: 'תקשורת (אינטרנט/סלולר)', votes: 420 },
    { label: 'ביטוח', votes: 280 },
    { label: 'בנקים', votes: 190 },
    { label: 'ממשל ובירוקרטיה', votes: 150 },
  ],
};

const TOP_COMPLAINT_COMPANIES = [
  { name: 'הוט', shouts: 1240, icon: '📡' },
  { name: 'שופרסל', shouts: 890, icon: '🛒' },
  { name: 'פרטנר', shouts: 760, icon: '📱' },
  { name: 'מגדל ביטוח', shouts: 610, icon: '🛡️' },
];

export default function Leaderboard() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollVote, setPollVote] = useState(null);
  const [cityLikes, setCityLikes] = useState({});
  const [compareMetric, setCompareMetric] = useState('anger_score');
  const [compareEntities, setCompareEntities] = useState([]);

  useEffect(() => {
    API.get('/api/leaderboard').then(d => { setCompanies(d); setLoading(false); });
  }, []);

  const totalVotes = DAILY_POLL.options.reduce((s, o) => s + o.votes, 0);

  const statBoxes = [
    { label: 'מאבקים פעילים', value: '142', icon: '🔥', color: '#EF4444' },
    { label: 'תגובות חברות', value: '38%', icon: '💬', color: '#F97316' },
    { label: 'הושגו השבוע', value: '4', icon: '✅', color: '#F59E0B' },
    { label: 'מאבקים פעילים מהחודש האחרון', value: '89', icon: '📈', color: '#10B981' },
  ];

  const chartData = companies.slice(0, 5).map(c => ({
    name: c.name,
    value: c[compareMetric] || 0,
  }));
  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <>
      {/* Hero — white/light background */}
      <div className="leaderboard-hero-light">
        <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 700, marginBottom: 6 }}>
          📊 נתונים ומידע
        </div>
        <div className="leaderboard-hero-title-dark">תמונת מצב</div>
        <div className="leaderboard-hero-sub-dark">
          הנתונים והמידע שמאחורי הצעקות
        </div>

        {/* Top stat boxes — yellows-to-reds gradient */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {statBoxes.map((s, i) => (
            <div key={i} className="stat-box" style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'var(--gray-500)', lineHeight: 1.3, textAlign: 'center' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter note */}
      <div style={{ padding: '8px 12px 4px', fontSize: 12, color: 'var(--gray-500)' }}>
        על מה מתלוננים הכי הרבה? <span style={{ color: 'var(--orange)', fontWeight: 700 }}>45% שירות לקוחות</span>
        {' · '}<span style={{ color: 'var(--orange)', fontWeight: 700 }}>30% בירוקרטיה</span>
        {' · '}<span style={{ color: 'var(--orange)', fontWeight: 700 }}>25% כספים</span>
      </div>

      {/* Company leaderboard */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>טוען...</div>
      ) : (
        companies.map((co, i) => {
          const rank = i + 1;
          const angerColor = getAngerColor(co.anger_score);
          const catIcon = CAT_ICONS[co.category_name] || '🏢';

          return (
            <RevealRow key={co.id} delay={`${Math.min(i * 0.06, 0.3)}s`}>
            <div className={`leaderboard-card rank-${rank}`}>
              <div className="leaderboard-row">
                <div className="lb-rank">{getRankEmoji(rank)}</div>
                <div className="lb-company-avatar" style={{ background: rank <= 3 ? angerColor + '20' : 'var(--gray-100)' }}>
                  {catIcon}
                </div>
                <div className="lb-info">
                  <div className="lb-name">{co.name}</div>
                  <div className="lb-category">{co.category_name}</div>
                </div>
                <div className="lb-score" style={{ color: angerColor }}>{co.anger_score}</div>
              </div>

              <div className="anger-bar-track">
                <div
                  className="anger-bar-fill"
                  style={{ width: `${co.anger_score}%`, background: angerColor }}
                />
              </div>

              <div className="lb-stats">
                <div className="lb-stat">
                  <strong>{co.total_shouts.toLocaleString('he-IL')}</strong>
                  צעקות כוללות
                </div>
                <div className="lb-stat">
                  <strong style={{ color: co.response_rate > 40 ? 'var(--green)' : 'var(--red)' }}>
                    {co.response_rate}%
                  </strong>
                  שיעור תגובה
                </div>
                <div className="lb-stat">
                  <strong style={{ color: 'var(--green)' }}>
                    {co.resolved_shouts.toLocaleString('he-IL')}
                  </strong>
                  נפתרו
                </div>
              </div>
            </div>
            </RevealRow>
          );
        })
      )}

      {/* כיכר העיר */}
      <div className="lb-section">
        <div className="lb-section-title">🏙️ כיכר העיר</div>
        <div className="lb-section-sub">פוסטים קצרים – עד 100 תווים</div>
        {CITY_POSTS.map(p => (
          <div key={p.id} className="city-post">
            <div className="city-post-header">
              <span className="city-post-author">{p.author}</span>
              <span className="city-post-time">{p.time}</span>
            </div>
            <div className="city-post-text">{p.text}</div>
            <button
              className="city-post-like"
              onClick={() => setCityLikes(l => ({ ...l, [p.id]: (l[p.id] || p.likes) + 1 }))}
            >
              👍 {cityLikes[p.id] || p.likes}
            </button>
          </div>
        ))}
      </div>

      {/* סקר יומי */}
      <div className="lb-section">
        <div className="lb-section-title">📊 סקר יומי</div>
        <div className="lb-section-sub">{DAILY_POLL.question}</div>
        {DAILY_POLL.options.map((o, i) => {
          const pct = Math.round((o.votes / totalVotes) * 100);
          const voted = pollVote === i;
          return (
            <div
              key={i}
              className={`poll-option${voted ? ' voted' : ''}`}
              onClick={() => setPollVote(i)}
            >
              <div className="poll-bar" style={{ width: pollVote !== null ? `${pct}%` : '0%' }} />
              <span className="poll-label">{o.label}</span>
              {pollVote !== null && <span className="poll-pct">{pct}%</span>}
            </div>
          );
        })}
      </div>

      {/* מוקד התלונות הארצי */}
      <div className="lb-section">
        <div className="lb-section-title">📣 מוקד התלונות הארצי</div>
        <div className="lb-section-sub">החברות שמקבלות הכי הרבה תלונות</div>
        {TOP_COMPLAINT_COMPANIES.map((c, i) => (
          <div key={i} className="complaint-row">
            <span className="complaint-icon">{c.icon}</span>
            <span className="complaint-name">{c.name}</span>
            <span className="complaint-shouts">📣 {c.shouts.toLocaleString('he-IL')}</span>
          </div>
        ))}
      </div>

      {/* מעבדת נתונים */}
      <div className="lb-section">
        <div className="lb-section-title">🔬 מעבדת נתונים</div>
        <div className="lb-section-sub">השווה מדדים בין חברות</div>
        <select
          className="lab-select"
          value={compareMetric}
          onChange={e => setCompareMetric(e.target.value)}
        >
          <option value="anger_score">מדד זעם</option>
          <option value="total_shouts">צעקות כוללות</option>
          <option value="response_rate">שיעור תגובה</option>
          <option value="resolved_shouts">נפתרו</option>
        </select>
        <div className="lab-chart">
          {chartData.map((d, i) => {
            const pct = Math.round((d.value / maxVal) * 100);
            const color = getAngerColor(typeof d.value === 'number' ? d.value : 50);
            return (
              <div key={i} className="lab-bar-row">
                <span className="lab-bar-label">{d.name}</span>
                <div className="lab-bar-track">
                  <div className="lab-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="lab-bar-val">{d.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: 20 }} />
    </>
  );
}
