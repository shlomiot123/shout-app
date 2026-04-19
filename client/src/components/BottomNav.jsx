const TABS = [
  { key: 'feed',      icon: '🏠', label: 'הפיד' },
  { key: 'squads',    icon: '⚡', label: 'קבוצות' },
  { key: 'companies', icon: '🏢', label: 'חברות' },
  { key: 'arena',     icon: '📊', label: 'הזירה' },
  { key: 'friends',   icon: '👥', label: 'חברים' },
];

export default function BottomNav({ screen, onNav }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <button
          key={t.key}
          className={`bottom-nav-btn${screen === t.key ? ' active' : ''}`}
          onClick={() => onNav(t.key)}
        >
          <span className="nav-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
