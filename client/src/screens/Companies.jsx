import { useState, useEffect } from 'react';
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
  food: '🛒', transport: '🚌', aviation: '✈️', 'car-rental': '🚗', all: '🏢',
};

// Companies that "joined Shout"
const JOINED_SHOUT = ['שופרסל', 'רמי לוי', 'פרטנר'];

export default function Companies({ onCreateShout, initialFilter }) {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState(initialFilter?.companySearch || '');

  useEffect(() => {
    API.get('/api/categories').then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    API.get(`/api/companies?category=${selectedCat}`)
      .then(d => {
        setCompanies(d);
        setLoading(false);
        // Auto-expand if arriving from alert banner
        if (initialFilter?.companySearch) {
          const found = d.find(c => c.name === initialFilter.companySearch);
          if (found) setExpandedId(found.id);
        }
      });
  }, [selectedCat]);

  function getAngerClass(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'mid';
    return 'low';
  }

  const filtered = companies.filter(c =>
    !search || c.name.includes(search) || c.category_name?.includes(search)
  );

  // Monthly shouts estimate (~30% of total)
  function monthlyShouts(total) {
    return Math.round(total * 0.3);
  }

  return (
    <>
      {/* Search */}
      <div style={{ background: 'var(--white)', padding: '12px', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--gray-100)', borderRadius: 10, padding: '8px 12px',
          border: '1.5px solid var(--gray-200)',
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, fontFamily: 'Heebo', flex: 1,
              direction: 'rtl', color: 'var(--dark)',
            }}
            placeholder="חפש חברה..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="category-strip">
        {categories.map(c => (
          <button
            key={c.slug}
            className={`cat-pill${selectedCat === c.slug ? ' active' : ''}`}
            onClick={() => setSelectedCat(c.slug)}
          >
            {c.slug === 'health' ? '🩺' : c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>טוען...</div>
      ) : (
        filtered.map((co, i) => {
          const icon = CAT_ICONS[co.category_name?.toLowerCase().replace(/[^a-z-]/g,'')] || co.category_icon || '🏢';
          const isExpanded = expandedId === co.id;
          const hasJoined = JOINED_SHOUT.includes(co.name);
          const monthly = monthlyShouts(co.total_shouts);

          return (
            <RevealRow key={co.id} delay={`${Math.min(i * 0.05, 0.25)}s`}><div>
              <div
                className="company-row"
                onClick={() => setExpandedId(isExpanded ? null : co.id)}
              >
                <div className="company-row-icon" style={{ fontSize: 22 }}>
                  {icon}
                </div>

                <div className="company-row-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <div className="company-row-name">{co.name}</div>
                    {hasJoined && (
                      <span className="company-joined-badge">👂 הצטרפנו כדי להקשיב לכם</span>
                    )}
                  </div>
                  <div className="company-row-meta">
                    {co.category_name} · 📣 {co.total_shouts.toLocaleString('he-IL')} צעקות
                    {' · '}
                    <span style={{ color: 'var(--orange)', fontWeight: 600 }}>
                      {monthly.toLocaleString('he-IL')} מהחודש האחרון
                    </span>
                  </div>
                </div>

                <div className="company-row-anger">
                  <span className="company-anger-icon">🔥 {co.anger_score}</span>
                  <span className="company-trophy-icon">🏆 {co.resolved_shouts}</span>
                  <span className="company-mega-icon">📣 {co.total_shouts}</span>
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

                  {/* Two buttons */}
                  <button
                    className="btn-primary yellow"
                    style={{ width: '100%', marginBottom: 8 }}
                    onClick={(e) => { e.stopPropagation(); onCreateShout(); }}
                  >
                    📣 פתח תלונה נגד {co.name}
                  </button>

                  <button
                    className="btn-ghost"
                    style={{ width: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    👁 צפה בכל הצעקות נגד {co.name}
                  </button>
                </div>
              )}
            </div></RevealRow>
          );
        })
      )}

      <div style={{ height: 20 }} />
    </>
  );
}
