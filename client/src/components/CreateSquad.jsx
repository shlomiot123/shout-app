import { useState, useEffect } from 'react';
import { API } from '../App.jsx';

const GOAL_TYPES = [
  { key: 'legal', icon: '⚖️', label: 'תביעה ייצוגית' },
  { key: 'regulatory', icon: '🏛️', label: 'פנייה לרגולטור' },
  { key: 'public', icon: '📢', label: 'לחץ ציבורי' },
  { key: 'investor', icon: '📈', label: 'אזהרת משקיעים' },
];

const THRESHOLD_OPTIONS = [100, 250, 500, 1000, 2500, 5000, 10000];

export default function CreateSquad({ initialShout, onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1..4
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState('legal');
  const [goalDesc, setGoalDesc] = useState('');
  const [threshold, setThreshold] = useState(1000);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(
    initialShout?.company_id
      ? { id: initialShout.company_id, name: initialShout.company_name }
      : null
  );
  const [companySearch, setCompanySearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    API.get('/api/companies').then(setCompanies);
  }, []);

  const filteredCompanies = companies.filter(
    c => !companySearch || c.name.includes(companySearch)
  );

  async function handleSubmit() {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const result = await API.post('/api/squads', {
        name,
        description,
        company_id: selectedCompany?.id || null,
        target_members: threshold,
        goal_description: goalDesc || GOAL_TYPES.find(g => g.key === goalType)?.label,
        goal_type: goalType,
      });
      setSuccess(true);
      setTimeout(() => {
        onCreated && onCreated(result);
      }, 1500);
    } catch {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>קבוצת הלחץ נוצרה!</div>
          <div style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 20 }}>
            {name} — גיוס {threshold.toLocaleString('he-IL')} חברים
          </div>
          <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>מעביר אותך לקבוצה...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <span className="modal-title">⚡ יצירת קבוצת לחץ</span>
          <div style={{ width: 30 }} />
        </div>

        <div className="modal-body">
          {/* Step indicator */}
          <div className="modal-step-indicator">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="modal-section-label">פרטי הקבוצה</div>
              <input
                className="company-search"
                placeholder="שם הקבוצה (לדוגמה: נגד עיכובי שירות הוט 2024)"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
                autoFocus
              />
              <input
                className="company-search"
                style={{ marginTop: 10 }}
                placeholder="כינוי היוזם (לדוגמה: אנונימי_84 – לא חובה)"
                value={alias}
                onChange={e => setAlias(e.target.value)}
                maxLength={30}
              />
              <textarea
                className="modal-textarea"
                rows={3}
                style={{ marginTop: 10 }}
                placeholder="תיאור קצר של המאבק — מה קרה ולמה אנשים צריכים להצטרף..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={300}
              />
              <div style={{ fontSize: 11, color: 'var(--gray-500)', textAlign: 'left' }}>
                {description.length}/300
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>ביטול</button>
                <button
                  className="btn-primary"
                  disabled={name.trim().length < 3}
                  onClick={() => setStep(2)}
                >
                  המשך →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="modal-section-label">כנגד איזה חברה?</div>
              <input
                className="company-search"
                placeholder="חפש חברה..."
                value={companySearch}
                onChange={e => setCompanySearch(e.target.value)}
              />
              <div className="company-list">
                <div
                  className={`company-option${!selectedCompany ? ' selected' : ''}`}
                  onClick={() => setSelectedCompany(null)}
                >
                  <span>ללא חברה ספציפית (כללי)</span>
                  {!selectedCompany && <span>✓</span>}
                </div>
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
                <button className="btn-secondary" onClick={() => setStep(1)}>חזור</button>
                <button className="btn-primary" onClick={() => setStep(3)}>המשך →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="modal-section-label">מהו יעד המאבק?</div>
              <div className="cat-grid">
                {GOAL_TYPES.map(g => (
                  <div
                    key={g.key}
                    className={`cat-option${goalType === g.key ? ' selected' : ''}`}
                    onClick={() => setGoalType(g.key)}
                  >
                    <span style={{ fontSize: 20 }}>{g.icon}</span>
                    {g.label}
                  </div>
                ))}
              </div>
              <input
                className="company-search"
                style={{ marginTop: 12 }}
                placeholder="מה הניצחון? (לדוגמה: פיצוי לכל הנפגעים) — אופציונלי"
                value={goalDesc}
                onChange={e => setGoalDesc(e.target.value)}
                maxLength={100}
              />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setStep(2)}>חזור</button>
                <button className="btn-primary" onClick={() => setStep(4)}>המשך →</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="modal-section-label">כמה חברים דרושים להצלחה?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {THRESHOLD_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => setThreshold(t)}
                    style={{
                      padding: '8px 16px', borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: threshold === t ? 'var(--yellow)' : 'var(--gray-200)',
                      background: threshold === t ? 'var(--yellow)' : 'var(--white)',
                      fontFamily: 'Heebo', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {t.toLocaleString('he-IL')}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div style={{
                background: 'var(--yellow-pale)', borderRadius: 12,
                padding: '14px', fontSize: 13, color: 'var(--gray-700)', marginBottom: 16,
                border: '1px solid var(--yellow)',
              }}>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 14 }}>📋 סיכום הקבוצה</div>
                <div style={{ marginBottom: 4 }}>📣 <strong>{name}</strong></div>
                <div style={{ marginBottom: 4 }}>🏢 חברה: {selectedCompany?.name || 'כללי'}</div>
                <div style={{ marginBottom: 4 }}>
                  {GOAL_TYPES.find(g => g.key === goalType)?.icon}{' '}
                  יעד: {GOAL_TYPES.find(g => g.key === goalType)?.label}
                </div>
                <div>👥 סף חברים: {threshold.toLocaleString('he-IL')}</div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setStep(3)}>חזור</button>
                <button
                  className="btn-primary yellow"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? '...' : '⚡ צור קבוצת לחץ'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
