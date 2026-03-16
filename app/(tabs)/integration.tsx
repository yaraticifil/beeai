import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ERPType, useUser } from "@/contexts/UserContext";

function ERPCard({
  title,
  subtitle,
  tag,
  onPress,
}: {
  title: string;
  subtitle: string;
  tag: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.erpCard, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <View style={styles.erpRow}>
        <View style={styles.erpIcon}>
          <Ionicons name="link" size={18} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.erpTitle}>{title}</Text>
          <Text style={styles.erpSub}>{subtitle}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function IntegrationScreen() {
  const insets = useSafeAreaInsets();
  const { importSampleERP, importFromCsv } = useUser();

  const [csv, setCsv] = useState(
    "checkNo;issuer;amount;dueDate;bank\n" +
      "CHK-10001;Kovan Tekstil A.Ş.;185000;2026-05-31;Garanti BBVA\n"
  );

  const canImport = useMemo(() => csv.trim().split(/\r?\n/).length >= 2, [csv]);

  const runSample = async (erp: ERPType) => {
    const n = await importSampleERP(erp);
    Alert.alert("Pilot Aktarım", `${n} çek içeri alındı (${erp.toUpperCase()}).`);
  };

  const runCsv = async () => {
    if (!canImport) return;
    const n = await importFromCsv(csv);
    Alert.alert("CSV Aktarım", `${n} çek içeri alındı.`);
  };

  return (
    <LinearGradient colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]} style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>ERP Entegrasyon</Text>
        <Text style={styles.h2}>“Zaten kullandığın yazılımdan 1 tıkla BeeAI’ye aktar.” Pilot bağlantı.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Kurulum (Pilot)</Text>
          <ERPCard title="Logo Tiger" subtitle="Seçili kurulum profili" tag="PILOT" onPress={() => runSample("tiger")} />
          <ERPCard title="Mikro" subtitle="Seçili kurulum profili" tag="PILOT" onPress={() => runSample("mikro")} />
          <ERPCard title="Netsis" subtitle="Seçili kurulum profili" tag="PILOT" onPress={() => runSample("netsis")} />
          <Text style={styles.small}>
            Pilot notu: Bu ekran, gerçek entegrasyon yerine pilot aktarım akışını simüle eder ve akışı doğrular.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CSV / Excel Aktarım</Text>
          <Text style={styles.small2}>Kolonlar: checkNo, issuer, amount, dueDate, bank (ayraç: ; veya ,)</Text>

          <TextInput
            value={csv}
            onChangeText={setCsv}
            style={styles.textarea}
            multiline
            placeholder="CSV yapıştır"
            placeholderTextColor={Colors.textMuted}
          />

          <Pressable
            onPress={runCsv}
            disabled={!canImport}
            style={({ pressed }) => [
              styles.btn,
              !canImport && { opacity: 0.5 },
              pressed && canImport && { opacity: 0.9 },
            ]}
          >
            <Ionicons name="cloud-upload" size={18} color={Colors.white} />
            <Text style={styles.btnText}>Aktarımı Başlat</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İpucu</Text>
          <Text style={styles.tip}>
            Entegrasyon tamamlandığında: “1 tık” gerçekten 1 tık olur. Pilot’ta amacımız sürtünmeyi sıfırlayan akışı ve
            kovan mantığını sahada doğrulamak.
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

  section: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 10 },

  erpCard: { borderRadius: 18, padding: 12, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 10, backgroundColor: Colors.white },
  erpRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  erpIcon: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(34,197,94,0.12)" },
  erpTitle: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.text },
  erpSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginTop: 2 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(245,158,11,0.14)", borderWidth: 1, borderColor: "rgba(245,158,11,0.18)" },
  tagText: { fontSize: 10, fontFamily: "Poppins_700Bold", color: Colors.honeyDark, letterSpacing: 0.4 },

  small: { marginTop: 4, fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, lineHeight: 14 },
  small2: { marginBottom: 8, fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, lineHeight: 14 },
  textarea: { minHeight: 120, borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: Colors.white, padding: 12, fontFamily: "Poppins_400Regular", color: Colors.text, textAlignVertical: "top" },
  btn: { marginTop: 10, backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  btnText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.white },

  tip: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, lineHeight: 18 },
});
