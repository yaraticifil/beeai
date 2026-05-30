import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface HoneyBoosterBadgeProps {
  honeyBoosterUntil: number;
}

export function HoneyBoosterBadge({ honeyBoosterUntil }: HoneyBoosterBadgeProps) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, honeyBoosterUntil - Date.now()));

  useEffect(() => {
    if (honeyBoosterUntil <= Date.now()) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, honeyBoosterUntil - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [honeyBoosterUntil]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <View style={styles.badge}>
      <Ionicons name="flash" size={12} color={Colors.white} />
      <Text style={styles.text}>
        2x Bal Aktif: {mins}:{secs.toString().padStart(2, "0")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
});
