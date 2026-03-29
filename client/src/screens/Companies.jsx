import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const CAT_ICONS = {
  banks: '🏦', insurance: '🛡️', health: '❤️', telecom: '📱',
  food: '🛒', transport: '🚌', aviation: '✈️', 'car-rental': '🚗', all: '🏢',
};

export default function Companies({ onCreateShout }) {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    API.get('/api/categories').then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    API.get(`/api/companies?category=${selectedCat}`)
      .then(d => { setCompanies(d); setLoading(false); });
  }, [selectedCat]);

  function getAngerClass(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'mid';
    return 'low';
  }

  return (
    <>
      <div className="companies-header">חברות ותאגידים</div>
      <div className="companies-sub">
        חברות שכל נושא תפקיד בסופר ברנד הוא גם צרכן שלהן.
        בחר חברה לפתיחת תלונה, לצפייה בניילון הצעקות שלה.
      </div>

      {/* Category filter */}
      <div className="category-strip">
        {categories.map(c => (
          <button
            key={c.slug}
            className={`cat-pill${selectedCat === c.slug ? ' active' : ''}`}
            onClick={() => setSelectedCat(c.slug)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>טוען...</div>
      ) : (
        companies.map(co => {
          const icon = CAT_ICONS[co.category_name?.toLowerCase().replace(/[^a-z]/g,'')] || co.category_icon || '🏢';
          const isExpanded = expandedId === co.id;

          return (
            <div key={co.id}>
              <div
                className="company-row"
                onClick={() => setExpandedId(isExpanded ? null : co.id)}
              >
                <div className="company-row-icon" style={{ fontSize: 22 }}>
                  {icon}
                </div>

                <div className="company-row-info">
                  <div className="company-row-name">{co.name}</div>
                  <div className="company-row-meta">
                    {co.category_name} · {co.total_shouts.toLocaleString('he-IL')} צעקות
                  </div>
                </div>

                <div className="company-row-anger">
                  <span className={`anger-chip ${getAngerClass(co.anger_score)}`}>
                    זעם {co.anger_score}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                    {co.response_rate}% תגובות
                  </span>
                </div>

                <span style={{ color: 'var(--gray-400)', fontSize: 14 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {isExpanded && (
                <div style={{
                  margin: '-6px 12px 10px',
                  background: 'var(--white)',
                  borderRadius: '0 0 12px 12px',
                  padding: '14px',
                  border: '1.5px solid var(--gray-200)',
                  borderTop: 'none',
                  animation: 'fadeSlideIn 0.2s ease',
                }}>
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    {[
                      { label: 'צעקות', value: co.total_shouts.toLocaleString('he-IL'), color: 'var(--red)' },
                      { label: 'נפתרו', value: co.resolved_shouts.toLocaleString('he-IL'), color: 'var(--green)' },
                      { label: 'מדד זעם', value: `${co.anger_score}/100`, color: 'var(--orange)' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        flex: 1, textAlign: 'center', padding: '10px 8px',
                        background: 'var(--gray-50)', borderRadius: 10,
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <button
                    className="btn-primary yellow"
                    style={{ width: '100%', marginBottom: 8 }}
                    onClick={(e) => { e.stopPropagation(); onCreateShout(); }}
                  >
                    📣 פתח תלונה נגד {co.name}
                  </button>

                  <button style={{
                    width: '100%', padding: '11px', borderRadius: 10,
                    border: '1.5px solid var(--gray-200)', background: 'none',
                    fontFamily: 'Heebo', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', color: 'var(--dark)',
                  }}>
                    👁 צפה בכל הצעקות נגד {co.name}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      <div style={{ height: 20 }} />
    </>
  );
}
