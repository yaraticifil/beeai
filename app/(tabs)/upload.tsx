import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const { addCheck, startOfferCollection } = useUser();

  const [checkNo, setCheckNo] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(""); // YYYY-MM-DD
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const canSubmit = useMemo(() => {
    const a = Number(amount.replace(/\./g, "").replace(",", "."));
    return checkNo.trim() && issuerName.trim() && dueDate.trim() && Number.isFinite(a) && a > 0;
  }, [checkNo, issuerName, amount, dueDate]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin Gerekli", "Galeri izni veriniz.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]?.uri) setImageUri(res.assets[0].uri);
  };

  const handleSubmit = async () => {
    const a = Number(amount.replace(/\./g, "").replace(",", "."));
    const id = await addCheck({
      checkNo,
      issuerName,
      bankName,
      amount: a,
      dueDate,
      imageUri,
      source: "manual",
    });

    if (!id) {
      Alert.alert("Eksik Bilgi", "Çek no, keşideci, tutar ve vade zorunlu.");
      return;
    }

    await startOfferCollection(id);
    Alert.alert("Alındı", "Çek kovana eklendi. Teklif toplama başlatıldı.", [
      { text: "Tamam", onPress: () => router.push("/(tabs)/offers") },
    ]);
  };

  return (
    <LinearGradient colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]} style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Çek Yükle</Text>
        <Text style={styles.h2}>Fotoğraf ekle veya manuel gir. Arılar hemen teklif toplamaya başlar.</Text>

        <View style={styles.card}>
          <Pressable style={styles.photoBtn} onPress={pickImage}>
            <Ionicons name={imageUri ? "checkmark-circle" : "camera"} size={18} color={imageUri ? Colors.primary : Colors.textSecondary} />
            <Text style={styles.photoText}>{imageUri ? "Görsel eklendi" : "Fotoğraf ekle"}</Text>
          </Pressable>

          <Field label="Çek No" value={checkNo} onChangeText={setCheckNo} placeholder="Örn: 00012345" />
          <Field label="Keşideci (Firma)" value={issuerName} onChangeText={setIssuerName} placeholder="Örn: Kovan Tekstil A.Ş." />
          <Field label="Banka" value={bankName} onChangeText={setBankName} placeholder="Örn: Garanti BBVA" />
          <Field label="Tutar (TRY)" value={amount} onChangeText={setAmount} placeholder="Örn: 185000" keyboardType="numeric" />
          <Field label="Vade (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="Örn: 2026-06-01" />

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submit,
              !canSubmit && { opacity: 0.5 },
              pressed && canSubmit && { opacity: 0.9 },
            ]}
          >
            <Ionicons name="flash" size={18} color={Colors.white} />
            <Text style={styles.submitText}>15 Dakika 3 Teklif Başlat</Text>
          </Pressable>

          <Text style={styles.small}>
            Pilot notu: Teklifler seçili partner ağından toplanır. Sonuçlar veri ve yanıt hızına göre değişebilir.
          </Text>
        </View>

        <Pressable style={styles.whatsRow} onPress={() => Alert.alert("WhatsApp", "Pilot: WhatsApp hattı entegrasyonu ekranı burada. (Backend bağlanınca aktif)")} >
          <Ionicons name="logo-whatsapp" size={18} color={Colors.primary} />
          <Text style={styles.whatsText}>WhatsApp’tan fotoğraf gönder (Pilot)</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={props.keyboardType}
        style={styles.input}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  h1: { fontSize: 20, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 6 },
  h2: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginBottom: 12, lineHeight: 18 },
  card: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder },
  photoBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "rgba(34,197,94,0.10)", borderWidth: 1, borderColor: "rgba(34,197,94,0.18)", marginBottom: 10 },
  photoText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.text },
  label: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: Colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 12 : 10, borderWidth: 1, borderColor: Colors.cardBorder, fontFamily: "Poppins_400Regular", color: Colors.text },
  submit: { marginTop: 6, backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  submitText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.white },
  small: { marginTop: 10, fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, lineHeight: 14 },
  whatsRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: "rgba(255,255,255,0.85)" },
  whatsText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.text },
});
