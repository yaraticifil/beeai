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
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      setError("Geçerli bir telefon numarası giriniz.");
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setError("");
      setLoading(true);
      await login(companyName.trim(), phoneNumber.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e) {
      setError("Bir hata oluştu. Tekrar deneyiniz.");
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.bee}>🐝</Text>
            <Text style={styles.title}>Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>
              Kovan hesabınıza giriş yapın
            </Text>
          </View>

          <View style={styles.offerCard}>
            <LinearGradient
              colors={["rgba(245,158,11,0.12)", "rgba(34,197,94,0.08)"]}
              style={styles.offerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.offerRow}>
                <Text style={styles.offerJar}>🍯</Text>
                <View style={styles.offerContent}>
                  <View style={styles.offerTitleRow}>
                    <Text style={styles.offerTitle}>Hazır Limit Fırsatı!</Text>
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerBadgeText}>HAZIR</Text>
                    </View>
                  </View>
                  <Text style={styles.offerAmount}>₺500,000</Text>
                  <Text style={styles.offerSub}>⚡ AI ile %4+ iskonto garantisi</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

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
                  name="business-outline"
                  size={20}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={companyRef}
                  style={styles.input}
                  placeholder="Firma adınızı giriniz"
                  placeholderTextColor={Colors.textMuted}
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
                  name="call-outline"
                  size={20}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={phoneRef}
                  style={styles.input}
                  placeholder="05XX XXX XX XX"
                  placeholderTextColor={Colors.textMuted}
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
                pressed && styles.loginBtnPressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.loginGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.loginText}>Giriş Yap</Text>
                    <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.textMuted} />
            <Text style={styles.footerText}>256-bit SSL ile güvence altında</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 28,
  },
  bee: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
  },
  offerCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
    shadowColor: Colors.honey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  offerGradient: {
    padding: 18,
    backgroundColor: Colors.white,
  },
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  offerJar: {
    fontSize: 44,
  },
  offerContent: {
    flex: 1,
  },
  offerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.text,
  },
  offerBadge: {
    backgroundColor: Colors.honey,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  offerBadgeText: {
    fontSize: 9,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  offerAmount: {
    fontSize: 24,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.primary,
    marginBottom: 3,
  },
  offerSub: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.text,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.text,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.danger,
  },
  loginBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnPressed: {
    opacity: 0.9,
  },
  loginGradient: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loginText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
  },
});
