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
import { PRODUCTS, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const ORDER_TABS = ["All", "Active", "Delivered", "Returns"];

const ORDERS = [
  {
    id: "VNK-4821",
    productId: "p2",
    product: "Minimalist Watch",
    seller: "Style Studio",
    sellerAvatar: "https://i.pravatar.cc/60?img=47",
    price: 1499,
    qty: 1,
    status: "Out for Delivery",
    statusCode: "active",
    progress: 3,
    date: "Today",
    eta: "Today by 7 PM",
    tracking: "DTDC12345678",
    steps: [
      { label: "Order Placed",     done: true,  time: "10 May, 10:30 AM" },
      { label: "Seller Confirmed", done: true,  time: "10 May, 11:00 AM" },
      { label: "Shipped",          done: true,  time: "10 May, 4:00 PM"  },
      { label: "Out for Delivery", done: true,  time: "11 May, 9:00 AM"  },
      { label: "Delivered",        done: false, time: "Expected: Today"  },
    ],
  },
  {
    id: "VNK-4819",
    productId: "p3",
    product: "Terracotta Vase Set",
    seller: "ClayCraft Studio",
    sellerAvatar: "https://i.pravatar.cc/60?img=45",
    price: 1299,
    qty: 1,
    status: "Shipped",
    statusCode: "active",
    progress: 2,
    date: "9 May",
    eta: "12 May",
    tracking: "BLUEDART987654",
    steps: [
      { label: "Order Placed",     done: true,  time: "9 May, 2:00 PM"  },
      { label: "Seller Confirmed", done: true,  time: "9 May, 2:45 PM"  },
      { label: "Shipped",          done: true,  time: "9 May, 8:00 PM"  },
      { label: "Out for Delivery", done: false, time: "Expected: 12 May" },
      { label: "Delivered",        done: false, time: "Expected: 12 May" },
    ],
  },
  {
    id: "VNK-4803",
    productId: "p4",
    product: "Organic Skincare Set",
    seller: "GlowWithSam",
    sellerAvatar: "https://i.pravatar.cc/60?img=11",
    price: 899,
    qty: 2,
    status: "Delivered",
    statusCode: "delivered",
    progress: 5,
    date: "2 May",
    eta: "Delivered on 4 May",
    tracking: "DELHIVERY334455",
    steps: [
      { label: "Order Placed",     done: true, time: "2 May, 11:00 AM" },
      { label: "Seller Confirmed", done: true, time: "2 May, 11:30 AM" },
      { label: "Shipped",          done: true, time: "3 May, 9:00 AM"  },
      { label: "Out for Delivery", done: true, time: "4 May, 8:00 AM"  },
      { label: "Delivered",        done: true, time: "4 May, 1:30 PM"  },
    ],
  },
  {
    id: "VNK-4800",
    productId: "p1",
    product: "Handcrafted Leather Bag",
    seller: "EcoThreads",
    sellerAvatar: "https://i.pravatar.cc/60?img=32",
    price: 1899,
    qty: 1,
    status: "Delivered",
    statusCode: "delivered",
    progress: 5,
    date: "28 Apr",
    eta: "Delivered on 1 May",
    tracking: "FEDEX112233",
    steps: [
      { label: "Order Placed",     done: true, time: "28 Apr, 3:00 PM" },
      { label: "Seller Confirmed", done: true, time: "28 Apr, 4:00 PM" },
      { label: "Shipped",          done: true, time: "29 Apr, 10:00 AM" },
      { label: "Out for Delivery", done: true, time: "1 May, 9:30 AM"  },
      { label: "Delivered",        done: true, time: "1 May, 2:00 PM"  },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  "Out for Delivery": "#F59E0B",
  "Shipped":          "#3B82F6",
  "Delivered":        "#10B981",
  "Confirmed":        "#8B5CF6",
  "Cancelled":        "#FF3B5C",
};

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = activeTab === "All"
    ? ORDERS
    : activeTab === "Active"
    ? ORDERS.filter((o) => o.statusCode === "active")
    : activeTab === "Delivered"
    ? ORDERS.filter((o) => o.statusCode === "delivered")
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>My Orders</Text>
        <Pressable style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Feather name="search" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        {ORDER_TABS.map((tab) => {
          const isActive = tab === activeTab;
          const count = tab === "All" ? ORDERS.length : tab === "Active" ? ORDERS.filter((o) => o.statusCode === "active").length : ORDERS.filter((o) => o.statusCode === "delivered").length;
          return (
            <Pressable
              key={tab}
              style={[styles.tabPill, isActive && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); }}
            >
              <Text style={[styles.tabText, { color: isActive ? "#fff" : colors.mutedForeground }]}>{tab}</Text>
              {count > 0 && <Text style={[styles.tabCount, { color: isActive ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>{count}</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: Platform.OS === "web" ? 90 : 80 }}>
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="package" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders here</Text>
            <Pressable style={[styles.shopBtn, { backgroundColor: colors.primary }]} onPress={() => { router.back(); }}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </Pressable>
          </View>
        )}

        {filtered.map((order) => {
          const product = PRODUCTS.find((p) => p.id === order.productId);
          const isExpanded = expandedId === order.id;
          const statusColor = STATUS_COLORS[order.status] ?? colors.primary;

          return (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Card header */}
              <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.orderMeta}>
                  <Text style={[styles.orderId, { color: colors.mutedForeground }]}>#{order.id}</Text>
                  <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>{order.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
                </View>
              </View>

              {/* Product row */}
              <Pressable style={styles.productRow} onPress={() => product && router.push(`/product/${product.id}`)}>
                {product && (
                  <Image source={product.image} style={styles.productImg} resizeMode="cover" />
                )}
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>{order.product}</Text>
                  <View style={styles.sellerRow}>
                    <Image source={{ uri: order.sellerAvatar }} style={styles.sellerAvatar} />
                    <Text style={[styles.sellerName, { color: colors.mutedForeground }]}>{order.seller}</Text>
                  </View>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>{formatPrice(order.price)} × {order.qty}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>

              {/* ETA row */}
              <View style={[styles.etaRow, { backgroundColor: statusColor + "10" }]}>
                <Feather name={order.statusCode === "delivered" ? "check-circle" : "truck"} size={14} color={statusColor} />
                <Text style={[styles.etaText, { color: statusColor }]}>{order.eta}</Text>
                {order.statusCode === "active" && (
                  <View style={[styles.trackingChip, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.trackingText, { color: colors.mutedForeground }]}>{order.tracking}</Text>
                  </View>
                )}
              </View>

              {/* Timeline */}
              <Pressable
                style={[styles.timelineToggle, { borderTopColor: colors.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedId(isExpanded ? null : order.id); }}
              >
                <Feather name="map-pin" size={14} color={colors.primary} />
                <Text style={[styles.timelineToggleText, { color: colors.primary }]}>
                  {isExpanded ? "Hide tracking" : "Track order"}
                </Text>
                <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
              </Pressable>

              {isExpanded && (
                <View style={[styles.timeline, { borderTopColor: colors.border }]}>
                  {order.steps.map((step, i) => (
                    <View key={i} style={styles.timelineStep}>
                      <View style={styles.timelineLeft}>
                        <View style={[
                          styles.timelineDot,
                          { backgroundColor: step.done ? statusColor : colors.border, borderColor: step.done ? statusColor : colors.border },
                        ]}>
                          {step.done && <Feather name="check" size={9} color="#fff" />}
                        </View>
                        {i < order.steps.length - 1 && (
                          <View style={[styles.timelineLine, { backgroundColor: i < order.progress - 1 ? statusColor : colors.border }]} />
                        )}
                      </View>
                      <View style={styles.timelineInfo}>
                        <Text style={[styles.timelineLabel, { color: step.done ? colors.foreground : colors.mutedForeground, fontWeight: step.done ? "700" : "400" }]}>
                          {step.label}
                        </Text>
                        <Text style={[styles.timelineTime, { color: colors.mutedForeground }]}>{step.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.muted }]}
                  onPress={() => router.push("/chat/c1")}
                >
                  <Feather name="message-circle" size={14} color={colors.foreground} />
                  <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Contact Seller</Text>
                </Pressable>
                {order.statusCode === "delivered" && (
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
                    <Feather name="star" size={14} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Rate Order</Text>
                  </Pressable>
                )}
                {order.statusCode === "delivered" && (
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.muted }]}>
                    <Feather name="refresh-cw" size={14} color={colors.foreground} />
                    <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Reorder</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  header:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10, gap: 12, borderBottomWidth: 1 },
  backBtn:          { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  title:            { flex: 1, fontSize: 20, fontWeight: "900" },
  iconBtn:          { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  tabsRow:          { paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  tabPill:          { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: "transparent" },
  tabText:          { fontSize: 13, fontWeight: "600" },
  tabCount:         { fontSize: 12 },
  emptyState:       { alignItems: "center", gap: 14, paddingTop: 60 },
  emptyIcon:        { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle:       { fontSize: 18, fontWeight: "700" },
  shopBtn:          { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  shopBtnText:      { color: "#fff", fontWeight: "700" },
  orderCard:        { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  cardHeader:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  orderMeta:        { gap: 2 },
  orderId:          { fontSize: 12, fontWeight: "700" },
  orderDate:        { fontSize: 11 },
  statusBadge:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusDot:        { width: 6, height: 6, borderRadius: 3 },
  statusText:       { fontSize: 12, fontWeight: "700" },
  productRow:       { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  productImg:       { width: 70, height: 70, borderRadius: 12 },
  productName:      { fontSize: 14, fontWeight: "700" },
  sellerRow:        { flexDirection: "row", alignItems: "center", gap: 5 },
  sellerAvatar:     { width: 18, height: 18, borderRadius: 9 },
  sellerName:       { fontSize: 12 },
  productPrice:     { fontSize: 14, fontWeight: "800" },
  etaRow:           { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8 },
  etaText:          { flex: 1, fontSize: 13, fontWeight: "600" },
  trackingChip:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  trackingText:     { fontSize: 11, fontWeight: "600" },
  timelineToggle:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  timelineToggleText: { flex: 1, fontSize: 13, fontWeight: "700" },
  timeline:         { paddingHorizontal: 14, paddingVertical: 10, gap: 0, borderTopWidth: 1 },
  timelineStep:     { flexDirection: "row", gap: 12 },
  timelineLeft:     { alignItems: "center", width: 20 },
  timelineDot:      { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  timelineLine:     { width: 2, height: 30, borderRadius: 1, marginVertical: 2 },
  timelineInfo:     { flex: 1, paddingBottom: 12, paddingTop: 0 },
  timelineLabel:    { fontSize: 13 },
  timelineTime:     { fontSize: 11, marginTop: 2 },
  cardActions:      { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, flexWrap: "wrap" },
  actionBtn:        { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "transparent" },
  actionBtnText:    { fontSize: 12, fontWeight: "600" },
});
