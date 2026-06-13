import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { GlassCard } from "@/components/GlassCard";
import { TrendChart } from "@/components/TrendChart";
import { HoneyBoosterBadge } from "@/components/HoneyBoosterBadge";
import { MissionItem } from "@/components/MissionItem";
import { haptics } from "@/shared/utils/haptics";
import { formatCompactNumber } from "@/shared/utils/format";

function StatCard({ label, value, icon, delay = 0 }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      <GlassCard style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={18} color={Colors.gold} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </GlassCard>
    </Animated.View>
  );
}

function ActionItem({
  title,
  sub,
  icon,
  onPress,
  delay = 0,
}: {
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  delay?: number;
}) {
  const handlePress = () => {
    haptics.light();
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable style={({ pressed }) => [styles.actionItem, pressed && { opacity: 0.8 }]} onPress={handlePress}>
        <View style={styles.actionIcon}>
          <Ionicons name={icon} size={22} color={Colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSub}>{sub}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export default function PanelScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, checkDailySpins, checkDailyMissions, claimMissionReward, getDailyPulse } = useUser();

  useEffect(() => {
    if (user) {
      checkDailySpins();
      checkDailyMissions();
    }
  }, [user, checkDailySpins, checkDailyMissions]);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user]);

  if (!user) return null;

  const pulse = getDailyPulse();
  const checksCount = user.checks?.length || 0;
  const activeReqs = (user.offerRequests || []).filter((r) => r.status === "collecting").length;
  const offersReady = (user.offerRequests || []).filter((r) => r.status === "ready").length;

  const totalAmount = (user.checks || []).reduce((sum, c) => sum + (c.amount || 0), 0);

  const topInset = Platform.OS === "web" ? 60 : insets.top;

  const handleLogout = () => {
    haptics.medium();
    Alert.alert("Çıkış Yap", "Kovan hesabınızdan çıkmak istiyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          haptics.success();
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={[styles.header, { paddingTop: topInset + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <Animated.View entering={FadeInUp.springify()} style={styles.headerLeft}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>🐝</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeText}>Hoş Geldin,</Text>
              <Text style={styles.companyText} numberOfLines={1}>
                {user.companyName}
              </Text>
              <HoneyBoosterBadge />
              <View style={styles.levelProgressContainer}>
                <View style={styles.levelRow}>
                  <Text style={styles.levelLabel}>Seviye {user.level}</Text>
                  <Text style={styles.xpLabel}>{user.honeyPoints % 100}/100 XP</Text>
                </View>
                <View style={styles.levelBarBg}>
                  <View style={[styles.levelBarFill, { width: `${user.honeyPoints % 100}%` }]} />
                </View>
              </View>
            </View>
          </Animated.View>

          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="power-outline" size={20} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.pulseContainer}>
          <GlassCard style={styles.pulseCard} intensity={20}>
            <View style={styles.pulseHeader}>
              <View style={styles.pulseIndicator}>
                <View style={[styles.pulseDot, { backgroundColor: pulse.mood === "sert" ? Colors.danger : pulse.mood === "yumuşak" ? Colors.primary : Colors.gold }]} />
                <Text style={styles.pulseStatus}>{pulse.mood.toUpperCase()} PİYASA</Text>
              </View>
              <Text style={styles.pointsText}>{user.honeyPoints} 🍯</Text>
            </View>
            <View style={styles.pulseContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pulseNote} numberOfLines={2}>{pulse.note}</Text>
              </View>
              <View style={styles.miniChart}>
                <TrendChart min={pulse.band90.min} max={pulse.band90.max} height={40} />
              </View>
            </View>
          </GlassCard>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <GlassCard style={styles.tipCard}>
             <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={18} color={Colors.gold} />
                <Text style={styles.tipTitle}>Günün Tavsiyesi</Text>
             </View>
             <Text style={styles.tipText}>
               {pulse.mood === 'sert'
                 ? 'Piyasa sert, yüksek puanlı keşidecilere odaklanarak işlem hızınızı koruyun.'
                 : pulse.mood === 'yumuşak'
                 ? 'Rekabetçi bir gün, arılarınızla revize turlarını mutlaka deneyin!'
                 : 'Dengeli bir gün. Çeklerinizi erkenden kovana bırakın, en iyi teklifi yakalayın.'}
             </Text>
          </GlassCard>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Günlük Görevler</Text>
          {user.missions && user.missions.length > 0 ? (
            user.missions.map((m, idx) => (
              <Animated.View key={m.id} entering={FadeInDown.delay(350 + idx * 50).springify()}>
                <MissionItem
                  mission={m}
                  onClaim={(id) => {
                    haptics.success();
                    claimMissionReward(id);
                  }}
                />
              </Animated.View>
            ))
          ) : (
            <GlassCard style={styles.emptyActivityCard}>
              <Ionicons name="medal-outline" size={24} color={Colors.textMuted} />
              <Text style={styles.emptyActivityText}>Bugünlük tüm görevler bitti!</Text>
            </GlassCard>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canlı Durum</Text>
          <View style={styles.statGrid}>
            <View style={styles.statRow}>
               <StatCard label="Toplam Çek" value={String(checksCount)} icon="document-attach" delay={100} />
               <StatCard label="Toplam Tutar" value={formatCompactNumber(totalAmount)} icon="wallet" delay={150} />
            </View>
            <View style={styles.statRow}>
               <StatCard label="Toplanıyor" value={String(activeReqs)} icon="time" delay={200} />
               <StatCard label="Hazır" value={String(offersReady)} icon="flash" delay={250} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Hareketler</Text>
          {user.activities && user.activities.length > 0 ? (
            <GlassCard style={styles.activityCard}>
              {user.activities.slice(0, 3).map((act, idx) => (
                <View key={act.id} style={[styles.activityItem, idx === 0 && { borderTopWidth: 0 }]}>
                   <View style={styles.activityDot} />
                   <View style={{ flex: 1 }}>
                     <Text style={styles.activityMsg}>{act.message}</Text>
                     <Text style={styles.activityTime}>{new Date(act.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                   </View>
                </View>
              ))}
            </GlassCard>
          ) : (
            <GlassCard style={styles.emptyActivityCard}>
               <Ionicons name="notifications-off-outline" size={24} color={Colors.textMuted} />
               <Text style={styles.emptyActivityText}>Henüz bir hareket yok</Text>
            </GlassCard>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <ActionItem
            title="Çek Analizi"
            sub="Yapay zeka ile çek analizi yap"
            icon="scan-outline"
            delay={400}
            onPress={() => router.push("/(tabs)/upload")}
          />
          <ActionItem
            title="Teklif Kasası"
            sub="Aktif ve geçmiş teklifleri yönet"
            icon="wallet-outline"
            delay={500}
            onPress={() => router.push("/(tabs)/offers")}
          />
          <ActionItem
            title="BeeAI Labs"
            sub="Özel modüller ve pilot özellikler"
            icon="color-filter-outline"
            delay={600}
            onPress={() => router.push("/labs")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arı Kovanın</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.beesScroll}>
            {(user.bees || []).map((b, idx) => (
              <Animated.View key={b.id} entering={FadeInDown.delay(700 + idx * 100).springify()}>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    const insights: Record<string, string> = {
                      İzci: "Analiz ve veri toplama uzmanı. Teklif toplama süresini kısaltır.",
                      Aracı: "Pazarlık ve revize ustası. Daha iyi oranlar yakalar.",
                      Kâtip: "Evrak ve kayıt yöneticisi. Çek analizlerini otonom yapar.",
                      Nabız: "Piyasa analisti. Günlük piyasa endeksini yorumlar.",
                    };
                    Alert.alert(b.name, insights[b.role] || "Kovanın sadık üyesi.");
                  }}
                >
                  <GlassCard style={styles.beeCard}>
                    <Text style={styles.beeEmoji}>{b.emoji}</Text>
                    <Text style={styles.beeName}>{b.name}</Text>
                    <View style={styles.xpBarBackground}>
                      <View style={[styles.xpBarFill, { width: `${b.xp}%` }]} />
                    </View>
                    <View style={styles.beeInfoRow}>
                      <Text style={styles.beeLevel}>Sv {b.level}</Text>
                      <Text style={styles.beeStatus}>• Aktif</Text>
                    </View>
                  </GlassCard>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  avatarGlow: {
    padding: 3,
    borderRadius: 25,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.slate,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarText: { fontSize: 24 },
  welcomeText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.7)" },
  companyText: { fontSize: 18, fontFamily: "Poppins_800ExtraBold", color: Colors.white },
  levelProgressContainer: { marginTop: 8, width: '100%' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  levelLabel: { fontSize: 10, fontFamily: 'Poppins_700Bold', color: Colors.gold },
  xpLabel: { fontSize: 9, fontFamily: 'Poppins_600SemiBold', color: 'rgba(255,255,255,0.5)' },
  levelBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  levelBarFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 2 },
  logoutBtn: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },

  pulseContainer: { marginTop: 4 },
  pulseCard: { padding: 16, borderRadius: 24 },
  pulseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  pulseIndicator: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  pulseStatus: { color: Colors.white, fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },
  pointsText: { color: Colors.gold, fontSize: 16, fontFamily: "Poppins_800ExtraBold" },
  pulseContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pulseNote: { color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 18, fontFamily: "Poppins_400Regular" },
  miniChart: { width: 80, height: 40, opacity: 0.8 },

  scroll: { flex: 1, paddingHorizontal: 20, marginTop: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_800ExtraBold", color: Colors.slate, marginBottom: 14 },

  statGrid: { gap: 12 },
  statRow: { flexDirection: 'row', gap: 12 },
  statCard: { alignItems: "center", paddingVertical: 14, paddingHorizontal: 8, minHeight: 100, justifyContent: 'center' },
  statIconContainer: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.goldLight, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 18, fontFamily: "Poppins_800ExtraBold", color: Colors.slate },
  statLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: Colors.textMuted },

  activityCard: { padding: 0, overflow: 'hidden' },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  activityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold },
  activityMsg: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: Colors.slate },
  activityTime: { fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, marginTop: 2 },

  emptyActivityCard: { padding: 24, alignItems: 'center', justifyContent: 'center', gap: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.cardBorder },
  emptyActivityText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.textMuted },

  actionItem: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
        android: { elevation: 2 }
    })
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.slate,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", color: Colors.slate },
  actionSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textMuted, marginTop: 2 },

  tipCard: { padding: 16, borderLeftWidth: 4, borderLeftColor: Colors.gold, backgroundColor: Colors.white },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tipTitle: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.slate },
  tipText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 18 },

  beesScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  beeCard: { width: 140, marginRight: 12, padding: 14, alignItems: 'center' },
  beeEmoji: { fontSize: 32, marginBottom: 8 },
  beeName: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: Colors.slate, marginBottom: 8 },
  xpBarBackground: { width: '100%', height: 4, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2, marginBottom: 4 },
  xpBarFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  beeInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  beeLevel: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: Colors.textMuted },
  beeStatus: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
});
