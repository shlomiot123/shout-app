import { useState } from 'react';
import { API } from '../App.jsx';

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function doSearch(q) {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    const shouts = await API.get(`/api/shouts?page=1`);
    const filtered = shouts.filter(s =>
      s.content.includes(q) ||
      s.company_name?.includes(q) ||
      s.username?.includes(q)
    );
    setResults(filtered);
    setLoading(false);
  }

  return (
    <div className="search-overlay">
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="חפש צעקה, חברה, מאבק..."
          value={query}
          autoFocus
          onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }}
        />
        <button className="search-cancel" onClick={onClose}>ביטול</button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading && (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--gray-500)' }}>מחפש...</div>
        )}

        {!loading && results && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">לא נמצאו תוצאות</div>
            <div className="empty-state-sub">נסה מילות חיפוש אחרות</div>
          </div>
        )}

        {!loading && results?.map(s => (
          <div key={s.id} style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--gray-200)',
            background: '#fff',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)', marginBottom: 4 }}>
              {s.username} → {s.company_name || 'כללי'}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--dark)', lineHeight: 1.55 }}>
              {s.content.slice(0, 120)}...
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 6 }}>
              {s.time_ago} · {s.echoes} הדהודים
            </div>
          </div>
        ))}

        {!results && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">חפש צעקות ומאבקים</div>
            <div className="empty-state-sub">חברות, קטגוריות, שמות משתמש</div>
          </div>
        )}
      </div>
    </div>
  );
}
