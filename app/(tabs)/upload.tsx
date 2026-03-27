import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { GlassCard } from "@/components/GlassCard";

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const { addCheck, startOfferCollection } = useUser();

  const [checkNo, setCheckNo] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(""); // YYYY-MM-DD

  const formatCurrency = (val: string) => {
    // Remove all non-digits
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    // Add dots as thousand separators
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (val: string) => {
    setAmount(formatCurrency(val));
  };
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    const a = Number(amount.replace(/\./g, "").replace(",", "."));
    return checkNo.trim() && issuerName.trim() && dueDate.trim() && Number.isFinite(a) && a > 0;
  }, [checkNo, issuerName, amount, dueDate]);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
    if (loading) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading(true);
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
      setLoading(false);
      Alert.alert("Eksik Bilgi", "Çek no, keşideci, tutar ve vade zorunlu.");
      return;
    }

    await startOfferCollection(id);
    setLoading(false);
    Alert.alert("Alındı", "Çek kovana eklendi. Teklif toplama başlatıldı.", [
      { text: "Tamam", onPress: () => router.push("/(tabs)/offers") },
    ]);
  };

  const topInset = Platform.OS === "web" ? 60 : insets.top;

  return (
    <View style={styles.container}>
       <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={[styles.header, { paddingTop: topInset + 10 }]}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.headerContent}>
          <Text style={styles.h1}>Çek Analizi</Text>
          <Text style={styles.h2}>Fotoğraf ekle veya manuel gir. Arılar hemen teklif toplamaya başlar.</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.card}>
            <Pressable style={({ pressed }) => [styles.photoBtn, pressed && { opacity: 0.8 }]} onPress={pickImage}>
              <View style={[styles.photoIconContainer, imageUri && { backgroundColor: Colors.primaryLight }]}>
                 <Ionicons name={imageUri ? "checkmark-circle" : "camera"} size={22} color={imageUri ? Colors.primary : Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.photoText}>{imageUri ? "Görsel Başarıyla Eklendi" : "Çek Fotoğrafını Çek/Yükle"}</Text>
                <Text style={styles.photoSub}>{imageUri ? "AI analizi için hazır" : "Yapay zeka verileri otomatik ayrıştırır"}</Text>
              </View>
            </Pressable>

            <View style={styles.form}>
              <Field label="Çek No" value={checkNo} onChangeText={setCheckNo} placeholder="Örn: 00012345" />
              <Field label="Keşideci (Firma)" value={issuerName} onChangeText={setIssuerName} placeholder="Örn: Kovan Tekstil A.Ş." />
              <Field label="Banka" value={bankName} onChangeText={setBankName} placeholder="Örn: Garanti BBVA" />
              
              <View style={styles.row}>
                 <View style={{ flex: 1.2 }}>
                   <Field label="Tutar (TRY)" value={amount} onChangeText={handleAmountChange} placeholder="185.000" keyboardType="numeric" />
                 </View>
                 <View style={{ flex: 1 }}>
                   <Field label="Vade" value={dueDate} onChangeText={setDueDate} placeholder="2026-06-01" />
                 </View>
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              style={({ pressed }) => [
                styles.submit,
                (!canSubmit || loading) && { opacity: 0.5, backgroundColor: Colors.textMuted },
                pressed && canSubmit && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.submitText}>{loading ? "Analiz Ediliyor..." : "15 Dakika 3 Teklif Başlat"}</Text>
              <Ionicons name="flash" size={18} color={Colors.slate} />
            </Pressable>

            <Text style={styles.small}>
              BeeAI Pilot: Teklifler seçili partner ağından toplanır. Sonuçlar veri ve yanıt hızına göre değişebilir.
            </Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Pressable style={({ pressed }) => [styles.whatsRow, pressed && { opacity: 0.8 }]} onPress={() => Alert.alert("WhatsApp", "Pilot: WhatsApp hattı entegrasyonu (Yakında)")} >
            <View style={styles.whatsIcon}>
               <Ionicons name="logo-whatsapp" size={24} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.whatsText}>WhatsApp ile Gönder</Text>
                <Text style={styles.whatsSub}>Kovan numaramıza atın, biz yükleyelim.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
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
    <View style={styles.fieldContainer}>
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerContent: { gap: 6 },
  h1: { fontSize: 24, fontFamily: "Poppins_800ExtraBold", color: Colors.white },
  h2: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.7)", lineHeight: 20 },
  
  scroll: { flex: 1, paddingHorizontal: 20, marginTop: -20 },
  card: { padding: 20, borderRadius: 24 },
  
  photoBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 14, 
    padding: 16, 
    borderRadius: 18, 
    backgroundColor: "rgba(255,255,255,0.8)", 
    borderWidth: 1, 
    borderColor: Colors.cardBorder,
    marginBottom: 20,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
        android: { elevation: 2 }
    })
  },
  photoIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.goldLight, alignItems: 'center', justifyContent: 'center' },
  photoText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.slate },
  photoSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textMuted, marginTop: 2 },
  
  form: { gap: 14, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  fieldContainer: { gap: 6 },
  label: { fontSize: 11, fontFamily: "Poppins_700Bold", color: Colors.textSecondary, marginLeft: 4 },
  input: { 
    backgroundColor: Colors.white, 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    paddingVertical: Platform.OS === "ios" ? 14 : 10, 
    borderWidth: 1, 
    borderColor: Colors.cardBorder, 
    fontFamily: "Poppins_600SemiBold", 
    color: Colors.slate,
    fontSize: 13
  },
  
  submit: { 
    backgroundColor: Colors.gold, 
    borderRadius: 20, 
    paddingVertical: 18, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 10,
    marginTop: 10
  },
  submitText: { fontSize: 15, fontFamily: "Poppins_800ExtraBold", color: Colors.slate },
  small: { marginTop: 14, fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, textAlign: 'center', lineHeight: 14 },
  
  whatsRow: { 
    marginTop: 16, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 14, 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: Colors.cardBorder, 
    backgroundColor: Colors.white,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
        android: { elevation: 2 }
    })
  },
  whatsIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' },
  whatsText: { fontSize: 14, fontFamily: "Poppins_700Bold", color: Colors.slate },
  whatsSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textMuted, marginTop: 2 },
});
