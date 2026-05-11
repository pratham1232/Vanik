import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/data/mockData";

const ESCROW_ORDERS = [
  {
    id: "eo1", product: "Handcrafted Leather Bag", seller: "EcoThreads", amount: 1899,
    status: "held" as const, image: "https://i.pravatar.cc/100?img=32",
    orderDate: "May 8, 2026", estimatedDelivery: "May 12, 2026",
  },
  {
    id: "eo2", product: "Minimalist Watch", seller: "Style Studio", amount: 1499,
    status: "delivered" as const, image: "https://i.pravatar.cc/100?img=47",
    orderDate: "May 5, 2026", estimatedDelivery: "May 9, 2026",
  },
  {
    id: "eo3", product: "Organic Skincare Set", seller: "GlowWithSam", amount: 899,
    status: "disputed" as const, image: "https://i.pravatar.cc/100?img=11",
    orderDate: "May 3, 2026", estimatedDelivery: "May 7, 2026",
  },
];

export default function EscrowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [orders, setOrders] = useState(ESCROW_ORDERS);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeText, setDisputeText] = useState("");

  const confirmDelivery = (orderId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "delivered" as const } : o));
  };

  const submitDispute = (orderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "disputed" as const } : o));
    setDisputeId(null); setDisputeText("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "held": return colors.warning;
      case "delivered": return colors.success;
      case "disputed": return colors.destructive;
      default: return colors.mutedForeground;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Escrow Payments</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Secure transactions</Text>
        </View>
        <Feather name="shield" size={20} color={colors.success} />
      </View>

      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
        <Feather name="info" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.foreground }]}>
          Payments are held securely until you confirm delivery. Funds release automatically after 48 hours.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {orders.map(order => {
          const statusColor = getStatusColor(order.status);
          return (
            <View key={order.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.topRow}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusLabel, { color: statusColor }]}>
                  {order.status === "held" ? "Payment Held in Escrow" : order.status === "delivered" ? "Delivered & Released" : "Dispute Filed"}
                </Text>
              </View>
              <View style={styles.orderRow}>
                <View style={[styles.imgPlaceholder, { backgroundColor: colors.muted }]}>
                  <Feather name="package" size={24} color={colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.productName, { color: colors.foreground }]}>{order.product}</Text>
                  <Text style={[styles.sellerText, { color: colors.mutedForeground }]}>by {order.seller}</Text>
                  <Text style={[styles.amount, { color: colors.primary }]}>{formatPrice(order.amount)}</Text>
                </View>
              </View>
              <View style={[styles.dateRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.dateText, { color: colors.mutedForeground }]}>Ordered: {order.orderDate}</Text>
                <Text style={[styles.dateText, { color: colors.mutedForeground }]}>ETA: {order.estimatedDelivery}</Text>
              </View>
              {order.status === "held" && (
                <View style={styles.actionRow}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => confirmDelivery(order.id)}>
                    <Feather name="check" size={14} color="#fff" />
                    <Text style={styles.actionText}>Confirm Delivery</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.destructive + "15" }]} onPress={() => setDisputeId(order.id)}>
                    <Feather name="alert-circle" size={14} color={colors.destructive} />
                    <Text style={[styles.actionText, { color: colors.destructive }]}>Dispute</Text>
                  </Pressable>
                </View>
              )}
              {disputeId === order.id && (
                <View style={[styles.disputeForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.disputeTitle, { color: colors.foreground }]}>Describe the issue:</Text>
                  <TextInput
                    style={[styles.disputeInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
                    placeholder="What went wrong?" placeholderTextColor={colors.mutedForeground}
                    value={disputeText} onChangeText={setDisputeText} multiline
                  />
                  <Pressable style={[styles.submitBtn, { backgroundColor: colors.destructive }]} onPress={() => submitDispute(order.id)}>
                    <Text style={styles.submitText}>Submit Dispute</Text>
                  </Pressable>
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
  infoBanner: { flexDirection: "row", alignItems: "center", gap: 10, margin: 16, padding: 14, borderRadius: 14, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  list: { paddingHorizontal: 16, gap: 14, paddingBottom: 40 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, fontWeight: "800" },
  orderRow: { flexDirection: "row", gap: 12 },
  imgPlaceholder: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  productName: { fontSize: 15, fontWeight: "700" },
  sellerText: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 17, fontWeight: "900", marginTop: 4 },
  dateRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1 },
  dateText: { fontSize: 11 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  disputeForm: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  disputeTitle: { fontSize: 14, fontWeight: "700" },
  disputeInput: { borderRadius: 12, padding: 12, borderWidth: 1, minHeight: 60, fontSize: 14 },
  submitBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
