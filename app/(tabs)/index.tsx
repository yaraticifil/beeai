import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

const { width } = Dimensions.get("window");

function StatPill({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={16} color={Colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.pillValue}>{value}</Text>
        <Text style={styles.pillLabel}>{label}</Text>
      </View>
    </View>
  );
}

function ActionCard({
  title,
  sub,
  icon,
  onPress,
}: {
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

export default function PanelScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, checkDailySpins, getDailyPulse } = useUser();

  useEffect(() => {
    if (user) checkDailySpins();
  }, []);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user]);

  if (!user) return null;

  const pulse = getDailyPulse();

  const checksCount = user.checks?.length || 0;
  const activeReqs = (user.offerRequests || []).filter((r) => r.status === "collecting").length;
  const offersReady = (user.offerRequests || []).filter((r) => r.status === "ready").length;

  const topInset = Platform.OS === "web" ? 60 : insets.top;

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Kovan hesabınızdan çıkmak istiyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary, "#22c55e"]}
        style={[styles.header, { paddingTop: topInset + 14 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>🐝</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeText}>Kovan</Text>
              <Text style={styles.companyText} numberOfLines={1}>
                {user.companyName}
              </Text>
            </View>
          </View>

          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>

        <View style={styles.headerCards}>
          <View style={styles.headerCard}>
            <Text style={styles.headerCardLabel}>Bal Puanı</Text>
            <Text style={styles.headerCardValue}>{user.honeyPoints} 🍯</Text>
          </View>
          <View style={styles.headerCard}>
            <Text style={styles.headerCardLabel}>Piyasa Nabzı</Text>
            <Text style={styles.headerCardValue}>
              {pulse.mood === "sert" ? "Sert" : pulse.mood === "yumuşak" ? "Yumuşak" : "Normal"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kovan Durumu</Text>
          <View style={styles.pillRow}>
            <StatPill label="Çek" value={String(checksCount)} icon="document-text-outline" />
            <StatPill label="Toplanıyor" value={String(activeReqs)} icon="flash-outline" />
            <StatPill label="Hazır Teklif" value={String(offersReady)} icon="checkmark-circle-outline" />
          </View>

          <View style={styles.pulseNote}>
            <Text style={styles.pulseTitle}>Bugün Not</Text>
            <Text style={styles.pulseText}>{pulse.note}</Text>
            <Pressable onPress={() => router.push("/(tabs)/pulse")} style={styles.pulseBtn}>
              <Text style={styles.pulseBtnText}>Nabız Detayı</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arıların</Text>
          <View style={styles.beesGrid}>
            {(user.bees || []).map((b) => (
              <View key={b.id} style={styles.beeCard}>
                <Text style={styles.beeEmoji}>{b.emoji}</Text>
                <Text style={styles.beeName}>{b.name}</Text>
                <Text style={styles.beeMeta}>Seviye {b.level} • XP {b.xp}/100</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>

          <ActionCard
            title="Çek Yükle"
            sub="Fotoğraf/PDF veya manuel giriş"
            icon="cloud-upload-outline"
            onPress={() => router.push("/(tabs)/upload")}
          />
          <ActionCard
            title="15 Dakikada 3 Teklif"
            sub="Teklifleri topla, revize turu aç"
            icon="flash"
            onPress={() => router.push("/(tabs)/offers")}
          />
          <ActionCard
            title="ERP Entegrasyon"
            sub="Tiger • Mikro • Netsis (Pilot)"
            icon="link-outline"
            onPress={() => router.push("/(tabs)/integration")}
          />
          <ActionCard
            title="Pilot Labs"
            sub="Bereket modülleri (Çark/Bahçe/Mağaza)"
            icon="flask-outline"
            onPress={() => router.push("/labs")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarText: { fontSize: 22 },
  welcomeText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.85)" },
  companyText: { fontSize: 16, fontFamily: "Poppins_800ExtraBold", color: Colors.white },
  logoutBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.15)" },

  headerCards: { flexDirection: "row", gap: 10 },
  headerCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  headerCardLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.85)" },
  headerCardValue: { fontSize: 16, fontFamily: "Poppins_800ExtraBold", color: Colors.white, marginTop: 4 },

  scroll: { flex: 1, paddingHorizontal: 16, marginTop: 10 },
  section: { marginTop: 10, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 10 },

  pillRow: { flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pillValue: { fontSize: 14, fontFamily: "Poppins_800ExtraBold", color: Colors.text },
  pillLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textMuted },

  pulseNote: {
    marginTop: 12,
    backgroundColor: "rgba(245,158,11,0.10)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.18)",
  },
  pulseTitle: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.honeyDark, marginBottom: 6 },
  pulseText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  pulseBtn: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  pulseBtnText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.primary },

  beesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  beeCard: {
    width: (width - 16 * 2 - 10) / 2,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 4,
  },
  beeEmoji: { fontSize: 18 },
  beeName: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.text },
  beeMeta: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textMuted },

  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontSize: 14, fontFamily: "Poppins_700Bold", color: Colors.text },
  actionSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginTop: 2 },
});
