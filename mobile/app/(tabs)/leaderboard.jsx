import {
  View, Text, FlatList, StyleSheet,
  RefreshControl, Animated,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { C, shadow } from '../../constants/theme';
import { api } from '../../utils/api';

const CAT_ICONS = {
  'בנקים': '🏦',
  'ביטוח ופנסיה': '🛡️',
  'קופות חולים': '❤️',
  'תקשורת': '📱',
  'רשתות מזון': '🛒',
  'תחבורה ציבורית': '🚌',
  'תעופה וטיירות': '✈️',
};

function getAngerColor(score) {
  if (score >= 80) return C.red;
  if (score >= 60) return C.orange;
  if (score >= 40) return C.yellow;
  return C.green;
}

function AngerBar({ score, color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { width, backgroundColor: color }]} />
    </View>
  );
}

function LBCard({ company, rank }) {
  const color = getAngerColor(company.anger_score);
  const icon = CAT_ICONS[company.category_name] || '🏢';

  let borderColor = C.gray200;
  if (rank === 1) borderColor = C.red;
  else if (rank === 2) borderColor = C.orange;
  else if (rank === 3) borderColor = C.yellow;

  const rankEmoji = rank <= 3
    ? ['🔴', '🟠', '🟡'][rank - 1]
    : rank;

  return (
    <View style={[styles.card, { borderColor, borderWidth: rank <= 3 ? 2 : 1.5 }]}>
      <View style={styles.cardRow}>
        <Text style={styles.rank}>{rankEmoji}</Text>
        <View style={[styles.coIcon, { backgroundColor: color + '20' }]}>
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>
        <View style={styles.coInfo}>
          <Text style={styles.coName}>{company.name}</Text>
          <Text style={styles.coCat}>{company.category_name}</Text>
        </View>
        <Text style={[styles.angerScore, { color }]}>{company.anger_score}</Text>
      </View>

      <AngerBar score={company.anger_score} color={color} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{company.total_shouts.toLocaleString('he-IL')}</Text>
          <Text style={styles.statLabel}>צעקות</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statVal, { color: company.response_rate > 40 ? C.green : C.red }]}>
            {company.response_rate}%
          </Text>
          <Text style={styles.statLabel}>תגובות</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statVal, { color: C.green }]}>
            {company.resolved_shouts.toLocaleString('he-IL')}
          </Text>
          <Text style={styles.statLabel}>נפתרו</Text>
        </View>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData() {
    try {
      const data = await api.get('/api/leaderboard');
      setCompanies(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchData(); }, []);

  const Hero = (
    <View style={styles.hero}>
      <Text style={styles.heroSub}>📊 נתונים שמאחורי הזעם הציבורי</Text>
      <Text style={styles.heroTitle}>מצעד הבושה</Text>
      <Text style={styles.heroDesc}>שקיפות מלאה. הנתונים שמאחורי הזעם.</Text>

      <View style={styles.heroStats}>
        {[
          { icon: '🔥', val: '142', label: 'מאבקים פעילים' },
          { icon: '💬', val: '38%', label: 'שיעור תגובה' },
          { icon: '✅', val: '4',   label: 'הושגו השבוע' },
        ].map((s, i) => (
          <View key={i} style={styles.heroStat}>
            <Text style={{ fontSize: 22 }}>{s.icon}</Text>
            <Text style={styles.heroStatVal}>{s.val}</Text>
            <Text style={styles.heroStatLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.topComplaint}>
        <Text style={styles.topComplaintText}>
          <Text style={{ color: C.orange, fontWeight: '700' }}>45%</Text> שירות לקוחות
          {'  ·  '}
          <Text style={{ color: C.orange, fontWeight: '700' }}>30%</Text> בירוקרטיה
          {'  ·  '}
          <Text style={{ color: C.orange, fontWeight: '700' }}>25%</Text> כספים
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={companies}
      keyExtractor={(c) => String(c.id)}
      renderItem={({ item, index }) => <LBCard company={item} rank={index + 1} />}
      ListHeaderComponent={Hero}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor={C.yellow}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      style={{ backgroundColor: C.gray100 }}
    />
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: C.black,
    padding: 20,
    marginBottom: 12,
  },
  heroSub: { fontSize: 12, color: C.yellow, fontWeight: '700', marginBottom: 6 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: C.white, marginBottom: 4 },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 },

  heroStats: { flexDirection: 'row', gap: 10 },
  heroStat: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, padding: 12, alignItems: 'center', gap: 4,
  },
  heroStatVal: { fontSize: 20, fontWeight: '900', color: C.yellow },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  topComplaint: { marginTop: 14 },
  topComplaintText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

  card: {
    backgroundColor: C.white,
    marginHorizontal: 12, marginBottom: 8,
    borderRadius: 14, padding: 14,
    ...shadow.sm,
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 12,
  },
  rank: { fontSize: 20, width: 32, textAlign: 'center' },
  coIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  coInfo: { flex: 1 },
  coName: { fontSize: 15, fontWeight: '700', color: C.dark, textAlign: 'right' },
  coCat: { fontSize: 11, color: C.gray500, textAlign: 'right', marginTop: 2 },
  angerScore: { fontSize: 26, fontWeight: '900' },

  barTrack: {
    height: 8, backgroundColor: C.gray200,
    borderRadius: 20, overflow: 'hidden', marginBottom: 10,
  },
  barFill: { height: '100%', borderRadius: 20 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2 },
  statVal: { fontSize: 14, fontWeight: '800', color: C.dark },
  statLabel: { fontSize: 10, color: C.gray500 },
});
