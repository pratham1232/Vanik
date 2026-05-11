import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { TIME_CAPSULE_DEALS, PRODUCTS, formatPrice } from "@/data/mockData";

function DealTimer({ start, end, colors }: { start: string; end: string; colors: any }) {
  const [status, setStatus] = useState<"locked" | "active" | "expired">("locked");
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      if (now < s) {
        setStatus("locked");
        const diff = s - now;
        const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(`Unlocks in ${h}h ${m}m`);
      } else if (now >= s && now <= e) {
        setStatus("active");
        const diff = e - now;
        const m = Math.floor(diff / 60000); const sec = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}:${sec.toString().padStart(2, "0")} left`);
      } else {
        setStatus("expired"); setTimeLeft("Expired");
      }
    };
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, [start, end]);
  const color = status === "active" ? colors.success : status === "locked" ? colors.primary : colors.destructive;
  const icon = status === "active" ? "unlock" : status === "locked" ? "lock" : "x-circle";
  return (
    <View style={[styles.statusPill, { backgroundColor: color + "15" }]}>
      <Feather name={icon as any} size={12} color={color} />
      <Text style={[styles.statusText, { color }]}>{timeLeft}</Text>
    </View>
  );
}

export default function TimeCapsuleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Time-Capsule Deals</Text>
        <Feather name="clock" size={20} color={colors.primary} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {TIME_CAPSULE_DEALS.map(deal => {
          const product = PRODUCTS.find(p => p.id === deal.productId);
          if (!product) return null;
          const isActive = new Date(deal.windowStart).getTime() <= Date.now() && Date.now() <= new Date(deal.windowEnd).getTime();
          return (
            <View key={deal.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: isActive ? 1 : 0.6 }]}>
              <DealTimer start={deal.windowStart} end={deal.windowEnd} colors={colors} />
              <View style={styles.productRow}>
                <Image source={product.image} style={styles.productImg} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dealTitle, { color: colors.foreground }]}>{deal.title}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.dealPrice, { color: colors.primary }]}>{formatPrice(deal.dealPrice)}</Text>
                    <Text style={[styles.origPrice, { color: colors.mutedForeground }]}>{formatPrice(deal.originalPrice)}</Text>
                    <View style={[styles.discBadge, { backgroundColor: colors.destructive }]}>
                      <Text style={styles.discText}>-{deal.discountPercent}%</Text>
                    </View>
                  </View>
                  <Text style={[styles.claimedText, { color: colors.mutedForeground }]}>{deal.claimed}/{deal.limit} claimed</Text>
                </View>
              </View>
              {isActive && (
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push(`/product/${product.id}`); }}>
                  <LinearGradient colors={colors.gradientPrimary as any} style={styles.claimBtn}>
                    <Feather name="zap" size={16} color="#fff" />
                    <Text style={styles.claimText}>Claim Deal</Text>
                  </LinearGradient>
                </Pressable>
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
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "900" },
  list: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 14 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  productRow: { flexDirection: "row", gap: 12 },
  productImg: { width: 70, height: 70, borderRadius: 14 },
  dealTitle: { fontSize: 15, fontWeight: "800" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  dealPrice: { fontSize: 18, fontWeight: "900" },
  origPrice: { fontSize: 13, textDecorationLine: "line-through" },
  discBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  claimedText: { fontSize: 12, marginTop: 4 },
  claimBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  claimText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
