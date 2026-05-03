import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const NOTIF_TABS = ["All", "Orders", "Social", "Deals"];

const ALL_NOTIFS = [
  // Orders
  { id: "n1", type: "order_confirmed", icon: "check-circle", color: "#10B981", avatar: "https://i.pravatar.cc/60?img=47", title: "Order Confirmed", body: "Style Studio confirmed your order #VNK-4821 for Minimalist Watch.", time: "2m", read: false, category: "Orders", action: "/orders" },
  { id: "n2", type: "order_shipped", icon: "truck", color: "#F59E0B", avatar: "https://i.pravatar.cc/60?img=45", title: "Your order is on the way!", body: "Terracotta Vase Set is out for delivery. ETA: Today by 7 PM.", time: "15m", read: false, category: "Orders", action: "/orders" },
  { id: "n3", type: "order_delivered", icon: "package", color: "#8B5CF6", avatar: "https://i.pravatar.cc/60?img=32", title: "Order Delivered!", body: "Handcrafted Leather Bag was delivered. How was it?", time: "1h", read: true, category: "Orders", action: "/orders" },
  // Social
  { id: "n4", type: "like", icon: "heart", color: "#FF3B5C", avatar: "https://i.pravatar.cc/60?img=9", title: "Meera S. liked your post", body: "\"Styled my new linen shirt today!\" got 28 likes.", time: "5m", read: false, category: "Social", action: "/" },
  { id: "n5", type: "comment", icon: "message-circle", color: "#3B82F6", avatar: "https://i.pravatar.cc/60?img=12", title: "Karan commented on your post", body: "\"This is amazing! Where did you get it?\"", time: "18m", read: false, category: "Social", action: "/" },
  { id: "n6", type: "follow", icon: "user-plus", color: "#8B5CF6", avatar: "https://i.pravatar.cc/60?img=11", title: "GlowWithSam started following you", body: "4.6K followers • Beauty & Skincare", time: "32m", read: true, category: "Social", action: "/" },
  { id: "n7", type: "mention", icon: "at-sign", color: "#EC4899", avatar: "https://i.pravatar.cc/60?img=22", title: "Priya mentioned you in a comment", body: "@you \"You need to see this leather bag 😍\"", time: "1h", read: true, category: "Social", action: "/" },
  { id: "n8", type: "story_view", icon: "eye", color: "#06B6D4", avatar: "https://i.pravatar.cc/60?img=5", title: "Riya and 12 others viewed your story", body: "Your product story got 13 views today!", time: "2h", read: true, category: "Social", action: "/" },
  // Live
  { id: "n9", type: "live", icon: "video", color: "#FF3B5C", avatar: "https://i.pravatar.cc/60?img=47", title: "Style Studio is LIVE now!", body: "Summer Collection drop — 2.4K people watching. Join now!", time: "3m", read: false, category: "Social", action: "/live/l1" },
  { id: "n10", type: "live_reminder", icon: "bell", color: "#F59E0B", avatar: "https://i.pravatar.cc/60?img=45", title: "ClayCraft goes live in 1 hour", body: "Handmade pottery launch — set a reminder!", time: "55m", read: true, category: "Social", action: "/live/l2" },
  // Deals
  { id: "n11", type: "deal", icon: "tag", color: "#10B981", avatar: "https://i.pravatar.cc/60?img=32", title: "Flash Sale! 50% off EcoThreads", body: "Only 4 hours left! Linen shirts, kurtas & more.", time: "10m", read: false, category: "Deals", action: "/explore" },
  { id: "n12", type: "wishlist_drop", icon: "trending-down", color: "#8B5CF6", avatar: "https://i.pravatar.cc/60?img=11", title: "Price drop on your wishlist!", body: "Organic Skincare Set dropped from ₹1,200 → ₹899. Grab it now!", time: "1h", read: true, category: "Deals", action: "/wishlist" },
  { id: "n13", type: "resell", icon: "trending-up", color: "#EC4899", avatar: "https://i.pravatar.cc/60?img=25", title: "You earned ₹180!", body: "Someone bought Leather Bag through your reseller link. Keep sharing!", time: "3h", read: true, category: "Deals", action: "/explore" },
  { id: "n14", type: "restock", icon: "refresh-cw", color: "#3B82F6", avatar: "https://i.pravatar.cc/60?img=47", title: "Back in stock!", body: "Minimalist Watch (Silver) is back in stock. Limited units.", time: "4h", read: true, category: "Deals", action: "/product/p2" },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState(ALL_NOTIFS);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = activeTab === "All"
    ? notifications
    : notifications.filter((n) => n.category === activeTab);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{unreadCount} new</Text>
          )}
        </View>
        <Pressable
          style={[styles.markAllBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}
          onPress={markAllRead}
        >
          <Feather name="check-circle" size={14} color={colors.primary} />
          <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        {NOTIF_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const tabUnread = tab === "All" ? unreadCount : ALL_NOTIFS.filter((n) => !n.read && n.category === tab).length;
          return (
            <Pressable
              key={tab}
              style={[styles.tabPill, isActive && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); }}
            >
              <Text style={[styles.tabText, { color: isActive ? "#fff" : colors.mutedForeground }]}>{tab}</Text>
              {tabUnread > 0 && (
                <View style={[styles.tabDot, { backgroundColor: isActive ? "rgba(255,255,255,0.5)" : colors.live }]}>
                  <Text style={styles.tabDotText}>{tabUnread}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 90 : 80 }}>
        {/* Today group */}
        <View style={[styles.dateGroup, { borderBottomColor: colors.border }]}>
          <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dateLabel, { color: colors.mutedForeground, backgroundColor: colors.background }]}>TODAY</Text>
          <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
        </View>

        {filtered.filter((_, i) => i < 8).map((n) => (
          <Pressable
            key={n.id}
            style={[
              styles.notifRow,
              { borderBottomColor: colors.border },
              !n.read && { backgroundColor: colors.primary + "08" },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              markRead(n.id);
              router.push(n.action as any);
            }}
          >
            {/* Unread indicator */}
            {!n.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}

            {/* Avatar + icon badge */}
            <View style={styles.avatarWrap}>
              <Image source={{ uri: n.avatar }} style={styles.avatar} />
              <View style={[styles.iconBadge, { backgroundColor: n.color, borderColor: colors.background }]}>
                <Feather name={n.icon as any} size={11} color="#fff" />
              </View>
            </View>

            {/* Content */}
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: colors.foreground, fontWeight: n.read ? "600" : "800" }]}>
                {n.title}
              </Text>
              <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                {n.body}
              </Text>
              <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{n.time} ago</Text>
            </View>

            {/* Action button for certain types */}
            {(n.type === "live" || n.type === "order_shipped") && (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: n.type === "live" ? "#FF3B5C" : colors.primary }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push(n.action as any); }}
              >
                <Text style={styles.actionBtnText}>{n.type === "live" ? "Join" : "Track"}</Text>
              </Pressable>
            )}
          </Pressable>
        ))}

        {/* Earlier group */}
        {filtered.length > 8 && (
          <>
            <View style={[styles.dateGroup, { borderBottomColor: colors.border }]}>
              <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dateLabel, { color: colors.mutedForeground, backgroundColor: colors.background }]}>EARLIER</Text>
              <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
            </View>
            {filtered.filter((_, i) => i >= 8).map((n) => (
              <Pressable
                key={n.id}
                style={[styles.notifRow, { borderBottomColor: colors.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(n.action as any); }}
              >
                <View style={styles.avatarWrap}>
                  <Image source={{ uri: n.avatar }} style={styles.avatar} />
                  <View style={[styles.iconBadge, { backgroundColor: n.color, borderColor: colors.background }]}>
                    <Feather name={n.icon as any} size={11} color="#fff" />
                  </View>
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, { color: colors.mutedForeground, fontWeight: "600" }]}>{n.title}</Text>
                  <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={1}>{n.body}</Text>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{n.time} ago</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10, gap: 12, borderBottomWidth: 1 },
  backBtn:      { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  title:        { fontSize: 20, fontWeight: "900" },
  subtitle:     { fontSize: 12, marginTop: 1 },
  markAllBtn:   { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, borderWidth: 1 },
  markAllText:  { fontSize: 12, fontWeight: "700" },
  tabsRow:      { paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  tabPill:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: "transparent" },
  tabText:      { fontSize: 13, fontWeight: "600" },
  tabDot:       { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8 },
  tabDotText:   { color: "#fff", fontSize: 10, fontWeight: "700" },
  dateGroup:    { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  dateLine:     { flex: 1, height: 1 },
  dateLabel:    { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, paddingHorizontal: 8 },
  notifRow:     { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, position: "relative" },
  unreadDot:    { position: "absolute", left: 6, top: "50%", marginTop: -4, width: 8, height: 8, borderRadius: 4 },
  avatarWrap:   { position: "relative" },
  avatar:       { width: 50, height: 50, borderRadius: 25 },
  iconBadge:    { position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  notifContent: { flex: 1, gap: 2 },
  notifTitle:   { fontSize: 14, lineHeight: 20 },
  notifBody:    { fontSize: 13, lineHeight: 18 },
  notifTime:    { fontSize: 11, marginTop: 2 },
  actionBtn:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, alignSelf: "center", marginLeft: 4 },
  actionBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
