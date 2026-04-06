import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const STORAGE_KEY = 'shout_interests';

function loadInterests() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function saveInterests(interests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interests));
}

export default function InterestFilterSheet({ onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [expandedCat, setExpandedCat] = useState(null);
  const [interests, setInterests] = useState(loadInterests()); // { catSlug: true | {companyId: true} }

  useEffect(() => {
    API.get('/api/categories').then(d => setCategories(d.filter(c => c.slug !== 'all')));
    API.get('/api/companies').then(setCompanies);
  }, []);

  function toggleCat(slug) {
    setInterests(prev => {
      const next = { ...prev };
      if (next[slug]) delete next[slug];
      else next[slug] = true;
      return next;
    });
  }

  function toggleCompany(catSlug, companyId) {
    setInterests(prev => {
      const next = { ...prev };
      if (!next[catSlug] || next[catSlug] === true) {
        next[catSlug] = {};
      }
      if (next[catSlug][companyId]) {
        delete next[catSlug][companyId];
        if (Object.keys(next[catSlug]).length === 0) delete next[catSlug];
      } else {
        next[catSlug][companyId] = true;
      }
      return next;
    });
  }

  function isCatSelected(slug) {
    return !!interests[slug];
  }

  function isCompanySelected(catSlug, companyId) {
    const ci = interests[catSlug];
    if (!ci) return false;
    if (ci === true) return true;
    return !!ci[companyId];
  }

  function handleSave() {
    saveInterests(interests);
    onSave(interests);
    onClose();
  }

  const selectedCount = Object.keys(interests).length;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ maxHeight: '88vh' }}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <span className="modal-title">מעניין אותי</span>
          <div style={{ width: 30 }} />
        </div>

        <div style={{ padding: '10px 14px 6px', fontSize: 13, color: 'var(--gray-600)' }}>
          בחר קטגוריות וחברות שמעניינות אותך. הפיד יסונן בהתאם.
        </div>

        <div className="modal-body" style={{ paddingTop: 4 }}>
          {categories.map(cat => {
            const icon = cat.slug === 'health' ? '🩺' : cat.icon;
            const catCos = companies.filter(c => c.category_name === cat.name);
            const isOpen = expandedCat === cat.slug;
            const catSelected = isCatSelected(cat.slug);

            return (
              <div key={cat.slug} style={{ marginBottom: 6 }}>
                {/* Category row */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 12px', background: catSelected ? 'var(--yellow-pale)' : 'var(--white)',
                    borderRadius: 10, border: `1.5px solid ${catSelected ? 'var(--yellow)' : 'var(--gray-200)'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedCat(isOpen ? null : cat.slug)}
                >
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{cat.name}</span>
                  <span
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: `2px solid ${catSelected ? 'var(--yellow)' : 'var(--gray-300)'}`,
                      background: catSelected ? 'var(--yellow)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, cursor: 'pointer',
                    }}
                    onClick={e => { e.stopPropagation(); toggleCat(cat.slug); }}
                  >
                    {catSelected ? '✓' : ''}
                  </span>
                  <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Companies sub-list */}
                {isOpen && catCos.length > 0 && (
                  <div style={{ margin: '4px 0 0 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {catCos.map(co => {
                      const coSelected = isCompanySelected(cat.slug, co.id);
                      return (
                        <div
                          key={co.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px',
                            background: coSelected ? 'var(--yellow-pale)' : 'var(--gray-50)',
                            borderRadius: 8,
                            border: `1.5px solid ${coSelected ? 'var(--yellow)' : 'var(--gray-200)'}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleCompany(cat.slug, co.id)}
                        >
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{co.name}</span>
                          <span
                            style={{
                              width: 18, height: 18, borderRadius: '50%',
                              border: `2px solid ${coSelected ? 'var(--yellow)' : 'var(--gray-300)'}`,
                              background: coSelected ? 'var(--yellow)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 900,
                            }}
                          >
                            {coSelected ? '✓' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={() => { setInterests({}); }}
            style={{ flex: 1 }}
          >
            אפס הכל
          </button>
          <button
            className="btn-primary yellow"
            onClick={handleSave}
            style={{ flex: 2 }}
          >
            {selectedCount > 0 ? `שמור (${selectedCount} נבחרו)` : 'שמור'}
          </button>
        </div>
      </div>
    </div>
  );
}
