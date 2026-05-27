import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useUser, Flower } from "@/contexts/UserContext";

const { width } = Dimensions.get("window");

const GROW_TIME = 30000;

function BoosterCountdown({ until }: { until: number }) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, until - Date.now()));

  useEffect(() => {
    const t = setInterval(() => {
      const remaining = Math.max(0, until - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [until]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <Text style={styles.boosterTime}>
      {mins}:{secs < 10 ? '0' : ''}{secs}
    </Text>
  );
}

function FlowerItem({
  flower,
  onHarvest,
  onBoost,
}: {
  flower: Flower;
  onHarvest: (id: string) => void;
  onBoost: (id: string) => void;
}) {
  const [elapsed, setElapsed] = useState(Date.now() - flower.plantedAt);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
    }).start();

    const interval = setInterval(() => {
      setElapsed(Date.now() - flower.plantedAt);
    }, 1000);
    return () => clearInterval(interval);
  }, [flower.plantedAt, scaleAnim]);

  const isReady = elapsed >= GROW_TIME;
  const progress = Math.min(elapsed / GROW_TIME, 1);
  const timeLeft = Math.max(0, Math.ceil((GROW_TIME - elapsed) / 1000));
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <Animated.View style={[styles.flowerItem, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={({ pressed }) => [
          styles.flowerPressable,
          isReady && styles.flowerPressableReady,
          pressed && isReady && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        ]}
        onPress={() => isReady && onHarvest(flower.id)}
        disabled={!isReady}
      >
        <Text style={[styles.flowerEmoji, !isReady && styles.flowerEmojiGrowing]}>
          {isReady ? "🌼" : "🌱"}
        </Text>
        <View style={styles.flowerProgressBg}>
          <View
            style={[
              styles.flowerProgressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: isReady ? Colors.gold : Colors.primary,
              },
            ]}
          />
        </View>
        {isReady ? (
          <Text style={styles.harvestText}>Topla</Text>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.growText}>
              {mins > 0 ? `${mins}d ${secs}s` : `${secs}s`}
            </Text>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onBoost(flower.id);
              }}
              style={styles.boostMiniBtn}
            >
              <Ionicons name="flash" size={10} color={Colors.white} />
            </Pressable>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function GardenScreen() {
  const insets = useSafeAreaInsets();
  const { user, plantFlower, harvestFlower, harvestAllFlowers, boostFlower } = useUser();
  const [harvestResult, setHarvestResult] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const showHarvestResult = (honey: number) => {
    setHarvestResult(honey);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setHarvestResult(null));
  };

  const handlePlant = async () => {
    if (!user || user.honeyPoints < 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Yetersiz Bal", "Çiçek dikmek için 10 bal puanı gerekiyor.");
      return;
    }
    const success = await plantFlower();
    if (success) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleHarvest = async (id: string) => {
    const earned = await harvestFlower(id);
    if (earned > 0) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showHarvestResult(earned);
    }
  };

  const handleHarvestAll = async () => {
    const earned = await harvestAllFlowers();
    if (earned > 0) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showHarvestResult(earned);
    }
  };

  const handleBoost = async (id: string) => {
    if (!user || (user.flowerBoosts || 0) <= 0) {
      Alert.alert("Hızlandırıcı Yok", "Mağazadan çiçek hızlandırıcı alabilirsiniz.");
      return;
    }
    const success = await boostFlower(id);
    if (success && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  if (!user) return null;

  const boosterActive = (user?.honeyBoosterUntil || 0) > Date.now();
  const readyCount = user.flowers.filter(
    (f) => Date.now() - f.plantedAt >= GROW_TIME
  ).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#dcfce7", "#f0fdf4", Colors.background]}
        style={[styles.topGradient, { paddingTop: topInset }]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Arı Bahçesi</Text>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceText}>{user.honeyPoints} 🍯</Text>
          </View>
        </View>

        <View style={styles.gardenStats}>
          <View style={styles.gardenStatItem}>
            <Text style={styles.gardenStatValue}>{user.flowers.length}</Text>
            <Text style={styles.gardenStatLabel}>Çiçek</Text>
          </View>
          <View style={styles.gardenStatDivider} />
          <View style={styles.gardenStatItem}>
            <Text style={[styles.gardenStatValue, { color: Colors.gold }]}>
              {readyCount}
            </Text>
            <Text style={styles.gardenStatLabel}>Hazır</Text>
          </View>
          <View style={styles.gardenStatDivider} />
          <View style={styles.gardenStatItem}>
            <Text style={[styles.gardenStatValue, { color: "#8b5cf6" }]}>
              {user.totalHarvested}
            </Text>
            <Text style={styles.gardenStatLabel}>Hasat</Text>
          </View>
          <View style={styles.gardenStatDivider} />
          <View style={styles.gardenStatItem}>
            <Text style={[styles.gardenStatValue, { color: Colors.primary }]}>
              {user.flowerBoosts || 0}
            </Text>
            <Text style={styles.gardenStatLabel}>Hızlandır</Text>
          </View>
        </View>

        {boosterActive && (
           <View style={styles.boosterBadge}>
              <Text style={styles.boosterBadgeText}>2x BAL AKTİF</Text>
              <BoosterCountdown until={user?.honeyBoosterUntil || 0} />
           </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {harvestResult !== null && (
          <Animated.View style={[styles.harvestToast, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={[Colors.gold, Colors.goldDark]}
              style={styles.harvestToastGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.harvestToastEmoji}>🍯</Text>
              <Text style={styles.harvestToastText}>
                +{harvestResult} bal kazandınız!
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.gardenArea}>
          <LinearGradient
            colors={["#87ceeb", "#98d8c8", "#90ee90"]}
            style={styles.gardenGround}
          >
            <View style={styles.groundOverlay} />
            {user.flowers.length === 0 ? (
              <View style={styles.emptyGarden}>
                <Ionicons name="leaf-outline" size={40} color="rgba(0,100,0,0.3)" />
                <Text style={styles.emptyGardenText}>
                  Bahçeniz boş.{"\n"}Çiçek dikin!
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.flowersGrid}>
                  {user.flowers.map((f) => (
                    <FlowerItem key={f.id} flower={f} onHarvest={handleHarvest} onBoost={handleBoost} />
                  ))}
                </View>
                {readyCount > 1 && (
                  <Pressable
                    onPress={handleHarvestAll}
                    style={styles.harvestAllBtn}
                  >
                    <Text style={styles.harvestAllText}>Hepsini Topla</Text>
                    <Ionicons name="basket" size={16} color={Colors.white} />
                  </Pressable>
                )}
              </>
            )}
          </LinearGradient>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.plantBtn,
            pressed && styles.plantBtnPressed,
            user.honeyPoints < 10 && styles.plantBtnDisabled,
          ]}
          onPress={handlePlant}
          disabled={user.honeyPoints < 10}
        >
          <LinearGradient
            colors={
              user.honeyPoints >= 10
                ? [Colors.primary, Colors.primaryDark]
                : ["#d1d5db", "#9ca3af"]
            }
            style={styles.plantBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.plantBtnEmoji}>🌱</Text>
            <Text style={styles.plantBtnText}>Çiçek Ek (10 bal)</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
          <View style={styles.infoSteps}>
            {[
              { icon: "🌱", step: "10 bal ile çiçek ek" },
              { icon: "⏱️", step: "30 saniye büyümesini bekle" },
              { icon: "🌼", step: "Hazır olunca üzerine dokun" },
              { icon: "🍯", step: "15-30 bal kazan!" },
            ].map((s, i) => (
              <View key={i} style={styles.infoStep}>
                <Text style={styles.infoStepEmoji}>{s.icon}</Text>
                <Text style={styles.infoStepText}>{s.step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  boosterBadge: {
    marginTop: 12,
    backgroundColor: Colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  boosterBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_800ExtraBold',
    color: Colors.white,
  },
  boosterTime: {
    fontSize: 10,
    fontFamily: 'Poppins_800ExtraBold',
    color: Colors.white,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topGradient: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.text,
  },
  balanceChip: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  balanceText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  gardenStats: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gardenStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  gardenStatValue: {
    fontSize: 24,
    fontFamily: "Poppins_800ExtraBold",
    color: Colors.primary,
  },
  gardenStatLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
  },
  gardenStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.cardBorder,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  harvestToast: {
    borderRadius: 14,
    overflow: "hidden",
  },
  harvestToastGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  harvestToastEmoji: {
    fontSize: 24,
  },
  harvestToastText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  gardenArea: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 200,
  },
  gardenGround: {
    minHeight: 200,
    padding: 16,
    justifyContent: "flex-end",
    position: "relative",
  },
  groundOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "rgba(139,69,19,0.15)",
  },
  emptyGarden: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    gap: 8,
  },
  emptyGardenText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(0,100,0,0.5)",
    textAlign: "center",
    lineHeight: 22,
  },
  flowersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 8,
  },
  flowerItem: {
    width: (width - 40 - 36) / 4,
  },
  flowerPressable: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  flowerPressableReady: {
    backgroundColor: "rgba(245,158,11,0.15)",
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  flowerEmoji: {
    fontSize: 28,
  },
  flowerEmojiGrowing: {
    opacity: 0.7,
  },
  boostMiniBtn: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  harvestAllBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  harvestAllText: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: Colors.white,
  },
  flowerProgressBg: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  flowerProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  harvestText: {
    fontSize: 9,
    fontFamily: "Poppins_700Bold",
    color: Colors.gold,
  },
  growText: {
    fontSize: 8,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
  },
  plantBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  plantBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  plantBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  plantBtnGradient: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  plantBtnEmoji: {
    fontSize: 20,
  },
  plantBtnText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: Colors.text,
  },
  infoSteps: {
    gap: 10,
  },
  infoStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoStepEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  infoStepText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
  },
});
