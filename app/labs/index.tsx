import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

function LabCard({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={handlePress}>
      <View style={styles.cardRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSub}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function LabsHome() {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]} style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>🐝 Pilot Labs</Text>
        <Text style={styles.h2}>
          Bereket modülleri burada. Ana akış kurumsal, burası deney alanı.
        </Text>

        <LabCard
          title="Çark"
          subtitle="Günlük hak, ödül ve bonuslar"
          icon="disc"
          onPress={() => router.push("/labs/wheel")}
        />
        <LabCard
          title="Bahçe"
          subtitle="Tohum, hasat ve bal üretimi"
          icon="leaf"
          onPress={() => router.push("/labs/garden")}
        />
        <LabCard
          title="Mağaza"
          subtitle="Pilot avantajlar ve paketler"
          icon="bag"
          onPress={() => router.push("/labs/shop")}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  h1: { fontSize: 22, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 6 },
  h2: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  card: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 10 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(34,197,94,0.12)", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", color: Colors.text },
  cardSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginTop: 2 },
});
