import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { GlassCard } from "@/components/GlassCard";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useUser();
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const companyRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!companyName.trim() || !phoneNumber.trim()) {
      setError("Tüm alanları doldurunuz.");
      shake();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      setError("Geçerli bir telefon numarası giriniz.");
      shake();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setError("");
      setLoading(true);
      await login(companyName.trim(), phoneNumber.trim());
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch {
      setError("Bir hata oluştu. Tekrar deneyiniz.");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={[styles.meshCircle, { top: -50, right: -100, backgroundColor: 'rgba(251,191,36,0.1)' }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </Pressable>

          <View style={styles.header}>
            <Image
              source={require("@/assets/images/greeting.png")}
              style={styles.heroImage}
              contentFit="cover"
              transition={500}
            />
            <View style={styles.logoBadge}>
               <Text style={styles.bee}>🐝</Text>
            </View>
            <Text style={styles.title}>Hoş Geldin</Text>
            <Text style={styles.subtitle}>
              Kovan kapılarını senin için açıyoruz
            </Text>
          </View>

          <GlassCard style={styles.offerCard} intensity={20}>
              <View style={styles.offerRow}>
                <View style={styles.jarContainer}>
                   <Text style={styles.offerJar}>🍯</Text>
                </View>
                <View style={styles.offerContent}>
                  <View style={styles.offerTitleRow}>
                    <Text style={styles.offerTitle}>Pilot Özel Limit</Text>
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerBadgeText}>AKTİF</Text>
                    </View>
                  </View>
                  <Text style={styles.offerAmount}>₺500k+</Text>
                  <Text style={styles.offerSub}>AI ajanları ile anında sorgulama</Text>
                </View>
              </View>
          </GlassCard>

          <Animated.View
            style={[
              styles.form,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Firma Adı</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="business"
                  size={20}
                  color={Colors.gold}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={companyRef}
                  style={styles.input}
                  placeholder="Firma adınızı giriniz"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={companyName}
                  onChangeText={(t) => { setCompanyName(t); setError(""); }}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon Numarası</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call"
                  size={20}
                  color={Colors.gold}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={phoneRef}
                  style={styles.input}
                  placeholder="05XX XXX XX XX"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={phoneNumber}
                  onChangeText={(t) => { setPhoneNumber(t); setError(""); }}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.loginBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
                {loading ? (
                  <ActivityIndicator color={Colors.slate} />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.loginText}>Giriş Yap</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.slate} />
                  </View>
                )}
            </Pressable>
          </Animated.View>

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.footerText}>Kovan Güvenliği ile Korunuyor</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate },
  meshCircle: { position: "absolute", width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, opacity: 0.5 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  header: { alignItems: "flex-start", marginBottom: 32 },
  heroImage: {
    width: "100%",
    height: 180,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  logoBadge: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bee: { fontSize: 32 },
  title: { fontSize: 32, fontFamily: "Poppins_800ExtraBold", color: Colors.white, marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },

  offerCard: { marginBottom: 32 },
  offerRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  jarContainer: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(251, 191, 36, 0.1)', alignItems: 'center', justifyContent: 'center' },
  offerJar: { fontSize: 32 },
  offerContent: { flex: 1 },
  offerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  offerTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.9)" },
  offerBadge: { backgroundColor: Colors.gold, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  offerBadgeText: { fontSize: 8, fontFamily: "Poppins_800ExtraBold", color: Colors.slate },
  offerAmount: { fontSize: 24, fontFamily: "Poppins_800ExtraBold", color: Colors.gold, marginBottom: 2 },
  offerSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },

  form: { gap: 20, marginBottom: 32 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.8)", marginLeft: 4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    gap: 12,
  },
  inputIcon: { opacity: 0.9 },
  input: { flex: 1, height: 56, fontSize: 15, fontFamily: "Poppins_400Regular", color: Colors.white },

  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 12, padding: 14 },
  errorText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.danger },

  loginBtn: { backgroundColor: Colors.gold, borderRadius: 20, height: 60, justifyContent: "center", alignItems: "center" },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginText: { fontSize: 16, fontFamily: "Poppins_800ExtraBold", color: Colors.slate },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 },
  footerText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.4)" },
});
