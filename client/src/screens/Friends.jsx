import { useState, useEffect, useRef, useCallback } from 'react';
import { API } from '../App.jsx';

const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EF4444','#F59E0B','#06B6D4'];
const MY_SESSION = (() => { let s = localStorage.getItem('shout_session'); if (!s) { s = Math.random().toString(36).slice(2); localStorage.setItem('shout_session', s); } return s; })();

function Avatar({ color, name, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color || '#9CA3AF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {(name || '?')[0]}
    </div>
  );
}

// ── New Direct Chat Modal ─────────────────────────────────────────────────────
function NewChatModal({ onClose, onOpen }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      API.get(`/api/users?q=${encodeURIComponent(query)}`)
        .then(d => { setResults(d); setLoading(false); })
        .catch(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function startChat(user) {
    setCreating(true);
    try {
      const data = await API.post('/api/chat/direct', {
        target_session: user.session_id,
        target_nickname: user.nickname,
      });
      onOpen(data.room);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', borderRadius: '20px 20px 0 0', padding: 20, paddingBottom: 40, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>💬 שיחה חדשה</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
        </div>
        <input
          autoFocus
          style={{
            padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--gray-200)',
            fontFamily: 'Heebo', fontSize: 13, direction: 'rtl', outline: 'none',
            background: 'var(--gray-50)', marginBottom: 12,
          }}
          placeholder="חפש לפי כינוי..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        {loading && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)', fontSize: 12 }}>מחפש...</div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)', fontSize: 12 }}>
            לא נמצאו משתמשים עם הכינוי הזה
          </div>
        )}

        {results.map(user => (
          <button
            key={user.id}
            onClick={() => startChat(user)}
            disabled={creating}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 4px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: '1px solid var(--gray-100)', width: '100%', direction: 'rtl', textAlign: 'right',
              opacity: creating ? 0.5 : 1,
            }}
          >
            <Avatar color={user.avatar_color} name={user.nickname} size={40} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{user.nickname}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>לחץ לפתיחת שיחה</div>
            </div>
          </button>
        ))}

        {query.length < 2 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)', fontSize: 12, lineHeight: 1.7 }}>
            הקלד לפחות 2 תווים כדי לחפש משתמשים<br />
            שיחות ישירות נפתחות עם משתמשים רשומים
          </div>
        )}
      </div>
    </div>
  );
}

// ── New Group Chat Modal ──────────────────────────────────────────────────────
function NewGroupModal({ onClose, onOpen }) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const data = await API.post('/api/chat/group', { name: name.trim() });
      onOpen(data.room);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', borderRadius: '20px 20px 0 0', padding: 20, paddingBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>⚡ קבוצה חדשה</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
        </div>
        <input
          autoFocus
          style={{
            padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--gray-200)',
            fontFamily: 'Heebo', fontSize: 13, direction: 'rtl', outline: 'none',
            background: 'var(--gray-50)', marginBottom: 16, width: '100%', boxSizing: 'border-box',
          }}
          placeholder="שם הקבוצה..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && create()}
        />
        <button
          onClick={create}
          disabled={!name.trim() || creating}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            background: name.trim() ? 'var(--dark)' : 'var(--gray-200)',
            color: name.trim() ? 'var(--yellow)' : 'var(--gray-400)',
            fontFamily: 'Heebo', fontWeight: 700, fontSize: 14, cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          {creating ? '...' : '⚡ צור קבוצה'}
        </button>
      </div>
    </div>
  );
}

