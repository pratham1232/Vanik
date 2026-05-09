import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs, router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { CHAT_THREADS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

function CreateSheet({ visible, onClose, isLoggedIn }: { visible: boolean; onClose: () => void; isLoggedIn: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const options = [
    { emoji: "📸", label: "Add Story",   sub: "Share a moment — vanishes in 24h", color: "#EC4899", route: "/add-story" },
    { emoji: "✏️", label: "Create Post", sub: "Share photos to your feed",         color: "#8B5CF6", route: "/create"   },
    { emoji: "🎬", label: "Create Reel", sub: "Short video for your followers",    color: "#3B82F6", route: "/create"   },
    { emoji: "🔴", label: "Go Live",     sub: "Broadcast to your audience now",    color: "#FF3B5C", route: "/live/l1"  },
  ];

  const handleOption = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    setTimeout(() => {
      if (!isLoggedIn) router.push("/auth/login");
      else router.push(route as any);
    }, 200);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: Platform.OS === "web" ? 32 : insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Create</Text>
          {options.map((opt) => (
            <Pressable key={opt.label} style={[styles.sheetRow, { borderBottomColor: colors.border }]} onPress={() => handleOption(opt.route)}>
              <View style={[styles.sheetIcon, { backgroundColor: opt.color + "20" }]}>
                <Text style={{ fontSize: 22 }}>{opt.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetRowLabel, { color: colors.foreground }]}>{opt.label}</Text>
                <Text style={[styles.sheetRowSub,   { color: colors.mutedForeground }]}>{opt.sub}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const colors      = useColors();
  const insets      = useSafeAreaInsets();
  const { count }   = useCart();
  const { isLoggedIn } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const totalUnread = CHAT_THREADS.reduce((s: number, c: any) => s + c.unread, 0);

  // Home | Reels | [+] | Chat | Profile
  const tabs = [
    { name: "index",   icon: "home",          label: "Home"    },
    { name: "reels",   icon: "film",           label: "Reels"   },
    { name: "_create", icon: "plus",           label: ""        },
    { name: "inbox",   icon: "message-circle", label: "Chat"    },
    { name: "profile", icon: "user",           label: "Profile" },
  ];

  const routeNames = state.routes.map((r: any) => r.name);

<<<<<<< Updated upstream
  return (
    <>
      <CreateSheet visible={showCreate} onClose={() => setShowCreate(false)} isLoggedIn={isLoggedIn} />
      <View style={[styles.tabBar, {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === "web" ? 30 : insets.bottom,
        height: Platform.OS === "web" ? 80 : 58 + insets.bottom,
      }]}>
        {tabs.map((tab) => {
          if (tab.name === "_create") {
            return (
              <Pressable key="create" style={styles.centerBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowCreate(true); }}>
                <View style={[styles.plusBtn, { backgroundColor: colors.primary }]}>
                  <Feather name="plus" size={22} color="#fff" />
                </View>
              </Pressable>
            );
          }

          const routeIndex = routeNames.indexOf(tab.name);
          const isFocused  = routeIndex >= 0 && state.index === routeIndex;
          const route      = routeIndex >= 0 ? state.routes[routeIndex] : null;

          return (
            <Pressable
              key={tab.name}
              style={styles.tabItem}
              onPress={() => {
                if (!isFocused && route) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate(tab.name);
                }
              }}
            >
              <View style={[styles.iconWrap, isFocused && { backgroundColor: colors.primary + "18", borderRadius: 12 }]}>
                <Feather name={tab.icon as any} size={22} color={isFocused ? colors.primary : colors.mutedForeground} />
                {tab.name === "inbox" && totalUnread > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.live }]}>
                    <Text style={styles.badgeText}>{totalUnread > 9 ? "9+" : totalUnread}</Text>
                  </View>
                )}
                {tab.name === "profile" && count > 0 && (
                  <View style={[styles.dot, { backgroundColor: colors.live }]} />
                )}
              </View>
              <Text style={[styles.label, { color: isFocused ? colors.primary : colors.mutedForeground, fontWeight: isFocused ? "700" : "500" }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
=======
  const handleCreatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(createScale, { toValue: 0.85, useNativeDriver: true, speed: 60 }),
      Animated.spring(createScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12 }),
    ]).start();
    setShowCreate(true);
  };

  return (
    <>
      <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={[styles.tabBar, { borderColor: colors.glassBorder }]}>
          {tabs.map((tab) => {
            if (tab.name === "_create") {
              return (
                <Pressable key="create" style={styles.tabItem} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowCreate(true); }}>
                  <LinearGradient colors={[colors.primary, colors.accent]} style={styles.createBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Feather name="plus" size={24} color="#fff" />
                  </LinearGradient>
                </Pressable>
              );
            }

            const route = state.routes.find((r: any) => r.name === tab.name);
            const isFocused = state.index === state.routes.indexOf(route);

            return (
              <Pressable
                key={tab.name}
                style={styles.tabItem}
                onPress={() => {
                  if (route && !isFocused) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate(tab.name);
                  }
                }}
              >
                <TabIcon name={tab.icon} focused={isFocused} colors={colors} badge={tab.badge} />
              </Pressable>
            );
          })}
        </BlurView>
>>>>>>> Stashed changes
      </View>
      <CreateSheet visible={showCreate} onClose={() => setShowCreate(false)} isLoggedIn={isLoggedIn} />
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index"   />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="reels"   />
      <Tabs.Screen name="inbox"   />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
<<<<<<< Updated upstream
  tabBar:    { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingTop: 6 },
  tabItem:   { flex: 1, alignItems: "center", gap: 2, paddingTop: 2 },
  iconWrap:  { width: 44, height: 32, alignItems: "center", justifyContent: "center", position: "relative" },
  label:     { fontSize: 10 },
  centerBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  plusBtn:   { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8, marginBottom: 4 },
  badge:     { position: "absolute", top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  dot:       { position: "absolute", top: 2, right: 4, width: 7, height: 7, borderRadius: 4 },
  sheetOverlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet:         { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, paddingTop: 10 },
  sheetHandle:   { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle:    { fontSize: 18, fontWeight: "800", paddingHorizontal: 20, marginBottom: 8 },
  sheetRow:      { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  sheetIcon:     { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  sheetRowLabel: { fontSize: 15, fontWeight: "700" },
  sheetRowSub:   { fontSize: 12, marginTop: 1 },
=======
  tabBarContainer:  { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center" },
  tabBar:           { flexDirection: "row", width: "92%", height: 64, borderRadius: 32, borderWidth: 1, overflow: "hidden", marginBottom: 8, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  tabItem:          { flex: 1, alignItems: "center", justifyContent: "center" },
  createBtn:        { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6 },
  iconWrap:         { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  activeGlow:       { position: "absolute", width: 32, height: 32, borderRadius: 16 },
  badge:            { position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#000" },
  badgeText:         { color: "#fff", fontSize: 9, fontWeight: "900" },
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet:        { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, paddingTop: 10 },
  sheetHandle:  { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle:   { fontSize: 20, fontWeight: "900", paddingHorizontal: 20, marginBottom: 8 },
  sheetRow:     { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  sheetIcon:    { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  sheetRowLabel:{ fontSize: 15, fontWeight: "700" },
  sheetRowSub:  { fontSize: 12, marginTop: 1 },
  sheetArrow:   { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
>>>>>>> Stashed changes
});
