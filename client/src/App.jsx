import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import HamburgerMenu from './components/HamburgerMenu.jsx';
import CreateShout from './components/CreateShout.jsx';
import CreateSquad from './components/CreateSquad.jsx';
import LoginModal from './components/LoginModal.jsx';
import Landing from './screens/Landing.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Feed from './screens/Feed.jsx';
import Squads from './screens/Squads.jsx';
import Companies from './screens/Companies.jsx';
import Notifications from './screens/Notifications.jsx';
import CorporatePortal from './screens/CorporatePortal.jsx';
import Profile from './screens/Profile.jsx';
import Arena from './screens/Arena.jsx';
import Friends from './screens/Friends.jsx';
import SquadLobby from './screens/SquadLobby.jsx';
import CompanyLobby from './screens/CompanyLobby.jsx';
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
  const isLoggedIn_ = !!localStorage.getItem('shout_logged_in');
  const onboarded = !!localStorage.getItem('shout_onboarded');

  const startScreen = isLoggedIn_ ? 'feed' : onboarded ? 'landing' : 'onboarding';
  const [screen, setScreen] = useState(startScreen);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateSquad, setShowCreateSquad] = useState(false);
  const [createSquadShout, setCreateSquadShout] = useState(null);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedKey, setFeedKey] = useState(0);
  const [companiesFilter, setCompaniesFilter] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [squadLobbyId, setSquadLobbyId] = useState(null);
  const [companyLobbyId, setCompanyLobbyId] = useState(null);

  function isLoggedIn() { return !!localStorage.getItem('shout_logged_in'); }
  function requireLogin(action) { if (isLoggedIn()) action(); else setShowLogin(true); }
  function handleLogout() {
    API.post('/api/auth/logout', {});
    ['shout_logged_in','shout_nickname','shout_user_id','shout_avatar_color'].forEach(k => localStorage.removeItem(k));
    setScreen('landing');
  }

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

  function navigate(s, filter) {
    if (s === 'squad-lobby' && filter) { setSquadLobbyId(filter); setScreen('squad-lobby'); return; }
    if (s === 'company-lobby' && filter) { setCompanyLobbyId(filter); setScreen('company-lobby'); return; }
    setScreen(s);
    if (s === 'notifications') fetchUnread();
    if (s === 'companies' && filter) setCompaniesFilter(filter);
    else if (s !== 'companies') setCompaniesFilter(null);
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
    requireLogin(() => {
      setCreateSquadShout(shout || null);
      setShowCreateSquad(true);
    });
  }

  const isApp = !['landing', 'onboarding', 'corporate', 'profile', 'squad-lobby', 'company-lobby'].includes(screen);

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
        <Profile onClose={() => navigate('feed')} onNav={navigate} onLogout={handleLogout} />
      </div>
    );
  }

  if (screen === 'squad-lobby') {
    return (
      <div className="app-shell" style={{ overflowY: 'auto' }}>
        <SquadLobby
          squadId={squadLobbyId}
          onBack={() => navigate('squads')}
          onCreateShout={() => { setShowCreate(true); }}
          requireLogin={requireLogin}
        />
      </div>
    );
  }

  if (screen === 'company-lobby') {
    return (
      <div className="app-shell" style={{ overflowY: 'auto' }}>
        <CompanyLobby
          companyId={companyLobbyId}
          onBack={() => navigate('companies')}
          onCreateShout={() => { setShowCreate(true); }}
          requireLogin={requireLogin}
        />
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
        {screen === 'feed'         && <Feed key={feedKey} onCreateShout={() => requireLogin(() => setShowCreate(true))} onNav={navigate} onOpenCreateSquad={openCreateSquad} requireLogin={requireLogin} />}
        {screen === 'squads'    && <Squads onCreateShout={() => requireLogin(() => setShowCreate(true))} onCreateSquad={openCreateSquad} requireLogin={requireLogin} onSquadLobby={(id) => navigate('squad-lobby', id)} />}
        {screen === 'companies' && <Companies onCreateShout={() => setShowCreate(true)} initialFilter={companiesFilter} onCompanyLobby={(id) => navigate('company-lobby', id)} />}
        {screen === 'arena'     && <Arena />}
        {screen === 'friends'   && <Friends requireLogin={requireLogin} />}
        {screen === 'notifications' && <Notifications />}
      </div>

      {isApp && (
        <button className="fab" onClick={() => requireLogin(() => setShowCreate(true))} aria-label="יצירת צעקה">
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
        <SearchOverlay onClose={() => setShowSearch(false)} onNav={(s, id) => { setShowSearch(false); navigate(s, id); }} />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoggedIn={(user) => {
            setShowLogin(false);
            localStorage.setItem('shout_onboarded', '1');
            setFeedKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}