// ── Chat thread ───────────────────────────────────────────────────────────────
function ChatThread({ room, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const myNick = localStorage.getItem('shout_nickname') || 'אנונימי';

  const fetchMessages = useCallback(async () => {
    const data = await API.get(`/api/chat/rooms/${room.id}/messages`);
    setMessages(data);
  }, [room.id]);

  useEffect(() => {
    fetchMessages();
    const t = setInterval(fetchMessages, 3000);
    return () => clearInterval(t);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const msg = await API.post(`/api/chat/rooms/${room.id}/messages`, { content: input });
      setMessages(m => [...m, msg]);
      setInput('');
    } finally {
      setSending(false);
    }
  }

  const isGroup = room.type === 'group';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        background: isGroup ? 'var(--yellow)' : 'var(--white)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--gray-200)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>‹</button>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: isGroup ? 'rgba(0,0,0,0.12)' : '#3B82F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          {isGroup ? '⚡' : '💬'}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{room.name}</div>
          <div style={{ fontSize: 11, color: isGroup ? 'rgba(0,0,0,0.5)' : 'var(--gray-500)' }}>
            {isGroup ? 'קבוצת לחץ' : 'צ׳אט פרטי'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: 'var(--gray-100)' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 12, paddingTop: 40 }}>
            {isGroup ? 'אין הודעות עדיין — היה הראשון לכתוב!' : 'שלח הודעה כדי להתחיל שיחה'}
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.session_id === MY_SESSION;
          const showNick = isGroup && !isMe && (i === 0 || messages[i - 1]?.session_id !== msg.session_id);
          const color = AVATAR_COLORS[msg.session_id?.charCodeAt(0) % AVATAR_COLORS.length] || '#9CA3AF';
          return (
            <div key={msg.id} style={{ marginBottom: 8 }}>
              {showNick && (
                <div style={{ fontSize: 10, color: 'var(--gray-500)', marginBottom: 2, marginRight: 42 }}>
                  {msg.nickname}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: 6 }}>
                {!isMe && isGroup && (
                  <Avatar color={color} name={msg.nickname} size={28} />
                )}
                <div style={{
                  maxWidth: '75%', padding: '10px 13px', borderRadius: 16,
                  background: isMe ? 'var(--white)' : 'var(--yellow)',
                  fontSize: 13, lineHeight: 1.5, direction: 'rtl',
                  borderBottomRightRadius: isMe ? 4 : 16,
                  borderBottomLeftRadius: isMe ? 16 : 4,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                }}>
                  {msg.content}
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 3, textAlign: isMe ? 'left' : 'right' }}>
                    {msg.time_ago}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{
        background: 'var(--white)', padding: '10px 14px', flexShrink: 0,
        display: 'flex', gap: 8, alignItems: 'center',
        borderTop: '1px solid var(--gray-200)',
      }}>
        <input
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 22,
            border: '1.5px solid var(--gray-200)', outline: 'none',
            fontFamily: 'Heebo', fontSize: 13, direction: 'rtl',
            background: 'var(--gray-50)',
          }}
          placeholder="כתוב הודעה..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: input.trim() ? 'var(--dark)' : 'var(--gray-200)',
            border: 'none', cursor: 'pointer', fontSize: 18,
            color: input.trim() ? 'var(--yellow)' : 'var(--gray-400)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >›</button>
      </div>
    </div>
  );
}

