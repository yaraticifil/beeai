import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { CONSUMABLE_ITEMS } from "@/constants/game";
import { useUser } from "@/contexts/UserContext";

interface ShopItem {
  id: string;
  emoji: string;
  name: string;
  description: string;
  cost: number;
  category: "iskonto" | "bonus" | "ozel";
  color: string;
  tag?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "coupon_5",
    emoji: "🎫",
    name: "%5 İskonto Kuponu",
    description: "Bir sonraki işleminizde %5 indirim",
    cost: 50,
    category: "iskonto",
    color: "#8b5cf6",
  },
  {
    id: "coupon_10",
    emoji: "🎟️",
    name: "%10 İskonto Kuponu",
    description: "Premium fatura iskontonu aktifleştir",
    cost: 100,
    category: "iskonto",
    color: "#7c3aed",
    tag: "Popüler",
  },
  { id: "extra_spin", emoji: "🎰", name: "Ekstra Çevirme", description: "Çark için +1 ekstra hak", cost: 20, category: "bonus", color: Colors.gold },
  { id: "triple_spin", emoji: "🎲", name: "3x Çevirme Paketi", description: "Çark için +3 ekstra hak", cost: 50, category: "bonus", color: Colors.goldDark, tag: "Tasarruflu" },
  {
    id: "flower_boost",
    emoji: "💨",
    name: "Çiçek Hızlandırıcı",
    description: "Bir çiçeği anında olgunlaştır",
    cost: 30,
    category: "bonus",
    color: Colors.primary,
  },
  {
    id: "double_honey",
    emoji: "💛",
    name: "2x Bal Pusulası",
    description: "30 dk boyunca 2 kat bal kazan",
    cost: 80,
    category: "ozel",
    color: "#f59e0b",
    tag: "Yeni",
  },
  {
    id: "vip_limit",
    emoji: "👑",
    name: "VIP Limit Artışı",
    description: "Kredinizi ₺750,000'e yükseltin",
    cost: 500,
    category: "ozel",
    color: "#dc2626",
    tag: "Premium",
  },
  {
    id: "free_spin",
    emoji: "🌟",
    name: "Altın Çevirme",
    description: "Jackpot olasılığı 3x artırılmış özel çeviri",
    cost: 150,
    category: "ozel",
    color: "#ea580c",
  },
];

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "iskonto", label: "İskonto" },
  { key: "bonus", label: "Bonus" },
  { key: "ozel", label: "Özel" },
];

function ShopCard({
  item,
  canAfford,
  isPurchased,
  onBuy,
}: {
  item: ShopItem;
  canAfford: boolean;
  isPurchased: boolean;
  onBuy: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.shopCard,
        pressed && canAfford && !isPurchased && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
      onPress={onBuy}
      disabled={!canAfford || isPurchased}
    >
      <View style={[styles.shopCardIconBg, { backgroundColor: item.color + "18" }]}>
        <Text style={styles.shopCardEmoji}>{item.emoji}</Text>
        {item.tag && (
          <View style={[styles.tagBadge, { backgroundColor: item.color }]}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        )}
      </View>
      <View style={styles.shopCardContent}>
        <Text style={styles.shopCardName}>{item.name}</Text>
        <Text style={styles.shopCardDesc}>{item.description}</Text>
        <View style={styles.shopCardFooter}>
          <View style={styles.costChip}>
            <Text style={styles.costText}>{item.cost} 🍯</Text>
          </View>
          {isPurchased ? (
            <View style={styles.purchasedBadge}>
              <Ionicons name="checkmark" size={12} color={Colors.white} />
              <Text style={styles.purchasedText}>Alındı</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.buyButton,
                { backgroundColor: canAfford ? item.color : "#d1d5db" },
                pressed && { opacity: 0.8 },
              ]}
              onPress={onBuy}
              disabled={!canAfford}
            >
              <Text style={styles.buyButtonText}>
                {canAfford ? "Satın Al" : "Yetersiz"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { user, spendHoney, updateUser } = useUser();
  const [activeCategory, setActiveCategory] = useState("all");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (!user) return null;

  const filteredItems = SHOP_ITEMS.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  const handleBuy = (item: ShopItem) => {
    if (!user || user.honeyPoints < item.cost) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    const isConsumable = Object.values(CONSUMABLE_ITEMS).includes(item.id);
    if (!isConsumable && user.purchasedItems.includes(item.id)) return;

    Alert.alert(
      "Satın Al",
      `${item.name} için ${item.cost} bal harcamak istiyor musunuz?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Satın Al",
          onPress: async () => {
            const success = await spendHoney(item.cost);
            if (success) {
              const updates: any = {};
              if (!isConsumable) {
                updates.purchasedItems = [...user.purchasedItems, item.id];
              }

              if (item.id === "extra_spin") {
                updates.spinCount = (user.spinCount || 0) + 1;
              } else if (item.id === "triple_spin") {
                updates.spinCount = (user.spinCount || 0) + 3;
              } else if (item.id === "flower_boost") {
                updates.flowerBoosts = (user.flowerBoosts || 0) + 1;
              } else if (item.id === "double_honey") {
                const currentBooster = user.honeyBoosterUntil || 0;
                const base = Math.max(Date.now(), currentBooster);
                updates.honeyBoosterUntil = base + 30 * 60 * 1000;
              }

              await updateUser(updates);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert("Tebrikler!", `${item.name} başarıyla satın alındı!`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#ede9fe", "#f5f3ff", Colors.background]}
        style={[styles.topGradient, { paddingTop: topInset }]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bal Mağazası</Text>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceText}>{user.honeyPoints} 🍯</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              style={[
                styles.categoryPill,
                activeCategory === cat.key && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.key && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {filteredItems.map((item) => {
          const isConsumable = Object.values(CONSUMABLE_ITEMS).includes(item.id);
          const isPurchased = !isConsumable && user.purchasedItems.includes(item.id);
          return (
            <ShopCard
              key={item.id}
              item={item}
              canAfford={user.honeyPoints >= item.cost}
              isPurchased={isPurchased}
              onBuy={() => handleBuy(item)}
            />
          );
        })}

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Bu kategoride ürün bulunamadı.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topGradient: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.text,
  },
  balanceChip: {
    backgroundColor: "#8b5cf6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  balanceText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  categoryScroll: {
    marginBottom: 0,
  },
  categoryContent: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  shopCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    flexDirection: "row",
    gap: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  shopCardIconBg: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },
  shopCardEmoji: {
    fontSize: 34,
  },
  tagBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 8,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  shopCardContent: {
    flex: 1,
    gap: 4,
  },
  shopCardName: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.text,
  },
  shopCardDesc: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  shopCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  costChip: {
    backgroundColor: Colors.goldLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  costText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: Colors.goldDark,
  },
  buyButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buyButtonText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  purchasedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  purchasedText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
  },
});
