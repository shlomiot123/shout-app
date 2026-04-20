import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from '../utils/haptics';
import { C, shadow, AVATAR_COLORS } from '../constants/theme';
import { api } from '../utils/api';

const GOAL_ICONS = {
  legal: '⚖️', public: '📢', regulatory: '🏛️', investor: '📈',
};

export default function SquadCard({ squad: initial }) {
  const [squad, setSquad] = useState(initial);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(100, Math.round((squad.current_members / squad.target_members) * 100));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  async function handleJoin() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await api.post(`/api/squads/${squad.id}/join`);
    setSquad((s) => ({
      ...s,
      joined: res.joined,
      current_members: res.joined ? s.current_members + 1 : s.current_members - 1,
    }));
  }

  const goalIcon = GOAL_ICONS[squad.goal_type] || '⚖️';

  return (
    <View style={[styles.card, squad.is_success && styles.cardSuccess]}>
      {/* Banner */}
      <View style={[styles.banner, squad.is_success && styles.bannerSuccess]}>
        <Text style={{ fontSize: 44 }}>{squad.is_success ? '🏆' : '⚡'}</Text>
        {squad.is_success && (
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>✅ הצלחה!</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{squad.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>👥 </Text>
          <Text style={styles.meta}>{squad.category_name || 'כללי'}</Text>
          {squad.company_name && (
            <Text style={[styles.meta, { color: C.orange, fontWeight: '700' }]}>
              {' '}• {squad.company_name}
            </Text>
          )}
        </View>

        {squad.goal_description && (
          <View style={styles.goalRow}>
            <Text style={styles.goalText}>{goalIcon} {squad.goal_description}</Text>
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressWidth },
              pct >= 100 && { backgroundColor: C.green },
            ]}
          />
        </View>
        <View style={styles.progressLabel}>
          <Text style={styles.progressTarget}>
            {squad.target_members.toLocaleString('he-IL')} דרושים
          </Text>
          <Text style={[styles.progressPct, { color: pct >= 100 ? C.green : C.orange }]}>
            {pct}%
          </Text>
        </View>

        {/* Members */}
        <View style={styles.membersRow}>
          <View style={styles.avatarGroup}>
            {AVATAR_COLORS.slice(0, 3).map((col, i) => (
              <View
                key={i}
                style={[
                  styles.memberAvatar,
                  { backgroundColor: col, marginRight: i < 2 ? -8 : 0 },
                ]}
              >
                <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>
                  {['א', 'ב', 'ג'][i]}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.memberCount}>
            {squad.current_members.toLocaleString('he-IL')} חברים
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.joinBtn, squad.joined && styles.joinBtnActive]}
            onPress={handleJoin}
            activeOpacity={0.85}
          >
            <Text style={[styles.joinBtnText, squad.joined && { color: C.dark }]}>
              {squad.joined ? '✓ הצטרפתי' : '+ הצטרף'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.lobbyBtn}
            onPress={() => router.push({ pathname: '/squad-lobby', params: { id: squad.id } })}
            activeOpacity={0.85}
          >
            <Text style={styles.lobbyBtnText}>כנס ללובי ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    marginHorizontal: 12, marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1.5, borderColor: C.gray200,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardSuccess: { borderColor: C.greenBorder },

  banner: {
    height: 88,
    backgroundColor: C.yellow,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  bannerSuccess: { backgroundColor: C.green },

  successBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  successBadgeText: { fontSize: 11, fontWeight: '800', color: C.white },

  body: { padding: 14 },
  name: { fontSize: 16, fontWeight: '800', color: C.dark, textAlign: 'right', marginBottom: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, flexWrap: 'wrap' },
  meta: { fontSize: 12, color: C.gray500 },

  goalRow: { marginBottom: 10 },
  goalText: { fontSize: 12, fontWeight: '600', color: C.red, textAlign: 'right' },

  progressTrack: {
    height: 6, backgroundColor: C.gray200,
    borderRadius: 20, overflow: 'hidden', marginBottom: 6,
  },
  progressFill: {
    height: '100%', backgroundColor: C.yellow, borderRadius: 20,
  },
  progressLabel: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  progressTarget: { fontSize: 11, color: C.gray500 },
  progressPct: { fontSize: 12, fontWeight: '700' },

  membersRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  avatarGroup: { flexDirection: 'row' },
  memberAvatar: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: C.white,
    justifyContent: 'center', alignItems: 'center',
  },
  memberCount: { fontSize: 13, fontWeight: '700', color: C.gray600 },

  joinBtn: {
    borderRadius: 12, borderWidth: 1.5, borderColor: C.gray200,
    paddingVertical: 12, alignItems: 'center',
  },
  joinBtnActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  joinBtnText: { fontSize: 13, fontWeight: '700', color: C.dark },

  btnRow: { flexDirection: 'row', gap: 8 },
  lobbyBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: C.dark,
    paddingVertical: 10, alignItems: 'center',
  },
  lobbyBtnText: { fontSize: 13, fontWeight: '700', color: C.dark },

  successMsg: {
    backgroundColor: C.greenLight, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  successMsgText: { fontSize: 14, fontWeight: '700', color: C.green },
});
