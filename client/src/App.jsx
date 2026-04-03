import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import HamburgerMenu from './components/HamburgerMenu.jsx';
import CreateShout from './components/CreateShout.jsx';
import Landing from './screens/Landing.jsx';
import Feed from './screens/Feed.jsx';
import Squads from './screens/Squads.jsx';
import Leaderboard from './screens/Leaderboard.jsx';
import Companies from './screens/Companies.jsx';
import Notifications from './screens/Notifications.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';

// Persistent session id
const SESSION = (() => {
  let s = localStorage.getItem('shout_session');
  if (!s) { s = Math.random().toString(36).slice(2); localStorage.setItem('shout_session', s); }
  return s;
})();

export const API = {
  get: (url) => fetch(url, { headers: { 'x-session': SESSION } }).then(r => r.json()),
  post: (url, body) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session': SESSION },
    body: JSON.stringify(body),
  }).then(r => r.json()),
};

export default function App() {
  const [screen, setScreen] = useState('landing'); // landing | feed | squads | leaderboard | companies | notifications
  const [showCreate, setShowCreate] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedKey, setFeedKey] = useState(0); // bump to refresh feed

  const fetchUnread = useCallback(async () => {
    try {
      const data = await API.get('/api/notifications');
      setUnreadCount(data.unread || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const t = setInterval(fetchUnread, 30000);
    return () => clearInterval(t);
  }, [fetchUnread]);

  function navigate(s) {
    setScreen(s);
    if (s === 'notifications') fetchUnread();
  }

  function onShoutCreated() {
    setShowCreate(false);
    setFeedKey(k => k + 1);
    navigate('feed');
  }

  const isApp = screen !== 'landing';

  return (
    <div className="app-shell">
      {isApp && (
        <Header
          screen={screen}
          onNav={navigate}
          onHamburger={() => setShowHamburger(true)}
          onSearch={() => setShowSearch(true)}
          unreadCount={unreadCount}
        />
      )}

      <div className="screen-content">
        {screen === 'landing'      && <Landing onEnter={() => navigate('feed')} />}
        {screen === 'feed'         && <Feed key={feedKey} onCreateShout={() => setShowCreate(true)} onNav={navigate} />}
        {screen === 'squads'       && <Squads onCreateShout={() => setShowCreate(true)} />}
        {screen === 'leaderboard'  && <Leaderboard onCompanies={() => navigate('companies')} />}
        {screen === 'companies'    && <Companies onCreateShout={() => setShowCreate(true)} />}
        {screen === 'notifications' && <Notifications />}
      </div>

      {isApp && (
        <BottomNav screen={screen} onNav={navigate} />
      )}

      {isApp && (
        <button className="fab" onClick={() => setShowCreate(true)} aria-label="יצירת צעקה">
          📣
        </button>
      )}

      {showHamburger && (
        <HamburgerMenu
          onClose={() => setShowHamburger(false)}
          onNav={(s) => { setShowHamburger(false); navigate(s); }}
        />
      )}

      {showCreate && (
        <CreateShout
          onClose={() => setShowCreate(false)}
          onCreated={onShoutCreated}
        />
      )}

      {showSearch && (
        <SearchOverlay onClose={() => setShowSearch(false)} onNav={navigate} />
      )}
    </div>
  );
}
