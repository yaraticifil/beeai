import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { GlassCard } from "./GlassCard";
import { Mission, useUser } from "@/contexts/UserContext";
import { haptics } from "@/shared/utils/haptics";
import Animated, { FadeInRight } from "react-native-reanimated";

interface MissionItemProps {
  mission: Mission;
}

export function MissionItem({ mission }: MissionItemProps) {
  const { claimMissionReward } = useUser();
  const isCompleted = mission.progress >= mission.target;
  const progressPercent = Math.min(100, (mission.progress / mission.target) * 100);

  const handleClaim = async () => {
    if (isCompleted && !mission.claimed) {
      haptics.success();
      await claimMissionReward(mission.id);
    }
  };

  if (mission.claimed) {
    return (
      <GlassCard style={[styles.container, styles.claimed]} intensity={10}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.titleClaimed}>{mission.title}</Text>
          <Text style={styles.descClaimed}>Görev tamamlandı ve ödül alındı.</Text>
        </View>
        <View style={styles.rewardBadgeClaimed}>
          <Text style={styles.rewardTextClaimed}>+{mission.reward} 🍯</Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <Animated.View entering={FadeInRight.springify()}>
      <GlassCard style={styles.container} intensity={20}>
        <View style={[styles.iconContainer, isCompleted && styles.iconContainerReady]}>
          <Ionicons
            name={isCompleted ? "trophy" : "flag"}
            size={20}
            color={isCompleted ? Colors.gold : Colors.textMuted}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{mission.title}</Text>
          <Text style={styles.description}>{mission.description}</Text>

          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                  isCompleted && { backgroundColor: Colors.primary }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {mission.progress}/{mission.target}
            </Text>
          </View>
        </View>

        {isCompleted ? (
          <Pressable
            style={({ pressed }) => [
              styles.claimBtn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
            ]}
            onPress={handleClaim}
          >
            <Text style={styles.claimBtnText}>Al</Text>
          </Pressable>
        ) : (
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>+{mission.reward} 🍯</Text>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  claimed: {
    opacity: 0.6,
    borderColor: "transparent",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerReady: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
  },
  titleClaimed: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  description: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
  },
  descClaimed: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 9,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
    minWidth: 25,
    textAlign: "right",
  },
  rewardBadge: {
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: Colors.goldDark,
  },
  rewardBadgeClaimed: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardTextClaimed: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: Colors.primary,
  },
  claimBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  claimBtnText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
});
