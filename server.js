const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new DatabaseSync(path.join(__dirname, 'shout.db'));

app.use(cors());
app.use(express.json());

// ── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  PRAGMA journal_mode=WAL;

  CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS companies (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT NOT NULL,
    category_id    INTEGER,
    anger_score    INTEGER DEFAULT 0,
    response_rate  INTEGER DEFAULT 0,
    total_shouts   INTEGER DEFAULT 0,
    resolved_shouts INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS shouts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL DEFAULT 'אנונימי_84',
    company_id  INTEGER,
    category_id INTEGER,
    content     TEXT NOT NULL,
    anger_level INTEGER DEFAULT 3,
    echoes      INTEGER DEFAULT 0,
    boosts      INTEGER DEFAULT 0,
    is_resolved INTEGER DEFAULT 0,
    has_proof   INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS shout_responses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    shout_id    INTEGER NOT NULL,
    author      TEXT NOT NULL,
    content     TEXT NOT NULL,
    is_official INTEGER DEFAULT 0,
    company_id  INTEGER,
    is_resolved INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (shout_id) REFERENCES shouts(id)
  );

  CREATE TABLE IF NOT EXISTS squads (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT NOT NULL,
    description      TEXT,
    company_id       INTEGER,
    category_id      INTEGER,
    target_members   INTEGER DEFAULT 1000,
    current_members  INTEGER DEFAULT 0,
    goal_description TEXT,
    goal_type        TEXT DEFAULT 'legal',
    is_success       INTEGER DEFAULT 0,
    created_at       TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT NOT NULL,
    message    TEXT NOT NULL,
    icon       TEXT DEFAULT '🔔',
    is_read    INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_echoes (
    shout_id   INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    PRIMARY KEY (shout_id, session_id)
  );

  CREATE TABLE IF NOT EXISTS user_boosts (
    shout_id   INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    PRIMARY KEY (shout_id, session_id)
  );

  CREATE TABLE IF NOT EXISTS squad_joins (
    squad_id   INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    PRIMARY KEY (squad_id, session_id)
  );
`);

// ── Seed ────────────────────────────────────────────────────────────────────
const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
if (catCount === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, icon, slug) VALUES (?,?,?)');
  const cats = [
    ['כל המאבקים', '🔥', 'all'],
    ['בנקים', '🏦', 'banks'],
    ['ביטוח ופנסיה', '🛡️', 'insurance'],
    ['קופות חולים', '❤️', 'health'],
    ['תקשורת', '📱', 'telecom'],
    ['רשתות מזון', '🛒', 'food'],
    ['תחבורה ציבורית', '🚌', 'transport'],
    ['תעופה ותיירות', '✈️', 'aviation'],
  ];
  cats.forEach(c => insertCat.run(...c));

  const insertCo = db.prepare('INSERT INTO companies (name, category_id, anger_score, response_rate, total_shouts, resolved_shouts) VALUES (?,?,?,?,?,?)');
  const companies = [
    ['הראל ביטוח',        3, 82, 34, 4231, 1440],
    ['הוט',               5, 95, 12, 8920, 1070],
    ['בנק לאומי',         2, 61, 55, 2100, 1155],
    ['בנק הפועלים',       2, 58, 61, 1980, 1208],
    ['שופרסל',            6, 44, 72, 1200, 864],
    ['פרטנר',             5, 88, 18, 7340, 1321],
    ['סלקום',             5, 91, 15, 8100, 1215],
    ['מכבי שירותי בריאות',4, 69, 42, 3100, 1302],
    ['אל על',             8, 78, 22, 5600, 1232],
    ['רכבת ישראל',        7, 100,  5, 12400, 620],
    ['בנק דיסקונט',       2, 54, 65, 1700, 1105],
    ['כלל ביטוח',         3, 74, 29, 3400, 986],
  ];
  companies.forEach(c => insertCo.run(...c));

  const insertShout = db.prepare(`
    INSERT INTO shouts (username, company_id, category_id, content, anger_level, echoes, boosts, is_resolved, has_proof, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,datetime('now', ? || ' hours'))
  `);

  const shouts = [
    ['אנונימי_34', 10, 7, 'כבר חצי שנה שאני מחכה לפיצוי על עיכוב של 4 שעות. כל שבוע מעבירים אותי ממחלקה למחלקה. שמתי 40 דקות על הקו עכשיו והשיחה נותקה.', 5, 5400, 312, 0, 0, '-2'],
    ['דנה מ.', 1, 3, 'סירבו לשלם תביעת ביטוח בריאות למרות שיש לי את כל המסמכים. גורמים אותי חודשים בלך ושוב במוקד. פשוט שיטת מצליח!', 5, 842, 45, 1, 1, '-5'],
    ['שי ר.', 2, 5, 'חסמו לי את האשראי בחו"ל בלי שום סיבה. המוקד עונה אחרי 50 דקות ממוצע — ואז המחבר!', 4, 65, 12, 0, 0, '-1'],
    ['נעמה ט.', 8, 4, 'אי אפשר לקבוע תור לרופא עור באפליקציה כבר שבועיים. אומרים שיש תקלה אבל שום דבר לא זז.', 4, 120, 8, 0, 0, '-3'],
    ['אייל ז.', 2, 5, 'ביטול טיסה לאתונה ברגע האחרון. שעות של המתנה ללא נציג אנושי. חברה שמרשה לעצמה לזלזל בנוסעים.', 5, 890, 67, 0, 0, '-10'],
    ['מיכל כ.', 6, 5, 'העלו את הפרמיה שלי ב-25% בלי הודעה מוקדמת. כשביקשתי הסבר — טענו שנשלחה הודעה שלא קיבלתי.', 3, 210, 19, 0, 0, '-8'],
    ['יוסי ב.', 7, 5, 'האפליקציה של הסלקום מחייבת אותי פעמיים כל חודש. כבר 4 חודשים שאני מנסה לתקן.', 4, 445, 38, 0, 0, '-15'],
    ['רחל ד.', 3, 2, 'הבנק עצר חשבון העסקי שלי ללא התראה. אין הסבר, אין מענה. עסק שלם עצר בגלל בירוקרטיה עיוורת.', 5, 1200, 98, 0, 0, '-20'],
    ['אמיר ל.', 10, 7, 'הרכבת ביטלה 3 נסיעות ברצף בבוקר. אלפי נוסעים על הרציף. ניסיון ליצור קשר — לחוצים לכל כיוון, אין מענה.', 5, 3200, 220, 0, 0, '-4'],
    ['תמר פ.', 9, 8, 'מזוודה אבדה, פיצוי לא הגיע אחרי 3 חודשים. כל פניה מקבלת תשובה שלא קשורה לשום דבר.', 4, 780, 55, 0, 0, '-7'],
    ['נדב כ.', 4, 3, 'הראל דחתה תביעת ניתוח דחוף — טוענים שזה "אלקטיבי". רופאים שאלו אם אני צוחק.', 5, 660, 72, 0, 1, '-12'],
    ['שירה מ.', 5, 5, 'שופרסל מחייבת אותי על מוצרים שלא הגיעו במשלוח. שלושה שבועות ואין זיכוי.', 3, 340, 28, 0, 0, '-9'],
    ['גל א.', 7, 5, 'פרטנר מדורגת 1 בכמות תקריות ביטול שירות. ב-3 השבועות האחרונים — אינטרנט נפל 7 פעמים.', 4, 890, 61, 0, 0, '-6'],
    ['לירון ש.', 2, 2, 'בנק לאומי גובה עמלות על חשבון "ללא עמלות". כשהתלוננתי — אמרו שזה בתקנון. איפה הגבול?', 3, 520, 44, 0, 0, '-14'],
    ['עידן מ.', 8, 4, 'מכבי מסרבת לאשר בדיקה גנטית שכל רופא מבקש. כבר 6 חודשים. אין ערעור, אין שקיפות.', 5, 410, 33, 0, 1, '-18'],
  ];

  shouts.forEach(s => insertShout.run(...s));

  // Official responses
  const insertResp = db.prepare(`
    INSERT INTO shout_responses (shout_id, author, content, is_official, company_id, is_resolved, created_at)
    VALUES (?,?,?,?,?,?,datetime('now', ? || ' hours'))
  `);

  insertResp.run(2, 'תגובה רשמית מהראל ביטוח', 'דנה שלום. לאחר בדיקת המקרה שלך מול מחלקת התביעות, התגלה כשל טכני בניתוב המסמכים. הסרנו את החסימה, הכסף יועבר לחשבונך תוך 3 ימי עסקים. אנו מתנצלים על עוגמת הנפש.', 1, 1, 1, '-3');
  insertResp.run(8, 'תגובה רשמית מבנק לאומי', 'שלום רחל. בחנו את המקרה. כתוצאה מדרישת רגולציה, החשבון הוקפא זמנית. הכינו עבורך חבילת חידוש — פנה לסניף הקרוב ביום-ב׳ בין 10–14.', 1, 3, 0, '-18');

  // Squads
  const insertSquad = db.prepare(`
    INSERT INTO squads (name, description, company_id, category_id, target_members, current_members, goal_description, goal_type, is_success, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,datetime('now', ? || ' hours'))
  `);

  insertSquad.run('הראל ביטוח – מסורבי סיעוד', 'ביטוח ופנסיה • נגד הראל ביטוח', 1, 3, 2000, 1240, 'יעד משפטי: הכנה לתביעה ייצוגית', 'legal', 0, '-5');
  insertSquad.run('אגד – עוצרים את דילוגי קו 480', 'תחבורה ציבורית • נגד אגד', null, 7, 500, 450, 'יעד משפטי: פנייה קולקטיבית למשרד התחבורה', 'public', 0, '-3');
  insertSquad.run('נפגעי קו 480 – רכבת ישראל', 'תחבורה ציבורית • נגד רכבת ישראל', 10, 7, 5000, 4800, 'יעד: אזהרת משקיעים ממוקדת', 'investor', 0, '-1');
  insertSquad.run('סלקום – מאבק שקיפות בהצגת חבילות', 'תקשורת • נגד סלקום', 7, 5, 800, 312, 'יעד: פנייה לרשות ניירות ערך', 'regulatory', 0, '-8');
  insertSquad.run('נפגעי ביטול טיסות אל-על 2024', 'תעופה • נגד אל על', 9, 8, 3000, 2890, 'הכנת תביעה ייצוגית – הושגה הצלחה!', 'legal', 1, '-30');

  // Notifications
  const insertNotif = db.prepare(`INSERT INTO notifications (type, message, icon, is_read, created_at) VALUES (?,?,?,?,datetime('now', ? || ' minutes'))`);
  insertNotif.run('boost', 'הצעקה שלך נגד הוט עושה גלים! מעל 50 אנשים שיגרו בוסט.', '📢', 0, '-10');
  insertNotif.run('echo', 'דניאל ועוד 4 אנשים הזדהו עם הצעקה שלך על רכבת ישראל.', '🤝', 0, '-60');
  insertNotif.run('squad', 'חדשות טובות: קבוצת הלחץ "נפגעי קו 480" הגיעה ליעד! התיק עובר לייעוץ משפטי.', '⚖️', 0, '-1440');
  insertNotif.run('response', 'הראל ביטוח הגיבה לצעקה שלך – לחץ לצפייה.', '💬', 1, '-2880');
  insertNotif.run('alert', 'אירוע רב-נפגעים מתרחש ברכבת ישראל עכשיו. גם אתה נפגעת?', '🚨', 1, '-5760');
}

// ── Migrations (fix existing data) ───────────────────────────────────────────
db.prepare("UPDATE categories SET name='תעופה ותיירות' WHERE slug='aviation' AND name='תעופה וטיירות'").run();

// ── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr + 'Z').getTime()) / 1000;
  if (diff < 60) return 'עכשיו';
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דק'`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעה`;
  if (diff < 604800) return `לפני ${Math.floor(diff / 86400)} ימים`;
  return `לפני ${Math.floor(diff / 604800)} שבועות`;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// Categories
app.get('/api/categories', (req, res) => {
  const cats = db.prepare('SELECT * FROM categories').all();
  res.json(cats);
});

// Shouts
app.get('/api/shouts', (req, res) => {
  const { category, company_id, page = 1 } = req.query;
  const limit = 20;
  const offset = (page - 1) * limit;
  const session = req.headers['x-session'] || 'default';

  let query = `
    SELECT s.*, c.name as company_name, cat.name as category_name, cat.icon as category_icon
    FROM shouts s
    LEFT JOIN companies c ON s.company_id = c.id
    LEFT JOIN categories cat ON s.category_id = cat.id
  `;

  const conditions = [];
  if (category && category !== 'all') {
    conditions.push(`cat.slug = '${category.replace(/'/g, '')}'`);
  }
  if (company_id) {
    conditions.push(`s.company_id = ${parseInt(company_id, 10)}`);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const rows = db.prepare(query).all();

  const result = rows.map(r => {
    const echoed = db.prepare('SELECT 1 FROM user_echoes WHERE shout_id=? AND session_id=?').get(r.id, session);
    const boosted = db.prepare('SELECT 1 FROM user_boosts WHERE shout_id=? AND session_id=?').get(r.id, session);
    const responses = db.prepare('SELECT * FROM shout_responses WHERE shout_id=? ORDER BY created_at DESC').all(r.id);
    return {
      ...r,
      time_ago: timeAgo(r.created_at),
      echoed: !!echoed,
      boosted: !!boosted,
      responses: responses.map(rr => ({ ...rr, time_ago: timeAgo(rr.created_at) })),
    };
  });

  res.json(result);
});

