import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  Animated,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const MAX_W = Math.min(width, 550);

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const COLORS = {
  bg: "#0a0e17",
  card: "rgba(15,22,35,0.95)",
  gold: "#f59e0b",
  goldLight: "rgba(245,158,11,0.12)",
  danger: "#ef4444",
  success: "#10b981",
  warning: "#fbbf24",
  border: "rgba(245,158,11,0.18)",
  text: "#f1f5f9",
  muted: "#64748b",
  slate: "#1e293b",
};

const YEARS = ["2019", "2020", "2021", "2022", "2023", "2024"];

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function calcRiskScore(form: typeof INITIAL_FORM): {
  score: number;
  label: string;
  color: string;
  summary: string;
} {
  const idx = parseFloat(form.checkIndex) || 0;
  const bounced = parseInt(form.bouncedCount) || 0;
  const bouncedAmt = parseFloat(form.bouncedAmount.replace(/\./g, "").replace(",", ".")) || 0;
  const payPct = parseFloat(form.paymentPct) || 0;
  const protest = parseInt(form.protestCount) || 0;

  let score = 0;
  // Index contribution (max 400 → 40 pts)
  score += Math.min((idx / 400) * 40, 40);
  // Payment % (max 40 pts)
  score += (payPct / 100) * 40;
  // Bounced check penalty
  score -= Math.min(bounced * 5, 20);
  // Protest penalty
  score -= Math.min(protest * 8, 24);
  // Bounced amount penalty (over 100k = -5)
  if (bouncedAmt > 100000) score -= 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = "ÇOK YÜKSEK RİSK";
  let color = COLORS.danger;
  let summary = "Keşideci yüksek ödeme riski taşımaktadır. İşlem önerilmez.";

  if (score >= 75) {
    label = "DÜŞÜK RİSK";
    color = COLORS.success;
    summary = "Keşidicinin geçmiş ödeme performansı son derece olumludur.";
  } else if (score >= 50) {
    label = "ORTA RİSK";
    color = COLORS.warning;
    summary = "Ödeme geçmişi karışık. Ek teminat istenebilir.";
  } else if (score >= 25) {
    label = "YÜKSEK RİSK";
    color = COLORS.danger;
    summary = "Dikkatli olunmalı. Uzman onayı gereklidir.";
  }

  return { score, label, color, summary };
}

function sendWhatsApp(text: string) {
  const url = `https://wa.me/905407254626?text=${encodeURIComponent(text)}`;
  Linking.openURL(url).catch(() =>
    Alert.alert("WhatsApp açılamadı", "Lütfen WhatsApp'ı yükleyin.")
  );
}

// ─────────────────────────────────────────
// TYPES & INITIAL STATE
// ─────────────────────────────────────────
const INITIAL_FORM = {
  vknTckn: "",
  checkIndex: "",
  bouncedCount: "",
  bouncedAmount: "",
  paymentPct: "",
  protestCount: "",
};

// ─────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  icon?: string;
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.fieldRow}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={16}
            color={COLORS.gold}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          keyboardType={keyboardType}
          style={s.input}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

// Risk gauge (arc)
function RiskGauge({ score, color }: { score: number; color: string }) {
  return (
    <View style={s.gaugeWrap}>
      <View style={[s.gaugeOuter, { borderColor: color }]}>
        <View style={s.gaugeInner}>
          <Text style={[s.gaugeScore, { color }]}>{score}</Text>
          <Text style={s.gaugeMax}>/100</Text>
        </View>
      </View>
    </View>
  );
}

// Simple bar chart
function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <View style={s.chart}>
      {YEARS.map((y, i) => (
        <View key={y} style={s.barWrap}>
          <View
            style={[
              s.bar,
              {
                height: Math.max((data[i] / max) * 100, 4),
                backgroundColor: i === YEARS.length - 1 ? COLORS.gold : "rgba(245,158,11,0.45)",
              },
            ]}
          />
          <Text style={s.barLabel}>{y.slice(2)}</Text>
        </View>
      ))}
    </View>
  );
}

