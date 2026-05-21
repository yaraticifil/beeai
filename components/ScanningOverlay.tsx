import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

const { height } = Dimensions.get("window");

export function ScanningOverlay() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(height * 0.4, {
        duration: 2000,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
      }),
      -1,
      true
    );
  }, [translateY]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.line, lineStyle]}>
        <View style={styles.glow} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 2,
    width: "100%",
    backgroundColor: Colors.primary,
    zIndex: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  glow: {
    height: 40,
    width: "100%",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    position: "absolute",
    top: -20,
  },
});
