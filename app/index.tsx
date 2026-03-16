import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { GlassCard } from "@/components/GlassCard";

const { width, height } = Dimensions.get("window");

const STEPS = [
  {
    badge: "MODERN KOVAN",
    title: "Dijital Merkezin Senin Emrinde.",
    text: "BeeAI’de her kullanıcıya premium bir kovan tahsis edilir. Finans dünyasındaki otonom üssüne hoş geldin.",
    emoji: "🏛️",
  },
  {
    badge: "BEE AGENTS",
    title: "Hibrit Zeka ile Otonom Gelecek.",
    text: "Arıların sadece yapay zeka değil, senin için veriyi toplayan ve pazarlık yapan otonom ajanlardır.",
    emoji: "🐝",
  },
  {
    badge: "PİYASA NABZI",
    title: "+40 Faktoring Ağından Canlı Veri.",
    text: "Piyasa nabzını anlık takip et, 15 dakikada en iyi teklifleri topla. Güç senin elinde.",
    emoji: "⚡",
  },
];

export default function Entry() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useUser();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/(tabs)");
    }
  }, [isLoading, user]);

  const goNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else router.push("/(auth)/login");
  };

  const goLogin = () => router.push("/(auth)/login");

  if (isLoading || user) return null;

  const current = STEPS[step];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Mesh Gradient Circles */}
      <View style={[styles.meshCircle, { top: -100, left: -50, backgroundColor: 'rgba(34,197,94,0.15)' }]} />
      <View style={[styles.meshCircle, { bottom: -100, right: -50, backgroundColor: 'rgba(251,191,36,0.1)' }]} />

      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <Text style={styles.logoBee}>🐝</Text>
            <Text style={styles.logoText}>BeeAI</Text>
          </View>
          <Pressable onPress={goLogin} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Giriş Yap</Text>
          </Pressable>
        </View>

        <View style={styles.stepContainer}>
          <Animated.View 
            key={step} 
            entering={SlideInRight.springify()} 
            exiting={SlideOutLeft.springify()}
            style={styles.animatedStep}
          >
             <Text style={styles.mainEmoji}>{current.emoji}</Text>
             
             <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{current.badge}</Text>
             </View>

             <Text style={styles.titleText}>{current.title}</Text>
             <Text style={styles.bodyText}>{current.text}</Text>
          </Animated.View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]} onPress={goNext}>
            <Text style={styles.primaryBtnText}>{step < STEPS.length - 1 ? "Sonraki" : "Kovanı Başlat"}</Text>
            <Text style={styles.primaryBtnIcon}>→</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Pilot sürümü. Veriler ve teklifler gerçek zamanlı simüle edilir.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate },
  meshCircle: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.6,
  },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 + (Platform.OS === 'ios' ? 44 : 20) },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBee: { fontSize: 24 },
  logoText: { fontSize: 20, fontFamily: 'Poppins_800ExtraBold', color: Colors.white },
  loginLink: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 },
  loginLinkText: { color: Colors.gold, fontFamily: 'Poppins_700Bold', fontSize: 13 },

  stepContainer: { flex: 1, justifyContent: 'center' },
  animatedStep: { alignItems: 'flex-start' },
  mainEmoji: { fontSize: 64, marginBottom: 20 },
  badgeContainer: { backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' },
  badgeText: { color: Colors.gold, fontSize: 11, fontFamily: 'Poppins_700Bold', letterSpacing: 1 },
  titleText: { fontSize: 28, fontFamily: 'Poppins_800ExtraBold', color: Colors.white, marginBottom: 12, lineHeight: 36 },
  bodyText: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', lineHeight: 24 },

  bottomSection: { paddingBottom: 40 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 24, backgroundColor: Colors.gold },
  primaryBtn: { backgroundColor: Colors.gold, borderRadius: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  primaryBtnText: { color: Colors.slate, fontSize: 16, fontFamily: 'Poppins_800ExtraBold' },
  primaryBtnIcon: { fontSize: 18, color: Colors.slate, fontWeight: 'bold' },
  footerNote: { marginTop: 16, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins_400Regular' },
});
