import React from "react";
import { Stack } from "expo-router";

export default function LabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Pilot Labs",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Pilot Labs" }} />
      <Stack.Screen name="wheel" options={{ title: "Çark" }} />
      <Stack.Screen name="garden" options={{ title: "Bahçe" }} />
      <Stack.Screen name="shop" options={{ title: "Mağaza" }} />
    </Stack>
  );
}
