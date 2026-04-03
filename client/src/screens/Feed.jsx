import { useState, useEffect, useCallback } from 'react';
import { API } from '../App.jsx';
import ShoutCard from '../components/ShoutCard.jsx';

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
  { text: 'תלונות נגד שופרסל עלו ב-340% בשעה האחרונה.' },
  { text: 'גל תלונות חדש על הוט – 200+ צעקות ב-2 שעות.' },
  { text: 'כיכר הצרכנים: עלייה בתלונות על בנק לאומי.' },
];

export default function Feed({ onCreateShout, onNav, onOpenCreateSquad }) {
  const [shouts, setShouts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [feedMode, setFeedMode] = useState('all'); // all | mine
  const [loading, setLoading] = useState(true);

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
          onClick={() => setFeedMode('mine')}
        >מעניין אותי ⓘ</button>
      </div>

      {/* Category filter */}
      <div className="category-strip">
        {categories.map(c => {
          // Override health icon to stethoscope
          const icon = c.slug === 'health' ? '🩺' : c.icon;
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
              onClick={() => onNav && onNav('companies')}
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

      {/* Shouts */}
      {loading ? (
        [1,2,3].map(i => <SkeletonCard key={i} />)
      ) : shouts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😮</div>
          <div className="empty-state-title">אין צעקות עדיין</div>
          <div className="empty-state-sub">
            היה הראשון לצעוק בקטגוריה זו!
          </div>
        </div>
      ) : (
        shouts.map(shout => (
          <ShoutCard key={shout.id} shout={shout} onNav={onNav} onOpenCreateSquad={onOpenCreateSquad} />
        ))
      )}
    </>
  );
}