app.post('/api/shouts', (req, res) => {
  const { username, company_id, category_id, content, anger_level, has_proof } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });

  const result = db.prepare(`
    INSERT INTO shouts (username, company_id, category_id, content, anger_level, has_proof)
    VALUES (?,?,?,?,?,?)
  `).run(username || 'אנונימי_84', company_id || null, category_id || null, content, anger_level || 3, has_proof ? 1 : 0);

  // Update company total_shouts
  if (company_id) {
    db.prepare('UPDATE companies SET total_shouts = total_shouts + 1, anger_score = MIN(100, anger_score + 1) WHERE id = ?').run(company_id);
  }

  // Add notification
  db.prepare(`INSERT INTO notifications (type, message, icon) VALUES ('post', 'הצעקה שלך פורסמה! שתף אותה כדי לגייס תומכים.', '📣')`).run();

  const shout = db.prepare('SELECT * FROM shouts WHERE id = ?').get(result.lastInsertRowid);
  res.json({ ...shout, time_ago: timeAgo(shout.created_at), echoed: false, boosted: false, responses: [] });
});

// Echo toggle
app.post('/api/shouts/:id/echo', (req, res) => {
  const { id } = req.params;
  const session = req.headers['x-session'] || 'default';
  const existing = db.prepare('SELECT 1 FROM user_echoes WHERE shout_id=? AND session_id=?').get(id, session);

  if (existing) {
    db.prepare('DELETE FROM user_echoes WHERE shout_id=? AND session_id=?').run(id, session);
    db.prepare('UPDATE shouts SET echoes = MAX(0, echoes - 1) WHERE id=?').run(id);
    return res.json({ echoed: false });
  } else {
    db.prepare('INSERT INTO user_echoes (shout_id, session_id) VALUES (?,?)').run(id, session);
    db.prepare('UPDATE shouts SET echoes = echoes + 1 WHERE id=?').run(id);
    return res.json({ echoed: true });
  }
});

