import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const ANGER_OPTIONS = [
  { level: 1, icon: '😐', label: 'מרוגז' },
  { level: 2, icon: '😤', label: 'זועם' },
  { level: 3, icon: '😠', label: 'כועס' },
  { level: 4, icon: '🤬', label: 'רותח' },
  { level: 5, icon: '🔥', label: 'נפצץ' },
];

const CHURN_OPTIONS = [
  'כן, מיידית',
  'בהתלבטות',
  'לא ניתן - מונופול',
  'לא רלוונטי',
];

const PROFANITY_WORDS = ['כסיל', 'מטומטם', 'אידיוט', 'חרא', 'זין', 'כאס', 'בן זונה', 'שרמוטה'];

function hasProfanity(text) {
  const lower = text.toLowerCase();
  return PROFANITY_WORDS.some(w => lower.includes(w));
}

function sanitize(text) {
  let out = text;
  PROFANITY_WORDS.forEach(w => {
    out = out.replace(new RegExp(w, 'gi'), '***');
  });
  return out;
}

export default function CreateShout({ onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1..5
  const [content, setContent] = useState('');
  const [angerLevel, setAngerLevel] = useState(3);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [churnChoice, setChurnChoice] = useState(null);
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showProfanityWarning, setShowProfanityWarning] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState('');

  const TOTAL_STEPS = 5;

  useEffect(() => {
    API.get('/api/categories').then(d => setCategories(d.filter(c => c.slug !== 'all')));
    API.get('/api/companies').then(setCompanies);
  }, []);

  const filteredCompanies = companies.filter(c =>
    c.name.includes(companySearch) || c.category_name?.includes(companySearch)
  );

  function handleNextFromStep1() {
    if (hasProfanity(content)) {
      const clean = sanitize(content);
      setSanitizedContent(clean);
      setShowProfanityWarning(true);
    } else {
      setStep(2);
    }
  }

  function acceptSanitized() {
    setContent(sanitizedContent);
    setShowProfanityWarning(false);
    setStep(2);
  }

  async function handleSubmit() {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await API.post('/api/shouts', {
        content,
        anger_level: angerLevel,
        category_id: selectedCat?.id || null,
        company_id: selectedCompany?.id || null,
      });
      onCreated();
    } catch (e) {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <span className="modal-title">יצירת צעקה</span>
          <div style={{ width: 30 }} />
        </div>

        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderBottom: '1px solid var(--gray-200)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: '#10B981', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700,
          }}>א</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>אנונימי_84</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
              🌐 פומבי למתחרים
            </div>
          </div>
        </div>

        <div className="modal-body">
          {/* Step indicator */}
          <div className="modal-step-indicator">
            {[1,2,3,4,5].map(s => (
              <div
                key={s}
                className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`}
              />
            ))}
          </div>

          {/* Profanity warning overlay */}
          {showProfanityWarning && (
            <div className="profanity-warning">
              <div className="profanity-warning-icon">⚠️</div>
              <div className="profanity-warning-title">מותר לכעוס! אסור לקלל</div>
              <div className="profanity-warning-sub">זה הנוסח המתוקן לצעקה שלך, נא אשר:</div>
              <div className="profanity-warning-text">{sanitizedContent}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn-secondary" onClick={() => setShowProfanityWarning(false)}>ערוך</button>
                <button className="btn-primary yellow" onClick={acceptSanitized}>אשר ✓</button>
              </div>
            </div>
          )}

          {/* Step 1: Write */}
          {step === 1 && !showProfanityWarning && (
            <>
              <div className="modal-section-label">ספר לנו על החוויה שלך - בלי קללות ושפה בוטה. מותר לכעוס!</div>
              <textarea
                className="modal-textarea"
                rows={5}
                placeholder="ספר לנו על החוויה שלך... כמה שיותר פרטים, ככה יותר כוח לצעקה."
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={800}
                autoFocus
              />
              <div style={{ fontSize: 11, color: 'var(--gray-500)', textAlign: 'left', marginBottom: 14 }}>
                {content.length}/800
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <div style={{
                  flex: 1, border: '1.5px dashed var(--gray-300)', borderRadius: 10,
                  padding: '10px', display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', color: 'var(--gray-500)', fontSize: 13,
                }}>
                  <span>📎</span> הוסף תמונה להוכחה
                </div>
                <div style={{
                  flex: 1, border: '1.5px dashed var(--gray-300)', borderRadius: 10,
                  padding: '10px', display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', color: 'var(--gray-500)', fontSize: 13,
                }}>
                  <span>📍</span>
                  <input
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'Heebo', width: '100%', direction: 'rtl' }}
                    placeholder="מיקום (אופציונלי)"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>ביטול</button>
                <button
                  className="btn-primary"
                  disabled={content.trim().length < 10}
                  onClick={handleNextFromStep1}
                >
                  המשך →
                </button>
              </div>
            </>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <>
              <div className="modal-section-label">באיזה תחום מדובר?</div>
              <div className="cat-grid">
                {categories.map(c => {
                  const icon = c.slug === 'health' ? '🩺' : c.icon;
                  return (
                    <div
                      key={c.id}
                      className={`cat-option${selectedCat?.id === c.id ? ' selected' : ''}`}
                      onClick={() => setSelectedCat(c)}
                    >
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      {c.name}
                    </div>
                  );
                })}
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setStep(1)}>חזור</button>
                <button
                  className="btn-primary"
                  disabled={!selectedCat}
                  onClick={() => setStep(3)}
                >
                  המשך →
                </button>
              </div>
            </>
          )}

          {/* Step 3: Company */}
          {step === 3 && (
            <>
              <div className="modal-section-label">בחר חברה מהרשימה:</div>
              <input
                className="company-search"
                placeholder="חפש חברה..."
                value={companySearch}
                onChange={e => setCompanySearch(e.target.value)}
              />
              <div className="company-list">
                {filteredCompanies.map(c => (
                  <div
                    key={c.id}
                    className={`company-option${selectedCompany?.id === c.id ? ' selected' : ''}`}
                    onClick={() => setSelectedCompany(c)}
                  >
                    <span>{c.name}</span>
                    {selectedCompany?.id === c.id && <span>✓</span>}
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setStep(2)}>חזור</button>
                <button
                  className="btn-primary"
                  onClick={() => setStep(4)}
                >
                  המשך →
                </button>
              </div>
            </>
          )}

          {/* Step 4: Anger level */}
          {step === 4 && (
            <>
              <div className="modal-section-label">מה רמת הכעס שלך?</div>
              <div className="anger-selector">
                {ANGER_OPTIONS.map(a => (
                  <div
                    key={a.level}
                    className={`anger-option${angerLevel === a.level ? ' selected' : ''}`}
                    onClick={() => setAngerLevel(a.level)}
                  >
                    {a.icon}
                    <span>{a.label}</span>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setStep(3)}>חזור</button>
                <button
                  className="btn-primary"
                  onClick={() => setStep(5)}
                >
                  המשך →
                </button>
              </div>
            </>
          )}

          {/* Step 5: Churn question + Submit */}
          {step === 5 && (
            <>
              <div className="modal-section-label">שאלה אחרונה:</div>
              <div style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 14, fontWeight: 600 }}>
                בעקבות המקרה, האם בכוונתך לעזוב את {selectedCompany?.name || 'החברה'}?
              </div>
              <div className="churn-options">
                {CHURN_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    className={`churn-option${churnChoice === opt ? ' selected' : ''}`}
                    onClick={() => setChurnChoice(opt)}
                  >
                    {opt}
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setStep(4)}>חזור</button>
                <button
                  className="btn-primary yellow"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? '...' : '📣 שגר צעקה לזירה הציבורית'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
