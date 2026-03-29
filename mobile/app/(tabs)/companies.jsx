import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Animated,
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

function StatBubble({ icon, value, label, color }) {
  return (
    <View style={styles.bubble}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.bubbleVal, { color }]}>{value}</Text>
      <Text style={styles.bubbleLabel}>{label}</Text>
    </View>
  );
}

function CompanyCard({ company }) {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    Animated.timing(heightAnim, {
      toValue: next ? 1 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }

  const icon = CAT_ICONS[company.category_name] || '🏢';

  const angerColor =
    company.anger_score >= 80 ? C.red :
    company.anger_score >= 60 ? C.orange :
    company.anger_score >= 40 ? C.yellow : C.green;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={[styles.iconWrap, { backgroundColor: angerColor + '18' }]}>
          <Text style={{ fontSize: 26 }}>{icon}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardName}>{company.name}</Text>
          <Text style={styles.cardCat}>{company.category_name}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.angerNum, { color: angerColor }]}>{company.anger_score}</Text>
          <Text style={styles.angerLabel}>ציון זעם</Text>
        </View>
        <Text style={[styles.chevron, expanded && { transform: [{ rotate: '180deg' }] }]}>
          ▾
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandBody}>
          <View style={styles.statsGrid}>
            <StatBubble
              icon="📣"
              value={company.total_shouts?.toLocaleString('he-IL') || '0'}
              label="צעקות"
              color={C.red}
            />
            <StatBubble
              icon="💬"
              value={`${company.response_rate || 0}%`}
              label="תגובות"
              color={company.response_rate > 40 ? C.green : C.orange}
            />
            <StatBubble
              icon="✅"
              value={company.resolved_shouts?.toLocaleString('he-IL') || '0'}
              label="נפתרו"
              color={C.green}
            />
          </View>

          <View style={styles.angerBarTrack}>
            <View style={[styles.angerBarFill, { width: `${company.anger_score}%`, backgroundColor: angerColor }]} />
          </View>

          <TouchableOpacity style={styles.shoutAtBtn} activeOpacity={0.85}>
            <Text style={styles.shoutAtBtnText}>📣 צעק על {company.name}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  async function fetchCompanies() {
    try {
      const data = await api.get('/api/companies');
      setCompanies(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchCompanies(); }, []);

  const shown = companies.filter((c) =>
    !search || c.name.includes(search) || c.category_name?.includes(search)
  );

  const ListHeader = (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>חברות</Text>
        <Text style={styles.subtitle}>לחץ על חברה לפרטים ונתונים</Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <Text style={styles.searchPlaceholder}>חפש חברה...</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={shown}
      keyExtractor={(c) => String(c.id)}
      renderItem={({ item }) => <CompanyCard company={item} />}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        !loading && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 44 }}>🏢</Text>
            <Text style={styles.emptyTitle}>אין חברות</Text>
          </View>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchCompanies(); }}
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
  header: {
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: '900', color: C.dark, textAlign: 'right' },
  subtitle: { fontSize: 12, color: C.gray500, textAlign: 'right', marginTop: 2 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.white,
    marginHorizontal: 12, marginBottom: 10,
    borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: C.gray200,
  },
  searchPlaceholder: { fontSize: 13, color: C.gray400 },

  card: {
    backgroundColor: C.white,
    marginHorizontal: 12, marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1.5, borderColor: C.gray200,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 10,
  },
  iconWrap: {
    width: 50, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  cardMeta: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: C.dark, textAlign: 'right' },
  cardCat: { fontSize: 11, color: C.gray500, textAlign: 'right', marginTop: 2 },
  cardRight: { alignItems: 'center' },
  angerNum: { fontSize: 22, fontWeight: '900' },
  angerLabel: { fontSize: 10, color: C.gray500 },
  chevron: { fontSize: 16, color: C.gray400, marginLeft: 4 },

  expandBody: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: C.gray100,
  },
  statsGrid: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12,
  },
  bubble: { alignItems: 'center', gap: 3 },
  bubbleVal: { fontSize: 16, fontWeight: '800' },
  bubbleLabel: { fontSize: 10, color: C.gray500 },

  angerBarTrack: {
    height: 6, backgroundColor: C.gray200,
    borderRadius: 20, overflow: 'hidden', marginBottom: 14,
  },
  angerBarFill: { height: '100%', borderRadius: 20 },

  shoutAtBtn: {
    backgroundColor: C.yellow,
    borderRadius: 12, paddingVertical: 11,
    alignItems: 'center',
  },
  shoutAtBtnText: { fontSize: 14, fontWeight: '700', color: C.black },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.dark, marginTop: 12 },
});
