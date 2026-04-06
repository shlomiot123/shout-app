import { useState, useEffect, useCallback } from 'react';
import { API } from '../App.jsx';
import ShoutCard from '../components/ShoutCard.jsx';
import InterestFilterSheet from '../components/InterestFilterSheet.jsx';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-line med" />
          <div className="skeleton skeleton-line short" style={{ marginTop: 6 }} />
        </div>
      </div>
      <div className="skeleton skeleton-line full" />
      <div className="skeleton skeleton-line full" style={{ marginTop: 6 }} />
      <div className="skeleton skeleton-line med" style={{ marginTop: 6 }} />
    </div>
  );
}

const ALERT_ITEMS = [
  { text: 'תלונות נגד שופרסל עלו ב-340% בשעה האחרונה.', companyName: 'שופרסל' },
  { text: 'גל תלונות חדש על הוט – 200+ צעקות ב-2 שעות.', companyName: 'הוט' },
  { text: 'כיכר הצרכנים: עלייה בתלונות על בנק לאומי.', companyName: 'בנק לאומי' },
];

function loadInterests() {
  try { return JSON.parse(localStorage.getItem('shout_interests') || '{}'); } catch { return {}; }
}

export default function Feed({ onCreateShout, onNav, onOpenCreateSquad }) {
  const [shouts, setShouts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [feedMode, setFeedMode] = useState('all'); // all | mine
  const [loading, setLoading] = useState(true);
  const [showInterestFilter, setShowInterestFilter] = useState(false);
  const [interests, setInterests] = useState(loadInterests());

  const fetchShouts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await API.get(`/api/shouts?category=${selectedCat}`);
      setShouts(data);
    } finally {
      setLoading(false);
    }
  }, [selectedCat]);

  useEffect(() => {
    API.get('/api/categories').then(setCategories);
  }, []);

  useEffect(() => {
    fetchShouts();
  }, [fetchShouts]);

  // Filter shouts by interests when in "mine" mode
  const displayShouts = feedMode === 'mine' && Object.keys(interests).length > 0
    ? shouts.filter(s => {
        const catSlug = s.category_name
          ? categories.find(c => c.name === s.category_name)?.slug
          : null;
        if (!catSlug) return false;
        const ci = interests[catSlug];
        if (!ci) return false;
        if (ci === true) return true;
        return s.company_id && ci[s.company_id];
      })
    : feedMode === 'mine' && Object.keys(interests).length === 0
      ? [] // no interests set yet
      : shouts;

  function handleInterestSave(newInterests) {
    setInterests(newInterests);
    if (feedMode !== 'mine') setFeedMode('mine');
  }

  return (
    <>
      {/* Feed mode toggle */}
      <div className="feed-toggle">
        <button
          className={`feed-toggle-btn${feedMode === 'all' ? ' active' : ''}`}
          onClick={() => setFeedMode('all')}
        >כללי</button>
        <button
          className={`feed-toggle-btn${feedMode === 'mine' ? ' active' : ''}`}
          onClick={() => {
            if (feedMode !== 'mine') setFeedMode('mine');
            setShowInterestFilter(true);
          }}
        >
          מעניין אותי ⓘ
          {Object.keys(interests).length > 0 && (
            <span style={{
              marginRight: 4, background: 'var(--yellow)', color: 'var(--black)',
              borderRadius: '50%', width: 16, height: 16, fontSize: 10,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
            }}>
              {Object.keys(interests).length}
            </span>
          )}
        </button>
      </div>

      {/* Category filter */}
      <div className="category-strip">
        {categories.map(c => {
          const icon = c.slug === 'health' ? '🩺' : c.slug === 'telecom' ? '📱' : c.icon;
          return (
            <button
              key={c.slug}
              className={`cat-pill${selectedCat === c.slug ? ' active' : ''}`}
              onClick={() => setSelectedCat(c.slug)}
            >
              {icon} {c.name}
            </button>
          );
        })}
      </div>

      {/* Alert banner — red flash, up to 3 items */}
      <div className="alert-banner-multi">
        <div className="alert-banner-header">
          <span className="alert-banner-icon">🚨</span>
          <span className="alert-banner-title">מבזק אדום!</span>
        </div>
        {ALERT_ITEMS.map((item, i) => (
          <div key={i} className="alert-banner-row">
            <span className="alert-banner-row-text">{item.text}</span>
            <button
              className="alert-banner-action"
              onClick={() => {
                // Navigate to companies with this company pre-searched
                onNav && onNav('companies', { companySearch: item.companyName });
              }}
            >
              הראו לי ›
            </button>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div className="compose-box" onClick={onCreateShout}>
        <div className="compose-placeholder">מה הכעיס אותך היום? (פרסום אנונימי)</div>
        <button className="compose-img-btn">🖼</button>
        <div className="compose-avatar">👤</div>
      </div>

      {/* Empty interests state */}
      {feedMode === 'mine' && Object.keys(interests).length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">ⓘ</div>
          <div className="empty-state-title">הגדר את תחומי העניין שלך</div>
          <div className="empty-state-sub">
            בחר קטגוריות וחברות כדי לראות רק את מה שרלוונטי לך
          </div>
          <button
            className="btn-primary yellow"
            style={{ marginTop: 14 }}
            onClick={() => setShowInterestFilter(true)}
          >
            בחר תחומי עניין
          </button>
        </div>
      )}

      {/* Shouts */}
      {(feedMode === 'all' || Object.keys(interests).length > 0) && (
        loading ? (
          [1,2,3].map(i => <SkeletonCard key={i} />)
        ) : displayShouts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">😮</div>
            <div className="empty-state-title">אין צעקות עדיין</div>
            <div className="empty-state-sub">
              {feedMode === 'mine' ? 'אין צעקות בתחומי העניין שבחרת' : 'היה הראשון לצעוק בקטגוריה זו!'}
            </div>
          </div>
        ) : (
          displayShouts.map(shout => (
            <ShoutCard key={shout.id} shout={shout} onNav={onNav} onOpenCreateSquad={onOpenCreateSquad} />
          ))
        )
      )}

      {/* Interest filter sheet */}
      {showInterestFilter && (
        <InterestFilterSheet
          onClose={() => setShowInterestFilter(false)}
          onSave={handleInterestSave}
        />
      )}
    </>
  );
}
