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
import { formatCurrency, formatDate, parseCurrency } from "@/shared/utils/format";

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const { addCheck, startOfferCollection, linkInvoice } = useUser();

  const [checkNo, setCheckNo] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(""); // DD.MM.YYYY
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");

  const handleAmountChange = (val: string) => {
    setAmount(formatCurrency(val));
  };

  const handleDateChange = (val: string) => {
    setDueDate(formatDate(val));
  };

  const handleInvoiceAmountChange = (val: string) => {
    setInvoiceAmount(formatCurrency(val));
  };

  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const canSubmit = useMemo(() => {
    const a = parseCurrency(amount);
    return checkNo.trim() && issuerName.trim() && dueDate.length === 10 && Number.isFinite(a) && a > 0;
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
    if (loading) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setLoading(true);

    const a = parseCurrency(amount);

    // Convert DD.MM.YYYY to YYYY-MM-DD
    let isoDate = dueDate;
    if (dueDate.includes(".")) {
      const [d, m, y] = dueDate.split(".");
      isoDate = `${y}-${m}-${d}`;
    }

    const id = await addCheck({
      checkNo,
      issuerName,
      bankName,
      amount: a,
      dueDate: isoDate,
      imageUri,
      source: "manual",
    });

    if (!id) {
      setLoading(false);
      Alert.alert("Eksik Bilgi", "Çek no, keşideci, tutar ve vade zorunlu.");
      return;
    }

    if (invoiceNo.trim()) {
      const invAmt = invoiceAmount ? parseCurrency(invoiceAmount) : a;
      await linkInvoice(id, invoiceNo.trim(), invAmt);
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
                   <Field label="Vade" value={dueDate} onChangeText={handleDateChange} placeholder="31.12.2025" keyboardType="numeric" />
                 </View>
              </View>

              <View style={styles.invoiceSection}>
                <View style={styles.invoiceHeader}>
                  <Ionicons name="receipt-outline" size={16} color={Colors.textMuted} />
                  <Text style={styles.invoiceLabel}>Opsiyonel: Fatura Eşleştir</Text>
                </View>
                <View style={styles.row}>
                   <View style={{ flex: 1 }}>
                     <Field label="Fatura No" value={invoiceNo} onChangeText={setInvoiceNo} placeholder="Örn: ABC2025..." />
                   </View>
                   <View style={{ flex: 1 }}>
                     <Field label="Fatura Tutarı" value={invoiceAmount} onChangeText={handleInvoiceAmountChange} placeholder="185.000" keyboardType="numeric" />
                   </View>
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
          <Pressable style={({ pressed }) => [styles.whatsRow, pressed && { opacity: 0.8 }]} onPress={() => setShowWhatsApp(true)} >
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

      {showWhatsApp && (
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowWhatsApp(false)} />
          <Animated.View entering={FadeInDown.springify()} style={[styles.modal, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalTitle}>WhatsApp Destek</Text>
                <Text style={styles.modalSub}>Evrakları asistanımıza iletin.</Text>
              </View>
              <Pressable onPress={() => setShowWhatsApp(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.white} />
              </Pressable>
            </View>

            <View style={styles.whatsContent}>
               <View style={styles.whatsNumberBox}>
                  <Text style={styles.whatsNumberLabel}>KOVANTİ HATTI</Text>
                  <Text style={styles.whatsNumber}>+90 5XX XXX XX XX</Text>
               </View>
               <Text style={styles.whatsInstructions}>
                 Çekinizin fotoğrafını ve varsa faturasını bu numaraya WhatsApp üzerinden gönderin. AI ajanlarımız verileri işleyip kovanınıza otomatik ekleyecektir.
               </Text>
               <Pressable
                style={styles.whatsPrimaryBtn}
                onPress={() => {
                  setShowWhatsApp(false);
                  Alert.alert("Yönlendiriliyor", "WhatsApp uygulamasına yönlendiriliyorsunuz...");
                }}
               >
                 <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
                 <Text style={styles.whatsPrimaryBtnText}>WhatsApp&apos;ı Aç</Text>
               </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
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
  invoiceSection: {
    marginTop: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    gap: 12,
  },
  invoiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  invoiceLabel: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
  },
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

  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: Colors.slate,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.white,
  },
  modalSub: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsContent: { gap: 20 },
  whatsNumberBox: {
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.2)',
    alignItems: 'center',
  },
  whatsNumberLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: '#25D366',
    letterSpacing: 1,
    marginBottom: 4,
  },
  whatsNumber: {
    fontSize: 22,
    fontFamily: 'Poppins_800ExtraBold',
    color: Colors.white,
  },
  whatsInstructions: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  whatsPrimaryBtn: {
    backgroundColor: '#25D366',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  whatsPrimaryBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_800ExtraBold',
    color: Colors.white,
  },
});
