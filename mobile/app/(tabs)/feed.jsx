import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { C, shadow } from '../../constants/theme';
import { api } from '../../utils/api';
import ShoutCard from '../../components/ShoutCard';

function CategoryPill({ cat, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
        {cat.name}
      </Text>
    </TouchableOpacity>
  );
}

function ComposeBanner() {
  return (
    <TouchableOpacity
      style={styles.compose}
      onPress={() => router.push('/create')}
      activeOpacity={0.9}
    >
      <View style={styles.composeAvatar}>
        <Text style={{ fontSize: 20 }}>👤</Text>
      </View>
      <Text style={styles.composePlaceholder}>על מה נכעס היום, אנונימי?</Text>
      <View style={styles.composeImgBtn}>
        <Text style={{ fontSize: 18 }}>🖼</Text>
      </View>
    </TouchableOpacity>
  );
}

function AlertBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <View style={styles.alert}>
      <Text style={{ fontSize: 22 }}>🚨</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.alertTitle}>מבזק אדום עכשיו!</Text>
        <Text style={styles.alertSub}>
          תלונות נגד שופרסל עלו ב-340% בשעה האחרונה.
        </Text>
      </View>
      <TouchableOpacity onPress={() => setVisible(false)} style={styles.alertClose}>
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.skeleton}>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <View style={[styles.skBox, { width: 42, height: 42, borderRadius: 21 }]} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.skBox, { height: 14, width: '70%', borderRadius: 8 }]} />
          <View style={[styles.skBox, { height: 11, width: '45%', borderRadius: 6 }]} />
        </View>
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.skBox, { height: 13, borderRadius: 6, marginBottom: 8, width: `${85 + i * 5}%` }]} />
      ))}
    </View>
  );
}

export default function FeedScreen() {
  const [shouts, setShouts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShouts = useCallback(async (cat = selectedCat) => {
    try {
      const data = await api.get(`/api/shouts?category=${cat}`);
      setShouts(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [selectedCat]);

  useEffect(() => {
    api.get('/api/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchShouts(selectedCat);
  }, [selectedCat]);

  function onRefresh() {
    setRefreshing(true);
    fetchShouts(selectedCat);
  }

  const ListHeader = (
    <View>
      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity style={[styles.toggleBtn, styles.toggleBtnActive]}>
          <Text style={[styles.toggleLabel, { color: C.dark }]}>כללי</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleBtn}>
          <Text style={styles.toggleLabel}>מותאם לי ⓘ</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catStrip}
      >
        {categories.map((c) => (
          <CategoryPill
            key={c.slug}
            cat={c}
            active={selectedCat === c.slug}
            onPress={() => setSelectedCat(c.slug)}
          />
        ))}
      </ScrollView>

      <AlertBanner />
      <ComposeBanner />

      {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={loading ? [] : shouts}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => <ShoutCard shout={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 50 }}>😮</Text>
              <Text style={styles.emptyTitle}>אין צעקות עדיין</Text>
              <Text style={styles.emptySub}>היה הראשון לצעוק בקטגוריה זו!</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/create')}
              >
                <Text style={styles.emptyBtnText}>📣 צעק עכשיו</Text>
              </TouchableOpacity>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.yellow}
            colors={[C.yellow]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create')}
        activeOpacity={0.9}
      >
        <Text style={{ fontSize: 28 }}>📣</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray100 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: C.gray200,
    margin: 12,
    marginBottom: 0,
    borderRadius: 20,
    padding: 3,
  },
  toggleBtn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 18 },
  toggleBtnActive: { backgroundColor: C.white, ...shadow.sm },
  toggleLabel: { fontSize: 13, fontWeight: '700', color: C.gray500 },

  catStrip: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.gray200,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  pillLabel: { fontSize: 13, fontWeight: '600', color: C.gray600 },
  pillLabelActive: { color: C.black },

  alert: {
    margin: 12,
    marginBottom: 0,
    backgroundColor: C.black,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertTitle: { fontSize: 13, fontWeight: '700', color: C.yellow, marginBottom: 2 },
  alertSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 17 },
  alertClose: { padding: 4 },

  compose: {
    margin: 12,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.gray200,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadow.sm,
  },
  composeAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.gray100,
    justifyContent: 'center', alignItems: 'center',
  },
  composePlaceholder: { flex: 1, fontSize: 14, color: C.gray500, textAlign: 'right' },
  composeImgBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: C.gray100,
    justifyContent: 'center', alignItems: 'center',
  },

  skeleton: {
    backgroundColor: C.white,
    marginHorizontal: 12, marginBottom: 10,
    borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: C.gray200,
  },
  skBox: { backgroundColor: C.gray200 },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.dark, marginTop: 12 },
  emptySub: { fontSize: 13, color: C.gray500, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  emptyBtn: {
    marginTop: 20, backgroundColor: C.yellow,
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: C.black },

  fab: {
    position: 'absolute',
    bottom: 80, right: 20,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: C.yellow,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.md,
    shadowColor: C.yellow,
  },
});
