import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const hapticImpact = (style: "light" | "medium" | "heavy" = "medium") => {
  if (Platform.OS === "web") return;

  const impactStyle =
    style === "light" ? Haptics.ImpactFeedbackStyle.Light :
    style === "heavy" ? Haptics.ImpactFeedbackStyle.Heavy :
    Haptics.ImpactFeedbackStyle.Medium;

  Haptics.impactAsync(impactStyle);
};

export const hapticNotification = (type: "success" | "warning" | "error" = "success") => {
  if (Platform.OS === "web") return;

  const notificationType =
    type === "warning" ? Haptics.NotificationFeedbackType.Warning :
    type === "error" ? Haptics.NotificationFeedbackType.Error :
    Haptics.NotificationFeedbackType.Success;

  Haptics.notificationAsync(notificationType);
};

export const haptics = {
  light: () => hapticImpact("light"),
  medium: () => hapticImpact("medium"),
  heavy: () => hapticImpact("heavy"),
  success: () => hapticNotification("success"),
  warning: () => hapticNotification("warning"),
  error: () => hapticNotification("error"),
};
