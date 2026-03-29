export default function Landing({ onEnter }) {
  return (
    <div className="landing">
      {/* Top bar */}
      <div className="landing-hero">
        <div className="landing-hero-logo">📣</div>
        <span style={{ fontSize: 20, fontWeight: 900 }}>Shout</span>
      </div>

      <div className="landing-body">
        <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 4 }}>
          האפליקציה לצרכנים
        </div>
        <div className="landing-headline">
          כל קול<br />
          <span>נחשב.</span>
        </div>
        <p className="landing-sub">
          האפליקציה שצוברת את הקולות הבודדים והופכת אותם לחברתי צרכני משפיע
        </p>

        <div className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-icon">📣</div>
            <div className="landing-feature-text">
              <strong>לצעוק – לשתף את מה שמציק לך</strong>
              <span>פרסם את הצעקה שלך ותן לכולם לראות</span>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">👥</div>
            <div className="landing-feature-text">
              <strong>להתארגן – לצבור כח ביחד ולנקוט פעולה</strong>
              <span>הצטרף לקבוצות לחץ ויצור שינוי אמיתי</span>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">👁</div>
            <div className="landing-feature-text">
              <strong>להשפיע – ליצור קבוצת לחץ שתחייב תגובה</strong>
              <span>מדד הבושה שם תאגידים במקום שלהם</span>
            </div>
          </div>
        </div>

        <button className="landing-cta" onClick={onEnter}>
          📣 I want to Shout
        </button>

        <div className="landing-member-count">
          כבר <strong>47,000+</strong> צרכנים פעילים
        </div>
      </div>
    </div>
  );
}
