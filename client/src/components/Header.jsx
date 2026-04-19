const TABS = [
  { key: 'feed',      label: '🏠 הפיד' },
  { key: 'squads',    label: '⚡ קבוצות' },
  { key: 'companies', label: '🏢 חברות' },
  { key: 'arena',     label: '📊 הזירה' },
  { key: 'friends',   label: '👥 חברים' },
];

export default function Header({ screen, onNav, onHamburger, onSearch, unreadCount }) {
  return (
    <header className="header">
      <div className="header-top">
        {/* Logo on LEFT side */}
        <span className="header-logo">Shout</span>
        {/* Right side: search, bell, hamburger */}
        <div className="header-icons">
          <button className="icon-btn" onClick={onSearch} aria-label="חיפוש">
            🔍
          </button>
          <button className="icon-btn" onClick={() => onNav('notifications')} aria-label="התראות">
            🔔
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>
          <button className="icon-btn" onClick={onHamburger} aria-label="תפריט">
            ☰
          </button>
        </div>
      </div>

      <div className="header-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`header-tab${screen === t.key ? ' active' : ''}`}
            onClick={() => onNav(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
}
