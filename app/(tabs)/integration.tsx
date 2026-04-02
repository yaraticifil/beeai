import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { ERPType, useUser } from "@/contexts/UserContext";
import { GlassCard } from "@/components/GlassCard";

function ERPCard({
  title,
  subtitle,
  tag,
  onPress,
  icon = "link"
}: {
  title: string;
  subtitle: string;
  tag: string;
  onPress: () => void;
  icon?: any;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.erpCard, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]} onPress={onPress}>
      <View style={styles.erpRow}>
        <View style={styles.erpIcon}>
          <Ionicons name={icon} size={22} color={Colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.erpTitle}>{title}</Text>
          <Text style={styles.erpSub}>{subtitle}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function IntegrationScreen() {
  const insets = useSafeAreaInsets();
  const { importSampleERP, importFromCsv } = useUser();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [csv, setCsv] = useState(
    "checkNo;issuer;amount;dueDate;bank\n" +
      "CHK-10001;Kovan Tekstil A.Ş.;185000;2026-05-31;Garanti BBVA\n"
  );

  const canImport = useMemo(() => csv.trim().split(/\r?\n/).length >= 2, [csv]);

  const runSample = async (erp: ERPType) => {
    if (syncing) return;
    setSyncing(erp.toUpperCase());
    setProgress(0);

    // Simulate sync steps
    for (let i = 1; i <= 5; i++) {
        await new Promise(r => setTimeout(r, 600));
        setProgress(i * 20);
    }

    const n = await importSampleERP(erp);
    setSyncing(null);
    if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Senkronizasyon Tamamlandı", `${n} yeni çek verisi otonom olarak kovanınıza aktarıldı.`);
  };

  const runCsv = async () => {
    if (!canImport || syncing) return;
    setSyncing("CSV");
    setProgress(0);

    for (let i = 1; i <= 3; i++) {
        await new Promise(r => setTimeout(r, 400));
        setProgress(i * 33);
    }

    const n = await importFromCsv(csv);
    setSyncing(null);
    Alert.alert("Veri Aktarımı", `${n} çek başarıyla işlendi ve kovanınıza eklendi.`);
  };

  const topInset = Platform.OS === "web" ? 60 : insets.top;

  return (
    <View style={styles.container}>
       <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={[styles.header, { paddingTop: topInset + 10 }]}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.headerContent}>
          <Text style={styles.h1}>Veri Entegrasyonu</Text>
          <Text style={styles.h2}>Mevcut yazılımınızdan otonom veri aktarım kanallarını yapılandırın.</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 10 }} 
        showsVerticalScrollIndicator={false}
      >
        {syncing && (
            <Animated.View entering={FadeInDown.springify()} style={styles.syncOverlay}>
                <GlassCard style={styles.syncCard} intensity={25}>
                    <ActivityIndicator color={Colors.gold} size="large" />
                    <Text style={styles.syncTitle}>{syncing} Senkronize Ediliyor...</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.syncSub}>AI ajanları verileri doğrularıyor</Text>
                </GlassCard>
            </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionLabel}>ERP BAĞLANTILARI</Text>
          </View>
          <ERPCard title="Logo Tiger" subtitle={syncing === "TIGER" ? "Eşitleniyor..." : "Aktif bağlantı profili"} tag="PİLOT" onPress={() => runSample("tiger")} />
          <ERPCard title="Mikro Yazılım" subtitle={syncing === "MIKRO" ? "Eşitleniyor..." : "Aktif bağlantı profili"} tag="PİLOT" onPress={() => runSample("mikro")} />
          <ERPCard title="Netsis" subtitle={syncing === "NETSIS" ? "Eşitleniyor..." : "Aktif bağlantı profili"} tag="PİLOT" onPress={() => runSample("netsis")} />
          
          <GlassCard style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.gold} />
            <Text style={styles.infoText}>
              Pilot Notu: Bu ekran gerçek ERP bağlantısı yerine otonom aktarım akışını ve kovan veri bütünlüğünü simüle eder.
            </Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.csvSection}>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionLabel}>CSV / EXCEL MANUEL AKTARIM</Text>
          </View>
          <GlassCard style={styles.csvCard}>
             <Text style={styles.csvHelp}>Format: checkNo; issuer; amount; dueDate; bank</Text>
             <TextInput
                value={csv}
                onChangeText={setCsv}
                style={styles.textarea}
                multiline
                placeholder="Verileri buraya yapıştırın..."
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <Pressable
                onPress={runCsv}
                disabled={!canImport}
                style={({ pressed }) => [
                  styles.btn,
                  !canImport && { opacity: 0.5, backgroundColor: Colors.textMuted },
                  pressed && canImport && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.btnText}>Verileri Kovana Aktar</Text>
                <Ionicons name="cloud-upload" size={18} color={Colors.slate} />
              </Pressable>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
           <GlassCard style={styles.tipCard} intensity={15}>
              <View style={styles.tipHeader}>
                 <Ionicons name="flash-outline" size={20} color={Colors.primary} />
                 <Text style={styles.tipTitle}>Otonom Gelecek</Text>
              </View>
              <Text style={styles.tipText}>
                Entegrasyon tam kapasiteye ulaştığında, çek verileriniz hiçbir manuel işlem gerektirmeden kovanınıza düşer ve 15 dakika içinde en iyi tekliflerle buluşur.
              </Text>
           </GlassCard>
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
  sectionHeader: { marginBottom: 12, marginTop: 10, paddingLeft: 4 },
  sectionLabel: { fontSize: 11, fontFamily: "Poppins_800ExtraBold", color: Colors.textMuted, letterSpacing: 1.2 },

  erpCard: { backgroundColor: Colors.white, borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 }, android: { elevation: 2 } }) },
  erpRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  erpIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.slate, alignItems: "center", justifyContent: "center" },
  erpTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", color: Colors.slate },
  erpSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textMuted, marginTop: 2 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.goldLight, borderWidth: 1, borderColor: "rgba(251,191,36,0.2)" },
  tagText: { fontSize: 9, fontFamily: "Poppins_800ExtraBold", color: Colors.goldDark, letterSpacing: 0.5 },

  infoBox: { padding: 16, flexDirection: 'row', gap: 12, borderRadius: 20, marginBottom: 20 },
  infoText: { flex: 1, fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", lineHeight: 18 },

  csvSection: { marginBottom: 20 },
  csvCard: { padding: 20, borderRadius: 28 },
  csvHelp: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.4)", marginBottom: 12 },
  textarea: { 
    minHeight: 140, 
    borderRadius: 20, 
    backgroundColor: "rgba(255,255,255,0.05)", 
    padding: 16, 
    fontFamily: "Poppins_500Medium", 
    color: Colors.white, 
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
    fontSize: 13
  },
  btn: { 
    backgroundColor: Colors.gold, 
    borderRadius: 20, 
    paddingVertical: 18, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 12 
  },
  btnText: { fontSize: 15, fontFamily: "Poppins_800ExtraBold", color: Colors.slate },

  tipCard: { padding: 20, borderRadius: 24, marginBottom: 20 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  tipTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", color: Colors.primary },
  tipText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", lineHeight: 20 },

  syncOverlay: { marginBottom: 20 },
  syncCard: { padding: 24, alignItems: 'center', gap: 12 },
  syncTitle: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.white },
  progressBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.gold },
  syncSub: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.5)' },
});
