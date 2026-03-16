import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export default function PulseScreen() {
  const insets = useSafeAreaInsets();
  const { user, getDailyPulse, setPulseMode } = useUser();

  const pulse = getDailyPulse();
  const mode = user?.settings?.pulseMode || "weather";

  const moodLabel = useMemo(() => {
    if (pulse.mood === "sert") return "Sert";
    if (pulse.mood === "yumuşak") return "Yumuşak";
    return "Normal";
  }, [pulse.mood]);

  return (
    <LinearGradient colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]} style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Piyasa Nabzı</Text>
        <Text style={styles.h2}>Göstergeyi saklarız; piyasayı konuştururuz. (Pilot)</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name="pulse" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Bugün</Text>
              <Text style={styles.date}>{pulse.date}</Text>
            </View>
            <View style={[styles.moodPill, pulse.mood === "sert" ? styles.moodHard : pulse.mood === "yumuşak" ? styles.moodSoft : styles.moodNormal]}>
              <Text style={styles.moodText}>{moodLabel}</Text>
            </View>
          </View>

          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setPulseMode("weather")}
              style={[styles.modeBtn, mode === "weather" && styles.modeBtnActive]}
            >
              <Ionicons name="cloud" size={16} color={mode === "weather" ? Colors.white : Colors.primary} />
              <Text style={[styles.modeText, mode === "weather" && styles.modeTextActive]}>Sayı Gizli</Text>
            </Pressable>

            <Pressable
              onPress={() => setPulseMode("band")}
              style={[styles.modeBtn, mode === "band" && styles.modeBtnActive]}
            >
              <Ionicons name="analytics" size={16} color={mode === "band" ? Colors.white : Colors.primary} />
              <Text style={[styles.modeText, mode === "band" && styles.modeTextActive]}>Band Göster</Text>
            </Pressable>
          </View>

          {mode === "weather" ? (
            <View style={styles.weatherBox}>
              <Text style={styles.weatherTitle}>Piyasa Havası</Text>
              <Text style={styles.weatherText}>
                {pulse.mood === "sert"
                  ? "Bugün piyasa sert. Teklifler daha seçici gelebilir."
                  : pulse.mood === "yumuşak"
                  ? "Bugün piyasa yumuşak. Revize turu güçlü çalışır."
                  : "Bugün piyasa dengeli. Evrak tam ise hızlı akış mümkün."}
              </Text>
            </View>
          ) : (
            <View style={styles.bandBox}>
              <Text style={styles.bandTitle}>90 Gün Vade Bandı</Text>
              <Text style={styles.bandValue}>
                %{pulse.band90.min}  –  %{pulse.band90.max}
              </Text>
              <Text style={styles.bandNote}>Not: Endeks niteliğindedir, bağlayıcı teklif değildir.</Text>
            </View>
          )}

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Pilot Notu</Text>
            <Text style={styles.noteText}>{pulse.note}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.footerText}>
            Bu veri BeeAI pilot ağından anonimleştirilmiş endeks olarak üretilir.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  h1: { fontSize: 20, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 6 },
  h2: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginBottom: 12, lineHeight: 18 },

  card: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 22, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder },

  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(34,197,94,0.12)", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.text },
  date: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textMuted, marginTop: 2 },

  moodPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  moodHard: { backgroundColor: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.18)" },
  moodSoft: { backgroundColor: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.18)" },
  moodNormal: { backgroundColor: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.18)" },
  moodText: { fontSize: 11, fontFamily: "Poppins_700Bold", color: Colors.text },

  modeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  modeBtn: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 12, borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: Colors.white },
  modeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.primary },
  modeTextActive: { color: Colors.white },

  weatherBox: { backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(34,197,94,0.14)", marginBottom: 12 },
  weatherTitle: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.primaryDark, marginBottom: 6 },
  weatherText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, lineHeight: 18 },

  bandBox: { backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(245,158,11,0.14)", marginBottom: 12 },
  bandTitle: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.honeyDark, marginBottom: 6 },
  bandValue: { fontSize: 18, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 4 },
  bandNote: { fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, lineHeight: 14 },

  noteBox: { backgroundColor: "rgba(20,83,45,0.06)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(20,83,45,0.10)" },
  noteTitle: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.text, marginBottom: 6 },
  noteText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, lineHeight: 18 },

  footer: { marginTop: 12, flexDirection: "row", gap: 8, alignItems: "center" },
  footerText: { fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, lineHeight: 14, flex: 1 },
});
