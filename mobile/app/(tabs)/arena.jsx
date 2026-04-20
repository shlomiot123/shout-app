import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
  TextInput, Modal, Pressable,
} from 'react-native';
import { useState, useEffect } from 'react';
import { C, shadow } from '../../constants/theme';
import { api } from '../../utils/api';

const TIPS = [
  { content: 'חברת תעופה חייבת להחזיר כסף על טיסה שבוטלה תוך 21 יום. חברות רבות מקוות שתשכחו.', cta: 'קרא את המדריך' },
  { content: 'לפי חוק הגנת הצרכן — מחיר סחורה בחנות חייב לכלול מע"מ. אל תשלמו יותר!', cta: 'כל הזכויות שלך' },
  { content: 'זכאים לפיצוי על טיסה שאוחרה ב-3 שעות ומעלה ליעד אירופאי.', cta: 'בדוק זכאות EU261' },
];
const CAT_COLORS = ['#EF4444', '#F97316', '#EAB308', '#3B82F6', '#6B7280'];

function buildItems(data) {
  const items = [];
  let n = 1;

  if (data.radar?.length) {
    items.push({
      id: n++, type: 'radar',
      title: '🔴 הראדאר האדום', subtitle: '5 החברות שחטפו הכי הרבה ביממה',
      data: data.radar.map(c => ({
        name: c.name,
        score: c.anger_score,
        delta: c.real_shouts > 0 ? `${c.real_shouts} צעקות` : `ציון ${c.anger_score}`,
      })),
    });
  }

  if (data.categoryPoll?.length) {
    const total = data.categoryPoll.reduce((a, c) => a + c.count, 0) || 1;
    items.push({
      id: n++, type: 'poll',
      title: '📊 סקר קהילה', subtitle: 'איזה תחום הכי מייצר צעקות?',
      options: data.categoryPoll.map(c => c.label),
      votes: data.categoryPoll.map(c => c.count),
      total, closed: false, closes_in: '48 שעות',
    });
  }

  if (data.vs?.length === 2) {
    items.push({
      id: n++, type: 'versus',
      title: '⚔️ ראש בראש',
      a: { name: data.vs[0].name, score: data.vs[0].anger_score },
      b: { name: data.vs[1].name, score: data.vs[1].anger_score },
      question: `למי מדד הזעם גבוה יותר ב${data.vs[0].category_name || 'תחום זה'}?`,
      votes_a: Math.round(data.vs[0].anger_score * 3.1),
      votes_b: Math.round(data.vs[1].anger_score * 3.1),
    });
  }

  if (data.top5?.length) {
    items.push({
      id: n++, type: 'top5',
      title: '🏆 הכי הכי', subtitle: '5 המובילות בציון זעם',
      data: data.top5.map((c, i) => ({ rank: i + 1, name: c.name, value: `ציון ${c.anger_score}` })),
    });
  }

  if (data.queen) {
    items.push({
      id: n++, type: 'queen',
      title: '👑 מלכת הצעקות היומית',
      content: data.queen.content,
      author: data.queen.username,
      company: data.queen.company_name || '',
      echoes: data.queen.echoes || 0,
    });
  }

  (data.wins || []).slice(0, 2).forEach(w => {
    items.push({
      id: n++, type: 'win', title: '🏆 ניצחון!',
      squad: w.name, achievement: w.goal_description || 'הושגה פשרה מול החברה',
    });
  });

  if (data.todayLesson) {
    items.push({
      id: n++, type: 'lesson',
      title: '📰 השיעור היומי',
      headline: data.todayLesson.title,
      content: data.todayLesson.content,
      source: data.todayLesson.source,
    });
  }

  const resolved = (data.hotShouts || []).find(s => s.is_resolved);
  if (resolved) {
    items.push({
      id: n++, type: 'tzaddik', title: '🕊️ צדיק בסדום',
      content: resolved.content.slice(0, 120),
      author: resolved.username, company: resolved.company_name || '',
    });
  }

  const tipIdx = (data.stats?.total_shouts || 0) % TIPS.length;
  items.push({ id: n++, type: 'tip', title: '💡 הידעת?', ...TIPS[tipIdx] });

  if (data.categoryPoll?.length) {
    items.push({
      id: n++, type: 'infographic',
      title: '📈 אינפוגרפיקת השבוע', subtitle: 'התפלגות תלונות לפי ענף',
      data: data.categoryPoll.slice(0, 5).map((c, i) => ({ cat: c.label, pct: c.pct, color: CAT_COLORS[i] })),
    });
  }

  items.push({
    id: n++, type: 'audience_request',
    title: '🎤 בקשת הקהל',
    latestRequest: data.latestRequest || null,
    pendingCount: data.pendingRequestsCount || 0,
  });

  return items;
}

