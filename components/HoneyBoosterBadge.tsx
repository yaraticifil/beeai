import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeOutRight } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export function HoneyBoosterBadge() {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      if (user?.honeyBoosterUntil) {
        const remaining = Math.max(0, user.honeyBoosterUntil - Date.now());
        setTimeLeft(remaining);
      } else {
        setTimeLeft(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user?.honeyBoosterUntil]);

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <Animated.View
      entering={FadeInRight.springify()}
      exit={FadeOutRight.springify()}
      style={styles.container}
    >
      <View style={styles.badge}>
        <Ionicons name="flash" size={12} color={Colors.white} />
        <Text style={styles.text}>2x Bal Aktif • {timeStr}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
});
