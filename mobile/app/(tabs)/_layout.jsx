import { Tabs, router } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { C, shadow } from '../../constants/theme';

const TABS = [
  { name: 'feed',      emoji: '🏠', label: 'הפיד שלי' },
  { name: 'squads',    emoji: '🛡️', label: 'קבוצות לחץ' },
  { name: 'companies', emoji: '🏢', label: 'תאגידים' },
  { name: 'arena',     emoji: '📊', label: 'תמונת מצב' },
  { name: 'friends',   emoji: '👥', label: 'חברים' },
];

const USER_INITIAL = 'מ';
const USER_COLOR = '#8B5CF6';

function CustomHeader() {
  return (
    <View style={styles.header}>
      {/* Far left: hamburger */}
      <TouchableOpacity style={styles.hamburgerBtn}>
        <Text style={styles.hamburgerText}>☰</Text>
      </TouchableOpacity>

      {/* Center-left: avatar, bell, search, create */}
      <View style={styles.headerIcons}>
        <TouchableOpacity
          style={[styles.avatarCircle, { backgroundColor: USER_COLOR }]}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.avatarText}>{USER_INITIAL}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create')}>
          <Text style={styles.createBtnText}>+</Text>
          <Text style={{ fontSize: 15 }}>📢</Text>
        </TouchableOpacity>
      </View>

      {/* Far right: Shout logo */}
      <View style={styles.logoWrap}>
        <Text style={styles.logoText}>Shout</Text>
        <Text style={{ fontSize: 18 }}>📢</Text>
      </View>
    </View>
  );
}

function CustomTabBar({ state, navigation }) {
  return (
    <View style={styles.tabBar}>
      {/* row-reverse so feed (first defined) appears on the right */}
      {[...state.routes].reverse().map((route) => {
        if (route.name === 'leaderboard') return null;
        const tab = TABS.find(t => t.name === route.name);
        if (!tab) return null;
        const routeIndex = state.routes.findIndex(r => r.key === route.key);
        const focused = state.index === routeIndex;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {focused && <View style={styles.tabIndicator} />}
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
              {tab.emoji}
            </Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ header: () => <CustomHeader /> }}
    >
      <Tabs.Screen name="feed"        options={{ title: 'הפיד שלי' }} />
      <Tabs.Screen name="squads"      options={{ title: 'קבוצות לחץ' }} />
      <Tabs.Screen name="companies"   options={{ title: 'תאגידים' }} />
      <Tabs.Screen name="arena"       options={{ title: 'הזירה' }} />
      <Tabs.Screen name="friends"     options={{ title: 'חברים למאבק' }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 52 : 14,
    paddingBottom: 10,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
    ...shadow.sm,
  },
  hamburgerBtn: { padding: 8 },
  hamburgerText: { fontSize: 22, color: C.gray600 },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingHorizontal: 8,
  },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: C.white },
  iconBtn: { padding: 4 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#FFF8DC',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1.5, borderColor: C.yellow,
  },
  createBtnText: { fontSize: 16, fontWeight: '800', color: C.black },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  logoText: { fontSize: 20, fontWeight: '900', color: C.yellow },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    height: Platform.OS === 'ios' ? 80 : 62,
    paddingBottom: Platform.OS === 'ios' ? 18 : 4,
    paddingTop: 0,
    ...shadow.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 3,
    backgroundColor: C.yellow,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tabEmoji: { fontSize: 21, marginBottom: 2, opacity: 0.4 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 9, fontWeight: '700', color: C.gray500 },
  tabLabelActive: { color: C.yellow },
});
