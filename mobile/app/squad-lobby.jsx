import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, TextInput, Animated,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { C, shadow, avatarColor } from '../constants/theme';
import { api } from '../utils/api';

function ProgressBar({ current, target }) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = Math.min((current / target) * 100, 100);
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 800, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={styles.progTrack}>
      <Animated.View style={[styles.progFill, { width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
    </View>
  );
}

const WEBINAR_SEED = { title: 'ישיבת אסטרטגיה: הצעדים הבאים מול רכבת ישראל', date: 'ראשון 27/4', time: '20:00', attendees: 84 };

export default function SquadLobby() {
  const { id } = useLocalSearchParams();
  const [squad, setSquad] = useState(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/squads/${id}`)
      .then((data) => { setSquad(data); setJoined(!!data.is_joined); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleJoin() {
    const res = await api.post(`/api/squads/${id}/join`);
    setJoined(res.joined);
    setSquad((s) => ({ ...s, current_members: res.joined ? s.current_members + 1 : s.current_members - 1 }));
  }

  if (loading || !squad) {
    return <View style={styles.root}><Text style={{ textAlign: 'center', marginTop: 60, color: C.gray500 }}>טוען...</Text></View>;
  }

  const isSuccess = squad.is_success;
  const pct = Math.round((squad.current_members / squad.target_members) * 100);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.hero, isSuccess && styles.heroSuccess]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, isSuccess && { color: C.white }]}>‹ חזור</Text>
        </TouchableOpacity>

        <Text style={[styles.heroName, isSuccess && { color: C.white }]}>{squad.name}</Text>
        <Text style={[styles.heroDesc, isSuccess && { color: 'rgba(255,255,255,0.75)' }]}>{squad.description}</Text>

        {/* Progress */}
        <View style={styles.heroStats}>
          <View style={styles.statBubble}>
            <Text style={styles.statNum}>{squad.current_members?.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>חברים</Text>
          </View>
          <View style={styles.statBubble}>
            <Text style={styles.statNum}>{pct}%</Text>
            <Text style={styles.statLabel}>מהיעד</Text>
          </View>
          <View style={styles.statBubble}>
            <Text style={styles.statNum}>{squad.target_members?.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>יעד</Text>
          </View>
        </View>

        <ProgressBar current={squad.current_members} target={squad.target_members} />

        {isSuccess && (
          <View style={styles.successBadge}>
            <Text style={styles.successText}>🏆 {squad.goal_description}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Join CTA */}
        {!isSuccess && (
          <TouchableOpacity
            style={[styles.joinBtn, joined && styles.joinBtnJoined]}
            onPress={toggleJoin}
            activeOpacity={0.85}
          >
            <Text style={[styles.joinBtnText, joined && { color: C.green }]}>
              {joined ? '✓ הצטרפת למאבק' : '⚡ הצטרף למאבק'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Webinar card */}
        <View style={styles.webinarCard}>
          <View style={styles.webinarHeader}>
            <Text style={{ fontSize: 22 }}>🎥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.webinarTitle}>{WEBINAR_SEED.title}</Text>
              <Text style={styles.webinarMeta}>{WEBINAR_SEED.date} · {WEBINAR_SEED.time} · {WEBINAR_SEED.attendees} אישרו הגעה</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.webinarBtn}>
            <Text style={styles.webinarBtnText}>אגיע, זה חשוב 🙋</Text>
          </TouchableOpacity>
        </View>

        {/* Goal */}
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>🎯 מטרת המאבק</Text>
          <Text style={styles.goalText}>{squad.goal_description}</Text>
        </View>

        {/* Shouts in lobby */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>💬 פיד הקהילה</Text>
          <TouchableOpacity style={styles.shareUpdate}>
            <Text style={styles.shareUpdateText}>שתף עדכון עם הקהילה...</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', color: C.gray400, fontSize: 13, paddingVertical: 20 }}>
          הצעקות הקשורות למאבק יופיעו כאן
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray100 },
  hero: {
    backgroundColor: C.white, padding: 20,
    borderBottomWidth: 1, borderBottomColor: C.gray200,
  },
  heroSuccess: { backgroundColor: C.green },
  backBtn: { marginBottom: 14 },
  backText: { fontSize: 16, fontWeight: '600', color: C.dark },
  heroName: { fontSize: 20, fontWeight: '900', color: C.dark, textAlign: 'right', marginBottom: 6 },
  heroDesc: { fontSize: 13, color: C.gray500, textAlign: 'right', marginBottom: 16 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  statBubble: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900', color: C.dark },
  statLabel: { fontSize: 11, color: C.gray500 },
  progTrack: { height: 10, backgroundColor: C.gray200, borderRadius: 20, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: C.yellow, borderRadius: 20 },

  successBadge: {
    marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10, padding: 10,
  },
  successText: { fontSize: 13, color: C.white, textAlign: 'center', fontWeight: '700' },

  joinBtn: {
    margin: 16, backgroundColor: C.yellow,
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  joinBtnJoined: { backgroundColor: '#ECFDF5', borderWidth: 1.5, borderColor: C.green },
  joinBtnText: { fontSize: 17, fontWeight: '900', color: C.black },

  webinarCard: {
    backgroundColor: '#F5F3FF', borderWidth: 1.5, borderColor: '#C4B5FD',
    borderRadius: 14, margin: 16, padding: 14, gap: 12,
  },
  webinarHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  webinarTitle: { fontSize: 14, fontWeight: '700', color: C.dark, textAlign: 'right', lineHeight: 20 },
  webinarMeta: { fontSize: 11, color: '#7C3AED', textAlign: 'right', marginTop: 3 },
  webinarBtn: {
    backgroundColor: '#7C3AED', borderRadius: 10, padding: 10, alignItems: 'center',
  },
  webinarBtnText: { fontSize: 14, fontWeight: '700', color: C.white },

  goalCard: {
    backgroundColor: C.white, borderRadius: 14, margin: 16, marginTop: 0, padding: 14,
    borderWidth: 1.5, borderColor: C.gray200,
  },
  goalTitle: { fontSize: 14, fontWeight: '800', color: C.dark, textAlign: 'right', marginBottom: 8 },
  goalText: { fontSize: 13, color: C.gray600, textAlign: 'right', lineHeight: 20 },

  feedHeader: { paddingHorizontal: 16, marginBottom: 8 },
  feedTitle: { fontSize: 15, fontWeight: '800', color: C.dark, textAlign: 'right', marginBottom: 10 },
  shareUpdate: {
    backgroundColor: C.white, borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: C.gray200,
  },
  shareUpdateText: { fontSize: 13, color: C.gray400, textAlign: 'right' },
});