// Donut chart (SVG-free, just two arcs using border trick)
function DonutChart({ pct }: { pct: number }) {
  const filled = Math.round(pct);
  return (
    <View style={s.donutWrap}>
      <View style={s.donutOuter}>
        <View style={[s.donutFill, { opacity: filled / 100 }]} />
        <View style={s.donutHole}>
          <Text style={[s.donutPct, { color: COLORS.gold }]}>{filled}%</Text>
          <Text style={s.donutSub}>Ödendi</Text>
        </View>
      </View>
      <View style={s.donutLegend}>
        <View style={s.legendRow}>
          <View style={[s.dot, { backgroundColor: COLORS.gold }]} />
          <Text style={s.legendTxt}>Arılan</Text>
        </View>
        <View style={s.legendRow}>
          <View style={[s.dot, { backgroundColor: COLORS.slate }]} />
          <Text style={s.legendTxt}>Ödenen</Text>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────
export default function RiskScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 60 : insets.top;

  const [form, setForm] = useState(INITIAL_FORM);
  const [phase, setPhase] = useState<"form" | "analyzing" | "result">("form");
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof calcRiskScore> | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassInput, setShowPassInput] = useState(false);

  // Fake year-by-year data based on paymentPct
  const payPct = parseFloat(form.paymentPct) || 50;
  const yearlyData = YEARS.map((_, i) =>
    Math.max(0, Math.min(100, payPct - (YEARS.length - 1 - i) * 4 + Math.round(Math.random() * 6 - 3)))
  );

  const set = (k: keyof typeof INITIAL_FORM) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const canSubmit =
    form.vknTckn.trim().length >= 10 &&
    form.checkIndex.trim() !== "" &&
    form.paymentPct.trim() !== "";

  const ANALYSIS_STEPS = [
    "VKN/TCKN doğrulanıyor...",
    "Çek endeksi hesaplanıyor...",
    "Arkası yazılan çekler taranıyor...",
    "Ödeme performansı analiz ediliyor...",
    "Protestolu senet kaydı kontrol ediliyor...",
    "Risk skoru hesaplanıyor...",
  ];

  const startAnalysis = async () => {
    if (!canSubmit) {
      Alert.alert("Eksik bilgi", "VKN/TCKN, Çek Endeksi ve Ödeme Yüzdesi zorunludur.");
      return;
    }
    setPhase("analyzing");
    setStepIdx(0);
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setStepIdx(i);
      await new Promise((r) => setTimeout(r, 4000));
    }
    setResult(calcRiskScore(form));
    setPhase("result");
  };

  const handleUnlock = () => {
    if (password === "BEEAI2026") {
      setUnlocked(true);
      setShowPassInput(false);
    } else {
      Alert.alert("Hata", "Yanlış şifre. Müşteri temsilcinizden alınız.");
    }
    setPassword("");
  };

  const handleWhatsApp = () => {
    if (!result) return;
    const bounced = parseInt(form.bouncedCount) || 0;
    const protest = parseInt(form.protestCount) || 0;
    const msg =
      `📊 BeeAI Risk Raporu\n` +
      `──────────────────\n` +
      `VKN/TCKN: ${form.vknTckn}\n` +
      `Çek Endeksi: ${form.checkIndex}\n` +
      `Ödeme Yüzdesi: %${form.paymentPct}\n` +
      `Arkası Yazılan Çek: ${bounced} adet / ${form.bouncedAmount} ₺\n` +
      `Protestolu Senet: ${protest} adet\n` +
      `──────────────────\n` +
      `RİSK SKORU: ${result.score}/100\n` +
      `KARAR: ${result.label}\n` +
      `──────────────────\n` +
      `${result.summary}\n` +
      `\nBeeAI Risk Engine v1.0`;
    sendWhatsApp(msg);
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setPhase("form");
    setResult(null);
    setUnlocked(false);
    setShowPassInput(false);
    setPassword("");
  };

  return (
    <View style={s.container}>
      {/* HEADER */}
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        style={[s.header, { paddingTop: topInset + 10 }]}
      >
        <View style={s.headerBadge}>
          <Ionicons name="shield-half" size={14} color={COLORS.gold} />
          <Text style={s.badgeTxt}>BeeAI RISK</Text>
        </View>
        <Text style={s.h1}>Risk Analiz Modülü</Text>
        <Text style={s.h2}>
          Keşideci ödeme performansı ve risk istihbaratı. Kriminal modülüyle
          bağlantısı yoktur.
        </Text>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: MAX_W }}>
          {/* ── FORM PHASE ── */}
          {phase === "form" && (
            <View style={s.card}>
              <Text style={s.sectionTitle}>
                <Ionicons name="document-text-outline" size={14} color={COLORS.gold} />{" "}
                VERİ GİRİŞİ (FİNDEKS BENZERİ)
              </Text>

              <Field
                label="Keşideci VKN/TCKN"
                value={form.vknTckn}
                onChangeText={set("vknTckn")}
                placeholder="Keşideci VKN/TCKN"
                keyboardType="numeric"
                icon="person-outline"
              />
              <Field
                label="Çek Endeksi"
                value={form.checkIndex}
                onChangeText={set("checkIndex")}
                placeholder="850"
                keyboardType="numeric"
                icon="trending-up-outline"
              />
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Arkası Yazılan (Adet)"
                    value={form.bouncedCount}
                    onChangeText={set("bouncedCount")}
                    placeholder="2"
                    keyboardType="numeric"
                    icon="close-circle-outline"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Field
                    label="Arkası Yazılan (Tutar)"
                    value={form.bouncedAmount}
                    onChangeText={set("bouncedAmount")}
                    placeholder="11.000.000"
                    keyboardType="numeric"
                    icon="cash-outline"
                  />
                </View>
              </View>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Ödeme Yüzdesi (%)"
                    value={form.paymentPct}
                    onChangeText={set("paymentPct")}
                    placeholder="50"
                    keyboardType="numeric"
                    icon="checkmark-circle-outline"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Field
                    label="Protestolu Senet (Adet)"
                    value={form.protestCount}
                    onChangeText={set("protestCount")}
                    placeholder="1"
                    keyboardType="numeric"
                    icon="warning-outline"
                  />
                </View>
              </View>

              <Pressable
                onPress={startAnalysis}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  s.submitBtn,
                  !canSubmit && { opacity: 0.45 },
                  pressed && canSubmit && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Ionicons name="analytics" size={18} color={COLORS.slate} />
                <Text style={s.submitTxt}>Risk Analizini Başlat</Text>
              </Pressable>
            </View>
          )}

          {/* ── ANALYZING PHASE ── */}
          {phase === "analyzing" && (
            <View style={s.card}>
              <Text style={s.sectionTitle}>🔍 ANALİZ DEVAM EDİYOR</Text>
              {ANALYSIS_STEPS.map((step, i) => {
                const done = i < stepIdx;
                const active = i === stepIdx;
                return (
                  <View key={i} style={[s.stepRow, active && s.stepActive]}>
                    <Ionicons
                      name={done ? "checkmark-circle" : active ? "radio-button-on" : "ellipse-outline"}
                      size={18}
                      color={done ? COLORS.success : active ? COLORS.gold : COLORS.muted}
                    />
                    <Text style={[s.stepTxt, active && { color: COLORS.gold, fontWeight: "700" }]}>
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── RESULT PHASE ── */}
          {phase === "result" && result && (
            <>
              {/* Risk Score Card */}
              <View style={s.card}>
                <Text style={s.sectionTitle}>📊 RİSK ANALİZ RAPORU</Text>
                <View style={s.resultTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.riskLabel}>RİSK SKORU</Text>
                    <RiskGauge score={result.score} color={result.color} />
                    <Text style={[s.riskDecision, { color: result.color }]}>
                      {result.label}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.riskLabel}>YILLIK ÖDEME PERFORMANSI</Text>
                    <BarChart data={yearlyData} />
                  </View>
                </View>

                <View style={s.divider} />

                <View style={s.resultBottom}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.riskLabel}>ARKASI YAZILAN/ÖDENEN</Text>
                    <DonutChart pct={payPct} />
                  </View>
                  <View style={{ flex: 1.2, paddingLeft: 16 }}>
                    <Text style={s.riskLabel}>ÖZET FİNANSAL GEÇMİŞ</Text>
                    <Text style={s.summaryTxt}>{result.summary}</Text>
                    <View style={s.statRow}>
                      <Ionicons name="person-outline" size={13} color={COLORS.muted} />
                      <Text style={s.statTxt}>VKN: {form.vknTckn}</Text>
                    </View>
                    <View style={s.statRow}>
                      <Ionicons name="trending-up-outline" size={13} color={COLORS.muted} />
                      <Text style={s.statTxt}>Endeks: {form.checkIndex}</Text>
                    </View>
                    <View style={s.statRow}>
                      <Ionicons name="close-circle-outline" size={13} color={COLORS.muted} />
                      <Text style={s.statTxt}>
                        Arkası Yazılan: {form.bouncedCount || "0"} adet
                      </Text>
                    </View>
                    <View style={s.statRow}>
                      <Ionicons name="warning-outline" size={13} color={COLORS.muted} />
                      <Text style={s.statTxt}>
                        Protestolu: {form.protestCount || "0"} adet
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              {!unlocked ? (
                <View style={s.card}>
                  {!showPassInput ? (
                    <Pressable
                      style={({ pressed }) => [s.submitBtn, pressed && { opacity: 0.85 }]}
                      onPress={() => setShowPassInput(true)}
                    >
                      <Ionicons name="lock-closed" size={18} color={COLORS.slate} />
                      <Text style={s.submitTxt}>Raporu Kilidi Aç</Text>
                    </Pressable>
                  ) : (
                    <>
                      <Text style={[s.fieldLabel, { marginBottom: 8 }]}>
                        Şifre Girin
                      </Text>
                      <Text style={[s.summaryTxt, { marginBottom: 12 }]}>
                        Şifrenizi bilmiyorsanız müşteri temsilcinizden alınız.
                      </Text>
                      <TextInput
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Şifre"
                        placeholderTextColor={COLORS.muted}
                        style={s.input}
                        autoCapitalize="none"
                      />
                      <Pressable
                        style={({ pressed }) => [s.submitBtn, { marginTop: 8 }, pressed && { opacity: 0.85 }]}
                        onPress={handleUnlock}
                      >
                        <Text style={s.submitTxt}>Mührü Kır</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              ) : (
                <View style={s.card}>
                  <Pressable
                    style={({ pressed }) => [
                      s.submitBtn,
                      { backgroundColor: "#25D366" },
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={handleWhatsApp}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                    <Text style={[s.submitTxt, { color: "#fff" }]}>
                      WhatsApp'a Raporu Paylaş
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [s.secondaryBtn, pressed && { opacity: 0.75 }]}
                    onPress={reset}
                  >
                    <Ionicons name="refresh" size={16} color={COLORS.gold} />
                    <Text style={s.secondaryTxt}>Yeni Analiz</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 6,
  },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeTxt: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: COLORS.gold,
    letterSpacing: 2,
  },
  h1: { fontSize: 22, fontFamily: "Poppins_800ExtraBold", color: "#fff" },
  h2: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 18,
  },
  scroll: { flex: 1, paddingHorizontal: 16, marginTop: -14 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: COLORS.gold,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  row: { flexDirection: "row" },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldRow: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.text,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitTxt: {
    fontSize: 14,
    fontFamily: "Poppins_800ExtraBold",
    color: COLORS.slate,
  },
  secondaryBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryTxt: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.gold,
  },
  // Steps
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  stepActive: { backgroundColor: "rgba(245,158,11,0.08)" },
  stepTxt: { fontSize: 13, fontFamily: "Poppins_400Regular", color: COLORS.muted, flex: 1 },
  // Results
  resultTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  resultBottom: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginTop: 16 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  riskLabel: {
    fontSize: 9,
    fontFamily: "Poppins_700Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  riskDecision: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  summaryTxt: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: COLORS.muted,
    lineHeight: 17,
    marginBottom: 12,
  },
  statRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  statTxt: { fontSize: 11, fontFamily: "Poppins_400Regular", color: COLORS.muted },
  // Gauge
  gaugeWrap: { alignItems: "center", marginVertical: 4 },
  gaugeOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeInner: { alignItems: "center" },
  gaugeScore: { fontSize: 26, fontFamily: "Poppins_800ExtraBold" },
  gaugeMax: { fontSize: 10, fontFamily: "Poppins_400Regular", color: COLORS.muted },
  // Bar chart
  chart: { flexDirection: "row", alignItems: "flex-end", height: 110, gap: 4 },
  barWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: 110 },
  bar: { width: "75%", borderRadius: 4, marginBottom: 4 },
  barLabel: { fontSize: 9, fontFamily: "Poppins_600SemiBold", color: COLORS.muted },
  // Donut
  donutWrap: { alignItems: "center" },
  donutOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: COLORS.slate,
  },
  donutFill: {
    position: "absolute",
    inset: 0,
    borderRadius: 40,
    backgroundColor: COLORS.gold,
  } as any,
  donutHole: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  donutPct: { fontSize: 14, fontFamily: "Poppins_800ExtraBold" },
  donutSub: { fontSize: 8, fontFamily: "Poppins_400Regular", color: COLORS.muted },
  donutLegend: { flexDirection: "row", gap: 12, marginTop: 8 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 9, fontFamily: "Poppins_400Regular", color: COLORS.muted },
});
