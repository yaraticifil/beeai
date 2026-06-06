import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export function HoneyBoosterBadge() {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkBooster = () => {
      const remaining = Math.max(0, (user?.honeyBoosterUntil || 0) - Date.now());
      setTimeLeft(remaining);
    };

    checkBooster();
    const interval = setInterval(checkBooster, 1000);
    return () => clearInterval(interval);
  }, [user?.honeyBoosterUntil]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <View style={styles.badge}>
      <Ionicons name="flash" size={14} color={Colors.gold} />
      <Text style={styles.text}>2x Bal Aktif</Text>
      <View style={styles.divider} />
      <Text style={styles.timer}>
        {mins}:{secs < 10 ? `0${secs}` : secs}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    gap: 6,
  },
  text: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(251, 191, 36, 0.3)",
  },
  timer: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.gold,
    minWidth: 35,
  },
});
