import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Modal, Share, Alert, Pressable,
} from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from '../utils/haptics';
import { C, shadow, avatarColor } from '../constants/theme';
import { api } from '../utils/api';

const ANGER_EMOJIS = [
  { v: 1, e: '😤', l: 'קצת' },
  { v: 2, e: '😠', l: 'עצבני' },
  { v: 3, e: '😡', l: 'מאוד' },
  { v: 4, e: '🤬', l: 'כועס' },
  { v: 5, e: '💢', l: 'נפיצה' },
];

function Flames({ level }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2, marginRight: 6 }}>
      {[1,2,3,4,5].map((i) => (
        <Text key={i} style={{ fontSize: 13, opacity: i <= level ? 1 : 0.18 }}>🔥</Text>
      ))}
    </View>
  );
}

function BoostPopup({ visible, onClose, onPick }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.boostPopup}>
          <Text style={styles.boostTitle}>דרג את רמת הזעם</Text>
          <View style={styles.boostRow}>
            {ANGER_EMOJIS.map((a) => (
              <TouchableOpacity key={a.v} style={styles.boostBtn} onPress={() => onPick(a.v)}>
                <Text style={{ fontSize: 30 }}>{a.e}</Text>
                <Text style={styles.boostLabel}>{a.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

function ThreeDotMenu({ visible, onClose, onSave, onCreateSquad, onCopy, onReport }) {
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menuPopup}>
          {[
            { icon: '🔖', label: 'שמרת צעקה למעקב', fn: onSave },
            { icon: '⊕', label: 'ליצירת קבוצת לחץ', fn: onCreateSquad, highlight: true },
            { icon: '🔗', label: 'העתקת קישור', fn: onCopy },
            { icon: '🚩', label: 'דיווח תוכן פוגעני', fn: onReport, red: true },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => { onClose(); item.fn?.(); }}
            >
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              <Text style={[
                styles.menuLabel,
                item.red && { color: C.red },
                item.highlight && { fontWeight: '800' },
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export default function ShoutCard({ shout: initial, onSquad }) {
  const [shout, setShout] = useState(initial);
  const [showReply, setShowReply] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const echoScale = useRef(new Animated.Value(1)).current;
  const boostScale = useRef(new Animated.Value(1)).current;

  function bounce(anim) {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1.3, useNativeDriver: true, speed: 50 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  }

  async function handleEcho() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bounce(echoScale);
    const res = await api.post(`/api/shouts/${shout.id}/echo`);
    setShout((s) => ({ ...s, echoed: res.echoed, echoes: res.echoed ? s.echoes + 1 : s.echoes - 1 }));
  }

  async function handleBoostPick(level) {
    setShowBoost(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bounce(boostScale);
    const res = await api.post(`/api/shouts/${shout.id}/boost`);
    setShout((s) => ({ ...s, boosted: res.boosted, boosts: res.boosted ? s.boosts + 1 : s.boosts - 1 }));
  }

  async function handleShare() {
    await Share.share({ message: `${shout.content}\n\nדרך Shout — כל קול נחשב` });
  }

  const color = avatarColor(shout.username || '');
  const initChar = (shout.username || '?').charAt(0);
  const officialResp = shout.responses?.find((r) => r.is_official);
  const totalResp = (shout.responses || []).length;
  const boosts = shout.boosts || 0;
  const echoes = shout.echoes || 0;

  return (
    <View style={[styles.card, shout.is_resolved && styles.cardResolved]}>
      <BoostPopup visible={showBoost} onClose={() => setShowBoost(false)} onPick={handleBoostPick} />
      <ThreeDotMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onCreateSquad={() => onSquad?.(shout)}
        onCopy={() => Alert.alert('הועתק', 'קישור הועתק ללוח')}
        onReport={() => Alert.alert('תודה', 'הדיווח התקבל')}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initChar}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{shout.username}</Text>
            {shout.company_name && (
              <><Text style={{ color: C.gray300, fontSize: 13 }}> › </Text>
              <Text style={styles.companyName}>{shout.company_name}</Text></>
            )}
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.time}>🕐 {shout.time_ago}</Text>
            {shout.has_proof && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ מאומת</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => setShowMenu(true)}>
          <Text style={{ fontSize: 20, color: C.gray500 }}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentWrap}>
        <Flames level={shout.anger_level} />
        <Text style={styles.content}>{shout.content}</Text>
      </View>

      {shout.has_proof && (
        <View style={styles.proofBadge}>
          <Text style={styles.proofText}>📎 צורפה אסמכתה</Text>
        </View>
      )}

      {/* F-10: Related squad badge */}
      {shout.related_squad && (
        <TouchableOpacity
          style={styles.relatedSquad}
          onPress={() => router.push(`/squad-lobby?id=${shout.related_squad.id}`)}
          activeOpacity={0.8}
        >
          <View style={styles.warningCircle}>
            <Text style={{ fontSize: 15 }}>⚠️</Text>
          </View>
          <Text style={styles.relatedSquadText}>קיימת קבוצת לחץ בנושא זה!</Text>
          <View style={styles.relatedSquadBtn}>
            <Text style={styles.relatedSquadBtnText}>להצטרפות</Text>
          </View>
        </TouchableOpacity>
      )}

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

      {/* Stats — matches design: N 🔥 | זעם: X/5 | N גם לי | N תגובות */}
      <View style={styles.stats}>
        <Text style={styles.statText}>{boosts} 🔥</Text>
        <Text style={styles.statSep}>|</Text>
        <Text style={styles.statText}>זעם: {shout.anger_level}/5</Text>
        <Text style={styles.statSep}>|</Text>
        <Text style={styles.statText}>{echoes} גם לי</Text>
        {totalResp > 0 && (
          <>
            <Text style={styles.statSep}>|</Text>
            <Text style={styles.statText}>{totalResp} תגובות</Text>
          </>
        )}
      </View>

      {/* Actions — 3 buttons: בוסט | גם לי | תגובה */}
      <View style={styles.actions}>
        <Animated.View style={[styles.actionWrap, { transform: [{ scale: boostScale }] }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBoost(true)} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>🔥</Text>
            <Text style={[styles.actionLabel, shout.boosted && styles.actionLabelBoost]}>
              בוסט{boosts > 0 ? ` (${boosts})` : ''}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.actionDivider} />

        <Animated.View style={[styles.actionWrap, { transform: [{ scale: echoScale }] }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleEcho} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>☝️</Text>
            <Text style={[styles.actionLabel, shout.echoed && styles.actionLabelActive]}>
              גם לי{echoes > 0 ? ` (${echoes})` : ''}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={[styles.actionWrap, styles.actionBtn]} onPress={() => setShowReply((v) => !v)}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>תגובה</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white, marginHorizontal: 12, marginBottom: 10,
    borderRadius: 16, borderWidth: 1.5, borderColor: C.gray200, overflow: 'hidden', ...shadow.sm,
  },
  cardResolved: { borderColor: C.greenBorder, backgroundColor: '#FAFFFE' },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingBottom: 10, gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.white },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  username: { fontSize: 14, fontWeight: '700', color: C.dark },
  companyName: { fontSize: 14, fontWeight: '700', color: C.orange },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  time: { fontSize: 11, color: C.gray500 },
  verifiedBadge: { backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedText: { fontSize: 10, fontWeight: '700', color: C.blue },
  moreBtn: { padding: 4 },

  contentWrap: { paddingHorizontal: 14, paddingBottom: 12 },
  content: { fontSize: 14.5, lineHeight: 22, color: C.dark, textAlign: 'right' },

  proofBadge: {
    marginHorizontal: 14, marginBottom: 10, backgroundColor: '#F0F9FF',
    borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-end',
  },
  proofText: { fontSize: 11, fontWeight: '600', color: C.blue },

  /* F-10 Related squad — matches design: yellow bg, warning circle, text, join btn */
  relatedSquad: {
    marginHorizontal: 14, marginBottom: 10,
    backgroundColor: '#FFFDE7',
    borderWidth: 1.5, borderColor: '#F5C000',
    borderRadius: 12, padding: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  warningCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FFF3CD',
    borderWidth: 2, borderColor: '#F5C000',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  relatedSquadText: {
    flex: 1, fontSize: 12, fontWeight: '800', color: '#92400E', textAlign: 'right',
  },
  relatedSquadBtn: {
    backgroundColor: C.white,
    borderWidth: 1.5, borderColor: '#92400E',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  relatedSquadBtnText: { fontSize: 11, fontWeight: '700', color: '#92400E' },

  officialResp: {
    marginHorizontal: 14, marginBottom: 12, backgroundColor: C.greenLight,
    borderWidth: 1.5, borderColor: C.greenBorder, borderRadius: 12, padding: 12,
  },
  officialHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  officialLabel: { fontSize: 12, fontWeight: '700', color: C.green },
  resolvedBadge: { backgroundColor: C.green, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  resolvedText: { fontSize: 10, fontWeight: '700', color: C.white },
  officialText: { fontSize: 13, lineHeight: 20, color: C.gray700, textAlign: 'right' },

  /* Stats — pipe separated: N 🔥 | זעם: X/5 | N גם לי | N תגובות */
  stats: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 10, gap: 6,
    flexWrap: 'wrap',
  },
  statText: { fontSize: 12, color: C.gray500 },
  statSep: { fontSize: 12, color: C.gray300 },

  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.gray200 },
  actionWrap: { flex: 1 },
  actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, gap: 3 },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 10, fontWeight: '700', color: C.gray500 },
  actionLabelActive: { color: C.orange },
  actionLabelBoost: { color: C.red },
  actionDivider: { width: 1, backgroundColor: C.gray200, marginVertical: 6 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  boostPopup: {
    backgroundColor: C.white, borderRadius: 20, padding: 20,
    width: '90%', alignItems: 'center', gap: 16,
  },
  boostTitle: { fontSize: 16, fontWeight: '800', color: C.dark },
  boostRow: { flexDirection: 'row', gap: 12 },
  boostBtn: { alignItems: 'center', gap: 4 },
  boostLabel: { fontSize: 10, color: C.gray500 },

  menuPopup: {
    backgroundColor: C.white, borderRadius: 16, padding: 8,
    width: '82%', gap: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 10 },
  menuLabel: { fontSize: 15, color: C.dark },
});
