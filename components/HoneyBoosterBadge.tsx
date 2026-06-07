import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeOutRight } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export function HoneyBoosterBadge() {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user?.honeyBoosterUntil) {
      setTimeLeft(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, user.honeyBoosterUntil - Date.now());
      setTimeLeft(remaining);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [user?.honeyBoosterUntil]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutRight}
      style={styles.container}
    >
      <LinearGradient
        colors={[Colors.gold, Colors.goldDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Ionicons name="flash" size={12} color={Colors.white} />
        <Text style={styles.text}>2x Bal Aktif</Text>
        <View style={styles.divider} />
        <Text style={styles.time}>{timeStr}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  text: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
  },
  time: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: "Poppins_800ExtraBold",
    minWidth: 32,
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
