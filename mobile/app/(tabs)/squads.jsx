import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useState, useEffect } from 'react';
import { C } from '../../constants/theme';
import { api } from '../../utils/api';
import SquadCard from '../../components/SquadCard';

const TABS = [
  { key: 'all',     label: 'כללי' },
  { key: 'success', label: '🏆 נצחונות' },
  { key: 'created', label: 'יצרתי' },
  { key: 'joined',  label: 'הצטרפתי' },
];

export default function SquadsScreen() {
  const [squads, setSquads] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchSquads() {
    try {
      const data = await api.get('/api/squads');
      setSquads(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchSquads(); }, []);

  const shown = squads.filter((s) => {
    if (tab === 'success') return s.is_success;
    if (tab === 'joined')  return s.joined;
    if (tab === 'created') return false; // placeholder until auth
    return !s.is_success;
  });

  const ListHeader = (
    <View>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>קבוצות לחץ</Text>
          <View style={styles.winBadge}>
            <Text style={styles.winBadgeText}>🏆 נצחונות המאבק</Text>
          </View>
        </View>

        {/* Search placeholder */}
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <Text style={styles.searchPlaceholder}>חפש קבוצת לחץ...</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={shown}
      keyExtractor={(s) => String(s.id)}
      renderItem={({ item }) => <SquadCard squad={item} />}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        !loading && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 50 }}>⚡</Text>
            <Text style={styles.emptyTitle}>אין קבוצות כאן</Text>
            <Text style={styles.emptySub}>לחץ על 📣 כדי ליצור קבוצת לחץ חדשה</Text>
          </View>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchSquads(); }}
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
  headerCard: {
    backgroundColor: C.white,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  screenTitle: { fontSize: 20, fontWeight: '900', color: C.dark },
  winBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  winBadgeText: { fontSize: 12, fontWeight: '700', color: C.orange },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.gray100, borderRadius: 10,
    padding: 10, marginBottom: 12,
  },
  searchPlaceholder: { fontSize: 13, color: C.gray500 },

  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray200 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: C.black },
  tabLabel: { fontSize: 13, fontWeight: '600', color: C.gray500 },
  tabLabelActive: { color: C.dark },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.dark, marginTop: 12 },
  emptySub: { fontSize: 13, color: C.gray500, marginTop: 6 },
});
