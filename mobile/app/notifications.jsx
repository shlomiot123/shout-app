import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { C, shadow } from '../constants/theme';
import { api } from '../utils/api';

const TYPE_ICONS = {
  echo:       { icon: '🤜', bg: '#FEF3C7', color: C.orange },
  squad_join: { icon: '⚡', bg: '#FEF3C7', color: C.orange },
  response:   { icon: '🏢', bg: '#DCFCE7', color: C.green },
  resolved:   { icon: '✅', bg: '#DCFCE7', color: C.green },
  boost:      { icon: '📈', bg: '#EFF6FF', color: C.blue },
  milestone:  { icon: '🎯', bg: '#FEF3C7', color: C.orange },
};

function NotifItem({ notif, onRead }) {
  const meta = TYPE_ICONS[notif.type] || { icon: '🔔', bg: C.gray100, color: C.gray600 };

  return (
    <TouchableOpacity
      style={[styles.item, !notif.is_read && styles.itemUnread]}
      onPress={() => onRead(notif.id)}
      activeOpacity={0.85}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Text style={{ fontSize: 20 }}>{meta.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{notif.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{notif.message}</Text>
        <Text style={styles.time}>{notif.time_ago}</Text>
      </View>
      {!notif.is_read && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/notifications')
      .then(setNotifs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function markRead(id) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    api.post(`/api/notifications/${id}/read`).catch(() => {});
  }

  function markAll() {
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    api.post('/api/notifications/read-all').catch(() => {});
  }

  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          התראות {unread > 0 && `(${unread})`}
        </Text>
        {unread > 0 && (
          <TouchableOpacity onPress={markAll} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>קרא הכל</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifs}
        keyExtractor={(n) => String(n.id)}
        renderItem={({ item }) => <NotifItem notif={item} onRead={markRead} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🔔</Text>
              <Text style={styles.emptyTitle}>אין התראות</Text>
              <Text style={styles.emptySub}>צעק כדי להתחיל לקבל התראות</Text>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray100 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.gray200,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: C.dark, textAlign: 'right' },
  readAllBtn: {
    backgroundColor: C.yellow, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  readAllText: { fontSize: 12, fontWeight: '700', color: C.black },

  item: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: C.white,
    paddingHorizontal: 14, paddingVertical: 14,
    gap: 12,
  },
  itemUnread: { backgroundColor: '#FFFBEB' },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: C.dark, textAlign: 'right', marginBottom: 3 },
  message: { fontSize: 12, color: C.gray600, textAlign: 'right', lineHeight: 18 },
  time: { fontSize: 11, color: C.gray400, textAlign: 'right', marginTop: 4 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.yellow, marginTop: 4, flexShrink: 0,
  },

  separator: { height: 1, backgroundColor: C.gray100 },

  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.dark, marginTop: 14 },
  emptySub: { fontSize: 13, color: C.gray500, marginTop: 6 },
});
