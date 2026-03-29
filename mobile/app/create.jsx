import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  Animated,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Haptics from '../utils/haptics';
import { C, shadow } from '../constants/theme';
import { api } from '../utils/api';

const ANGER_LEVELS = [
  { level: 1, emoji: '😤', label: 'קצת עצבני' },
  { level: 2, emoji: '😠', label: 'עצבני' },
  { level: 3, emoji: '😡', label: 'מאוד עצבני' },
  { level: 4, emoji: '🤬', label: 'כועס מאוד' },
  { level: 5, emoji: '💢', label: 'נפיצה!' },
];

const STEPS = ['כתיבה', 'קטגוריה', 'חברה'];

function StepIndicator({ step }) {
  return (
    <View style={styles.stepRow}>
      {STEPS.map((label, i) => (
        <View key={i} style={styles.stepItem}>
          <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
            <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>
              {i < step ? '✓' : i + 1}
            </Text>
          </View>
          <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CreateScreen() {
  const [step, setStep] = useState(0);
  const [content, setContent] = useState('');
  const [angerLevel, setAngerLevel] = useState(3);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    api.get('/api/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCat) {
      api.get(`/api/companies?category=${selectedCat}`).then(setCompanies).catch(() => {});
    }
  }, [selectedCat]);

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function next() {
    if (step === 0 && content.trim().length < 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      shake();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) { router.back(); return; }
    setStep((s) => s - 1);
  }

  async function submit() {
    setSubmitting(true);
    try {
      await api.post('/api/shouts', {
        content,
        anger_level: angerLevel,
        category_id: selectedCat,
        company_id: selectedCompany,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/feed');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setSubmitting(false);
  }

  const selectedAnger = ANGER_LEVELS.find((a) => a.level === angerLevel);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.backBtn}>
          <Text style={styles.backText}>{step === 0 ? '✕' : '‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>צעקה חדשה</Text>
        <View style={{ width: 40 }} />
      </View>

      <StepIndicator step={step} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step 0: Write */}
        {step === 0 && (
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <Text style={styles.stepTitle}>מה קרה לך?</Text>
            <Text style={styles.stepSub}>ספר לנו מה הרגיז אותך. כמה שיותר פרטים — כך הצעקה יותר אפקטיבית.</Text>

            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              placeholder="שפוך את הזעם שלך כאן... תאר מה קרה, מתי, ואיזה נזק נגרם לך."
              placeholderTextColor={C.gray400}
              textAlign="right"
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
              maxLength={1000}
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>

            <Text style={styles.sectionTitle}>רמת הזעם שלך</Text>
            <View style={styles.angerRow}>
              {ANGER_LEVELS.map((a) => (
                <TouchableOpacity
                  key={a.level}
                  style={[styles.angerBtn, angerLevel === a.level && styles.angerBtnActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAngerLevel(a.level);
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{a.emoji}</Text>
                  <Text style={[styles.angerLabel, angerLevel === a.level && styles.angerLabelActive]}>
                    {a.level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedAnger && (
              <Text style={styles.angerDesc}>{selectedAnger.emoji} {selectedAnger.label}</Text>
            )}
          </Animated.View>
        )}

        {/* Step 1: Category */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>באיזה תחום?</Text>
            <Text style={styles.stepSub}>בחר את הקטגוריה הרלוונטית לצעקה שלך.</Text>

            <View style={styles.catGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, selectedCat === cat.id && styles.catCardActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCat(cat.id);
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                  <Text style={[styles.catName, selectedCat === cat.id && styles.catNameActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Company */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>על מי אתה צועק?</Text>
            <Text style={styles.stepSub}>בחר את החברה — או דלג אם לא רלוונטי.</Text>

            <View style={styles.companyList}>
              {companies.map((co) => (
                <TouchableOpacity
                  key={co.id}
                  style={[styles.coItem, selectedCompany === co.id && styles.coItemActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCompany(co.id);
                  }}
                >
                  <View style={[styles.coIcon, selectedCompany === co.id && styles.coIconActive]}>
                    <Text style={{ fontSize: 20 }}>🏢</Text>
                  </View>
                  <Text style={[styles.coName, selectedCompany === co.id && { color: C.black, fontWeight: '800' }]}>
                    {co.name}
                  </Text>
                  {selectedCompany === co.id && (
                    <Text style={{ color: C.black, fontWeight: '700' }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}

              {companies.length === 0 && !selectedCat && (
                <Text style={styles.noCoText}>בחר קטגוריה כדי לראות חברות</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        {step < 2 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>
              {step === 0 ? 'הבא ›' : 'הבא ›'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, submitting && { opacity: 0.6 }]}
            onPress={submit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {submitting ? '⏳ שולח...' : '📣 צעק עכשיו!'}
            </Text>
          </TouchableOpacity>
        )}

        {step === 2 && !selectedCompany && (
          <TouchableOpacity style={styles.skipBtn} onPress={submit}>
            <Text style={styles.skipBtnText}>דלג על בחירת חברה</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.gray200,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backText: { fontSize: 24, color: C.dark, fontWeight: '400' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: C.dark },

  stepRow: {
    flexDirection: 'row', justifyContent: 'center',
    paddingVertical: 14, gap: 20,
    borderBottomWidth: 1, borderBottomColor: C.gray100,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: C.gray200,
    justifyContent: 'center', alignItems: 'center',
  },
  stepCircleActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  stepNum: { fontSize: 12, fontWeight: '700', color: C.gray400 },
  stepNumActive: { color: C.black },
  stepLabel: { fontSize: 10, color: C.gray400 },
  stepLabelActive: { color: C.dark, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  stepTitle: { fontSize: 20, fontWeight: '900', color: C.dark, textAlign: 'right', marginBottom: 6 },
  stepSub: { fontSize: 13, color: C.gray500, textAlign: 'right', marginBottom: 18, lineHeight: 20 },

  textArea: {
    backgroundColor: C.gray100,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.gray200,
    padding: 14, fontSize: 15, color: C.dark,
    minHeight: 160, lineHeight: 24,
  },
  charCount: { textAlign: 'left', fontSize: 11, color: C.gray400, marginTop: 6 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.dark, textAlign: 'right', marginTop: 20, marginBottom: 12 },

  angerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  angerBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.gray200,
    backgroundColor: C.white, gap: 4,
  },
  angerBtnActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  angerLabel: { fontSize: 11, fontWeight: '700', color: C.gray500 },
  angerLabelActive: { color: C.black },
  angerDesc: { textAlign: 'center', fontSize: 13, color: C.gray600, marginTop: 10 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '47%',
    padding: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.gray200,
    backgroundColor: C.white,
    alignItems: 'center', gap: 8,
  },
  catCardActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  catName: { fontSize: 13, fontWeight: '700', color: C.gray600, textAlign: 'center' },
  catNameActive: { color: C.black },

  companyList: { gap: 8 },
  coItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.gray200,
    backgroundColor: C.white,
  },
  coItemActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  coIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.gray100,
    justifyContent: 'center', alignItems: 'center',
  },
  coIconActive: { backgroundColor: 'rgba(0,0,0,0.1)' },
  coName: { flex: 1, fontSize: 15, fontWeight: '600', color: C.dark, textAlign: 'right' },
  noCoText: { textAlign: 'center', color: C.gray400, fontSize: 14, paddingVertical: 20 },

  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1, borderTopColor: C.gray100,
    gap: 10,
  },
  nextBtn: {
    backgroundColor: C.yellow,
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: C.black },
  skipBtn: { alignItems: 'center', paddingVertical: 6 },
  skipBtnText: { fontSize: 13, color: C.gray500, textDecoration: 'underline' },
});
