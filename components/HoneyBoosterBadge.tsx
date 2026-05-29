import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export function HoneyBoosterBadge({ until }: { until: number }) {
  const [timeLeft, setTimeLeft] = React.useState(Math.max(0, until - Date.now()));

  React.useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, until - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [until]);

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <View style={styles.boosterBadge}>
      <Ionicons name="flash" size={12} color={Colors.white} />
      <Text style={styles.boosterText}>2x Bal Aktif ({minutes}:{seconds.toString().padStart(2, '0')})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  boosterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  boosterText: {
    color: Colors.white,
    fontSize: 8,
    fontFamily: 'Poppins_700Bold',
  },
});
