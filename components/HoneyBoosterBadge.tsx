import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export function HoneyBoosterBadge() {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkBooster = () => {
      if (user?.honeyBoosterUntil && user.honeyBoosterUntil > Date.now()) {
        setTimeLeft(Math.max(0, user.honeyBoosterUntil - Date.now()));
      } else {
        setTimeLeft(0);
      }
    };

    checkBooster();
    const interval = setInterval(checkBooster, 1000);
    return () => clearInterval(interval);
  }, [user?.honeyBoosterUntil]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <LinearGradient
      colors={[Colors.gold, "#d97706"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Ionicons name="flash" size={12} color={Colors.white} />
      <Text style={styles.text}>2x Bal Aktif ({mins}:{secs.toString().padStart(2, "0")})</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
});
