import { isLiquidGlassAvailable } from "expo-glass-effect";
import React from "react";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Panel</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="upload">
        <Icon sf={{ default: "doc.text", selected: "doc.text.fill" }} />
        <Label>Çek Yükle</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="offers">
        <Icon sf={{ default: "bolt", selected: "bolt.fill" }} />
        <Label>Teklif</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pulse">
        <Icon sf={{ default: "waveform.path.ecg", selected: "waveform.path.ecg" }} />
        <Label>Nabız</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="integration">
        <Icon sf={{ default: "link", selected: "link" }} />
        <Label>ERP</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const { user } = useUser();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const readyCount = (user?.offerRequests || []).filter(r => r.status === 'ready').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontSize: 10,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.slate,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: "rgba(255,255,255,0.1)",
          elevation: 0,
          height: isWeb ? 84 : 64,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }]} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.slate, borderTopLeftRadius: 24, borderTopRightRadius: 24 }]} />
          ) : null,
        tabBarItemStyle: {
          paddingTop: isWeb ? 8 : 10,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Panel",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Çek Yükle",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: "Teklifler",
          tabBarBadge: readyCount > 0 ? readyCount : undefined,
          tabBarBadgeStyle: {
             backgroundColor: Colors.primary,
             color: Colors.white,
             fontSize: 10,
             fontFamily: 'Poppins_700Bold'
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pulse"
        options={{
          title: "Nabız",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="integration"
        options={{
          title: "Entegrasyon",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="link" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
