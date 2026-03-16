import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

const { width, height } = Dimensions.get("window");

const STEPS = [
  {
    badge: "KOVAN",
    title: "Sana bir kovan verdik.",
    text:
      "BeeAI’de her kullanıcıya bir kovan tahsis edilir. Bu kovan, finans dünyasında senin adına çalışan kişisel üssündür.",
    emoji: "🏛️🐝",
  },
  {
    badge: "BEBEK ARILAR",
    title: "Büyüttükçe enstrümana dönüşür.",
    text:
      "Kovana bebek arılar bıraktık. Tıpkı çocukluğumuzun sanal bebekleri gibi besleyip büyütürsün. Büyüdükçe finansal bir aracı enstrüman olur.",
    emoji: "🍼🐝",
  },
  {
    badge: "HİBRİT ZEKA",
    title: "+40 faktoring ağından veri toplar.",
    text:
      "Arılar yapay zekâ değil; hibrit, otonom ajanlardır. Veriyi toplar, anlamlandırır, teklifleri koşturur. Senin gözün, kulağın, iş bitiricin olur.",
    emoji: "🧠⚡",
  },
];

export default function Entry() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useUser();

  const [step, setStep] = useState(0);

  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [step]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/(tabs)");
    }
  }, [isLoading, user]);

  const current = STEPS[step];

  const goNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else router.push("/(auth)/login");
  };

  const goLogin = () => router.push("/(auth)/login");

  if (isLoading) return null;
  if (user) return null;

  return (
    <LinearGradient
      colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Text style={styles.logoBee}>🐝</Text>
          <Text style={styles.logoText}>BeeAI</Text>
        </View>
        <Pressable onPress={goLogin} hitSlop={10}>
          <Text style={styles.skipText}>Giriş</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <Text style={styles.emoji}>{current.emoji}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{current.badge}</Text>
        </View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.text}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]} onPress={goNext}>
          <Text style={styles.btnText}>{step < STEPS.length - 1 ? "Devam" : "Kovanımı Kur"}</Text>
          <Text style={styles.btnArrow}>→</Text>
        </Pressable>

        <Text style={styles.legal}>
          Pilot kapsamında bazı hizmetler seçili iş ortaklarıyla sunulur. Sonuçlar veri ve yanıt hızına göre değişebilir.
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgCircle1: {
    position: "absolute",
    top: -height * 0.1,
    left: -width * 0.12,
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: width * 0.325,
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  bgCircle2: {
    position: "absolute",
    bottom: -height * 0.12,
    right: -width * 0.12,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: "rgba(245,158,11,0.10)",
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBee: { fontSize: 22 },
  logoText: { fontSize: 18, fontFamily: "Poppins_800ExtraBold", color: Colors.primaryDark },
  skipText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.primary },
  card: {
    marginTop: 18,
    marginHorizontal: 18,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  emoji: { fontSize: 42, marginBottom: 10 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245,158,11,0.14)",
    borderColor: "rgba(245,158,11,0.22)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeText: { fontSize: 11, fontFamily: "Poppins_700Bold", color: Colors.honeyDark, letterSpacing: 0.5 },
  title: { fontSize: 18, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 8 },
  body: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, lineHeight: 19, marginBottom: 14 },
  dots: { flexDirection: "row", gap: 6, marginBottom: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(20,83,45,0.18)" },
  dotActive: { backgroundColor: Colors.primary },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnText: { fontSize: 14, fontFamily: "Poppins_700Bold", color: Colors.white },
  btnArrow: { fontSize: 16, fontFamily: "Poppins_800ExtraBold", color: Colors.white },
  legal: { marginTop: 12, fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, lineHeight: 14 },
});
