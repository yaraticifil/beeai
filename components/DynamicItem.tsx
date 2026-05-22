import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface DynamicItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconBgColor?: string;
  iconColor?: string;
}

export const DynamicItem = ({ icon, label, value, iconBgColor, iconColor }: DynamicItemProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor || Colors.slate }]}>
        <Ionicons name={icon} size={20} color={iconColor || Colors.white} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.slate,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textMuted,
  },
});
