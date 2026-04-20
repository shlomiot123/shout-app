import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { C, shadow, avatarColor } from '../constants/theme';

const TABS = ['צעקות שלי', 'קבוצות שיצרתי', 'קבוצות שהצטרפתי', 'וובינרים'];

const MOCK = {
  username: 'אנונימי_34',
  shouts: 7, squads: 2, wins: 1,
  myShouts: [
    { id: 1, content: 'כבר חצי שנה שאני מחכה לפיצוי...', company: 'רכבת ישראל', echoes: 5400, time: 'לפני יום' },
    { id: 2, content: 'האפליקציה מחייבת אותי פעמיים כל חודש', company: 'סלקום', echoes: 445, time: 'לפני 3 ימים' },
  ],
  myCreated: [{ id: 1, name: 'נגד הוט — ביטולי שירות', members: 312 }],
  myJoined: [{ id: 3, name: 'נפגעי קו 480 — רכבת ישראל', members: 4800 }, { id: 5, name: 'נפגעי ביטול טיסות אל-על', members: 2890 }],
  webinars: [{ id: 1, title: 'ישיבת אסטרטגיה נגד רכבת', date: 'ראשון 27/4 · 20:00' }],
};

export default function ProfileScreen() {
  const [tab, setTab] = useState(0);
  const [walletOpen, setWalletOpen] = useState(false);
  const color = avatarColor(MOCK.username);

  function getTabData() {
    switch (tab) {
      case 0: return MOCK.myShouts.map((s) => (
        <View key={s.id} style={styles.activityCard}>
          <Text style={styles.activityContent} numberOfLines={2}>{s.content}</Text>
          <View style={styles.activityMeta}>
            <Text style={styles.activityStat}>☝️ {s.echoes?.toLocaleString('he-IL')}</Text>
            <Text style={styles.activityCompany}>{s.company}</Text>
            <Text style={styles.activityTime}>{s.time}</Text>
          </View>
        </View>
      ));
      case 1: return MOCK.myCreated.map((s) => (
        <TouchableOpacity key={s.id} style={styles.activityCard}
          onPress={() => router.push({ pathname: '/squad-lobby', params: { id: s.id } })}>
          <Text style={styles.activityTitle}>{s.name}</Text>
          <Text style={styles.activityStat}>{s.members.toLocaleString('he-IL')} חברים</Text>
        </TouchableOpacity>
      ));
      case 2: return MOCK.myJoined.map((s) => (
        <TouchableOpacity key={s.id} style={styles.activityCard}
          onPress={() => router.push({ pathname: '/squad-lobby', params: { id: s.id } })}>
          <Text style={styles.activityTitle}>{s.name}</Text>
          <Text style={styles.activityStat}>{s.members.toLocaleString('he-IL')} חברים</Text>
        </TouchableOpacity>
      ));
      case 3: return MOCK.webinars.map((w) => (
        <View key={w.id} style={styles.activityCard}>
          <Text style={styles.activityTitle}>{w.title}</Text>
          <Text style={styles.activityStat}>📅 {w.date}</Text>
        </View>
      ));
      default: return null;
    }
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 24, color: C.dark }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>הפרופיל שלי</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{MOCK.username.charAt(0)}</Text>
          </View>
          <Text style={styles.username}>{MOCK.username}</Text>
          <Text style={styles.userSub}>חבר מאפריל 2026</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: '📣', val: MOCK.shouts, lab: 'צעקות' },
              { icon: '⚡', val: MOCK.squads, lab: 'מאבקים' },
              { icon: '🏆', val: MOCK.wins,   lab: 'נצחונות' },
            ].map((s) => (
              <View key={s.lab} style={styles.statCard}>
                <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                <Text style={styles.statNum}>{s.val}</Text>
                <Text style={styles.statLab}>{s.lab}</Text>
              </View>
            ))}
          </View>

          {/* Data Wallet */}
          <TouchableOpacity style={styles.walletBtn} onPress={() => setWalletOpen(true)}>
            <Text style={{ fontSize: 18 }}>🛡️</Text>
            <Text style={styles.walletText}>ארנק נתונים מאובטח</Text>
            <Text style={{ fontSize: 16, color: C.gray400 }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Activity tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
          {TABS.map((t, i) => (
            <TouchableOpacity key={i} style={[styles.tabPill, tab === i && styles.tabPillActive]} onPress={() => setTab(i)}>
              <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 12, paddingTop: 10, gap: 8 }}>
          {getTabData()}
        </View>
      </ScrollView>

      {/* Wallet modal (simple) */}
      {walletOpen && (
        <View style={styles.walletOverlay}>
          <View style={styles.walletModal}>
            <Text style={styles.walletTitle}>🛡️ ארנק נתונים מאובטח</Text>
            <Text style={styles.walletDesc}>המידע שלהלן מוצפן ומשמש לצורך תביעות משפטיות בלבד</Text>
            {[['שם מלא', 'ישראל ישראלי'], ['ת.ז.', '•••••••••'], ['טלפון', '05•-•••••••'], ['אימייל', 'is••@gmail.com']].map(([k, v]) => (
              <View key={k} style={styles.walletRow}>
                <Text style={styles.walletKey}>{k}</Text>
                <Text style={styles.walletVal}>{v}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.walletClose} onPress={() => setWalletOpen(false)}>
              <Text style={styles.walletCloseText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray100 },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.white,
    paddingHorizontal: 14, paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.gray200,
  },
  backBtn: { width: 40 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: C.dark },
  hero: { backgroundColor: C.white, alignItems: 'center', padding: 24, marginBottom: 10, gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  avatarText: { fontSize: 28, fontWeight: '900', color: C.white },
  username: { fontSize: 20, fontWeight: '900', color: C.dark },
  userSub: { fontSize: 12, color: C.gray400 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  statCard: { flex: 1, backgroundColor: C.gray100, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 24, fontWeight: '900', color: C.dark },
  statLab: { fontSize: 11, color: C.gray500 },
  walletBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F0FDF4', borderWidth: 1.5, borderColor: C.green,
    borderRadius: 12, padding: 14, width: '100%', marginTop: 8,
  },
  walletText: { flex: 1, fontSize: 14, fontWeight: '700', color: C.dark, textAlign: 'right' },
  tabsScroll: { marginTop: 10 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.gray200 },
  tabPillActive: { backgroundColor: C.black, borderColor: C.black },
  tabText: { fontSize: 13, fontWeight: '600', color: C.gray500 },
  tabTextActive: { color: C.white },
  activityCard: { backgroundColor: C.white, borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: C.gray200, gap: 8 },
  activityContent: { fontSize: 13, color: C.dark, textAlign: 'right', lineHeight: 20 },
  activityTitle: { fontSize: 14, fontWeight: '700', color: C.dark, textAlign: 'right' },
  activityMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityStat: { fontSize: 12, color: C.orange, fontWeight: '700' },
  activityCompany: { fontSize: 11, color: C.gray500 },
  activityTime: { fontSize: 11, color: C.gray400 },

  walletOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  walletModal: { backgroundColor: C.white, borderRadius: 20, padding: 24, width: '100%', gap: 12 },
  walletTitle: { fontSize: 18, fontWeight: '900', color: C.dark, textAlign: 'center' },
  walletDesc: { fontSize: 12, color: C.gray500, textAlign: 'center' },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.gray100 },
  walletKey: { fontSize: 13, color: C.gray500 },
  walletVal: { fontSize: 13, fontWeight: '700', color: C.dark },
  walletClose: { backgroundColor: C.yellow, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  walletCloseText: { fontSize: 15, fontWeight: '800', color: C.black },
});