// Boost toggle
app.post('/api/shouts/:id/boost', (req, res) => {
  const { id } = req.params;
  const session = req.headers['x-session'] || 'default';
  const existing = db.prepare('SELECT 1 FROM user_boosts WHERE shout_id=? AND session_id=?').get(id, session);

  if (existing) {
    db.prepare('DELETE FROM user_boosts WHERE shout_id=? AND session_id=?').run(id, session);
    db.prepare('UPDATE shouts SET boosts = MAX(0, boosts - 1) WHERE id=?').run(id);
    return res.json({ boosted: false });
  } else {
    db.prepare('INSERT INTO user_boosts (shout_id, session_id) VALUES (?,?)').run(id, session);
    db.prepare('UPDATE shouts SET boosts = boosts + 1 WHERE id=?').run(id);
    return res.json({ boosted: true });
  }
});

// Respond to shout
app.post('/api/shouts/:id/respond', (req, res) => {
  const { id } = req.params;
  const { content, author } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  db.prepare('INSERT INTO shout_responses (shout_id, author, content) VALUES (?,?,?)').run(id, author || 'אנונימי', content);
  res.json({ ok: true });
});

// Squads
app.get('/api/squads', (req, res) => {
  const session = req.headers['x-session'] || 'default';
  const rows = db.prepare(`
    SELECT s.*, c.name as company_name, cat.name as category_name
    FROM squads s
    LEFT JOIN companies c ON s.company_id = c.id
    LEFT JOIN categories cat ON s.category_id = cat.id
    ORDER BY s.current_members DESC
  `).all();

  const result = rows.map(r => {
    const joined = db.prepare('SELECT 1 FROM squad_joins WHERE squad_id=? AND session_id=?').get(r.id, session);
    return { ...r, joined: !!joined, progress: Math.round((r.current_members / r.target_members) * 100) };
  });

  res.json(result);
});

