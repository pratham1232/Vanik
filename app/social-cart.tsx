import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { PRODUCTS, formatPrice } from "@/data/mockData";

export default function SocialCartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : Math.max(insets.bottom, 20);
  const { items } = useCart();

  const [friendJoined, setFriendJoined] = useState(false);
  const [friendReactions, setFriendReactions] = useState<Record<string, string>>({});
  const [splitPayment, setSplitPayment] = useState(false);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate friend joining after 3s
    const t = setTimeout(() => {
      setFriendJoined(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // Simulate friend reacting
  useEffect(() => {
    if (!friendJoined) return;
    const t = setTimeout(() => {
      if (items.length > 0) {
        setFriendReactions({ [items[0]?.id || "p1"]: "😍" });
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [friendJoined]);

  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const inviteFriend = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({ message: "Join my shopping session on Vanik! 🛍️ https://vanik.app/co-shop/abc123" });
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Co-Shopping Session</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {friendJoined ? "Meera is shopping with you ✨" : "Waiting for friend to join..."}
          </Text>
        </View>
        <Pressable onPress={inviteFriend} style={[styles.inviteBtn, { backgroundColor: colors.primary }]}>
          <Feather name="user-plus" size={14} color="#fff" />
          <Text style={styles.inviteText}>Invite</Text>
        </Pressable>
      </View>

      {/* Friend Status */}
      {friendJoined && (
        <View style={[styles.friendBanner, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
          <Image source={{ uri: "https://i.pravatar.cc/50?img=9" }} style={styles.friendAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.friendName, { color: colors.foreground }]}>Meera joined your session!</Text>
            <Text style={[styles.friendStatus, { color: colors.success }]}>● Shopping together</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.cartList}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="shopping-bag" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Your shared cart is empty</Text>
            <Pressable style={[styles.browseBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/(tabs)/explore")}>
              <Text style={styles.browseText}>Browse Products</Text>
            </Pressable>
          </View>
        ) : (
          items.map(item => (
            <View key={item.id} style={[styles.cartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={item.image} style={styles.cartImg} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cartTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.cartPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
                <Text style={[styles.addedBy, { color: colors.mutedForeground }]}>Added by you</Text>
              </View>
              {friendReactions[item.id] && (
                <Animated.Text style={[styles.friendEmoji, { transform: [{ scale: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }] }]}>
                  {friendReactions[item.id]}
                </Animated.Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Bar */}
      {items.length > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: botPad + 8 }]}>
          {/* Split Payment Toggle */}
          <Pressable style={styles.splitRow} onPress={() => { setSplitPayment(!splitPayment); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <View style={[styles.toggle, { backgroundColor: splitPayment ? colors.primary : colors.muted }]}>
              <View style={[styles.toggleDot, splitPayment && { transform: [{ translateX: 16 }] }, { backgroundColor: "#fff" }]} />
            </View>
            <Text style={[styles.splitText, { color: colors.foreground }]}>Split Payment 50/50</Text>
            {splitPayment && <Text style={[styles.splitAmount, { color: colors.primary }]}>{formatPrice(Math.ceil(total / 2))} each</Text>}
          </Pressable>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total</Text>
            <Text style={[styles.totalAmount, { color: colors.foreground }]}>{formatPrice(total)}</Text>
          </View>
          <Pressable onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.push("/cart"); }}>
            <LinearGradient colors={colors.gradientPrimary as any} style={styles.checkoutBtn}>
              <Text style={styles.checkoutText}>Checkout Together</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 10, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "900" },
  headerSub: { fontSize: 12, fontWeight: "600" },
  inviteBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  inviteText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  friendBanner: { flexDirection: "row", alignItems: "center", gap: 12, margin: 16, padding: 14, borderRadius: 16, borderWidth: 1 },
  friendAvatar: { width: 36, height: 36, borderRadius: 18 },
  friendName: { fontSize: 14, fontWeight: "700" },
  friendStatus: { fontSize: 12, fontWeight: "600" },
  cartList: { padding: 16, gap: 12, paddingBottom: 20 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "600" },
  browseBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  browseText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  cartCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  cartImg: { width: 56, height: 56, borderRadius: 12 },
  cartTitle: { fontSize: 14, fontWeight: "700" },
  cartPrice: { fontSize: 16, fontWeight: "900", marginTop: 4 },
  addedBy: { fontSize: 11, marginTop: 2 },
  friendEmoji: { fontSize: 24 },
  bottomBar: { padding: 16, borderTopWidth: 1, gap: 12 },
  splitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  toggle: { width: 40, height: 24, borderRadius: 12, justifyContent: "center", padding: 2 },
  toggleDot: { width: 20, height: 20, borderRadius: 10 },
  splitText: { flex: 1, fontSize: 14, fontWeight: "600" },
  splitAmount: { fontSize: 13, fontWeight: "800" },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 14, fontWeight: "600" },
  totalAmount: { fontSize: 20, fontWeight: "900" },
  checkoutBtn: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
