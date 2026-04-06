export default function Landing({ onEnter, onCorporate }) {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-hero-logo">📣</div>
        <span style={{ fontSize: 20, fontWeight: 900 }}>Shout</span>
      </div>

      <div className="landing-body">
        <div className="landing-headline">
          כל קול<br />
          <span>נחשב.</span>
        </div>
        <p className="landing-sub">
          האפליקציה שצוברת את הקולות הבודדים והופכת אותם לכוח חברתי צרכני משפיע.
        </p>

        {/* Main CTA — black */}
        <button className="landing-cta landing-cta-black" onClick={onEnter}>
          אני רוצה להצטרף ל Shout 📣
        </button>

        {/* Corporate — blue */}
        <button className="landing-cta-corp-blue" onClick={onCorporate || onEnter}>
          🏢 כניסת נציג תאגיד
        </button>

        <div className="landing-member-count">
          כבר <strong>47,000+</strong> צרכנים פעילים
        </div>
      </div>
    </div>
  );
}
