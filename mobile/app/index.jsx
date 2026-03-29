import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Easing,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../constants/theme';

const FEATURES = [
  {
    icon: '📣',
    title: 'לצעוק – לשתף את מה שמציק לך',
    sub: 'פרסם את הצעקה שלך ותן לכולם לראות',
  },
  {
    icon: '⚡',
    title: 'להתארגן – לצבור כח ביחד ולנקוט פעולה',
    sub: 'הצטרף לקבוצות לחץ ויצור שינוי אמיתי',
  },
  {
    icon: '👁',
    title: 'להשפיע – ליצור קבוצת לחץ שתחייב תגובה',
    sub: 'מדד הבושה שם תאגידים במקום שלהם',
  },
];

export default function Landing() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function pressCta() {
    Animated.sequence([
      Animated.timing(ctaScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(ctaScale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start(() => router.replace('/(tabs)/feed'));
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" backgroundColor={C.yellow} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.logoCircle}>
          <Text style={{ fontSize: 22 }}>📣</Text>
        </View>
        <Text style={styles.logoText}>Shout</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.tagline}>האפליקציה לצרכנים</Text>
          <Text style={styles.headline}>
            כל קול{'\n'}
            <Text style={styles.headlineAccent}>נחשב.</Text>
          </Text>
          <Text style={styles.sub}>
            האפליקציה שצוברת את הקולות הבודדים{'\n'}
            והופכת אותם לכוח צרכני משפיע
          </Text>
        </Animated.View>

        {/* Feature cards */}
        {FEATURES.map((f, i) => (
          <Animated.View
            key={i}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={{ fontSize: 24 }}>{f.icon}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale: ctaScale }], marginTop: 8 }}>
          <TouchableOpacity style={styles.cta} onPress={pressCta} activeOpacity={0.9}>
            <Text style={styles.ctaText}>📣  I want to Shout</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.memberCount}>
          כבר <Text style={{ color: C.orange, fontWeight: '700' }}>47,000+</Text> צרכנים פעילים
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },

  topBar: {
    backgroundColor: C.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logoCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoText: { fontSize: 22, fontWeight: '900', color: C.black },

  body: {
    paddingHorizontal: 20,
    paddingTop: 36,
    alignItems: 'center',
  },

  tagline: {
    fontSize: 13, fontWeight: '600', color: C.gray500,
    marginBottom: 6, textAlign: 'center',
  },
  headline: {
    fontSize: 46, fontWeight: '900', color: C.black,
    letterSpacing: -1.5, textAlign: 'center', lineHeight: 52,
    marginBottom: 14,
  },
  headlineAccent: { color: C.yellow },
  sub: {
    fontSize: 15, color: C.gray500, textAlign: 'center',
    lineHeight: 22, marginBottom: 28,
  },

  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.gray50,
    borderWidth: 1.5, borderColor: C.gray200,
    borderRadius: 16, padding: 14,
    marginBottom: 10, width: '100%',
  },
  featureIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.yellow,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1, alignItems: 'flex-end' },
  featureTitle: {
    fontSize: 13.5, fontWeight: '700', color: C.dark,
    textAlign: 'right', marginBottom: 3,
  },
  featureSub: {
    fontSize: 12, color: C.gray500, textAlign: 'right', lineHeight: 17,
  },

  cta: {
    backgroundColor: C.black, borderRadius: 16,
    paddingVertical: 17, paddingHorizontal: 24,
    alignItems: 'center', width: '100%',
  },
  ctaText: { color: C.white, fontSize: 17, fontWeight: '800' },

  memberCount: {
    marginTop: 14, fontSize: 13, color: C.gray500, textAlign: 'center',
  },
});