/* ─── Card components ─── */

function CardHeader({ title, sub }) {
  return (
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      {sub && <Text style={styles.cardSub}>{sub}</Text>}
    </View>
  );
}

function RadarCard({ item }) {
  return (
    <View style={styles.card}>
      <CardHeader title={item.title} sub={item.subtitle} />
      {item.data.map((c, i) => (
        <View key={i} style={styles.radarRow}>
          <Text style={styles.radarRank}>#{i + 1}</Text>
          <Text style={styles.radarName}>{c.name}</Text>
          <View style={styles.radarBarTrack}>
            <View style={[styles.radarBarFill, { width: `${c.score}%` }]} />
          </View>
          <Text style={styles.radarDelta}>{c.delta}</Text>
        </View>
      ))}
    </View>
  );
}

function PollCard({ item }) {
  const [picked, setPicked] = useState(null);
  const total = item.total + (picked !== null ? 1 : 0);
  return (
    <View style={styles.card}>
      <CardHeader title={item.title} sub={item.subtitle} />
      {!item.closed && <Text style={styles.timer}>⏱ נסגר בעוד {item.closes_in}</Text>}
      {item.options.map((opt, i) => {
        const v = item.votes[i] + (picked === i ? 1 : 0);
        const pct = Math.round((v / total) * 100);
        const selected = picked === i;
        return (
          <TouchableOpacity key={i} style={[styles.pollOpt, selected && styles.pollOptSelected]}
            onPress={() => picked === null && setPicked(i)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 }}>
              <Text style={[styles.pollOptText, selected && { color: C.black }]}>{opt}</Text>
              {picked !== null && <Text style={styles.pollPct}>{pct}%</Text>}
            </View>
            {picked !== null && (
              <View style={[styles.pollBar, { width: `${pct}%`, backgroundColor: selected ? C.yellow : C.gray200 }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function VersusCard({ item }) {
  const [picked, setPicked] = useState(null);
  const total = item.votes_a + item.votes_b + (picked ? 1 : 0);
  const pctA = Math.round(((item.votes_a + (picked === 'a' ? 1 : 0)) / total) * 100);
  return (
    <View style={styles.card}>
      <CardHeader title={item.title} sub={item.question} />
      <View style={styles.vsRow}>
        <TouchableOpacity style={[styles.vsBtn, picked === 'a' && styles.vsBtnActive]} onPress={() => !picked && setPicked('a')}>
          <Text style={styles.vsName}>{item.a.name}</Text>
          <Text style={styles.vsScore}>{item.a.score}</Text>
          {picked && <Text style={styles.vsPct}>{pctA}%</Text>}
        </TouchableOpacity>
        <Text style={styles.vsVs}>VS</Text>
        <TouchableOpacity style={[styles.vsBtn, picked === 'b' && styles.vsBtnActive]} onPress={() => !picked && setPicked('b')}>
          <Text style={styles.vsName}>{item.b.name}</Text>
          <Text style={styles.vsScore}>{item.b.score}</Text>
          {picked && <Text style={styles.vsPct}>{100 - pctA}%</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Top5Card({ item }) {
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  return (
    <View style={styles.card}>
      <CardHeader title={item.title} sub={item.subtitle} />
      {item.data.map((row, i) => (
        <View key={i} style={styles.top5Row}>
          <Text style={{ fontSize: 20 }}>{medals[i]}</Text>
          <Text style={styles.top5Name}>{row.name}</Text>
          <Text style={styles.top5Val}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function QueenCard({ item }) {
  return (
    <View style={[styles.card, styles.queenCard]}>
      <View style={styles.queenCrown}><Text style={{ fontSize: 28 }}>👑</Text></View>
      <CardHeader title={item.title} sub={`${item.author} על ${item.company}`} />
      <Text style={styles.queenContent}>"{item.content}"</Text>
      <Text style={styles.queenEchoes}>☝️ {item.echoes.toLocaleString('he-IL')} הזדהו</Text>
    </View>
  );
}

function WinCard({ item }) {
  return (
    <View style={[styles.card, styles.winCard]}>
      <Text style={{ fontSize: 32 }}>🏆</Text>
      <Text style={styles.winTitle}>{item.squad}</Text>
      <Text style={styles.winText}>{item.achievement}</Text>
    </View>
  );
}

function TipCard({ item }) {
  return (
    <View style={[styles.card, styles.tipCard]}>
      <CardHeader title={item.title} />
      <Text style={styles.tipContent}>{item.content}</Text>
      <TouchableOpacity style={styles.tipBtn}><Text style={styles.tipBtnText}>{item.cta} ›</Text></TouchableOpacity>
    </View>
  );
}

function TzaddikCard({ item }) {
  return (
    <View style={[styles.card, styles.tzaddikCard]}>
      <Text style={{ fontSize: 28 }}>🕊️</Text>
      <CardHeader title={item.title} sub={`${item.author} על ${item.company}`} />
      <Text style={styles.tipContent}>{item.content}</Text>
    </View>
  );
}

function InfographicCard({ item }) {
  return (
    <View style={styles.card}>
      <CardHeader title={item.title} sub={item.subtitle} />
      {item.data.map((row, i) => (
        <View key={i} style={styles.infoRow}>
          <Text style={styles.infoCat}>{row.cat}</Text>
          <View style={styles.infoTrack}>
            <View style={[styles.infoFill, { width: `${row.pct}%`, backgroundColor: row.color }]} />
          </View>
          <Text style={styles.infoPct}>{row.pct}%</Text>
        </View>
      ))}
    </View>
  );
}

/* A-7 — השיעור היומי */
function LessonCard({ item }) {
  return (
    <View style={[styles.card, styles.lessonCard]}>
      <View style={styles.lessonBadge}><Text style={styles.lessonBadgeText}>חדשות צרכנות</Text></View>
      <CardHeader title={item.title} />
      <Text style={styles.lessonHeadline}>{item.headline}</Text>
      <Text style={styles.lessonContent}>{item.content}</Text>
      {item.source && <Text style={styles.lessonSource}>מקור: {item.source}</Text>}
    </View>
  );
}

/* A-11 — בקשת הקהל */
function AudienceRequestCard({ item }) {
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!question.trim()) return;
    try {
      await api.post('/api/arena/request', { question });
      setSent(true);
      setTimeout(() => { setShowModal(false); setSent(false); setQuestion(''); }, 1500);
    } catch {}
  }

  return (
    <View style={[styles.card, styles.requestCard]}>
      <Modal transparent visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>🎤 הגש בקשת מחקר</Text>
            <Text style={styles.modalSub}>שאל שאלה על שוק הצרכנות — הזירה תנתח ותפרסם תוצאות</Text>
            {sent ? (
              <Text style={styles.modalSent}>✅ בקשתך התקבלה! נחזור עם תוצאות בקרוב.</Text>
            ) : (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="למשל: איזו חברת תקשורת הכי פגעה לאחרונה?"
                  placeholderTextColor={C.gray500}
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  textAlign="right"
                />
                <TouchableOpacity
                  style={[styles.modalBtn, !question.trim() && styles.modalBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!question.trim()}
                >
                  <Text style={styles.modalBtnText}>שגר בקשה ›</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <CardHeader title={item.title} sub="שאל שאלה — הזירה תנתח ותפרסם תוצאות" />
      {item.latestRequest && (
        <View style={styles.requestPrev}>
          <Text style={styles.requestPrevLabel}>📊 במענה לבקשה אחרונה:</Text>
          <Text style={styles.requestPrevText}>"{item.latestRequest.question}"</Text>
        </View>
      )}
      {item.pendingCount > 0 && (
        <Text style={styles.requestPending}>{item.pendingCount} בקשות ממתינות לניתוח</Text>
      )}
      <TouchableOpacity style={styles.requestBtn} onPress={() => setShowModal(true)}>
        <Text style={styles.requestBtnText}>הגש בקשת מחקר ›</Text>
      </TouchableOpacity>
    </View>
  );
}

function renderItem({ item }) {
  switch (item.type) {
    case 'radar':           return <RadarCard item={item} />;
    case 'poll':            return <PollCard item={item} />;
    case 'versus':          return <VersusCard item={item} />;
    case 'top5':            return <Top5Card item={item} />;
    case 'queen':           return <QueenCard item={item} />;
    case 'win':             return <WinCard item={item} />;
    case 'tip':             return <TipCard item={item} />;
    case 'tzaddik':         return <TzaddikCard item={item} />;
    case 'infographic':     return <InfographicCard item={item} />;
    case 'lesson':          return <LessonCard item={item} />;
    case 'audience_request': return <AudienceRequestCard item={item} />;
    default:                return null;
  }
}

export default function ArenaScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await api.get('/api/arena');
      setItems(buildItems(data));
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  function onRefresh() { setRefreshing(true); load(); }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => String(i.id)}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>⚡ הזירה</Text>
          <Text style={styles.heroSub}>מודיעין צרכני חי — סקרים, דירוגים ומגמות</Text>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: C.gray500 }}>טוען את הזירה...</Text>
          </View>
        ) : null
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.yellow} />}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: C.gray100 }}
    />
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.black, padding: 20, marginBottom: 10 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: C.yellow, textAlign: 'right' },
  heroSub: { fontSize: 12, color: '#aaa', textAlign: 'right', marginTop: 4 },

  card: {
    backgroundColor: C.white, marginHorizontal: 12, marginBottom: 10,
    borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: C.gray200, ...shadow.sm,
  },
  cardHeader: { marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: C.dark, textAlign: 'right' },
  cardSub: { fontSize: 12, color: C.gray500, textAlign: 'right', marginTop: 3 },
  timer: { fontSize: 11, color: C.red, textAlign: 'right', marginBottom: 10 },

  radarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  radarRank: { fontSize: 12, fontWeight: '700', color: C.gray500, width: 20 },
  radarName: { fontSize: 12, fontWeight: '600', color: C.dark, width: 80, textAlign: 'right' },
  radarBarTrack: { flex: 1, height: 8, backgroundColor: C.gray200, borderRadius: 20, overflow: 'hidden' },
  radarBarFill: { height: '100%', backgroundColor: C.red, borderRadius: 20 },
  radarDelta: { fontSize: 11, color: C.red, width: 60, textAlign: 'left' },

  pollOpt: {
    borderWidth: 1.5, borderColor: C.gray200, borderRadius: 10,
    padding: 12, marginBottom: 8, overflow: 'hidden', position: 'relative',
  },
  pollOptSelected: { borderColor: C.yellow },
  pollOptText: { fontSize: 14, fontWeight: '600', color: C.dark, textAlign: 'right' },
  pollPct: { fontSize: 13, fontWeight: '700', color: C.dark },
  pollBar: { position: 'absolute', top: 0, right: 0, bottom: 0, opacity: 0.3, borderRadius: 8 },

  vsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vsBtn: { flex: 1, borderWidth: 1.5, borderColor: C.gray200, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 },
  vsBtnActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  vsVs: { fontSize: 18, fontWeight: '900', color: C.gray500 },
  vsName: { fontSize: 13, fontWeight: '700', color: C.dark, textAlign: 'center' },
  vsScore: { fontSize: 28, fontWeight: '900', color: C.red },
  vsPct: { fontSize: 12, color: C.gray600 },

  top5Row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.gray100 },
  top5Name: { flex: 1, fontSize: 14, fontWeight: '600', color: C.dark, textAlign: 'right' },
  top5Val: { fontSize: 12, color: C.gray500 },

  queenCard: { borderColor: '#FCD34D', backgroundColor: '#FFFBEB' },
  queenCrown: { alignItems: 'flex-end', marginBottom: 8 },
  queenContent: { fontSize: 14, lineHeight: 22, color: C.dark, textAlign: 'right', fontStyle: 'italic', marginBottom: 10 },
  queenEchoes: { fontSize: 13, fontWeight: '700', color: C.orange, textAlign: 'right' },

  winCard: { backgroundColor: '#ECFDF5', borderColor: C.green, alignItems: 'center', gap: 8 },
  winTitle: { fontSize: 15, fontWeight: '800', color: C.dark, textAlign: 'center' },
  winText: { fontSize: 13, color: C.gray600, textAlign: 'center', lineHeight: 20 },

  tipCard: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  tipContent: { fontSize: 14, lineHeight: 22, color: C.dark, textAlign: 'right', marginBottom: 12 },
  tipBtn: { alignSelf: 'flex-end' },
  tipBtnText: { fontSize: 13, fontWeight: '700', color: C.blue },

  tzaddikCard: { backgroundColor: '#F0FDF4', borderColor: C.green, alignItems: 'flex-end' },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  infoCat: { fontSize: 12, color: C.dark, width: 55, textAlign: 'right' },
  infoTrack: { flex: 1, height: 10, backgroundColor: C.gray200, borderRadius: 20, overflow: 'hidden' },
  infoFill: { height: '100%', borderRadius: 20 },
  infoPct: { fontSize: 11, color: C.gray500, width: 28 },

  lessonCard: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' },
  lessonBadge: {
    alignSelf: 'flex-end', backgroundColor: '#F97316',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10,
  },
  lessonBadgeText: { fontSize: 10, fontWeight: '700', color: C.white },
  lessonHeadline: { fontSize: 15, fontWeight: '800', color: C.dark, textAlign: 'right', marginBottom: 8 },
  lessonContent: { fontSize: 13, lineHeight: 21, color: C.gray700, textAlign: 'right', marginBottom: 8 },
  lessonSource: { fontSize: 11, color: C.gray500, textAlign: 'right', fontStyle: 'italic' },

  requestCard: { backgroundColor: '#F5F3FF', borderColor: '#C4B5FD' },
  requestPrev: {
    backgroundColor: C.white, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#DDD6FE', marginBottom: 10,
  },
  requestPrevLabel: { fontSize: 11, fontWeight: '700', color: '#7C3AED', marginBottom: 4 },
  requestPrevText: { fontSize: 12, color: C.gray700, textAlign: 'right', fontStyle: 'italic' },
  requestPending: { fontSize: 11, color: C.gray500, textAlign: 'right', marginBottom: 10 },
  requestBtn: { backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  requestBtnText: { fontSize: 14, fontWeight: '700', color: C.white },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: C.dark, textAlign: 'right' },
  modalSub: { fontSize: 13, color: C.gray500, textAlign: 'right', lineHeight: 20 },
  modalInput: {
    borderWidth: 1.5, borderColor: C.gray200, borderRadius: 12, padding: 12,
    fontSize: 14, color: C.dark, minHeight: 80, textAlignVertical: 'top',
  },
  modalBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalBtnDisabled: { opacity: 0.4 },
  modalBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
  modalSent: { fontSize: 15, fontWeight: '700', color: C.green, textAlign: 'center', paddingVertical: 20 },
});
