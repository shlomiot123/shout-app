import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { useRef, useState } from 'react';
import * as Haptics from '../utils/haptics';
import { C, shadow, avatarColor } from '../constants/theme';
import { api } from '../utils/api';

function Flames({ level }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2, marginRight: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: 13, opacity: i <= level ? 1 : 0.18 }}>
          🔥
        </Text>
      ))}
    </View>
  );
}

export default function ShoutCard({ shout: initial, onSquad }) {
  const [shout, setShout] = useState(initial);
  const [showReply, setShowReply] = useState(false);
  const echoScale = useRef(new Animated.Value(1)).current;
  const boostScale = useRef(new Animated.Value(1)).current;

  function animateButton(anim) {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1.3, useNativeDriver: true, speed: 50 }),
      Animated.spring(anim, { toValue: 1,   useNativeDriver: true, speed: 30 }),
    ]).start();
  }

  async function handleEcho() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateButton(echoScale);
    const res = await api.post(`/api/shouts/${shout.id}/echo`);
    setShout((s) => ({
      ...s,
      echoed: res.echoed,
      echoes: res.echoed ? s.echoes + 1 : s.echoes - 1,
    }));
  }

  async function handleBoost() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateButton(boostScale);
    const res = await api.post(`/api/shouts/${shout.id}/boost`);
    setShout((s) => ({
      ...s,
      boosted: res.boosted,
      boosts: res.boosted ? s.boosts + 1 : s.boosts - 1,
    }));
  }

  const color = avatarColor(shout.username || '');
  const initial_char = (shout.username || '?').charAt(0);
  const officialResp = shout.responses?.find((r) => r.is_official);
  const totalResp = (shout.responses || []).length;

  return (
    <View style={[styles.card, shout.is_resolved && styles.cardResolved]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initial_char}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{shout.username}</Text>
            {shout.company_name && (
              <>
                <Text style={{ color: C.gray300, fontSize: 13 }}> › </Text>
                <Text style={styles.companyName}>{shout.company_name}</Text>
              </>
            )}
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.time}>🕐 {shout.time_ago}</Text>
            {shout.has_proof ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ מאומת</Text>
              </View>
            ) : null}
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={{ fontSize: 18, color: C.gray500 }}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentWrap}>
        <Flames level={shout.anger_level} />
        <Text style={styles.content}>{shout.content}</Text>
      </View>

      {/* Proof badge */}
      {shout.has_proof && (
        <View style={styles.proofBadge}>
          <Text style={styles.proofText}>📎 צורפה אסמכתה בנקאית (PDF)</Text>
        </View>
      )}

      {/* Official response */}
      {officialResp && (
        <View style={styles.officialResp}>
          <View style={styles.officialHeader}>
            <Text style={styles.officialLabel}>🏢 תגובה רשמית מ{shout.company_name}</Text>
            {(officialResp.is_resolved || shout.is_resolved) && (
              <View style={styles.resolvedBadge}>
                <Text style={styles.resolvedText}>✅ נפתר</Text>
              </View>
            )}
          </View>
          <Text style={styles.officialText}>{officialResp.content}</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statText}>
          {shout.echoes.toLocaleString('he-IL')} הדהודים
        </Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.statText}>כעס {shout.anger_level}.{(shout.id % 9)}/5</Text>
        {totalResp > 0 && (
          <>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.statText}>{totalResp} תגובות</Text>
          </>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Animated.View style={[styles.actionWrap, { transform: [{ scale: echoScale }] }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleEcho}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{shout.echoed ? '🤝' : '🤜'}</Text>
            <Text style={[styles.actionLabel, shout.echoed && styles.actionLabelActive]}>
              {shout.echoed ? 'הדהדתי' : 'קרה גם לי'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.actionDivider} />

        <Animated.View style={[styles.actionWrap, { transform: [{ scale: boostScale }] }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleBoost}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={[styles.actionLabel, shout.boosted && styles.actionLabelBoost]}>
              {shout.boosts > 0 ? `בוסט (${shout.boosts})` : 'בוסט'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={[styles.actionWrap, styles.actionBtn]}
          onPress={() => setShowReply((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>תגובה</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={[styles.actionWrap, styles.actionBtn]}
          onPress={() => onSquad && onSquad(shout)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>⚡</Text>
          <Text style={styles.actionLabel}>קבוצה</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.gray200,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardResolved: { borderColor: C.greenBorder, backgroundColor: '#FAFFFE' },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    paddingBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.white },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  username: { fontSize: 14, fontWeight: '700', color: C.dark },
  companyName: { fontSize: 14, fontWeight: '700', color: C.orange },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  time: { fontSize: 11, color: C.gray500 },
  verifiedBadge: {
    backgroundColor: '#EFF6FF', borderRadius: 20,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: C.blue },
  moreBtn: { padding: 4 },

  contentWrap: { paddingHorizontal: 14, paddingBottom: 12 },
  content: { fontSize: 14.5, lineHeight: 22, color: C.dark, textAlign: 'right' },

  proofBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 14, marginBottom: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1, borderColor: '#BAE6FD',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-end',
  },
  proofText: { fontSize: 11, fontWeight: '600', color: C.blue },

  officialResp: {
    marginHorizontal: 14, marginBottom: 12,
    backgroundColor: C.greenLight,
    borderWidth: 1.5, borderColor: C.greenBorder,
    borderRadius: 12, padding: 12,
  },
  officialHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 6,
  },
  officialLabel: { fontSize: 12, fontWeight: '700', color: C.green },
  resolvedBadge: {
    backgroundColor: C.green, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  resolvedText: { fontSize: 10, fontWeight: '700', color: C.white },
  officialText: { fontSize: 13, lineHeight: 20, color: C.gray700, textAlign: 'right' },

  stats: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 10, gap: 8,
  },
  statText: { fontSize: 12, color: C.gray500 },
  statDot: { fontSize: 12, color: C.gray300 },

  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.gray200,
  },
  actionWrap: { flex: 1 },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, gap: 3,
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 10, fontWeight: '700', color: C.gray500 },
  actionLabelActive: { color: C.orange },
  actionLabelBoost: { color: C.blue },
  actionDivider: { width: 1, backgroundColor: C.gray200, marginVertical: 6 },
});
