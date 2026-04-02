import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser, CheckItem, OfferRequest } from "@/contexts/UserContext";
import { GlassCard } from "@/components/GlassCard";
import { money } from "@/shared/utils/format";

const { width, height } = Dimensions.get("window");

function fmtCountdown(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(t / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function OffersScreen() {
  const insets = useSafeAreaInsets();
  const {
    user,
    startOfferCollection,
    ensureOfferProgress,
    requestRevision,
    pickOffer,
    linkInvoice,
  } = useUser();

  const [selected, setSelected] = useState<{
    check: CheckItem;
    req?: OfferRequest;
  } | null>(null);
  const [view, setView] = useState<"active" | "history">("active");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const reqs = (user.offerRequests || []).filter(
        (r) => r.status === "collecting",
      );
      for (const r of reqs) {
        await ensureOfferProgress(r.checkId);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [user]);

  const checks = user?.checks || [];

  // ⚡ Bolt: Cache offer requests by checkId to optimize O(N*M) lookup into O(N+M)
  const reqMap = useMemo(() => {
    const reqs = user?.offerRequests || [];
    const map = new Map<string, OfferRequest>();
    for (const req of reqs) {
      map.set(req.checkId, req);
    }
    return map;
  }, [user?.offerRequests]);

  const getReq = React.useCallback((checkId: string) => reqMap.get(checkId), [reqMap]);

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
    const check = (user?.checks || []).find((c) => c.id === selected.check.id) || selected.check;
    return { check, req };
  }, [selected, getReq, user?.checks]);

  const topInset = Platform.OS === "web" ? 60 : insets.top;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={[styles.header, { paddingTop: topInset + 10 }]}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.headerContent}
        >
          <Text style={styles.h1}>Teklifler</Text>
          <Text style={styles.h2}>
            15 Dakika Hedefi: En az 3 teklif. Tüm süreç otonom kontrolünde.
          </Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.toggleContainer}>
        <GlassCard style={styles.toggleBg} intensity={10} overlayStyle={styles.toggleOverlay}>
          <Pressable
            style={[styles.toggleBtn, view === "active" && styles.toggleBtnActive]}
            onPress={() => setView("active")}
          >
            <Text style={[styles.toggleText, view === "active" && styles.toggleTextActive]}>Aktif</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, view === "history" && styles.toggleBtnActive]}
            onPress={() => setView("history")}
          >
            <Text style={[styles.toggleText, view === "history" && styles.toggleTextActive]}>Geçmiş</Text>
          </Pressable>
        </GlassCard>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {view === "active" ? (
          checks.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🧺</Text>
                <Text style={styles.emptyTitle}>Henüz kovanınız boş</Text>
                <Text style={styles.emptyText}>
                  Önce “Çek Yükle” ekranından kovana ilk çekinizi bırakmalısınız.
                </Text>
              </GlassCard>
            </Animated.View>
          ) : (
            checks.map((c, idx) => {
              const r = getReq(c.id);
              const status = r?.status || "yok";
              const offersCount = r?.offers?.length || 0;

              const badge =
                status === "collecting"
                  ? "TOPLANIYOR"
                  : status === "ready"
                    ? "HAZIR"
                    : status === "expired"
                      ? "SÜRE DOLDU"
                      : "BAŞLAT";

              return (
                <Animated.View
                  key={c.id}
                  entering={FadeInDown.delay(100 + idx * 100).springify()}
                  layout={Layout.springify()}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.card,
                      pressed && { opacity: 0.88 },
                    ]}
                    onPress={() => open(c)}
                  >
                    <View style={styles.cardRow}>
                      <View style={styles.docIcon}>
                        <Ionicons
                          name="document-text"
                          size={20}
                          color={Colors.gold}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {c.issuerName}
                        </Text>
                        <Text style={styles.cardSub}>
                          {c.checkNo} • Vade {c.dueDate}
                        </Text>
                        <Text style={styles.cardAmount}>₺{money(c.amount)}</Text>

                        {c.dna.seenBefore && (
                          <View style={styles.warnRow}>
                            <Ionicons
                              name="warning"
                              size={14}
                              color={Colors.gold}
                            />
                            <Text style={styles.warnText}>
                              Çek DNA: Sistemde kayıtlı
                            </Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={[
                          styles.badge,
                          status === "ready"
                            ? styles.badgeReady
                            : status === "collecting"
                              ? styles.badgeCollect
                              : styles.badgeIdle,
                        ]}
                      >
                        <Text style={styles.badgeText}>{badge}</Text>
                        <View style={styles.badgeCountRow}>
                          <Ionicons
                            name="flash"
                            size={10}
                            color={
                              status === "ready"
                                ? Colors.primary
                                : Colors.textMuted
                            }
                          />
                          <Text style={styles.badgeSub}>{offersCount}/3</Text>
                        </View>
                      </View>
                    </View>

                    {!r && (
                      <Pressable
                        style={({ pressed }) => [
                          styles.startBtn,
                          pressed && { opacity: 0.9 },
                        ]}
                        onPress={() => start(c)}
                      >
                        <Text style={styles.startText}>15dk Akışı Başlat</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={Colors.slate}
                        />
                      </Pressable>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })
          )
        ) : (
          (user?.completedTransactions || []).length === 0 ? (
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📜</Text>
                <Text style={styles.emptyTitle}>Henüz geçmiş işlem yok</Text>
                <Text style={styles.emptyText}>
                  Tamamladığınız işlemler burada listelenir.
                </Text>
              </GlassCard>
            </Animated.View>
          ) : (
            (user?.completedTransactions || []).map((trx, idx) => (
              <Animated.View
                key={trx.id}
                entering={FadeInDown.delay(100 + idx * 100).springify()}
              >
                <GlassCard style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.partnerInfo}>
                      <View style={[styles.partnerDot, { backgroundColor: Colors.primary }]} />
                      <Text style={styles.historyPartner}>{trx.offer.partnerCode}</Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(trx.completedAt).toLocaleDateString("tr-TR")}
                    </Text>
                  </View>
                  <View style={styles.historyContent}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyIssuer} numberOfLines={1}>{trx.check.issuerName}</Text>
                      <Text style={styles.historySub}>{trx.check.checkNo} • ₺{money(trx.check.amount)}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.historyNet}>₺{money(trx.offer.netPay)}</Text>
                      <Text style={styles.historyRate}>%{trx.offer.discountRate} Oran</Text>
                    </View>
                  </View>
                  <View style={styles.historyBadge}>
                    <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
                    <Text style={styles.historyBadgeText}>İŞLEM TAMAMLANDI</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )
        )}
      </ScrollView>

      <Modal
        visible={!!refreshSelected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelected(null)}
          />
          <Animated.View
            entering={FadeInDown.springify()}
            style={[styles.modal, { paddingBottom: insets.bottom + 20 }]}
          >
            <View style={styles.modalIndicator} />
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalTitle}>Teklif Analizi</Text>
                <Text style={styles.modalSub}>
                  Sistem partner ağından veri topluyor.
                </Text>
              </View>
              <Pressable
                onPress={() => setSelected(null)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={Colors.white} />
              </Pressable>
            </View>

            {refreshSelected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <GlassCard style={styles.modalCheckInfo} intensity={20}>
                  <Text style={styles.modalH}>
                    {refreshSelected.check.issuerName}
                  </Text>
                  <Text style={styles.modalAmount}>
                    ₺{money(refreshSelected.check.amount)}
                  </Text>
                  <Text style={styles.modalCheckSub}>
                    {refreshSelected.check.checkNo} • Vade{" "}
                    {refreshSelected.check.dueDate}
                  </Text>

                  {refreshSelected.check.invoice ? (
                    <View style={styles.modalInvoiceBadge}>
                      <Ionicons name="receipt" size={12} color={Colors.gold} />
                      <Text style={styles.modalInvoiceText}>
                        Fatura: {refreshSelected.check.invoice.invoiceNo} (₺{money(refreshSelected.check.invoice.invoiceAmount || 0)})
                      </Text>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.addInvoiceLink}
                      onPress={() => {
                        Alert.prompt(
                          "Fatura Ekle",
                          "Fatura numarasını giriniz:",
                          [
                            { text: "Vazgeç", style: "cancel" },
                            {
                              text: "Ekle",
                              onPress: (val) => {
                                if (val) linkInvoice(refreshSelected.check.id, val);
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={14} color={Colors.gold} />
                      <Text style={styles.addInvoiceText}>Fatura Eşleştir</Text>
                    </Pressable>
                  )}
                </GlassCard>

                {!refreshSelected.req ? (
                  <Pressable
                    style={styles.modalPrimary}
                    onPress={() => start(refreshSelected.check)}
                  >
                    <Text style={styles.modalPrimaryText}>
                      Hemen Akışı Başlat
                    </Text>
                    <Ionicons name="flash" size={18} color={Colors.slate} />
                  </Pressable>
                ) : (
                  <>
                    <View style={styles.kpis}>
                      <View style={styles.kpi}>
                        <Ionicons
                          name="timer-outline"
                          size={14}
                          color={Colors.gold}
                        />
                        <Text style={styles.kpiValue}>
                          {fmtCountdown(refreshSelected.req.deadlineAt - now)}
                        </Text>
                        <Text style={styles.kpiLabel}>SÜRE</Text>
                      </View>
                      <View style={styles.kpi}>
                        <Ionicons
                          name="flash-outline"
                          size={14}
                          color={Colors.primary}
                        />
                        <Text style={styles.kpiValue}>
                          {refreshSelected.req.offers.length}/3
                        </Text>
                        <Text style={styles.kpiLabel}>TEKLİF</Text>
                      </View>
                      <View style={styles.kpi}>
                        <Ionicons
                          name="git-branch-outline"
                          size={14}
                          color={Colors.gold}
                        />
                        <Text style={styles.kpiValue}>
                          {refreshSelected.check.lane === "pilot-micro"
                            ? "PİLOT"
                            : "STD"}
                        </Text>
                        <Text style={styles.kpiLabel}>LİMİT</Text>
                      </View>
                    </View>

                    <View style={styles.offerList}>
                      {refreshSelected.req.offers.map((o) => (
                        <GlassCard
                          key={o.id}
                          style={styles.offerCard}
                          intensity={10}
                        >
                          <View style={styles.offerTop}>
                            <View style={styles.partnerInfo}>
                              <View style={styles.partnerDot} />
                              <Text style={styles.offerPartner}>
                                {o.partnerCode}
                              </Text>
                            </View>
                            <Text style={styles.offerRate}>
                              %{o.discountRate}
                            </Text>
                          </View>
                          <View style={styles.offerDetails}>
                            <View>
                              <Text style={styles.offerLine}>
                                Masraf: ₺{money(o.fees)}
                              </Text>
                              <Text style={styles.offerNet}>
                                Net Ödeme: ₺{money(o.netPay)}
                              </Text>
                            </View>
                            <Pressable
                              style={styles.acceptBtn}
                              onPress={async () => {
                                if (refreshSelected) {
                                  if (Platform.OS !== "web") {
                                    Haptics.notificationAsync(
                                      Haptics.NotificationFeedbackType.Success,
                                    );
                                  }
                                  await pickOffer(
                                    refreshSelected.check.id,
                                    o.id,
                                  );
                                  setSelected(null);
                                }
                              }}
                            >
                              <Text style={styles.acceptBtnText}>Onayla</Text>
                            </Pressable>
                          </View>
                          {!!o.notes && (
                            <Text style={styles.offerNote}>{o.notes}</Text>
                          )}
                        </GlassCard>
                      ))}

                      {refreshSelected.req.offers.length === 0 && (
                        <View style={styles.waitBox}>
                          <ActivityIndicator color={Colors.gold} size="small" />
                          <Text style={styles.waitText}>
                            Arılar teklif topluyor…
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.actionsRow}>
                      <Pressable
                        onPress={async () => {
                          await ensureOfferProgress(refreshSelected.check.id);
                        }}
                        style={({ pressed }) => [
                          styles.secondaryBtn,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Ionicons
                          name="refresh"
                          size={16}
                          color={Colors.gold}
                        />
                        <Text style={styles.secondaryText}>Güncelle</Text>
                      </Pressable>

                      <Pressable
                        onPress={async () => {
                          await requestRevision(refreshSelected.check.id);
                        }}
                        disabled={
                          refreshSelected.req?.revisionUsed ||
                          refreshSelected.req?.offers?.length === 0
                        }
                        style={({ pressed }) => [
                          styles.secondaryBtn,
                          (refreshSelected.req?.revisionUsed ||
                            refreshSelected.req?.offers?.length === 0) && {
                            opacity: 0.5,
                          },
                          pressed &&
                            !(
                              refreshSelected.req?.revisionUsed ||
                              refreshSelected.req?.offers?.length === 0
                            ) && { opacity: 0.8 },
                        ]}
                      >
                        <Ionicons
                          name="swap-horizontal"
                          size={16}
                          color={Colors.gold}
                        />
                        <Text style={styles.secondaryText}>
                          {refreshSelected.req?.revisionUsed
                            ? "Revize Edildi"
                            : "Revize İste"}
                        </Text>
                      </Pressable>
                    </View>

                    <Text style={styles.legal}>
                      BeeAI SLA: Teklifler seçili partner ağından toplanır.
                      Sonuçlar piyasa koşullarına göre otonom olarak simüle
                      edilir.
                    </Text>
                  </>
                )}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerContent: { gap: 6 },
  h1: { fontSize: 24, fontFamily: "Poppins_800ExtraBold", color: Colors.white },
  h2: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },

  toggleContainer: {
    paddingHorizontal: 20,
    marginTop: -25,
    marginBottom: 10,
  },
  toggleBg: {
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  toggleOverlay: {
    flexDirection: "row",
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: Colors.gold,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: "rgba(255,255,255,0.6)",
  },
  toggleTextActive: {
    color: Colors.slate,
  },

  scroll: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.slate,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
  },
  cardSub: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardAmount: {
    fontSize: 16,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.primary,
    marginTop: 4,
  },
  warnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  warnText: {
    fontSize: 9,
    fontFamily: "Poppins_700Bold",
    color: Colors.goldDark,
  },

  badge: {
    width: 90,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  badgeReady: {
    backgroundColor: "rgba(34,197,94,0.08)",
    borderColor: "rgba(34,197,94,0.15)",
  },
  badgeCollect: {
    backgroundColor: Colors.goldLight,
    borderColor: "rgba(251,191,36,0.2)",
  },
  badgeIdle: {
    backgroundColor: "rgba(0,0,0,0.03)",
    borderColor: "rgba(0,0,0,0.06)",
  },
  badgeText: {
    fontSize: 8,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.slate,
    letterSpacing: 0.5,
  },
  badgeCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  badgeSub: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
  },

  startBtn: {
    marginTop: 14,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startText: {
    fontSize: 13,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.slate,
  },

  emptyCard: { padding: 30, alignItems: "center" },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.slate,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: Colors.slate,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    maxHeight: height * 0.9,
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
    marginBottom: 20,
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

  modalCheckInfo: { padding: 16, marginBottom: 20 },
  modalH: { fontSize: 15, fontFamily: "Poppins_700Bold", color: Colors.gold },
  modalAmount: {
    fontSize: 28,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.white,
    marginVertical: 4,
  },
  modalCheckSub: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 10,
  },
  modalInvoiceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  modalInvoiceText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.gold,
  },
  addInvoiceLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  addInvoiceText: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.gold,
  },

  modalPrimary: {
    backgroundColor: Colors.gold,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  modalPrimaryText: {
    fontSize: 15,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.slate,
  },

  kpis: { flexDirection: "row", gap: 12, marginBottom: 24 },
  kpi: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  kpiLabel: {
    fontSize: 8,
    fontFamily: "Poppins_700Bold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.white,
  },

  offerList: { gap: 14, marginBottom: 24 },
  offerCard: { padding: 16, borderRadius: 20 },
  offerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  partnerInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  partnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  offerPartner: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  offerRate: {
    fontSize: 16,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.gold,
  },
  offerDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  offerLine: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  offerNet: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
    marginTop: 4,
  },
  acceptBtn: {
    backgroundColor: "rgba(34,197,94,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  acceptBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },
  offerNote: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.4)",
    marginTop: 10,
    fontStyle: "italic",
  },

  waitBox: { alignItems: "center", padding: 20, gap: 12 },
  waitText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "rgba(255,255,255,0.5)",
  },

  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.gold,
  },

  legal: {
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    lineHeight: 14,
  },

  historyCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 24,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  historyPartner: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
  },
  historyDate: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
  },
  historyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyIssuer: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
  },
  historySub: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyNet: {
    fontSize: 15,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.primary,
  },
  historyRate: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "rgba(34,197,94,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  historyBadgeText: {
    fontSize: 9,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.primary,
  },
});
