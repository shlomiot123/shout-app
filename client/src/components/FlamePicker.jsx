// FlamePicker — reusable anger-level selector using colored flames
// value: 1-5, onChange: (level) => void
// mode: 'selector' (full grid with labels) | 'row' (compact popup row)

const FLAME_LEVELS = [
  { level: 1, label: 'תסכול',  color: '#FDE68A', dark: '#CA8A04' },
  { level: 2, label: 'רוגז',   color: '#FCD34D', dark: '#B45309' },
  { level: 3, label: 'כעס',    color: '#F97316', dark: '#C2410C' },
  { level: 4, label: 'זעם',    color: '#EF4444', dark: '#B91C1C' },
  { level: 5, label: 'רתיחה',  color: '#991B1B', dark: '#7F1D1D' },
];

export function FlameIcon({ level, active, size = 28 }) {
  const fl = FLAME_LEVELS[level - 1];
  return (
    <span
      style={{
        fontSize: size,
        filter: active
          ? `drop-shadow(0 0 4px ${fl.color})`
          : 'grayscale(0.6) opacity(0.45)',
        transition: 'filter 0.15s, transform 0.12s',
        transform: active ? 'scale(1.15)' : 'scale(1)',
        display: 'inline-block',
        color: fl.color,
      }}
    >
      🔥
    </span>
  );
}

// Full selector (CreateShout step)
export function FlameSelectorFull({ value, onChange }) {
  return (
    <div className="flame-selector-full">
      {FLAME_LEVELS.map(fl => {
        const active = value >= fl.level;
        const selected = value === fl.level;
        return (
          <div
            key={fl.level}
            className={`flame-option-full${selected ? ' selected' : ''}`}
            onClick={() => onChange(fl.level)}
            style={{ borderColor: selected ? fl.color : 'var(--gray-200)', background: selected ? fl.color + '18' : '' }}
          >
            <div className="flame-row">
              {FLAME_LEVELS.slice(0, fl.level).map((_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 20,
                    filter: active ? `drop-shadow(0 0 3px ${fl.color})` : 'none',
                    transition: 'all 0.15s',
                  }}
                >🔥</span>
              ))}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: selected ? fl.dark : 'var(--gray-500)', marginTop: 4 }}>
              {fl.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Compact popup row (ShoutCard boost picker)
export function FlamePickerRow({ onSelect }) {
  return (
    <div className="boost-picker">
      <div className="boost-picker-title">בחר עוצמת כעס</div>
      <div className="boost-picker-options">
        {FLAME_LEVELS.map(fl => (
          <button
            key={fl.level}
            className="boost-picker-option"
            onClick={() => onSelect(fl.level)}
            style={{ '--flame-color': fl.color }}
          >
            <div style={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              {FLAME_LEVELS.slice(0, fl.level).map((_, i) => (
                <span key={i} style={{ fontSize: 16, lineHeight: 1 }}>🔥</span>
              ))}
            </div>
            <span style={{ fontSize: 10, color: fl.dark, fontWeight: 700 }}>{fl.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Inline flame display (read-only, in ShoutCard stats)
export function FlameDisplay({ level }) {
  return (
    <span className="anger-flames">
      {FLAME_LEVELS.map(fl => (
        <span
          key={fl.level}
          style={{
            fontSize: 14,
            filter: level >= fl.level ? `drop-shadow(0 0 2px ${fl.color})` : 'grayscale(1) opacity(0.3)',
          }}
        >🔥</span>
      ))}
    </span>
  );
}
