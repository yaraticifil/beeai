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
  TextInput,
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

const { height } = Dimensions.get("window");

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
  } = useUser();

  const [selected, setSelected] = useState<{
    check: CheckItem;
    req?: OfferRequest;
  } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [tab, setTab] = useState<"active" | "history">("active");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ready" | "collecting">("all");
  const [selectedCouponId, setSelectedCouponId] = useState<string | undefined>(undefined);

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
  }, [user, ensureOfferProgress]);

  const rawChecks = useMemo(() => user?.checks || [], [user?.checks]);

  const reqMap = useMemo(() => {
    const reqs = user?.offerRequests || [];
    const map = new Map<string, OfferRequest>();
    for (const req of reqs) {
      map.set(req.checkId, req);
    }
    return map;
  }, [user?.offerRequests]);

  const checks = useMemo(() => {
    return rawChecks.filter((c) => {
      const r = reqMap.get(c.id);
      const status = r?.status || "yok";

      if (filter === "ready" && status !== "ready") return false;
      if (filter === "collecting" && status !== "collecting") return false;

      if (search) {
        const s = search.toLowerCase();
        return (
          c.issuerName.toLowerCase().includes(s) ||
          c.checkNo.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [rawChecks, reqMap, search, filter]);


  const getReq = React.useCallback((checkId: string) => reqMap.get(checkId), [reqMap]);

  const open = (check: CheckItem) => {
    const req = getReq(check.id);
    setSelected({ check, req });
    setSelectedCouponId(undefined);
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
  }, [selected, getReq]);

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

      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setTab("active")}
          style={[styles.tab, tab === "active" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>
            Aktif
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("history")}
          style={[styles.tab, tab === "history" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>
            Geçmiş
          </Text>
        </Pressable>
      </View>

      {tab === "active" && (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Keşideci veya çek no ara..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsContainer}>
              {[
                { id: "all", label: "Tümü" },
                { id: "ready", label: "Hazır" },
                { id: "collecting", label: "Toplanıyor" },
              ].map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setFilter(c.id as any)}
                  style={[styles.chip, filter === c.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filter === c.id && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "active" ? (
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
        ) : (user?.completedTransactions || []).length === 0 ? (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📜</Text>
              <Text style={styles.emptyTitle}>Geçmiş kaydı yok</Text>
              <Text style={styles.emptyText}>
                Onaylanan işlemleriniz burada listelenecek.
              </Text>
            </GlassCard>
          </Animated.View>
        ) : (
          (user?.completedTransactions || []).map((tx, idx) => {
            return (
              <Animated.View
                key={tx.id}
                entering={FadeInDown.delay(100 + idx * 100).springify()}
              >
                <GlassCard style={styles.card}>
                  <View style={styles.cardRow}>
                    <View
                      style={[
                        styles.docIcon,
                        { backgroundColor: Colors.primaryLight },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {tx.check.issuerName}
                      </Text>
                      <Text style={styles.cardSub}>
                        {tx.selectedOffer.partnerCode} •{" "}
                        {new Date(tx.completedAt).toLocaleDateString("tr-TR")}
                      </Text>
                      <Text style={styles.cardAmount}>
                        ₺{money(tx.check.amount)}
                      </Text>
                    </View>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyRate}>
                        %{tx.selectedOffer.discountRate}
                      </Text>
                      <Text style={styles.historyLabel}>ORAN</Text>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            );
          })
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
                </GlassCard>

                {user?.coupons && user.coupons.filter(c => !c.used).length > 0 && refreshSelected.req && (
                  <View style={styles.couponSection}>
                    <Text style={styles.couponSectionTitle}>Kullanılabilir Kuponlar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.couponScroll}>
                      {user.coupons.filter(c => !c.used).map(c => (
                        <Pressable
                          key={c.id}
                          onPress={() => setSelectedCouponId(selectedCouponId === c.id ? undefined : c.id)}
                          style={[styles.couponPill, selectedCouponId === c.id && styles.couponPillActive]}
                        >
                          <Ionicons name="ticket-outline" size={14} color={selectedCouponId === c.id ? Colors.slate : Colors.gold} />
                          <Text style={[styles.couponText, selectedCouponId === c.id && styles.couponTextActive]}>{c.title}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

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
                                    selectedCouponId
                                  );
                                  setSelected(null);
                                  setSelectedCouponId(undefined);
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

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 14,
    padding: 4,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: "rgba(255,255,255,0.6)",
  },
  tabTextActive: {
    color: Colors.slate,
  },

  scroll: { flex: 1, paddingHorizontal: 20, marginTop: 14 },
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

  filterSection: {
    marginTop: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.slate,
    paddingVertical: 8,
  },
  chipsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: {
    backgroundColor: Colors.slate,
    borderColor: Colors.slate,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: Colors.white,
  },

  historyMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  historyRate: {
    fontSize: 16,
    fontFamily: 'Poppins_800ExtraBold',
    color: Colors.slate,
  },
  historyLabel: {
    fontSize: 8,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textMuted,
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
  },

  couponSection: { marginBottom: 20 },
  couponSectionTitle: { fontSize: 11, fontFamily: 'Poppins_700Bold', color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  couponScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
  couponPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
  couponPillActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  couponText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.white },
  couponTextActive: { color: Colors.slate },

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
});
