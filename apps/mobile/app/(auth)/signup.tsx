import React, { useState, useRef, useEffect } from "react";
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
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { GlassCard } from "@/components/GlassCard";

const { width } = Dimensions.get("window");

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const analysisTexts = [
    "Kovan Bağlantısı Kuruluyor...",
    "Kraliçe Arı Analiz Ediyor...",
    "Güven Protokolü Doğrulanıyor...",
    "Kovan Girişi Onaylanıyor..."
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setAnalysisStep((prev) => (prev + 1) % analysisTexts.length);
      }, 1500);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      return () => clearInterval(interval);
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSignup = async () => {
    if (!fullName.trim() || !companyName.trim() || !phoneNumber.trim() || !email.trim()) {
      setError("Lütfen tüm alanları doldurunuz.");
      shake();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!agreed) {
      setError("Lütfen KVKK ve Gizlilik sözleşmesini onaylayınız.");
      shake();
      return;
    }

    try {
      setError("");
      setLoading(true);
      // Simulating the "Trust Protocol" analysis
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e) {
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
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
            <Animated.View style={[styles.logoBadge, loading && { transform: [{ scale: pulseAnim }] }]}>
               <Text style={styles.bee}>{loading ? "👑" : "🐝"}</Text>
            </Animated.View>
            <Text style={styles.title}>{loading ? "Analiz Ediliyor" : "Kovana Katıl"}</Text>
            <Text style={styles.subtitle}>
              {loading ? analysisTexts[analysisStep] : "BEEAI ekosistemine ilk adımı at"}
            </Text>
          </View>

          {!loading && (
            <Animated.View
              style={[
                styles.form,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ad Soyad</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color={Colors.gold} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adınızı ve soyadınızı giriniz"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={fullName}
                    onChangeText={(t) => { setFullName(t); setError(""); }}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Firma Adı</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="business" size={20} color={Colors.gold} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Firma adınızı giriniz"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={companyName}
                    onChangeText={(t) => { setCompanyName(t); setError(""); }}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-posta</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail" size={20} color={Colors.gold} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="E-posta adresinizi giriniz"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(""); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefon Numarası</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call" size={20} color={Colors.gold} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="05XX XXX XX XX"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={phoneNumber}
                    onChangeText={(t) => { setPhoneNumber(t); setError(""); }}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <Pressable 
                style={styles.checkboxRow} 
                onPress={() => setAgreed(!agreed)}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Ionicons name="checkmark" size={12} color={Colors.slate} />}
                </View>
                <Text style={styles.checkboxText}>
                  <Text style={styles.linkText}>KVKK</Text> ve <Text style={styles.linkText}>Gizlilik Politikası</Text>'nı okudum, onaylıyorum.
                </Text>
              </Pressable>

              {!!error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.signupBtn,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleSignup}
              >
                <View style={styles.btnContent}>
                  <Text style={styles.signupText}>Protokolü Başlat</Text>
                  <Ionicons name="shield-checkmark" size={20} color={Colors.slate} />
                </View>
              </Pressable>
            </Animated.View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.gold} />
              <GlassCard style={styles.analysisCard}>
                 <Text style={styles.analysisDetail}>
                   Verileriniz uçtan uca şifreleniyor ve Kraliçe Arı'nın nöro-ağına güvenli bir şekilde aktarılıyor.
                 </Text>
              </GlassCard>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten bir kovana dahil misin?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.footerText, { color: Colors.gold, fontFamily: 'Poppins_700Bold' }]}> Giriş Yap</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate },
  meshCircle: { position: "absolute", width: 300, height: 300, borderRadius: 150, opacity: 0.5 },
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
  header: { alignItems: "center", marginBottom: 32 },
  logoBadge: { width: 80, height: 80, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bee: { fontSize: 40 },
  title: { fontSize: 28, fontFamily: "Poppins_800ExtraBold", color: Colors.white, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", textAlign: 'center' },
  
  form: { gap: 16, marginBottom: 32 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.8)", marginLeft: 4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    gap: 12,
  },
  inputIcon: { opacity: 0.8 },
  input: { flex: 1, height: 52, fontSize: 14, fontFamily: "Poppins_400Regular", color: Colors.white },
  
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, marginTop: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  checkboxText: { flex: 1, fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", lineHeight: 16 },
  linkText: { color: Colors.gold, textDecorationLine: 'underline' },

  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 12, padding: 12 },
  errorText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.danger },

  signupBtn: { backgroundColor: Colors.gold, borderRadius: 18, height: 56, justifyContent: "center", alignItems: "center", marginTop: 10 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  signupText: { fontSize: 15, fontFamily: "Poppins_800ExtraBold", color: Colors.slate },

  loadingContainer: { alignItems: 'center', gap: 24, marginTop: 40 },
  analysisCard: { padding: 20, width: '100%' },
  analysisDetail: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.7)", textAlign: 'center', lineHeight: 20 },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20 },
  footerText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
});