// ── Room list item ─────────────────────────────────────────────────────────────
function RoomItem({ room, onClick }) {
  const isGroup = room.type === 'group';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: '1px solid var(--gray-100)', direction: 'rtl', textAlign: 'right',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: isGroup ? 12 : '50%', flexShrink: 0,
        background: isGroup ? 'var(--yellow)' : '#3B82F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {isGroup ? '⚡' : '💬'}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{room.name}</div>
        {room.last_message ? (
          <div style={{ fontSize: 11, color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {room.last_message.nickname}: {room.last_message.content}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>אין הודעות עדיין</div>
        )}
      </div>
      {room.last_message && (
        <div style={{ fontSize: 10, color: 'var(--gray-400)', flexShrink: 0 }}>{room.last_message.time}</div>
      )}
    </button>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function Friends({ requireLogin }) {
  const [rooms, setRooms] = useState({ group: [], direct: [] });
  const [activeRoom, setActiveRoom] = useState(null);
  const [tab, setTab] = useState('direct');
  const [loading, setLoading] = useState(true);
  const [showNewDirect, setShowNewDirect] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  function loadRooms() {
    API.get('/api/chat/rooms')
      .then(data => { setRooms(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadRooms(); }, []);

  function openRoom(room) {
    setShowNewDirect(false);
    setShowNewGroup(false);
    setActiveRoom(room);
  }

  if (activeRoom) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ChatThread room={activeRoom} onBack={() => { setActiveRoom(null); loadRooms(); }} />
      </div>
    );
  }

  const shown = tab === 'group' ? rooms.group : rooms.direct;

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--white)', padding: '16px 12px 0', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>צ׳אט</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => requireLogin ? requireLogin(() => setShowNewGroup(true)) : setShowNewGroup(true)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: 'var(--gray-100)', fontFamily: 'Heebo', fontWeight: 700, fontSize: 12,
                color: 'var(--gray-700)',
              }}
            >⚡ קבוצה חדשה</button>
            <button
              onClick={() => requireLogin ? requireLogin(() => setShowNewDirect(true)) : setShowNewDirect(true)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: 'var(--dark)', fontFamily: 'Heebo', fontWeight: 700, fontSize: 12,
                color: 'var(--yellow)',
              }}
            >💬 שיחה חדשה</button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>
          שיחות קבוצתיות ופרטיות
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)' }}>
          {[
            { key: 'direct', label: '💬 ישיר' },
            { key: 'group',  label: '⚡ קבוצות לחץ' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'none',
                cursor: 'pointer', fontFamily: 'Heebo', fontWeight: 700, fontSize: 13,
                color: tab === t.key ? 'var(--dark)' : 'var(--gray-500)',
                borderBottom: tab === t.key ? '2.5px solid var(--dark)' : '2.5px solid transparent',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>טוען...</div>
      ) : shown.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>{tab === 'group' ? '⚡' : '💬'}</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
            {tab === 'group' ? 'אין קבוצות פעילות' : 'אין שיחות פרטיות עדיין'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 20 }}>
            {tab === 'group'
              ? 'הצטרף לקבוצות לחץ כדי להשתתף בשיחות הקבוצתיות'
              : 'התחל שיחה חדשה עם משתמש אחר'}
          </div>
          {tab === 'direct' && (
            <button
              onClick={() => requireLogin ? requireLogin(() => setShowNewDirect(true)) : setShowNewDirect(true)}
              style={{
                padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'var(--dark)', color: 'var(--yellow)',
                fontFamily: 'Heebo', fontWeight: 700, fontSize: 14,
              }}
            >💬 התחל שיחה</button>
          )}
          {tab === 'group' && (
            <button
              onClick={() => requireLogin ? requireLogin(() => setShowNewGroup(true)) : setShowNewGroup(true)}
              style={{
                padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'var(--yellow)', color: 'var(--dark)',
                fontFamily: 'Heebo', fontWeight: 700, fontSize: 14,
              }}
            >⚡ צור קבוצה</button>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 14, margin: '0 12px', overflow: 'hidden', border: '1.5px solid var(--gray-200)' }}>
          {shown.map(room => (
            <RoomItem key={room.id} room={room} onClick={() => setActiveRoom(room)} />
          ))}
        </div>
      )}

      {tab === 'group' && shown.length > 0 && (
        <div style={{
          margin: '12px 12px 0', padding: '12px 14px', background: '#FFF7ED',
          borderRadius: 12, border: '1px solid #FED7AA', fontSize: 12,
          color: 'var(--orange)', fontWeight: 600, direction: 'rtl',
        }}>
          💡 הצטרף לקבוצות לחץ נוספות כדי לראות עוד שיחות קבוצתיות
        </div>
      )}

      {showNewDirect && (
        <NewChatModal
          onClose={() => setShowNewDirect(false)}
          onOpen={openRoom}
        />
      )}
      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onOpen={openRoom}
        />
      )}
    </div>
  );
}
