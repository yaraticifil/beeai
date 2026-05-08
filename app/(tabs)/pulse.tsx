import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { GlassCard } from "@/components/GlassCard";
import { TrendChart } from "@/components/TrendChart";

function DynamicItem({ label, value, trend }: { label: string; value: string; trend: 'up' | 'down' | 'stable' }) {
  return (
    <View style={styles.dynamicItem}>
      <Text style={styles.dynamicLabel}>{label}</Text>
      <View style={styles.dynamicValueRow}>
        <Text style={styles.dynamicValue}>{value}</Text>
        <Ionicons
          name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'}
          size={16}
          color={trend === 'up' ? Colors.danger : trend === 'down' ? Colors.primary : Colors.textMuted}
        />
      </View>
    </View>
  );
}

function SectorCard({ name, change, mood }: { name: string; change: string; mood: 'positive' | 'negative' | 'neutral' }) {
  return (
    <GlassCard style={styles.sectorCard} intensity={10}>
      <Text style={styles.sectorName}>{name}</Text>
      <View style={[styles.sectorBadge, mood === 'positive' ? styles.badgePos : mood === 'negative' ? styles.badgeNeg : styles.badgeNeu]}>
        <Text style={styles.sectorChange}>{change}</Text>
      </View>
    </GlassCard>
  );
}

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

  const topInset = Platform.OS === "web" ? 60 : insets.top;

  return (
    <View style={styles.container}>
       <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={[styles.header, { paddingTop: topInset + 10 }]}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.headerContent}>
          <Text style={styles.h1}>Piyasa Nabzı</Text>
          <Text style={styles.h2}>Piyasayı konuşturur, sayıları otonom analiz ederiz.</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 10 }} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>Piyasa Dinamikleri</Text>
               <View style={styles.liveBadge}>
                 <View style={styles.liveDot} />
                 <Text style={styles.liveText}>CANLI</Text>
               </View>
            </View>

            <View style={styles.dynamicsGrid}>
               <DynamicItem label="Ort. İskonto" value={`%${pulse.band90.min.toFixed(1)}`} trend={pulse.mood === 'sert' ? 'up' : 'down'} />
               <DynamicItem label="Partner İştahı" value={pulse.mood === 'yumuşak' ? 'Yüksek' : 'Orta'} trend={pulse.mood === 'yumuşak' ? 'down' : 'up'} />
               <DynamicItem label="İşlem Hızı" value="12 dk" trend="down" />
            </View>

            <View style={styles.divider} />

            <View style={styles.topRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="pulse" size={24} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Günlük Endeks</Text>
                <Text style={styles.date}>{pulse.date}</Text>
              </View>
              <View style={[styles.moodPill, pulse.mood === "sert" ? styles.moodHard : pulse.mood === "yumuşak" ? styles.moodSoft : styles.moodNormal]}>
                <View style={styles.dot} />
                <Text style={styles.moodText}>{moodLabel}</Text>
              </View>
            </View>

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => setPulseMode("weather")}
                style={[styles.modeBtn, mode === "weather" && styles.modeBtnActive]}
              >
                <Ionicons name="cloud-outline" size={18} color={mode === "weather" ? Colors.slate : Colors.gold} />
                <Text style={[styles.modeText, mode === "weather" && styles.modeTextActive]}>Piyasa Havası</Text>
              </Pressable>

              <Pressable
                onPress={() => setPulseMode("band")}
                style={[styles.modeBtn, mode === "band" && styles.modeBtnActive]}
              >
                <Ionicons name="analytics-outline" size={18} color={mode === "band" ? Colors.slate : Colors.gold} />
                <Text style={[styles.modeText, mode === "band" && styles.modeTextActive]}>Vade Bandı</Text>
              </Pressable>
            </View>

            {mode === "weather" ? (
              <Animated.View entering={FadeInDown.springify()} style={styles.weatherBox}>
                <Text style={styles.weatherTitle}>Analiz Özeti</Text>
                <Text style={styles.weatherText}>
                  {pulse.mood === "sert"
                    ? "Bugün finansal piyasalarda likidite daralması gözleniyor. Teklifler daha seçici ve yüksek iskontolu gelebilir."
                    : pulse.mood === "yumuşak"
                    ? "Piyasada likidite bolluğu hakim. Arılar revize turlarında daha agresif ve rekabetçi teklifler yakalayabilir."
                    : "Piyasa koşulları standart dengesinde seyrediyor. Evrak kalitenize göre hızlı ve sağlıklı akış bekliyoruz."}
                </Text>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.springify()} style={styles.bandBox}>
                <Text style={styles.bandTitle}>90 Gün Ortalama Bandı</Text>

                <TrendChart min={pulse.band90.min} max={pulse.band90.max} />

                <View style={styles.bandValueContainer}>
                    <Text style={styles.bandValue}>%{pulse.band90.min}</Text>
                    <View style={styles.bandDivider} />
                    <Text style={styles.bandValue}>%{pulse.band90.max}</Text>
                </View>
                <Text style={styles.bandNote}>Not: Bu oranlar anonimleşmiş BeeAI verilerinden üretilen güncel piyasa endeksidir.</Text>
              </Animated.View>
            )}

            <View style={styles.noteBox}>
              <View style={styles.noteHeader}>
                 <Ionicons name="bulb-outline" size={16} color={Colors.gold} />
                 <Text style={styles.noteTitle}>Strateji Notu</Text>
              </View>
              <Text style={styles.noteText}>{pulse.note}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 20 }}>
           <Text style={styles.sectionTitle}>Sektörel Analizler</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectorScroll}>
              <SectorCard name="İnşaat" change="+%1.2" mood="negative" />
              <SectorCard name="Tekstil" change="-%0.5" mood="positive" />
              <SectorCard name="Gıda" change="Stabil" mood="neutral" />
              <SectorCard name="Lojistik" change="+%0.8" mood="negative" />
           </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.footerText}>
              Bu veriler pilot ağından gelen gerçek zamanlı işlem verileriyle otonom olarak güncellenir.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerContent: { gap: 6 },
  h1: { fontSize: 24, fontFamily: "Poppins_800ExtraBold", color: Colors.white },
  h2: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.7)", lineHeight: 20 },

  scroll: { flex: 1, paddingHorizontal: 20, marginTop: -20 },
  card: { padding: 20, borderRadius: 28 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.slate },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  liveDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.danger },
  liveText: { fontSize: 8, fontFamily: 'Poppins_800ExtraBold', color: Colors.danger },

  dynamicsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dynamicItem: { gap: 4 },
  dynamicLabel: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: Colors.textMuted },
  dynamicValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dynamicValue: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.slate },

  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 20 },

  sectorScroll: { marginHorizontal: -20, paddingHorizontal: 20, marginTop: 10 },
  sectorCard: { width: 110, marginRight: 12, padding: 12, alignItems: 'center', gap: 8 },
  sectorName: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: Colors.slate },
  sectorBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgePos: { backgroundColor: 'rgba(34,197,94,0.1)' },
  badgeNeg: { backgroundColor: 'rgba(239,68,68,0.1)' },
  badgeNeu: { backgroundColor: 'rgba(0,0,0,0.05)' },
  sectorChange: { fontSize: 10, fontFamily: 'Poppins_700Bold', color: Colors.slate },

  topRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.slate, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontFamily: "Poppins_800ExtraBold", color: Colors.slate },
  date: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textMuted, marginTop: 2 },

  moodPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'currentColor' },
  moodHard: { backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.15)", color: Colors.danger },
  moodSoft: { backgroundColor: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.15)", color: Colors.primary },
  moodNormal: { backgroundColor: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.15)", color: Colors.gold },
  moodText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.slate },

  modeRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  modeBtn: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: Colors.white },
  modeBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  modeText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.slate },
  modeTextActive: { color: Colors.slate },

  weatherBox: { backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 20 },
  weatherTitle: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.slate, marginBottom: 10 },
  weatherText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, lineHeight: 22 },

  bandBox: { backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 20, alignItems: 'center' },
  bandTitle: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.slate, marginBottom: 16 },
  bandValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  bandValue: { fontSize: 28, fontFamily: "Poppins_800ExtraBold", color: Colors.primary },
  bandDivider: { width: 20, height: 2, backgroundColor: Colors.cardBorder },
  bandNote: { fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },

  noteBox: { backgroundColor: Colors.slate, borderRadius: 20, padding: 18 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  noteTitle: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.gold },
  noteText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.7)", lineHeight: 20 },

  infoRow: { marginTop: 20, flexDirection: "row", gap: 10, alignItems: "center", paddingHorizontal: 10 },
  footerText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textMuted, lineHeight: 18, flex: 1 },
});
