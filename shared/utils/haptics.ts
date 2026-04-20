import * as ExpoHaptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Wraps expo-haptics to provide a platform-agnostic interface.
 * On web, haptics are typically not supported or behave differently,
 * so we guard the calls.
 */

export const hapticImpact = (style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== "web") {
    ExpoHaptics.impactAsync(style);
  }
};

export const hapticNotification = (type: ExpoHaptics.NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType.Success) => {
  if (Platform.OS !== "web") {
    ExpoHaptics.notificationAsync(type);
  }
};

export const hapticSelection = () => {
  if (Platform.OS !== "web") {
    ExpoHaptics.selectionAsync();
  }
};

export const haptics = {
  light: () => hapticImpact(ExpoHaptics.ImpactFeedbackStyle.Light),
  medium: () => hapticImpact(ExpoHaptics.ImpactFeedbackStyle.Medium),
  heavy: () => hapticImpact(ExpoHaptics.ImpactFeedbackStyle.Heavy),
  success: () => hapticNotification(ExpoHaptics.NotificationFeedbackType.Success),
  warning: () => hapticNotification(ExpoHaptics.NotificationFeedbackType.Warning),
  error: () => hapticNotification(ExpoHaptics.NotificationFeedbackType.Error),
  selection: hapticSelection,
};