app.post('/api/squads', (req, res) => {
  const { name, description, company_id, category_id, target_members, goal_description, goal_type } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const result = db.prepare(`
    INSERT INTO squads (name, description, company_id, category_id, target_members, current_members, goal_description, goal_type)
    VALUES (?,?,?,?,?,1,?,?)
  `).run(name, description || '', company_id || null, category_id || null, target_members || 1000, goal_description || '', goal_type || 'legal');

  res.json(db.prepare('SELECT * FROM squads WHERE id=?').get(result.lastInsertRowid));
});

app.post('/api/squads/:id/join', (req, res) => {
  const { id } = req.params;
  const session = req.headers['x-session'] || 'default';
  const existing = db.prepare('SELECT 1 FROM squad_joins WHERE squad_id=? AND session_id=?').get(id, session);

  if (existing) {
    db.prepare('DELETE FROM squad_joins WHERE squad_id=? AND session_id=?').run(id, session);
    db.prepare('UPDATE squads SET current_members = MAX(0, current_members - 1) WHERE id=?').run(id);
    return res.json({ joined: false });
  } else {
    db.prepare('INSERT INTO squad_joins (squad_id, session_id) VALUES (?,?)').run(id, session);
    db.prepare('UPDATE squads SET current_members = current_members + 1 WHERE id=?').run(id);
    return res.json({ joined: true });
  }
});

// Companies / Leaderboard
app.get('/api/companies', (req, res) => {
  const { category } = req.query;
  let query = `
    SELECT co.*, cat.name as category_name, cat.icon as category_icon
    FROM companies co
    LEFT JOIN categories cat ON co.category_id = cat.id
  `;
  if (category && category !== 'all') {
    query += ` WHERE cat.slug = '${category.replace(/'/g, '')}'`;
  }
  query += ' ORDER BY co.name ASC';
  res.json(db.prepare(query).all());
});

app.get('/api/leaderboard', (req, res) => {
  const rows = db.prepare(`
    SELECT co.*, cat.name as category_name
    FROM companies co
    LEFT JOIN categories cat ON co.category_id = cat.id
    ORDER BY co.anger_score DESC
    LIMIT 20
  `).all();
  res.json(rows);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 30').all();
  const unread = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE is_read=0').get().c;
  res.json({ notifications: rows.map(r => ({ ...r, time_ago: timeAgo(r.created_at) })), unread });
});

app.post('/api/notifications/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET is_read=1').run();
  res.json({ ok: true });
});

// ── Static (production) ──────────────────────────────────────────────────────
const clientDist = path.join(__dirname, 'client', 'dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Shout server running on http://localhost:${PORT}`));
