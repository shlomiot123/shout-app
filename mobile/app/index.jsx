import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Easing,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    ]).start(async () => {
      const welcomed = await AsyncStorage.getItem('shout_welcomed');
      router.replace(welcomed ? '/(tabs)/feed' : '/welcome');
    });
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

        {/* Feature pills */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            width: '100%', gap: 10, marginBottom: 24,
          }}
        >
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featurePill}>
              <Text style={{ fontSize: 20 }}>{f.icon}</Text>
              <Text style={styles.featurePillText}>{f.title}</Text>
            </View>
          ))}
        </Animated.View>

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
    lineHeight: 22, marginBottom: 20,
  },

  featurePill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.yellow,
    borderRadius: 50, paddingVertical: 12, paddingHorizontal: 18,
    width: '100%',
  },
  featurePillText: {
    fontSize: 14, fontWeight: '700', color: C.black,
    textAlign: 'right', flex: 1,
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
