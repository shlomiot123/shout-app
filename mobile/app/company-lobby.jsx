import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { C, shadow } from '../constants/theme';
import { api } from '../utils/api';

const ANGER_COLOR = (s) => s >= 80 ? C.red : s >= 60 ? C.orange : s >= 40 ? C.yellow : C.green;

export default function CompanyLobby() {
  const { id, name } = useLocalSearchParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/companies/${id}`)
      .then(setCompany)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !company) {
    return <View style={styles.root}><Text style={styles.loadingText}>טוען...</Text></View>;
  }

  const ac = ANGER_COLOR(company.anger_score);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ חזור</Text>
        </TouchableOpacity>

        <View style={styles.heroTop}>
          <View style={[styles.logoCircle, { backgroundColor: ac + '18' }]}>
            <Text style={{ fontSize: 32 }}>{company.category_icon || '🏢'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{company.name}</Text>
            <Text style={styles.heroCat}>{company.category_name}</Text>
          </View>
          <View style={styles.angerBadge}>
            <Text style={[styles.angerScore, { color: ac }]}>{company.anger_score}</Text>
            <Text style={styles.angerLabel}>ציון זעם</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: '📣', val: company.total_shouts?.toLocaleString('he-IL'), lab: 'צעקות' },
            { icon: '💬', val: `${company.response_rate}%`, lab: 'מענה' },
            { icon: '✅', val: company.resolved_shouts?.toLocaleString('he-IL'), lab: 'נפתרו' },
          ].map((s) => (
            <View key={s.lab} style={styles.statItem}>
              <Text style={{ fontSize: 20 }}>{s.icon}</Text>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLab}>{s.lab}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.shoutBtn} onPress={() => router.push({ pathname: '/create', params: { company_id: id, company_name: company.name } })}>
          <Text style={styles.shoutBtnText}>📣 צעק על {company.name}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Active squads */}
        {company.squads?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ קבוצות לחץ פעילות ({company.squads.length})</Text>
            {company.squads.map((sq) => (
              <TouchableOpacity key={sq.id} style={styles.squadRow}
                onPress={() => router.push({ pathname: '/squad-lobby', params: { id: sq.id } })}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.squadName}>{sq.name}</Text>
                  <Text style={styles.squadMeta}>{sq.current_members?.toLocaleString('he-IL')} חברים · {sq.goal_description}</Text>
                </View>
                <Text style={{ fontSize: 18, color: C.gray300 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Top shouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📣 הצעקות המובילות</Text>
          {(company.shouts || []).slice(0, 5).map((sh) => (
            <View key={sh.id} style={styles.shoutRow}>
              <Text style={styles.shoutContent} numberOfLines={2}>{sh.content}</Text>
              <View style={styles.shoutMeta}>
                <Text style={styles.shoutStat}>☝️ {sh.echoes?.toLocaleString('he-IL')}</Text>
                <Text style={styles.shoutTime}>{sh.time_ago}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray100 },
  loadingText: { textAlign: 'center', marginTop: 60, color: C.gray500 },
  hero: { backgroundColor: C.white, padding: 20, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  backBtn: { marginBottom: 14 },
  backText: { fontSize: 16, fontWeight: '600', color: C.dark },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  logoCircle: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  heroName: { fontSize: 20, fontWeight: '900', color: C.dark, textAlign: 'right' },
  heroCat: { fontSize: 12, color: C.gray500, textAlign: 'right', marginTop: 3 },
  angerBadge: { alignItems: 'center' },
  angerScore: { fontSize: 28, fontWeight: '900' },
  angerLabel: { fontSize: 10, color: C.gray500 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  statItem: { alignItems: 'center', gap: 3 },
  statVal: { fontSize: 16, fontWeight: '800', color: C.dark },
  statLab: { fontSize: 10, color: C.gray500 },
  shoutBtn: { backgroundColor: C.yellow, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  shoutBtnText: { fontSize: 15, fontWeight: '800', color: C.black },
  section: { margin: 12, marginBottom: 0 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: C.dark, textAlign: 'right', marginBottom: 8 },
  squadRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 6,
    borderWidth: 1.5, borderColor: C.gray200,
  },
  squadName: { fontSize: 14, fontWeight: '700', color: C.dark, textAlign: 'right' },
  squadMeta: { fontSize: 11, color: C.gray500, textAlign: 'right', marginTop: 3 },
  shoutRow: {
    backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 6,
    borderWidth: 1.5, borderColor: C.gray200,
  },
  shoutContent: { fontSize: 13, color: C.dark, textAlign: 'right', lineHeight: 20, marginBottom: 8 },
  shoutMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  shoutStat: { fontSize: 12, color: C.orange, fontWeight: '700' },
  shoutTime: { fontSize: 11, color: C.gray400 },
});
