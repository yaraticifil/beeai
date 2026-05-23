import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { GlassCard } from "@/components/GlassCard";
import { haptics } from "@/shared/utils/haptics";

function ActivityItem({
  message,
  time,
  type,
  index
}: {
  message: string;
  time: number;
  type: string;
  index: number
}) {
  const getIcon = () => {
    switch (type) {
      case "check_add": return "document-attach";
      case "offer_start": return "time";
      case "pick_offer": return "checkmark-circle";
      case "revision": return "swap-horizontal";
      case "level_up": return "trending-up";
      case "xp_gain": return "flash";
      default: return "notifications";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "pick_offer": return Colors.primary;
      case "check_add": return Colors.gold;
      case "revision": return "#8b5cf6";
      default: return Colors.slate;
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).springify()}>
      <GlassCard style={styles.activityCard}>
        <View style={styles.activityRow}>
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + "15" }]}>
            <Ionicons name={getIcon() as any} size={20} color={getIconColor()} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityMessage}>{message}</Text>
            <Text style={styles.activityTime}>
              {new Date(time).toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={[styles.header, { paddingTop: topInset + 10 }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => {
              haptics.light();
              router.back();
            }}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </Pressable>
          <View>
            <Text style={styles.h1}>Hareket Geçmişi</Text>
            <Text style={styles.h2}>Kovanınızdaki tüm otonom süreçler</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {user.activities && user.activities.length > 0 ? (
          user.activities.map((act, idx) => (
            <ActivityItem
              key={act.id}
              message={act.message}
              time={act.time}
              type={act.type}
              index={idx}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Henüz bir hareket yok</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 20, fontFamily: "Poppins_800ExtraBold", color: Colors.white },
  h2: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  scroll: { flex: 1, paddingHorizontal: 20 },
  activityCard: { marginBottom: 12, padding: 14 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activityMessage: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.slate, lineHeight: 18 },
  activityTime: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textMuted, marginTop: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.textMuted },
});
