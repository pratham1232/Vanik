import { Stack } from "expo-router";
import React from "react";
import { useColors } from "@/hooks/useColors";

export function ThemedApp() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
      <Stack.Screen name="auth/onboarding" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/login"      options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="auth/register"   options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="product/[id]"    options={{ headerShown: false }} />
      <Stack.Screen name="cart"            options={{ headerShown: false }} />
      <Stack.Screen name="create"          options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="live/[id]"       options={{ headerShown: false, presentation: "fullScreenModal" }} />
      <Stack.Screen name="chat/[id]"       options={{ headerShown: false }} />
      <Stack.Screen name="story/[id]"      options={{ headerShown: false, presentation: "fullScreenModal", animation: "fade" }} />
      <Stack.Screen name="edit-profile"    options={{ headerShown: false }} />
      <Stack.Screen name="notifications"   options={{ headerShown: false }} />
      <Stack.Screen name="orders"          options={{ headerShown: false }} />
      <Stack.Screen name="wishlist"        options={{ headerShown: false }} />
      <Stack.Screen name="add-story"       options={{ headerShown: false, presentation: "fullScreenModal", animation: "slide_from_bottom" }} />
    </Stack>
  );
}
