import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useUser, CheckItem, OfferRequest } from "@/contexts/UserContext";

function money(n: number) {
  try {
    return n.toLocaleString("tr-TR");
  } catch {
    return String(n);
  }
}

function fmtCountdown(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(t / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function OffersScreen() {
  const insets = useSafeAreaInsets();
  const { user, startOfferCollection, ensureOfferProgress, requestRevision } = useUser();

  const [selected, setSelected] = useState<{ check: CheckItem; req?: OfferRequest } | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const reqs = (user.offerRequests || []).filter((r) => r.status === "collecting");
      for (const r of reqs) {
        await ensureOfferProgress(r.checkId);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [user]);

  const checks = user?.checks || [];
  const requests = user?.offerRequests || [];

  const getReq = (checkId: string) => requests.find((r) => r.checkId === checkId);

  const open = (check: CheckItem) => {
    const req = getReq(check.id);
    setSelected({ check, req });
  };

  const start = async (check: CheckItem) => {
    await startOfferCollection(check.id);
    await ensureOfferProgress(check.id);
    open(check);
  };

  const refreshSelected = useMemo(() => {
    if (!selected) return null;
    const req = getReq(selected.check.id);
    return { check: selected.check, req };
  }, [selected, requests]);

  return (
    <LinearGradient colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]} style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Teklifler</Text>
        <Text style={styles.h2}>15 Dakika hedefi: en az 3 teklif. Pilot revize turu açık.</Text>

        {checks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧺</Text>
            <Text style={styles.emptyTitle}>Henüz çek yok</Text>
            <Text style={styles.emptyText}>Önce “Çek Yükle” ekranından kovana bir çek bırak.</Text>
          </View>
        ) : (
          checks.map((c) => {
            const r = getReq(c.id);
            const status = r?.status || "yok";
            const offersCount = r?.offers?.length || 0;

            const badge =
              status === "collecting" ? "TOPLANIYOR" : status === "ready" ? "HAZIR" : status === "expired" ? "SÜRE DOLDU" : "BAŞLAT";

            return (
              <Pressable key={c.id} style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]} onPress={() => open(c)}>
                <View style={styles.cardRow}>
                  <View style={styles.docIcon}>
                    <Ionicons name="document-text" size={18} color={Colors.primary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {c.issuerName}
                    </Text>
                    <Text style={styles.cardSub}>
                      {c.checkNo} • Vade {c.dueDate} • ₺{money(c.amount)}
                    </Text>

                    {c.dna.seenBefore && (
                      <View style={styles.warnRow}>
                        <Ionicons name="warning" size={14} color="#b45309" />
                        <Text style={styles.warnText}>Çek DNA: daha önce görüldü</Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.badge, status === "ready" ? styles.badgeReady : status === "collecting" ? styles.badgeCollect : styles.badgeIdle]}>
                    <Text style={styles.badgeText}>{badge}</Text>
                    <Text style={styles.badgeSub}>{offersCount}/3</Text>
                  </View>
                </View>

                {!r && (
                  <Pressable style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.9 }]} onPress={() => start(c)}>
                    <Ionicons name="flash" size={16} color={Colors.white} />
                    <Text style={styles.startText}>Teklif Topla</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!refreshSelected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { paddingBottom: insets.bottom + 14 }]}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Teklif Detayı</Text>
              <Pressable onPress={() => setSelected(null)} hitSlop={10}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {refreshSelected && (
              <>
                <Text style={styles.modalH}>{refreshSelected.check.issuerName}</Text>
                <Text style={styles.modalSub}>
                  {refreshSelected.check.checkNo} • ₺{money(refreshSelected.check.amount)} • Vade {refreshSelected.check.dueDate}
                </Text>

                {!refreshSelected.req ? (
                  <Pressable style={styles.modalPrimary} onPress={() => start(refreshSelected.check)}>
                    <Ionicons name="flash" size={18} color={Colors.white} />
                    <Text style={styles.modalPrimaryText}>15 Dakika Akışını Başlat</Text>
                  </Pressable>
                ) : (
                  <>
                    <View style={styles.kpis}>
                      <View style={styles.kpi}>
                        <Text style={styles.kpiLabel}>Geri Sayım</Text>
                        <Text style={styles.kpiValue}>{fmtCountdown(refreshSelected.req.deadlineAt - now)}</Text>
                      </View>
                      <View style={styles.kpi}>
                        <Text style={styles.kpiLabel}>Teklif</Text>
                        <Text style={styles.kpiValue}>{refreshSelected.req.offers.length}/3</Text>
                      </View>
                      <View style={styles.kpi}>
                        <Text style={styles.kpiLabel}>Şerit</Text>
                        <Text style={styles.kpiValue}>{refreshSelected.check.lane === "pilot-micro" ? "Pilot Limit" : "Standart"}</Text>
                      </View>
                    </View>

                    <View style={styles.offerList}>
                      {refreshSelected.req.offers.map((o) => (
                        <View key={o.id} style={styles.offerCard}>
                          <View style={styles.offerTop}>
                            <Text style={styles.offerPartner}>{o.partnerCode}</Text>
                            <Text style={styles.offerRate}>%{o.discountRate}</Text>
                          </View>
                          <Text style={styles.offerLine}>Masraf: ₺{money(o.fees)}</Text>
                          <Text style={styles.offerNet}>Net Ödeme: ₺{money(o.netPay)}</Text>
                          {!!o.notes && <Text style={styles.offerNote}>{o.notes}</Text>}
                        </View>
                      ))}

                      {refreshSelected.req.offers.length === 0 && (
                        <View style={styles.waitBox}>
                          <Text style={styles.waitEmoji}>🐝</Text>
                          <Text style={styles.waitText}>Arılar teklif topluyor…</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.actionsRow}>
                      <Pressable
                        onPress={async () => {
                          await ensureOfferProgress(refreshSelected.check.id);
                        }}
                        style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
                      >
                        <Ionicons name="refresh" size={16} color={Colors.primary} />
                        <Text style={styles.secondaryText}>Yenile</Text>
                      </Pressable>

                      <Pressable
                        onPress={async () => {
                          await requestRevision(refreshSelected.check.id);
                        }}
                        disabled={refreshSelected.req.revisionUsed || refreshSelected.req.offers.length === 0}
                        style={({ pressed }) => [
                          styles.secondaryBtn,
                          (refreshSelected.req.revisionUsed || refreshSelected.req.offers.length === 0) && { opacity: 0.5 },
                          pressed && !(refreshSelected.req.revisionUsed || refreshSelected.req.offers.length === 0) && { opacity: 0.9 },
                        ]}
                      >
                        <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
                        <Text style={styles.secondaryText}>{refreshSelected.req.revisionUsed ? "Revize Kullanıldı" : "Revize İste"}</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.legal}>
                      Pilot SLA: Teklifler seçili partner ağından toplanır. Endeks/sonuç bağlayıcı değildir.
                    </Text>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  h1: { fontSize: 20, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 6 },
  h2: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginBottom: 12, lineHeight: 18 },

  card: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 10 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  docIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(34,197,94,0.12)", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 13, fontFamily: "Poppins_700Bold", color: Colors.text },
  cardSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginTop: 3 },
  warnRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  warnText: { fontSize: 10, fontFamily: "Poppins_700Bold", color: "#b45309" },

  badge: { width: 86, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  badgeReady: { backgroundColor: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.18)" },
  badgeCollect: { backgroundColor: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.18)" },
  badgeIdle: { backgroundColor: "rgba(20,83,45,0.06)", borderColor: "rgba(20,83,45,0.12)" },
  badgeText: { fontSize: 9, fontFamily: "Poppins_800ExtraBold", color: Colors.text, letterSpacing: 0.4 },
  badgeSub: { fontSize: 11, fontFamily: "Poppins_700Bold", color: Colors.textMuted, marginTop: 3 },

  startBtn: { marginTop: 10, backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  startText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.white },

  empty: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 22, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: "center", marginTop: 20 },
  emptyEmoji: { fontSize: 34, marginBottom: 8 },
  emptyTitle: { fontSize: 14, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginBottom: 4 },
  emptyText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, textAlign: "center", lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#f7fff8", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)" },
  modalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontSize: 13, fontFamily: "Poppins_800ExtraBold", color: Colors.text },
  modalH: { fontSize: 15, fontFamily: "Poppins_800ExtraBold", color: Colors.text },
  modalSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textSecondary, marginTop: 4, marginBottom: 10 },

  modalPrimary: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  modalPrimaryText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.white },

  kpis: { flexDirection: "row", gap: 10, marginBottom: 12 },
  kpi: { flex: 1, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, padding: 10 },
  kpiLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: Colors.textMuted },
  kpiValue: { fontSize: 13, fontFamily: "Poppins_800ExtraBold", color: Colors.text, marginTop: 4 },

  offerList: { gap: 10, marginBottom: 12 },
  offerCard: { backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 18, padding: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  offerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  offerPartner: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.text },
  offerRate: { fontSize: 12, fontFamily: "Poppins_800ExtraBold", color: Colors.honeyDark },
  offerLine: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.textSecondary },
  offerNet: { fontSize: 12, fontFamily: "Poppins_800ExtraBold", color: Colors.primaryDark, marginTop: 4 },
  offerNote: { fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, marginTop: 6 },

  waitBox: { alignItems: "center", padding: 12 },
  waitEmoji: { fontSize: 20, marginBottom: 6 },
  waitText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.textSecondary },

  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  secondaryBtn: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 12, borderWidth: 1, borderColor: Colors.cardBorder, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.primary },

  legal: { fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.textMuted, lineHeight: 14 },
});
