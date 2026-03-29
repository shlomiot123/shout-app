import { Tabs, router } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/theme';

function TabIcon({ emoji, focused }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
    </View>
  );
}

function HeaderRight() {
  return (
    <TouchableOpacity
      onPress={() => router.push('/notifications')}
      style={styles.headerBtn}
    >
      <Text style={{ fontSize: 20 }}>🔔</Text>
    </TouchableOpacity>
  );
}

function HeaderLeft() {
  return (
    <TouchableOpacity
      onPress={() => {}}
      style={styles.headerBtn}
    >
      <Text style={{ fontSize: 20 }}>☰</Text>
    </TouchableOpacity>
  );
}

const headerOpts = {
  headerStyle: { backgroundColor: C.yellow },
  headerTintColor: C.black,
  headerTitleStyle: { fontWeight: '900', fontSize: 18 },
  headerRight: () => <HeaderRight />,
  headerLeft: () => <HeaderLeft />,
  headerShadowVisible: false,
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.black,
        tabBarInactiveTintColor: C.gray500,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
        ...headerOpts,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'הפיד שלי',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          tabBarLabel: 'הפיד',
        }}
      />
      <Tabs.Screen
        name="squads"
        options={{
          title: 'קבוצות לחץ',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} />,
          tabBarLabel: 'קבוצות',
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'מצעד הבושה',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          tabBarLabel: 'בושה',
        }}
      />
      <Tabs.Screen
        name="companies"
        options={{
          title: 'חברות ותאגידים',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏢" focused={focused} />,
          tabBarLabel: 'חברות',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: { fontSize: 10, fontWeight: '700', marginTop: -2 },
  tabIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  tabIconActive: { backgroundColor: C.yellowPale },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 8,
  },
});
