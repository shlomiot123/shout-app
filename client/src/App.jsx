import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import HamburgerMenu from './components/HamburgerMenu.jsx';
import CreateShout from './components/CreateShout.jsx';
import CreateSquad from './components/CreateSquad.jsx';
import Landing from './screens/Landing.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Feed from './screens/Feed.jsx';
import Squads from './screens/Squads.jsx';
import Leaderboard from './screens/Leaderboard.jsx';
import Companies from './screens/Companies.jsx';
import Notifications from './screens/Notifications.jsx';
import CorporatePortal from './screens/CorporatePortal.jsx';
import Profile from './screens/Profile.jsx';
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
  const onboarded = !!localStorage.getItem('shout_onboarded');

  // landing | onboarding | corporate | feed | squads | leaderboard | companies | notifications | profile
  const [screen, setScreen] = useState(onboarded ? 'landing' : 'onboarding');
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateSquad, setShowCreateSquad] = useState(false);
  const [createSquadShout, setCreateSquadShout] = useState(null);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedKey, setFeedKey] = useState(0);

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

  function onSquadCreated() {
    setShowCreateSquad(false);
    setCreateSquadShout(null);
    navigate('squads');
  }

  function openCreateSquad(shout) {
    setCreateSquadShout(shout || null);
    setShowCreateSquad(true);
  }

  const isApp = !['landing', 'onboarding', 'corporate', 'profile'].includes(screen);

  // Full-screen non-nav screens
  if (screen === 'onboarding') {
    return (
      <div className="app-shell">
        <Onboarding onDone={() => navigate('landing')} />
      </div>
    );
  }

  if (screen === 'corporate') {
    return (
      <div className="app-shell">
        <CorporatePortal onBack={() => navigate('landing')} />
      </div>
    );
  }

  if (screen === 'profile') {
    return (
      <div className="app-shell" style={{ overflowY: 'auto' }}>
        <Profile onClose={() => navigate('feed')} onNav={navigate} />
      </div>
    );
  }

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
        {screen === 'landing'      && <Landing onEnter={() => navigate('feed')} onCorporate={() => navigate('corporate')} />}
        {screen === 'feed'         && <Feed key={feedKey} onCreateShout={() => setShowCreate(true)} onNav={navigate} onOpenCreateSquad={openCreateSquad} />}
        {screen === 'squads'       && <Squads onCreateShout={() => setShowCreate(true)} onCreateSquad={openCreateSquad} />}
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

      {showCreateSquad && (
        <CreateSquad
          initialShout={createSquadShout}
          onClose={() => { setShowCreateSquad(false); setCreateSquadShout(null); }}
          onCreated={onSquadCreated}
        />
      )}

      {showSearch && (
        <SearchOverlay onClose={() => setShowSearch(false)} onNav={navigate} />
      )}
    </div>
  );
}
