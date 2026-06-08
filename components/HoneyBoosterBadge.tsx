import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export function HoneyBoosterBadge() {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      if (user?.honeyBoosterUntil) {
        const diff = Math.max(0, user.honeyBoosterUntil - Date.now());
        setTimeLeft(diff);
      } else {
        setTimeLeft(0);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [user?.honeyBoosterUntil]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <View style={styles.badge}>
      <Ionicons name="flash" size={12} color={Colors.white} />
      <Text style={styles.text}>2x Bal Aktif ({mins}:{secs.toString().padStart(2, '0')})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
  },
});
