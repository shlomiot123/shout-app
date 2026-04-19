import { useState, useCallback, useRef } from 'react';
import { API } from '../App.jsx';

function Section({ title, items, renderItem }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        padding: '8px 16px', fontSize: 11, fontWeight: 800, color: 'var(--gray-500)',
        background: 'var(--gray-100)', textTransform: 'uppercase', letterSpacing: 0.5,
      }}>{title}</div>
      {items.map(renderItem)}
    </div>
  );
}

export default function SearchOverlay({ onClose, onNav }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q.trim() || q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const data = await API.get(`/api/search?q=${encodeURIComponent(q.trim())}`);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doSearch(q), 300);
  }

  const hasResults = results && (results.shouts?.length || results.companies?.length || results.squads?.length || results.users?.length);

  return (
    <div className="search-overlay">
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="חפש צעקה, חברה, קבוצה, משתמש..."
          value={query}
          autoFocus
          onChange={handleChange}
        />
        <button className="search-cancel" onClick={onClose}>ביטול</button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading && (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--gray-500)' }}>מחפש...</div>
        )}

        {!loading && query.length > 1 && !hasResults && results && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">לא נמצאו תוצאות</div>
            <div className="empty-state-sub">נסה מילות חיפוש אחרות</div>
          </div>
        )}

        {!loading && results && (
          <>
            <Section
              title="חברות"
              items={results.companies}
              renderItem={co => (
                <button
                  key={co.id}
                  onClick={() => { onNav && onNav('company-lobby', co.id); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 16px', border: 'none', background: 'var(--white)',
                    borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', direction: 'rtl',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: '#FEF3C7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>🏢</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{co.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                      {co.category_name} · ציון זעם: <span style={{ color: 'var(--red)', fontWeight: 700 }}>{co.anger_score}</span>
                    </div>
                  </div>
                </button>
              )}
            />

            <Section
              title="קבוצות לחץ"
              items={results.squads}
              renderItem={sq => (
                <button
                  key={sq.id}
                  onClick={() => { onNav && onNav('squad-lobby', sq.id); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 16px', border: 'none', background: 'var(--white)',
                    borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', direction: 'rtl',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: 'var(--yellow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>⚡</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{sq.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                      {sq.company_name} · {sq.current_members.toLocaleString('he-IL')} חברים
                    </div>
                  </div>
                </button>
              )}
            />

            <Section
              title="צעקות"
              items={results.shouts}
              renderItem={s => (
                <div key={s.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', background: 'var(--white)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)', marginBottom: 4 }}>
                    {s.username} {s.company_name ? `→ ${s.company_name}` : ''}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--dark)', lineHeight: 1.5, direction: 'rtl' }}>
                    {s.content.slice(0, 100)}{s.content.length > 100 ? '...' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                    {s.time_ago} · {s.echoes} הזדהו ☝️
                  </div>
                </div>
              )}
            />

            <Section
              title="משתמשים"
              items={results.users}
              renderItem={u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, direction: 'rtl',
                  padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', background: 'var(--white)',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: u.avatar_color || '#9CA3AF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 16,
                  }}>{u.nickname[0]}</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{u.nickname}</div>
                </div>
              )}
            />
          </>
        )}

        {!results && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">חפש בכל Shout</div>
            <div className="empty-state-sub">צעקות · חברות · קבוצות · משתמשים</div>
          </div>
        )}
      </div>
    </div>
  );
}
