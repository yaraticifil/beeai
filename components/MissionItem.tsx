import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInRight } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { Mission, useUser } from "@/contexts/UserContext";
import { haptics } from "@/shared/utils/haptics";

interface MissionItemProps {
  mission: Mission;
}

export function MissionItem({ mission }: MissionItemProps) {
  const { claimMissionReward } = useUser();
  const progress = mission.target > 0 ? mission.current / mission.target : 1;
  const isCompleted = mission.current >= mission.target;

  const handleClaim = () => {
    if (isCompleted && !mission.claimed) {
      haptics.success();
      claimMissionReward(mission.id);
    }
  };

  return (
    <Animated.View entering={FadeInRight.springify()} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={
              mission.type === "analyze"
                ? "document-text"
                : mission.type === "harvest"
                ? "flower"
                : mission.type === "spin"
                ? "reload"
                : "pulse"
            }
            size={20}
            color={mission.claimed ? Colors.textMuted : Colors.gold}
          />
        </View>
        <View style={styles.details}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, mission.claimed && styles.textMuted]}>
              {mission.title}
            </Text>
            <Text style={[styles.progressText, mission.claimed && styles.textMuted]}>
              {mission.current}/{mission.target}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: mission.claimed ? Colors.textMuted : Colors.gold,
                },
              ]}
            />
          </View>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardText}>Ödül: {mission.reward} 🍯</Text>
          </View>
        </View>

        {isCompleted && !mission.claimed ? (
          <Pressable onPress={handleClaim}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.claimBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.claimBtnText}>Al</Text>
            </LinearGradient>
          </Pressable>
        ) : mission.claimed ? (
          <View style={styles.claimedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
  },
  claimBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  claimBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },
  claimedBadge: {
    width: 36,
    alignItems: "center",
  },
  textMuted: {
    color: Colors.textMuted,
  },
});
