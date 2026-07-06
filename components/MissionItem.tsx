import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Mission, useUser } from "@/contexts/UserContext";
import { GlassCard } from "./GlassCard";
import { haptics } from "@/shared/utils/haptics";

interface MissionItemProps {
  mission: Mission;
}

export function MissionItem({ mission }: MissionItemProps) {
  const { claimMissionReward } = useUser();
  const progress = mission.target > 0 ? Math.min(1, mission.current / mission.target) : 1;
  const isCompleted = mission.current >= mission.target;

  const handleClaim = async () => {
    if (isCompleted && !mission.claimed) {
      haptics.success();
      await claimMissionReward(mission.id);
    }
  };

  const getIcon = () => {
    switch (mission.type) {
      case "analyze": return "document-text";
      case "harvest": return "leaf";
      case "spin": return "dice";
      case "pulse": return "analytics";
      case "offer": return "checkmark-circle";
      case "revision": return "repeat";
      case "plant": return "flower";
      default: return "star";
    }
  };

  return (
    <GlassCard style={[styles.container, mission.claimed && styles.containerClaimed]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: mission.claimed ? Colors.textMuted : Colors.goldLight }]}>
          <Ionicons name={getIcon()} size={18} color={mission.claimed ? Colors.white : Colors.goldDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, mission.claimed && styles.textClaimed]}>{mission.title}</Text>
          <Text style={[styles.description, mission.claimed && styles.textClaimed]}>{mission.description}</Text>
        </View>
        <View style={styles.rewardContainer}>
          <Text style={[styles.rewardText, mission.claimed && styles.textClaimed]}>{mission.reward} 🍯</Text>
        </View>
      </View>

      {!mission.claimed && (
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressText}>{mission.current} / {mission.target}</Text>
            {isCompleted ? (
              <Pressable
                onPress={handleClaim}
                style={({ pressed }) => [
                  styles.claimBtn,
                  pressed && { opacity: 0.8 }
                ]}
              >
                <Text style={styles.claimBtnText}>Al</Text>
              </Pressable>
            ) : (
              <Text style={styles.pendingText}>Devam Ediyor</Text>
            )}
          </View>
        </View>
      )}

      {mission.claimed && (
        <View style={styles.claimedBadge}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.textMuted} />
          <Text style={styles.claimedText}>Tamamlandı</Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 20,
  },
  containerClaimed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
  },
  description: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.textMuted,
  },
  rewardContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: Colors.goldDark,
  },
  progressSection: {
    marginTop: 12,
    gap: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.slate,
  },
  pendingText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
  },
  claimBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  claimBtnText: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  claimedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    alignSelf: "flex-end",
  },
  claimedText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
  },
  textClaimed: {
    color: Colors.textMuted,
  },
});
