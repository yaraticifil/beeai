import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export function HoneyBoosterBadge() {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, (user?.honeyBoosterUntil || 0) - Date.now());
      setTimeLeft(remaining);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [user?.honeyBoosterUntil]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.badge}>
      <Ionicons name="flash" size={12} color={Colors.white} />
      <Text style={styles.text}>2x Bal Aktif</Text>
      <View style={styles.divider} />
      <Text style={styles.timer}>{mins}:{secs.toString().padStart(2, '0')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  text: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  timer: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    minWidth: 30,
  },
});
