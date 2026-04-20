import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../constants/theme';

/* Social Login Screen */
function LoginScreen({ type, onBack }) {
  const [loading, setLoading] = useState(false);

  async function handleLogin(provider) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate OAuth
    await AsyncStorage.setItem('shout_welcomed', '1');
    router.replace('/(tabs)/feed');
  }

  return (
    <View style={styles.loginRoot}>
      <TouchableOpacity onPress={onBack} style={styles.loginBack}>
        <Text style={styles.loginBackText}>‹ חזור</Text>
      </TouchableOpacity>
      <Text style={styles.loginTitle}>{type === 'b2c' ? 'הצטרפות ל-Shout' : 'כניסת נציגות תאגיד'}</Text>
      <Text style={styles.loginSub}>
        {type === 'b2c' ? 'התחבר בצורה מאובטחת עם חשבון קיים' : 'גישה מאובטחת לנציגי חברות בלבד'}
      </Text>

      {type === 'b2c' ? (
        <View style={styles.socialBtns}>
          {[
            { name: 'Google', icon: '🔵', bg: '#fff', border: '#ddd', text: '#333' },
            { name: 'Apple', icon: '⚫', bg: '#000', border: '#000', text: '#fff' },
            { name: 'Facebook', icon: '🔷', bg: '#1877F2', border: '#1877F2', text: '#fff' },
          ].map((p) => (
            <TouchableOpacity key={p.name} style={[styles.socialBtn, { backgroundColor: p.bg, borderColor: p.border }]}
              onPress={() => handleLogin(p.name)} disabled={loading}>
              <Text style={{ fontSize: 20 }}>{p.icon}</Text>
              <Text style={[styles.socialBtnText, { color: p.text }]}>
                {loading ? 'מתחבר...' : `המשך עם ${p.name}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.b2bForm}>
          <View style={styles.b2bField}>
            <Text style={styles.b2bLabel}>מזהה חברה (ח.פ)</Text>
            <Text style={styles.b2bInput}>•••••••••</Text>
          </View>
          <View style={styles.b2bField}>
            <Text style={styles.b2bLabel}>קוד נציג אישי</Text>
            <Text style={styles.b2bInput}>••••••</Text>
          </View>
          <TouchableOpacity style={styles.b2bBtn} onPress={() => handleLogin('b2b')}>
            <Text style={styles.b2bBtnText}>כניסה למערכת</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* Main Welcome Screen */
export default function WelcomeScreen() {
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'b2c' | 'b2b'
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  if (screen !== 'welcome') {
    return <LoginScreen type={screen} onBack={() => setScreen('welcome')} />;
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>📣</Text>
          <Text style={styles.logoText}>Shout</Text>
          <Text style={styles.logoTagline}>כל קול נחשב</Text>
        </View>

        <Text style={styles.desc}>
          הפלטפורמה שצוברת את הקולות הבודדים והופכת אותם לקבוצת לחץ וכוח חברתי-צרכני משפיע.
        </Text>

        {/* 3 features */}
        <View style={styles.features}>
          {[
            { icon: '📢', text: 'לצעוק — שתף את העולם במה שמכעיס אותך' },
            { icon: '🛡️', text: 'להתארגן — צור והצטרף לקבוצות לחץ' },
            { icon: '📊', text: 'להשפיע — נתונים שתאגידים לא יוכלו להתעלם מהם' },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={{ fontSize: 22 }}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <TouchableOpacity style={styles.joinBtn} onPress={() => setScreen('b2c')} activeOpacity={0.85}>
          <Text style={styles.joinBtnText}>אני רוצה להצטרף ל-Shout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.b2bLink} onPress={() => setScreen('b2b')}>
          <Text style={styles.b2bLinkText}>כניסת נציגות תאגיד</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.black, justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 56 },
  logoText: { fontSize: 48, fontWeight: '900', color: C.yellow, letterSpacing: -1 },
  logoTagline: { fontSize: 16, color: '#aaa', marginTop: 4 },
  desc: { fontSize: 15, color: '#ccc', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  features: { gap: 16, marginBottom: 40 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  featureText: { flex: 1, fontSize: 14, color: '#ddd', lineHeight: 22, textAlign: 'right' },
  joinBtn: { backgroundColor: C.yellow, borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginBottom: 16 },
  joinBtnText: { fontSize: 17, fontWeight: '900', color: C.black },
  b2bLink: { alignItems: 'center', paddingVertical: 10 },
  b2bLinkText: { fontSize: 14, color: '#888' },

  /* Login */
  loginRoot: { flex: 1, backgroundColor: C.white, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 24 },
  loginBack: { marginBottom: 24 },
  loginBackText: { fontSize: 16, color: C.dark },
  loginTitle: { fontSize: 24, fontWeight: '900', color: C.dark, textAlign: 'right', marginBottom: 8 },
  loginSub: { fontSize: 14, color: C.gray500, textAlign: 'right', marginBottom: 32, lineHeight: 22 },
  socialBtns: { gap: 12 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderRadius: 14, padding: 16 },
  socialBtnText: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'right' },
  b2bForm: { gap: 14 },
  b2bField: { backgroundColor: C.gray100, borderRadius: 12, padding: 14 },
  b2bLabel: { fontSize: 11, color: C.gray500, textAlign: 'right', marginBottom: 6 },
  b2bInput: { fontSize: 16, color: C.dark, textAlign: 'right', letterSpacing: 4 },
  b2bBtn: { backgroundColor: '#1E40AF', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  b2bBtnText: { fontSize: 16, fontWeight: '800', color: C.white },
});
