import { useState } from 'react';

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(1); // 1: phone | 2: otp | 3: nickname+terms
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [nickname, setNickname] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const SUGGESTED = 'אנונימי_' + (Math.floor(Math.random() * 900) + 100);

  function handlePhone() {
    if (phone.replace(/\D/g, '').length >= 9) setStep(2);
  }

  function handleOtp() {
    // Accept any 4-digit code (demo)
    if (otp.length === 4) {
      setStep(3);
    } else {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 2000);
    }
  }

  function handleDone() {
    if (!acceptTerms) return;
    const name = nickname.trim() || SUGGESTED;
    localStorage.setItem('shout_nickname', name);
    localStorage.setItem('shout_onboarded', '1');
    onDone(name);
  }

  return (
    <div className="onboarding">
      <div className="onboarding-top">
        <div className="onboarding-logo-wrap">
          <span className="onboarding-logo-icon">📣</span>
          <span className="onboarding-logo-text">Shout</span>
        </div>
        <div className="onboarding-tagline">הצטרף/י לזירה הצרכנית הגדולה בישראל</div>
        <div className="onboarding-counter">כבר <strong>47,000+</strong> צרכנים פעילים</div>
      </div>

      <div className="onboarding-card">
        {/* Step dots */}
        <div className="modal-step-indicator" style={{ marginBottom: 20 }}>
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="onboarding-step-title">מה מספר הטלפון שלך?</div>
            <div className="onboarding-step-sub">שמירת אנונימיות מלאה. לא נשלח ספאם.</div>
            <input
              className="onboarding-input"
              type="tel"
              inputMode="tel"
              placeholder="05X-XXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoFocus
              dir="ltr"
            />
            <button
              className="btn-primary yellow onboarding-btn"
              disabled={phone.replace(/\D/g, '').length < 9}
              onClick={handlePhone}
            >
              המשך →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="onboarding-step-title">קוד אימות</div>
            <div className="onboarding-step-sub">שלחנו SMS ל-{phone}. (הקלד כל 4 ספרות)</div>
            <input
              className={`onboarding-input otp${otpError ? ' error' : ''}`}
              type="number"
              inputMode="numeric"
              placeholder="0000"
              value={otp}
              onChange={e => setOtp(e.target.value.slice(0, 4))}
              autoFocus
              dir="ltr"
              style={{ textAlign: 'center', letterSpacing: 8, fontSize: 22 }}
            />
            {otpError && <div className="onboarding-error">קוד לא תקין, נסה שוב</div>}
            <div className="onboarding-resend">
              לא קיבלת SMS?{' '}
              <button className="onboarding-resend-btn" onClick={() => {}}>שלח שוב</button>
            </div>
            <button
              className="btn-primary yellow onboarding-btn"
              disabled={otp.length < 4}
              onClick={handleOtp}
            >
              אמת קוד
            </button>
            <button className="onboarding-back-link" onClick={() => setStep(1)}>← שנה מספר</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="onboarding-step-title">בחר שם בזירה</div>
            <div className="onboarding-step-sub">
              הכינוי שלך יופיע על הצעקות. אנונימיות מלאה.
            </div>
            <input
              className="onboarding-input"
              placeholder={SUGGESTED}
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 14, textAlign: 'center' }}>
              ריק = {SUGGESTED}
            </div>

            <label className="onboarding-terms-label">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                className="onboarding-checkbox"
              />
              <span>
                קראתי ומסכים/ה ל
                <span className="onboarding-link">תנאי השימוש</span>
                {' '}ול
                <span className="onboarding-link">מדיניות הפרטיות</span>
              </span>
            </label>

            <button
              className="btn-primary yellow onboarding-btn"
              disabled={!acceptTerms}
              onClick={handleDone}
            >
              📣 כניסה לזירה!
            </button>
          </>
        )}
      </div>

      <div className="onboarding-footer">
        הפלטפורמה הצרכנית הפעילה והמשפיעה ביותר בישראל
      </div>
    </div>
  );
}
