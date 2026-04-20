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
    <TouchableOpacity style={[styles.pill, active && styles.pillActive]} onPress={onPress} activeOpacity={0.8}>
      <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{cat.name}</Text>
    </TouchableOpacity>
  );
}

function ComposeBanner() {
  return (
    <TouchableOpacity style={styles.compose} onPress={() => router.push('/create')} activeOpacity={0.9}>
      <View style={styles.composeAvatar}><Text style={{ fontSize: 20 }}>👤</Text></View>
      <Text style={styles.composePlaceholder}>על מה נכעס היום, אנונימי?</Text>
      <View style={styles.composeImgBtn}><Text style={{ fontSize: 18 }}>🖼</Text></View>
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
        <Text style={styles.alertSub}>תלונות נגד שופרסל עלו ב-340% בשעה האחרונה.</Text>
      </View>
      <TouchableOpacity onPress={() => setVisible(false)} style={styles.alertClose}>
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function LiveWebinarBanner({ webinar }) {
  const [rsvped, setRsvped] = useState(webinar.rsvped);
  const [count, setCount] = useState(webinar.rsvp_count);

  async function handleRsvp() {
    try {
      const res = await api.post(`/api/webinars/${webinar.id}/rsvp`, {});
      setRsvped(res.rsvped);
      setCount(res.rsvp_count);
    } catch {}
  }

  const isLive = webinar.status === 'live';
  const scheduledDate = new Date(webinar.scheduled_at + 'Z');
  const hoursUntil = Math.max(0, Math.round((scheduledDate - Date.now()) / 3600000));

  return (
    <View style={[styles.webinarBanner, isLive && styles.webinarBannerLive]}>
      <View style={styles.webinarLeft}>
        <View style={styles.webinarBadge}>
          <Text style={styles.webinarBadgeText}>{isLive ? '🔴 LIVE' : '📅 בקרוב'}</Text>
        </View>
        <Text style={styles.webinarTitle} numberOfLines={1}>{webinar.title}</Text>
        <Text style={styles.webinarMeta}>
          {isLive ? 'מתקיים עכשיו' : `בעוד ${hoursUntil} שעות`}
          {count > 0 ? ` · ${count} נרשמו` : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.webinarBtn, rsvped && styles.webinarBtnActive]}
        onPress={handleRsvp}
        activeOpacity={0.8}
      >
        <Text style={styles.webinarBtnText}>{isLive ? 'הצטרף' : rsvped ? '✓ נרשמתי' : 'אגיע'}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* F-2: קבוצות לחץ חדשות */
function COMPANY_COLOR(id) {
  const palette = ['#EF4444','#F97316','#3B82F6','#8B5CF6','#10B981','#EC4899','#F59E0B'];
  return palette[(id || 0) % palette.length];
}

function NewSquadsBanner({ squads }) {
  return (
    <View style={styles.injectedSection}>
      <View style={styles.injectedHeader}>
        <Text style={styles.injectedTitle}>קבוצות לחץ חדשות</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/squads')}>
          <Text style={styles.injectedMore}>הכל ›</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 12 }}>
        {squads.map((sq) => {
          const color = COMPANY_COLOR(sq.company_id);
          const pct = Math.min(100, Math.round(((sq.current_members || 0) / (sq.target_members || 1000)) * 100));
          return (
            <View key={sq.id} style={[styles.squadCard, { backgroundColor: color }]}>
              {/* Top row: member count left, company pill right */}
              <View style={styles.squadCardTop}>
                <View style={styles.squadMemberPill}>
                  <Text style={styles.squadMemberText}>
                    {(sq.current_members || 0).toLocaleString('he-IL')} תומכים
                  </Text>
                </View>
                {sq.company_name ? (
                  <View style={styles.squadCoPill}>
                    <Text style={styles.squadCoPillText} numberOfLines={1}>{sq.company_name}</Text>
                  </View>
                ) : null}
              </View>
              {/* Title */}
              <Text style={styles.squadCardName} numberOfLines={3}>{sq.name}</Text>
              {/* Progress bar */}
              <View style={styles.squadCardBar}>
                <View style={[styles.squadCardFill, { width: `${pct}%` }]} />
              </View>
              {/* Buttons */}
              <View style={styles.squadCardBtns}>
                <TouchableOpacity
                  style={styles.squadFastJoinBtn}
                  onPress={() => router.push(`/squad-lobby?id=${sq.id}`)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.squadFastJoinText}>הצטרפות מהירה</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.squadLobbyBtn}
                  onPress={() => router.push(`/squad-lobby?id=${sq.id}`)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.squadLobbyText}>כניסה ללובי</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* F-3: זיהוי טרנד AI — white cards with company color per spec */
function TrendBanner({ topCategory, topCompany, topCompanyId }) {
  const color = COMPANY_COLOR(topCompanyId || 0);
  return (
    <View style={styles.trendSection}>
      <View style={styles.injectedHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.injectedTitle}>זיהוי טרנד ליצירת קבוצות לחץ</Text>
          <Text style={{ fontSize: 14 }}>🤖</Text>
        </View>
        <Text style={styles.trendAiLabel}>AI</Text>
      </View>
      <View style={styles.trendCard}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.trendCardCompany, { color }]} numberOfLines={1}>
            {topCompany || topCategory}
          </Text>
          <Text style={styles.trendCardSub}>זוהו צעקות רבות — כדאי להתאגד!</Text>
        </View>
        <TouchableOpacity
          style={[styles.trendCreateBtn, { backgroundColor: color }]}
          onPress={() => router.push('/create')}
          activeOpacity={0.85}
        >
          <Text style={styles.trendCreateBtnText}>יצירת קבוצה</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* F-4: המלצות הצטרפות */
function RecommendSquadsBanner({ squads }) {
  return (
    <View style={styles.injectedSection}>
      <View style={styles.injectedHeader}>
        <Text style={styles.injectedTitle}>💡 אולי יעניין אותך</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/squads')}>
          <Text style={styles.injectedMore}>הכל ›</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
        {squads.map((sq) => (
          <TouchableOpacity
            key={sq.id}
            style={styles.recCard}
            onPress={() => router.push(`/squad-lobby?id=${sq.id}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.recCardName} numberOfLines={2}>{sq.name}</Text>
            <Text style={styles.recCardCo} numberOfLines={1}>{sq.company_name || ''}</Text>
            <View style={styles.recJoinBtn}>
              <Text style={styles.recJoinText}>הצטרף →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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

/* builds the mixed feed items array */
function buildFeedItems(shouts, squads, arenaData) {
  const items = [];
  shouts.forEach((shout, index) => {
    items.push({ _type: 'shout', _key: `shout_${shout.id}`, ...shout });
    if (index === 0 && squads.length > 0) {
      items.push({ _type: 'new_squads', _key: 'new_squads', squads: squads.slice(0, 5) });
    }
    if (index === 1 && arenaData) {
      items.push({ _type: 'trend', _key: 'trend', ...arenaData, topCompanyId: arenaData.topCompanyId });
    }
    if (index === 3 && squads.length > 0) {
      items.push({ _type: 'recommend_squads', _key: 'recommend_squads', squads: squads.slice(0, 4) });
    }
  });
  return items;
}

export default function FeedScreen() {
  const [shouts, setShouts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [squads, setSquads] = useState([]);
  const [webinar, setWebinar] = useState(null);
  const [trendData, setTrendData] = useState(null);
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
    api.get('/api/squads').then(d => setSquads(d || [])).catch(() => {});
    api.get('/api/webinars').then(d => setWebinar((d || [])[0] || null)).catch(() => {});
    api.get('/api/arena').then(d => {
      if (d?.radar?.[0]) {
        setTrendData({
          topCompany: d.radar[0].name,
          topCompanyId: d.radar[0].id,
          topCategory: d.categoryPoll?.[0]?.label || '',
        });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchShouts(selectedCat);
  }, [selectedCat]);

  function onRefresh() {
    setRefreshing(true);
    fetchShouts(selectedCat);
    api.get('/api/webinars').then(d => setWebinar((d || [])[0] || null)).catch(() => {});
  }

  const feedItems = buildFeedItems(loading ? [] : shouts, squads, trendData);

  const ListHeader = (
    <View>
      <View style={styles.toggle}>
        <TouchableOpacity style={[styles.toggleBtn, styles.toggleBtnActive]}>
          <Text style={[styles.toggleLabel, { color: C.dark }]}>כללי</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleBtn}>
          <Text style={styles.toggleLabel}>מותאם לי ⓘ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catStrip}>
        {categories.map((c) => (
          <CategoryPill key={c.slug} cat={c} active={selectedCat === c.slug} onPress={() => setSelectedCat(c.slug)} />
        ))}
      </ScrollView>

      {webinar && <LiveWebinarBanner webinar={webinar} />}
      <AlertBanner />
      <ComposeBanner />
      {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}
    </View>
  );

  function renderItem({ item }) {
    if (item._type === 'shout') return <ShoutCard shout={item} />;
    if (item._type === 'new_squads') return <NewSquadsBanner squads={item.squads} />;
    if (item._type === 'trend') return <TrendBanner topCompany={item.topCompany} topCategory={item.topCategory} topCompanyId={item.topCompanyId} />;
    if (item._type === 'recommend_squads') return <RecommendSquadsBanner squads={item.squads} />;
    return null;
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item._key}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 50 }}>😮</Text>
              <Text style={styles.emptyTitle}>אין צעקות עדיין</Text>
              <Text style={styles.emptySub}>היה הראשון לצעוק בקטגוריה זו!</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/create')}>
                <Text style={styles.emptyBtnText}>📣 צעק עכשיו</Text>
              </TouchableOpacity>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.yellow} colors={[C.yellow]} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/create')} activeOpacity={0.9}>
        <Text style={{ fontSize: 28 }}>📣</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray100 },

  toggle: {
    flexDirection: 'row', backgroundColor: C.gray200,
    margin: 12, marginBottom: 0, borderRadius: 20, padding: 3,
  },
  toggleBtn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 18 },
  toggleBtnActive: { backgroundColor: C.white, ...shadow.sm },
  toggleLabel: { fontSize: 13, fontWeight: '700', color: C.gray500 },

  catStrip: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.gray200, backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  pillLabel: { fontSize: 13, fontWeight: '600', color: C.gray600 },
  pillLabelActive: { color: C.black },

  /* Webinar banner */
  webinarBanner: {
    marginHorizontal: 12, marginBottom: 8, backgroundColor: '#1E1B4B',
    borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  webinarBannerLive: { backgroundColor: '#7F1D1D' },
  webinarLeft: { flex: 1, gap: 3 },
  webinarBadge: {
    alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  webinarBadgeText: { fontSize: 10, fontWeight: '700', color: C.white },
  webinarTitle: { fontSize: 13, fontWeight: '700', color: C.white, textAlign: 'right' },
  webinarMeta: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  webinarBtn: {
    backgroundColor: C.yellow, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  webinarBtnActive: { backgroundColor: C.green },
  webinarBtnText: { fontSize: 13, fontWeight: '700', color: C.black },

  alert: {
    margin: 12, marginBottom: 0, backgroundColor: C.black,
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  alertTitle: { fontSize: 13, fontWeight: '700', color: C.yellow, marginBottom: 2 },
  alertSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 17 },
  alertClose: { padding: 4 },

  compose: {
    margin: 12, backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.gray200, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10, ...shadow.sm,
  },
  composeAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.gray100, justifyContent: 'center', alignItems: 'center',
  },
  composePlaceholder: { flex: 1, fontSize: 14, color: C.gray500, textAlign: 'right' },
  composeImgBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: C.gray100, justifyContent: 'center', alignItems: 'center',
  },

  /* Injected sections */
  injectedSection: { marginBottom: 8, paddingTop: 4 },
  injectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  injectedTitle: { fontSize: 14, fontWeight: '800', color: C.dark },
  injectedMore: { fontSize: 12, fontWeight: '700', color: C.orange },

  /* F-2 squad cards: solid color bg, white text, pills top row */
  squadCard: {
    width: 180, borderRadius: 14,
    padding: 12, gap: 6,
  },
  squadCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginBottom: 2,
  },
  squadMemberPill: {
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  squadMemberText: { fontSize: 10, fontWeight: '700', color: C.white },
  squadCoPill: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3, maxWidth: 90,
  },
  squadCoPillText: { fontSize: 10, fontWeight: '700', color: C.white },
  squadCardName: { fontSize: 13, fontWeight: '700', color: C.white, textAlign: 'right' },
  squadCardBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, overflow: 'hidden', marginTop: 4 },
  squadCardFill: { height: '100%', backgroundColor: C.yellow, borderRadius: 10 },
  squadCardBtns: { flexDirection: 'row', gap: 6, marginTop: 6 },
  squadFastJoinBtn: {
    flex: 1, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 8,
    paddingVertical: 6, alignItems: 'center',
  },
  squadFastJoinText: { fontSize: 10, fontWeight: '700', color: C.white },
  squadLobbyBtn: {
    flex: 1, borderRadius: 8,
    paddingVertical: 6, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  squadLobbyText: { fontSize: 10, fontWeight: '700', color: C.white },

  /* F-3 trend: white section with company color card */
  trendSection: { marginBottom: 8, paddingTop: 4 },
  trendCard: {
    marginHorizontal: 12, backgroundColor: C.white,
    borderWidth: 1.5, borderColor: C.gray200, borderRadius: 14,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
    ...shadow.sm,
  },
  trendAiLabel: {
    fontSize: 10, fontWeight: '800', color: C.white,
    backgroundColor: C.dark, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10,
  },
  trendCardCompany: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  trendCardSub: { fontSize: 11, color: C.gray500 },
  trendCreateBtn: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  trendCreateBtnText: { fontSize: 12, fontWeight: '700', color: C.white },

  recCard: {
    width: 130, backgroundColor: '#F0F7FF', borderRadius: 12,
    borderWidth: 1.5, borderColor: C.gray200, padding: 10,
  },
  recCardName: { fontSize: 12, fontWeight: '700', color: C.dark, textAlign: 'right', marginBottom: 2 },
  recCardCo: { fontSize: 10, color: C.gray500, textAlign: 'right', marginBottom: 6 },
  recJoinBtn: { backgroundColor: C.yellow, borderRadius: 8, paddingVertical: 6, alignItems: 'center' },
  recJoinText: { fontSize: 11, fontWeight: '700', color: C.black },

  skeleton: {
    backgroundColor: C.white, marginHorizontal: 12, marginBottom: 10,
    borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: C.gray200,
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
    position: 'absolute', bottom: 80, right: 20,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: C.yellow, justifyContent: 'center', alignItems: 'center',
    ...shadow.md, shadowColor: C.yellow,
  },
});
