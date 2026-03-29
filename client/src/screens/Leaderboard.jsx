import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const CAT_ICONS = {
  banks: '🏦', insurance: '🛡️', health: '❤️', telecom: '📱',
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

export default function Leaderboard() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/leaderboard').then(d => { setCompanies(d); setLoading(false); });
  }, []);

  return (
    <>
      <div className="leaderboard-hero">
        <div style={{ fontSize: 13, color: 'var(--yellow)', fontWeight: 700, marginBottom: 6 }}>
          📊 נתונים שמאחורי הזעם הציבורי
        </div>
        <div className="leaderboard-hero-title">מצעד הבושה</div>
        <div className="leaderboard-hero-sub">
          הנתונים שמאחורי הזעם הציבורי. שקיפות מלאה.
        </div>

        {/* Top stat boxes */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {[
            { label: 'מאבקים פעילים', value: '142', icon: '🔥' },
            { label: 'תגובות חברות', value: '38%', icon: '💬' },
            { label: 'הושגו השבוע', value: '4', icon: '✅' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--yellow)' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>{s.label}</div>
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

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>טוען...</div>
      ) : (
        companies.map((co, i) => {
          const rank = i + 1;
          const angerColor = getAngerColor(co.anger_score);
          const catIcon = CAT_ICONS[co.category_name] || '🏢';

          return (
            <div key={co.id} className={`leaderboard-card rank-${rank}`}>
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

              {/* Anger bar */}
              <div className="anger-bar-track">
                <div
                  className="anger-bar-fill"
                  style={{ width: `${co.anger_score}%`, background: angerColor }}
                />
              </div>

              {/* Stats */}
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
          );
        })
      )}

      <div style={{ height: 20 }} />
    </>
  );
}
