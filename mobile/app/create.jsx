import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated, Modal, Pressable,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from '../utils/haptics';
import { C } from '../constants/theme';
import { api } from '../utils/api';

// 4 steps matching design: category, content, radius, churn→submit
const TOTAL_STEPS = 4;

const CHURN_OPTIONS = [
  { label: 'כן, מיידית', value: 'immediate' },
  { label: 'בהתלבטות', value: 'considering' },
  { label: 'אין אלטרנטיבה', value: 'no_alternative' },
  { label: 'לא רלוונטי', value: 'na' },
];

const RADIUS_OPTIONS = ['אישי', 'משפחתי', 'קהילה / שכונה', 'יישוב / עיר', 'ארצי'];

/* RTL progress dots: step 0 = rightmost dot active, step 3 = leftmost */
function StepDots({ step }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const activeIndex = TOTAL_STEPS - 1 - step;
        return (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        );
      })}
    </View>
  );
}

/* Company picker dropdown — modal with radio list */
function CompanyPicker({ companies, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const selectedCo = companies.find(c => c.id === selected);

  return (
    <>
      <TouchableOpacity style={styles.pickerTrigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={styles.pickerChevron}>›</Text>
        <Text style={[styles.pickerText, !selected && styles.pickerPlaceholder]}>
          {selectedCo ? selectedCo.name : '-- בחר חברה --'}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.pickerOverlay} onPress={() => setOpen(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerSheetTitle}>בחר חברה</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {companies.map(co => (
                <TouchableOpacity
                  key={co.id}
                  style={styles.pickerOption}
                  onPress={() => { onSelect(co.id); setOpen(false); }}
                >
                  <View style={[styles.radioCircle, selected === co.id && styles.radioCircleActive]}>
                    {selected === co.id && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[
                    styles.pickerOptionText,
                    selected === co.id && { fontWeight: '700', color: C.dark },
                  ]}>
                    {co.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function CreateScreen() {
  const params = useLocalSearchParams();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCat, setSelectedCat] = useState(params.category_id ? Number(params.category_id) : null);
  const [selectedCompany, setSelectedCompany] = useState(params.company_id ? Number(params.company_id) : null);
  const [content, setContent] = useState('');
  const [radius, setRadius] = useState(null);
  const [churn, setChurn] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    api.get('/api/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCat) {
      api.get(`/api/companies?category_id=${selectedCat}`).then(setCompanies).catch(() => {});
    } else {
      setCompanies([]);
    }
  }, [selectedCat]);

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function handleNext() {
    if (step === 1 && content.trim().length < 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      shake();
      return;
    }
    if (step === 2) {
      // Simulate AI filtering
      setAiLoading(true);
      await new Promise(r => setTimeout(r, 1100));
      setAiLoading(false);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s + 1);
  }

  function handleBack() {
    if (step === 0) { router.back(); return; }
    setStep(s => s - 1);
  }

  async function handleSubmit() {
    if (!churn) return;
    setSubmitting(true);
    try {
      await api.post('/api/shouts', {
        content,
        anger_level: 3,
        category_id: selectedCat,
        company_id: selectedCompany,
        radius,
        churn_intent: churn,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/feed');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setSubmitting(false);
  }

  const selectedCompanyName = companies.find(c => c.id === selectedCompany)?.name || 'החברה';

  const canNext = [
    true,                          // 0: category optional
    content.trim().length >= 10,   // 1: content required
    !!radius,                      // 2: radius required
    !!churn,                       // 3: churn required
  ][step] ?? false;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>{step === 0 ? '✕' : '‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>יצירת צעקה</Text>
        <View style={{ width: 36 }} />
      </View>

      <StepDots step={step} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Step 0: Category + Company ─── */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>באיזה תחום מדובר?</Text>

            <View style={styles.catGrid}>
              {categories.filter(c => c.slug !== 'all').map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, selectedCat === cat.id && styles.catCardActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCat(cat.id);
                    setSelectedCompany(null);
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                  <Text style={[styles.catName, selectedCat === cat.id && styles.catNameActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedCat && (
              <View style={styles.companySection}>
                <Text style={styles.sectionLabel}>לבחירת חברה מהרשימה</Text>
                <CompanyPicker
                  companies={companies}
                  selected={selectedCompany}
                  onSelect={(id) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCompany(id);
                  }}
                />
              </View>
            )}
          </View>
        )}

        {/* ─── Step 1: Content + Proof ─── */}
        {step === 1 && (
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <Text style={styles.stepTitle}>
              {`מה הסיבה להפעלת הלחץ מול ${selectedCompanyName}?`}
            </Text>

            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              placeholder="תאר מה קרה, מתי ואיזה נזק נגרם לך..."
              placeholderTextColor={C.gray500}
              textAlign="right"
              textAlignVertical="top"
              value={content}
              onChangeText={t => setContent(t.slice(0, 200))}
              maxLength={200}
            />
            <Text style={styles.charCount}>{content.length}/200</Text>

            <TouchableOpacity style={styles.proofBtn}>
              <Text style={styles.proofBtnText}>צרף הוכחה</Text>
              <Text style={{ fontSize: 18 }}>🖼</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ─── Step 2: Impact Radius ─── */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>מהו מעגל ההשפעה של העוולה?</Text>
            <Text style={styles.stepSub}>באיזה היקף הנזק הצרכני משפיע?</Text>

            {RADIUS_OPTIONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.radioItem, radius === r && styles.radioItemActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRadius(r);
                }}
              >
                <View style={[styles.radioCircle, radius === r && styles.radioCircleActive]}>
                  {radius === r && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioLabel, radius === r && styles.radioLabelActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ─── Step 3: Churn → Submit ─── */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>
              {`בעקבות המקרה, האם בכוונתך לעזוב את ${selectedCompanyName}?`}
            </Text>

            {CHURN_OPTIONS.map(c => (
              <TouchableOpacity
                key={c.value}
                style={[styles.radioItem, churn === c.value && styles.radioItemActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setChurn(c.value);
                }}
              >
                <View style={[styles.radioCircle, churn === c.value && styles.radioCircleActive]}>
                  {churn === c.value && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioLabel, churn === c.value && styles.radioLabelActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step === 0 && (
          <TouchableOpacity
            style={[styles.nextBtn, !selectedCompany && styles.nextBtnDisabled]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>המשך</Text>
          </TouchableOpacity>
        )}

        {(step === 1 || step === 2) && (
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.nextBtn2} onPress={handleNext} disabled={!canNext || aiLoading}>
              <Text style={styles.nextBtnText}>
                {step === 2
                  ? (aiLoading ? '⏳ מסנן...' : '✨ סינון AI והמשך')
                  : 'המשך'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn2} onPress={handleBack}>
              <Text style={styles.backBtn2Text}>חזור</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.shoutBtn, (!churn || submitting) && styles.nextBtnDisabled]}
              onPress={handleSubmit}
              disabled={!churn || submitting}
              activeOpacity={0.85}
            >
              <Text style={styles.shoutBtnText}>
                {submitting ? '⏳ שולח...' : '📣  Shout'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn2} onPress={handleBack}>
              <Text style={styles.backBtn2Text}>חזור</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.gray200,
  },
  closeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 22, color: C.dark },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: C.dark },

  /* Step dots — RTL: step 0 = rightmost */
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.gray200 },
  dotActive: { backgroundColor: C.yellow, width: 28, borderRadius: 4 },

  scroll: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },

  stepTitle: {
    fontSize: 19, fontWeight: '900', color: C.dark,
    textAlign: 'right', marginBottom: 6, lineHeight: 28,
  },
  stepSub: {
    fontSize: 13, color: C.gray500, textAlign: 'right',
    marginBottom: 20, lineHeight: 20,
  },

  /* Category grid */
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  catCard: {
    width: '47%', padding: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.gray200,
    alignItems: 'center', gap: 8, backgroundColor: C.white,
  },
  catCardActive: { backgroundColor: '#FFFDE7', borderColor: C.yellow },
  catName: { fontSize: 12, fontWeight: '700', color: C.gray600, textAlign: 'center' },
  catNameActive: { color: C.black },

  /* Company picker */
  companySection: { marginTop: 22 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: C.dark, textAlign: 'right', marginBottom: 10 },
  pickerTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: C.gray200, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: C.white,
  },
  pickerText: { fontSize: 15, color: C.dark, flex: 1, textAlign: 'right' },
  pickerPlaceholder: { color: C.gray500 },
  pickerChevron: { fontSize: 18, color: C.gray500 },
  pickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '70%',
  },
  pickerSheetTitle: {
    fontSize: 17, fontWeight: '800', color: C.dark,
    textAlign: 'center', marginBottom: 16,
  },
  pickerOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.gray200,
  },
  pickerOptionText: { fontSize: 15, color: C.gray600, textAlign: 'right', flex: 1 },

  /* Content textarea */
  textArea: {
    backgroundColor: C.gray100, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.gray200,
    padding: 14, fontSize: 15, color: C.dark,
    minHeight: 150, lineHeight: 24,
  },
  charCount: { textAlign: 'left', fontSize: 11, color: C.gray500, marginTop: 6 },
  proofBtn: {
    marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: C.white,
    borderWidth: 1.5, borderColor: C.gray200, borderRadius: 12,
    paddingVertical: 14,
  },
  proofBtnText: { fontSize: 14, fontWeight: '700', color: C.dark },

  /* Radio list */
  radioItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.gray200,
    marginBottom: 8, backgroundColor: C.white,
  },
  radioItemActive: { borderColor: C.yellow, backgroundColor: '#FFFDE7' },
  radioCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: C.gray300,
    justifyContent: 'center', alignItems: 'center',
  },
  radioCircleActive: { borderColor: C.yellow },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.yellow },
  radioLabel: { fontSize: 15, color: C.gray500, flex: 1, textAlign: 'right' },
  radioLabelActive: { color: C.dark, fontWeight: '700' },

  /* Footer */
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1, borderTopColor: C.gray100,
    backgroundColor: C.white,
  },
  footerRow: { flexDirection: 'row', gap: 10 },

  /* Primary next button */
  nextBtn: {
    backgroundColor: C.yellow, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  nextBtn2: {
    flex: 2, backgroundColor: C.yellow, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.38 },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: C.black },

  /* Back button */
  backBtn2: {
    flex: 1, backgroundColor: C.white,
    borderWidth: 1.5, borderColor: C.gray200,
    borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  backBtn2Text: { fontSize: 16, fontWeight: '700', color: C.dark },

  /* Shout submit button — dark with yellow text */
  shoutBtn: {
    flex: 2, backgroundColor: C.dark, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  shoutBtnText: { fontSize: 16, fontWeight: '800', color: C.yellow },
});
