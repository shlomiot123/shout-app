import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const ANGER_OPTIONS = [
  { level: 1, icon: '😐', label: 'מרוגז' },
  { level: 2, icon: '😤', label: 'זועם' },
  { level: 3, icon: '😠', label: 'כועס' },
  { level: 4, icon: '🤬', label: 'רותח' },
  { level: 5, icon: '🔥', label: 'נפצץ' },
];

export default function CreateShout({ onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1: write, 2: category, 3: company, 4: confirm
  const [content, setContent] = useState('');
  const [angerLevel, setAngerLevel] = useState(3);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/api/categories').then(d => setCategories(d.filter(c => c.slug !== 'all')));
    API.get('/api/companies').then(setCompanies);
  }, []);

  const filteredCompanies = companies.filter(c =>
    c.name.includes(companySearch) || c.category_name?.includes(companySearch)
  );

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

  const steps = [1, 2, 3];

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
            {steps.map(s => (
              <div
                key={s}
                className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`}
              />
            ))}
          </div>

          {/* Step 1: Write */}
          {step === 1 && (
            <>
              <div className="modal-section-label">פרט מה קרה:</div>
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

              <div className="modal-section-label" style={{ marginBottom: 10 }}>רמת הכעס שלך:</div>
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

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
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
                  <span>📍</span> מיקום
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>ביטול</button>
                <button
                  className="btn-primary"
                  disabled={content.trim().length < 10}
                  onClick={() => setStep(2)}
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
                {categories.map(c => (
                  <div
                    key={c.id}
                    className={`cat-option${selectedCat?.id === c.id ? ' selected' : ''}`}
                    onClick={() => setSelectedCat(c)}
                  >
                    <span style={{ fontSize: 20 }}>{c.icon}</span>
                    {c.name}
                  </div>
                ))}
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

              {/* Last question: intent */}
              {selectedCompany && (
                <div style={{ marginTop: 16 }}>
                  <div className="modal-section-label">שאלה אחרונה:</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 10 }}>
                    בעקבות המקרה, האם בכוונתך לעזוב את {selectedCompany.name}?
                  </div>
                  {['כן, מחפש/ת חלופה מיידית','טרם החלטתי','לא רלוונטי / מונופול'].map(opt => (
                    <div key={opt} style={{
                      padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--gray-200)',
                      marginBottom: 8, cursor: 'pointer', fontSize: 14,
                      transition: 'all 0.15s ease', textAlign: 'right',
                    }}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setStep(2)}>חזור</button>
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
