import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Mission } from "@/contexts/UserContext";
import { GlassCard } from "./GlassCard";

interface MissionItemProps {
  mission: Mission;
  onClaim: (id: string) => void;
}

export function MissionItem({ mission, onClaim }: MissionItemProps) {
  const isCompleted = mission.progress >= mission.target;
  const progressPercent = Math.min(1, mission.progress / mission.target) * 100;

  return (
    <GlassCard style={[styles.card, mission.claimed && styles.cardClaimed]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={mission.claimed ? "checkmark-circle" : isCompleted ? "gift" : "rocket-outline"}
            size={24}
            color={mission.claimed ? Colors.primary : isCompleted ? Colors.gold : Colors.textMuted}
          />
        </View>
        <View style={styles.details}>
          <Text style={[styles.title, mission.claimed && styles.textMuted]}>{mission.title}</Text>
          <Text style={[styles.description, mission.claimed && styles.textMuted]}>{mission.description}</Text>

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
            <Text style={styles.progressText}>{mission.progress}/{mission.target}</Text>
          </View>
        </View>

        <View style={styles.action}>
          {mission.claimed ? (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedText}>Alındı</Text>
            </View>
          ) : isCompleted ? (
            <Pressable
              style={styles.claimButton}
              onPress={() => onClaim(mission.id)}
            >
              <Text style={styles.claimButtonText}>Al</Text>
            </Pressable>
          ) : (
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>{mission.reward}🍯</Text>
            </View>
          )}
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 20,
  },
  cardClaimed: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.slate,
  },
  description: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
  },
  textMuted: {
    color: Colors.textMuted,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
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
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: Colors.textMuted,
    minWidth: 24,
    textAlign: "right",
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
  },
  claimButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  claimButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },
  rewardBadge: {
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: Colors.goldDark,
  },
  claimedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  claimedText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.textMuted,
  },
});
