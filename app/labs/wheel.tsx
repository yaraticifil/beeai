import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width - 60, 320);

const SEGMENTS = [
  { label: "10-50 Bal", color: "#fbbf24", textColor: "#fff" },
  { label: "Çiçek", color: "#22c55e", textColor: "#fff" },
  { label: "Kupon %5", color: "#8b5cf6", textColor: "#fff" },
  { label: "2x Bal", color: "#f59e0b", textColor: "#fff" },
  { label: "BÜYÜK İKRAMİYE", color: "#ef4444", textColor: "#fff" },
  { label: "5-25 Bal", color: "#14b8a6", textColor: "#fff" },
];

const NUM_SEGMENTS = SEGMENTS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

export default function WheelScreen() {
  const insets = useSafeAreaInsets();
  const { user, spin, spendHoney } = useUser();

  const spinAnim = useRef(new Animated.Value(0)).current;
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<{ pointsWon: number; prize: string } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleSpin = async () => {
    if (!user || isSpinning) return;

    if (user.spinCount <= 0) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await spin();

    const extraDegrees = 5 * 360 + Math.floor(Math.random() * 360);
    const newRotation = currentRotation + extraDegrees;
    setCurrentRotation(newRotation);

    Animated.timing(spinAnim, {
      toValue: newRotation,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setLastResult(result);
      setShowResult(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  };

  const handleBuyExtra = async () => {
    const success = await spendHoney(20);
    if (success) {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const rotate = spinAnim.interpolate({
    inputRange: [0, currentRotation || 360],
    outputRange: ["0deg", `${currentRotation || 360}deg`],
    extrapolate: "extend",
  });

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#fef3c7", "#fffbeb", Colors.background]}
        style={[styles.topGradient, { paddingTop: topInset }]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Şans Çarkı</Text>
          <View style={styles.spinCountBadge}>
            <Text style={styles.spinCountText}>{user.spinCount} hak</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                width: WHEEL_SIZE,
                height: WHEEL_SIZE,
                borderRadius: WHEEL_SIZE / 2,
                transform: [{ rotate: rotate }],
              },
            ]}
          >
            {SEGMENTS.map((seg, i) => {
              const angle = i * SEGMENT_ANGLE;
              const rad = ((angle + SEGMENT_ANGLE / 2) * Math.PI) / 180;
              const textRadius = (WHEEL_SIZE / 2) * 0.62;
              const tx = WHEEL_SIZE / 2 + textRadius * Math.sin(rad);
              const ty = WHEEL_SIZE / 2 - textRadius * Math.cos(rad);

              return (
                <View key={i} pointerEvents="none">
                  <View
                    style={[
                      styles.segmentSlice,
                      {
                        width: WHEEL_SIZE,
                        height: WHEEL_SIZE / 2,
                        transform: [
                          { translateY: WHEEL_SIZE / 4 },
                          { rotate: `${angle - 90 + SEGMENT_ANGLE / 2}deg` },
                          { translateY: -WHEEL_SIZE / 4 },
                        ],
                        backgroundColor: seg.color,
                        borderTopLeftRadius: WHEEL_SIZE / 2,
                        borderTopRightRadius: WHEEL_SIZE / 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.segmentLabel,
                      { left: tx - 35, top: ty - 10, transform: [{ rotate: `${angle}deg` }] },
                    ]}
                  >
                    <Text style={styles.segmentText} numberOfLines={1}>
                      {seg.label}
                    </Text>
                  </View>
                </View>
              );
            })}
            <View style={styles.wheelCenter}>
              <Text style={styles.wheelCenterEmoji}>🍯</Text>
            </View>
          </Animated.View>

          <View style={styles.pointer}>
            <View style={styles.pointerTriangle} />
          </View>
        </View>

        {showResult && lastResult && (
          <View style={styles.resultCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.resultGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.resultEmoji}>
                {lastResult.pointsWon > 100 ? "🎉" : "✨"}
              </Text>
              <View>
                <Text style={styles.resultTitle}>
                  {lastResult.prize}
                </Text>
                {lastResult.pointsWon > 0 && (
                  <Text style={styles.resultPoints}>
                    +{lastResult.pointsWon} bal puanı kazandınız!
                  </Text>
                )}
              </View>
            </LinearGradient>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.spinBtn,
            pressed && styles.spinBtnPressed,
            (isSpinning || user.spinCount <= 0) && styles.spinBtnDisabled,
          ]}
          onPress={handleSpin}
          disabled={isSpinning || user.spinCount <= 0}
        >
          <LinearGradient
            colors={
              user.spinCount > 0
                ? [Colors.gold, Colors.goldDark]
                : ["#d1d5db", "#9ca3af"]
            }
            style={styles.spinBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name={isSpinning ? "reload" : "dice"}
              size={22}
              color="#fff"
            />
            <Text style={styles.spinBtnText}>
              {isSpinning ? "Çevriliyor..." : "Çevir!"}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={18} color={Colors.textMuted} />
            <Text style={styles.infoText}>
              Her gün <Text style={styles.infoBold}>3 ücretsiz</Text> hakkınız var!
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.buyBtn,
              pressed && { opacity: 0.7 },
              user.honeyPoints < 20 && styles.buyBtnDisabled,
            ]}
            onPress={handleBuyExtra}
            disabled={user.honeyPoints < 20}
          >
            <Text style={styles.buyBtnText}>+ Ekstra Çevirme (20 bal)</Text>
          </Pressable>
        </View>

        <View style={styles.prizesCard}>
          <Text style={styles.prizesTitle}>Ödüller</Text>
          <View style={styles.prizesList}>
            {[
              { emoji: "🍯", label: "10-50 Bal Puanı", color: "#fbbf24" },
              { emoji: "🌸", label: "Çiçek Tohumu", color: "#22c55e" },
              { emoji: "🎫", label: "%5 İskonto Kuponu", color: "#8b5cf6" },
              { emoji: "💫", label: "2 Kat Bal Puanı", color: "#f59e0b" },
              { emoji: "🏆", label: "JACKPOT: 200-500 Bal", color: "#ef4444" },
            ].map((p, i) => (
              <View key={i} style={styles.prizeItem}>
                <View style={[styles.prizeIconCircle, { backgroundColor: p.color + "20" }]}>
                  <Text style={styles.prizeEmoji}>{p.emoji}</Text>
                </View>
                <Text style={styles.prizeLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>
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
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.text,
  },
  spinCountBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  spinCountText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
    alignItems: "center",
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    position: "relative",
    marginBottom: 8,
  },
  wheel: {
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  segmentSlice: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    opacity: 0.92,
  },
  segmentLabel: {
    position: "absolute",
    width: 70,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 9,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  wheelCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 56,
    height: 56,
    marginTop: -28,
    marginLeft: -28,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  wheelCenterEmoji: {
    fontSize: 28,
  },
  pointer: {
    position: "absolute",
    top: -16,
    left: "50%",
    marginLeft: -12,
    alignItems: "center",
    zIndex: 20,
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 24,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  resultCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  resultGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  resultEmoji: {
    fontSize: 36,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  resultPoints: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
  spinBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  spinBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  spinBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  spinBtnGradient: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  spinBtnText: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  infoCard: {
    width: "100%",
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
  },
  infoBold: {
    fontFamily: "Poppins_700Bold",
    color: Colors.gold,
  },
  buyBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  buyBtnDisabled: {
    opacity: 0.4,
  },
  buyBtnText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.primary,
  },
  prizesCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prizesTitle: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: Colors.text,
  },
  prizesList: {
    gap: 10,
  },
  prizeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prizeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  prizeEmoji: {
    fontSize: 18,
  },
  prizeLabel: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.text,
  },
});
