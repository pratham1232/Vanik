import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GROUP_DEALS, PRODUCTS, formatPrice } from "@/data/mockData";

function CountdownTimer({ expiresAt, colors }: { expiresAt: string; colors: any }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("EXPIRED"); return; }
      const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [expiresAt]);
  const isUrgent = timeLeft !== "EXPIRED" && new Date(expiresAt).getTime() - Date.now() < 30 * 60 * 1000;
  return (
    <View style={[styles.timerPill, { backgroundColor: isUrgent ? colors.destructive + "20" : colors.primary + "15" }]}>
      <Feather name="clock" size={12} color={isUrgent ? colors.destructive : colors.primary} />
      <Text style={[styles.timerText, { color: isUrgent ? colors.destructive : colors.primary }]}>{timeLeft}</Text>
    </View>
  );
}

export default function GroupDealsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  const handleJoin = (dealId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoined(prev => ({ ...prev, [dealId]: true }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Group Deals</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Join the mob, save more!</Text>
        </View>
        <Feather name="zap" size={20} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {GROUP_DEALS.map(deal => {
          const product = PRODUCTS.find(p => p.id === deal.productId);
          if (!product) return null;
          const progress = deal.currentBuyers / deal.minBuyers;
          const isFilled = deal.status === "filled";
          const hasJoined = joined[deal.id];
          const discount = Math.round(((deal.originalPrice - deal.groupPrice) / deal.originalPrice) * 100);

          return (
            <View key={deal.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Badge */}
              {isFilled && (
                <View style={[styles.filledBadge, { backgroundColor: colors.success }]}>
                  <Feather name="check-circle" size={12} color="#fff" />
                  <Text style={styles.filledText}>GROUP FILLED</Text>
                </View>
              )}
              {!isFilled && <CountdownTimer expiresAt={deal.expiresAt} colors={colors} />}

              {/* Product Row */}
              <View style={styles.productRow}>
                <Image source={product.image} style={styles.productImg} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dealTitle, { color: colors.foreground }]} numberOfLines={2}>{deal.title}</Text>
                  <Text style={[styles.sellerLabel, { color: colors.mutedForeground }]}>by {deal.sellerName}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.groupPrice, { color: colors.primary }]}>{formatPrice(deal.groupPrice)}</Text>
                    <Text style={[styles.origPrice, { color: colors.mutedForeground }]}>{formatPrice(deal.originalPrice)}</Text>
                    <View style={[styles.discBadge, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={[styles.discText, { color: colors.primary }]}>-{discount}%</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressMeta}>
                  <Text style={[styles.progressLabel, { color: colors.foreground }]}>
                    <Text style={{ fontWeight: "900", color: colors.primary }}>{deal.currentBuyers}</Text>/{deal.minBuyers} joined
                  </Text>
                  <Text style={[styles.progressPercent, { color: colors.primary }]}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.muted }]}>
                  <View style={[styles.bar, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: isFilled ? colors.success : colors.primary }]} />
                </View>
              </View>

              {/* Buyer Avatars */}
              <View style={styles.buyersRow}>
                {deal.buyers.slice(0, 5).map((b, i) => (
                  <Image key={b.id} source={{ uri: b.avatar }} style={[styles.buyerAvatar, { marginLeft: i > 0 ? -8 : 0, borderColor: colors.card }]} />
                ))}
                {deal.buyers.length > 5 && (
                  <View style={[styles.moreBuyers, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.moreText, { color: colors.foreground }]}>+{deal.buyers.length - 5}</Text>
                  </View>
                )}
              </View>

              {/* Action */}
              {!isFilled && !hasJoined && (
                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                  <Pressable onPress={() => handleJoin(deal.id)}>
                    <LinearGradient colors={colors.gradientPrimary as any} style={styles.joinBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Feather name="users" size={16} color="#fff" />
                      <Text style={styles.joinText}>Join This Deal</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              )}
              {hasJoined && (
                <View style={[styles.joinedBadge, { backgroundColor: colors.success + "15" }]}>
                  <Feather name="check" size={16} color={colors.success} />
                  <Text style={[styles.joinedText, { color: colors.success }]}>You've joined! Waiting for group to fill...</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  headerSub: { fontSize: 12, fontWeight: "600" },
  list: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 14 },
  filledBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  filledText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  timerPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  timerText: { fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  productRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  productImg: { width: 70, height: 70, borderRadius: 14 },
  dealTitle: { fontSize: 15, fontWeight: "800" },
  sellerLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  groupPrice: { fontSize: 18, fontWeight: "900" },
  origPrice: { fontSize: 13, textDecorationLine: "line-through" },
  discBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discText: { fontSize: 11, fontWeight: "800" },
  progressSection: { gap: 6 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 13, fontWeight: "600" },
  progressPercent: { fontSize: 13, fontWeight: "800" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 4 },
  buyersRow: { flexDirection: "row", alignItems: "center" },
  buyerAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2 },
  moreBuyers: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  moreText: { fontSize: 10, fontWeight: "800" },
  joinBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  joinText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  joinedBadge: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  joinedText: { fontSize: 13, fontWeight: "700" },
});
