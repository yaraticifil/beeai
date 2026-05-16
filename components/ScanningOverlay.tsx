import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ScanningOverlay() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(SCREEN_HEIGHT * 0.6, {
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
        <LinearGradient
          colors={['transparent', Colors.primary, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 60,
    width: '100%',
    zIndex: 10,
  },
  gradient: {
    flex: 1,
    height: 2,
    opacity: 0.8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
});
