import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LOCAL_SELLERS, CATEGORIES } from "@/data/mockData";

const RADIUS_OPTIONS = [1, 5, 10];

export default function NearbyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [radius, setRadius] = useState(5);
  const [category, setCategory] = useState("All");

  const filtered = LOCAL_SELLERS.filter(s => {
    const km = parseFloat(s.distance);
    if (km > radius) return false;
    if (category !== "All" && s.category !== category) return false;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Nearby Sellers</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{filtered.length} sellers within {radius} km</Text>
        </View>
        <Feather name="map-pin" size={20} color={colors.primary} />
      </View>

      {/* Map Placeholder */}
      <View style={[styles.mapArea, { backgroundColor: colors.muted }]}>
        <LinearGradient colors={colors.gradientPrimary as any} style={styles.mapOverlay}>
          <Feather name="map" size={40} color="#fff" />
          <Text style={styles.mapText}>Interactive Map View</Text>
          <Text style={styles.mapSubText}>Showing sellers within {radius} km</Text>
        </LinearGradient>
        {/* Seller Pins */}
        {filtered.slice(0, 3).map((s, i) => (
          <View key={s.id} style={[styles.pin, { left: 60 + i * 120, top: 30 + i * 25, backgroundColor: s.isOpen ? colors.success : colors.mutedForeground }]}>
            <Image source={{ uri: s.avatar }} style={styles.pinAvatar} />
          </View>
        ))}
      </View>

      {/* Radius Selector */}
      <View style={styles.radiusRow}>
        {RADIUS_OPTIONS.map(r => (
          <Pressable key={r} onPress={() => setRadius(r)}
            style={[styles.radiusChip, { backgroundColor: r === radius ? colors.primary : colors.muted, borderColor: r === radius ? colors.primary : colors.border }]}>
            <Text style={[styles.radiusText, { color: r === radius ? "#fff" : colors.foreground }]}>{r} km</Text>
          </Pressable>
        ))}
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {CATEGORIES.map(cat => (
          <Pressable key={cat} onPress={() => setCategory(cat)}
            style={[styles.catChip, { backgroundColor: cat === category ? colors.primary + "15" : colors.surface, borderColor: cat === category ? colors.primary : colors.border }]}>
            <Text style={[styles.catText, { color: cat === category ? colors.primary : colors.foreground }]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Seller List */}
      <ScrollView contentContainerStyle={styles.sellerList}>
        {filtered.map(seller => (
          <View key={seller.id} style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sellerRow}>
              <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={[styles.sellerName, { color: colors.foreground }]}>{seller.name}</Text>
                  {seller.isOpen && (
                    <View style={[styles.openBadge, { backgroundColor: colors.success + "15" }]}>
                      <View style={[styles.openDot, { backgroundColor: colors.success }]} />
                      <Text style={[styles.openText, { color: colors.success }]}>Open Now</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.sellerMeta, { color: colors.mutedForeground }]}>
                  {seller.category} • {seller.distance} • ⭐ {seller.rating}
                </Text>
              </View>
              {seller.flashSale && (
                <View style={[styles.flashBadge, { backgroundColor: colors.destructive }]}>
                  <Feather name="zap" size={10} color="#fff" />
                  <Text style={styles.flashText}>SALE</Text>
                </View>
              )}
            </View>
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="map-pin" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sellers in this range</Text>
          </View>
        )}
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
  mapArea: { height: 180, margin: 16, borderRadius: 20, overflow: "hidden", position: "relative" },
  mapOverlay: { flex: 1, alignItems: "center", justifyContent: "center", opacity: 0.9, gap: 6 },
  mapText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  mapSubText: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  pin: { position: "absolute", width: 36, height: 36, borderRadius: 18, padding: 2, borderWidth: 2, borderColor: "#fff" },
  pinAvatar: { width: "100%", height: "100%", borderRadius: 16 },
  radiusRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  radiusChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  radiusText: { fontSize: 13, fontWeight: "700" },
  catRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, borderWidth: 1 },
  catText: { fontSize: 12, fontWeight: "700" },
  sellerList: { paddingHorizontal: 16, gap: 10, paddingBottom: 40 },
  sellerCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sellerName: { fontSize: 15, fontWeight: "800" },
  openBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openText: { fontSize: 10, fontWeight: "700" },
  sellerMeta: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  flashBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  flashText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "600" },
});
