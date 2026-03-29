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

export default function Feed({ onCreateShout }) {
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
        >מותאם לי ⓘ</button>
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

      {/* Alert banner */}
      <div className="alert-banner">
        <div className="alert-banner-icon">🚨</div>
        <div className="alert-banner-text">
          <div className="alert-banner-title">מבזק אדום עכשיו!</div>
          תלונות נגד שופרסל עלו ב-340% בשעה האחרונה.
        </div>
        <button className="alert-banner-action">כן, הלחץ יעבוד</button>
      </div>

      {/* Compose */}
      <div className="compose-box" onClick={onCreateShout}>
        <div className="compose-placeholder">על מה נכעס היום, אנונימי?</div>
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
          <ShoutCard key={shout.id} shout={shout} />
        ))
      )}
    </>
  );
}
