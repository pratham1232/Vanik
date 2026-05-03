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
import { useApp } from "@/context/AppContext";
import { useCart } from "@/context/CartContext";
import { PRODUCTS, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const COLLECTIONS = ["All Saved", "Fashion", "Home Decor", "Beauty"];

export default function WishlistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { wishlist, toggleWishlist } = useApp();
  const { addItem } = useCart();
  const [activeCol, setActiveCol] = useState("All Saved");
  const [view, setView] = useState<"grid" | "list">("grid");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // For demo purposes show all products if wishlist is empty
  const toShow = wishlist.length > 0 ? PRODUCTS.filter((p) => wishlist.includes(p.id)) : PRODUCTS;

  const filtered = activeCol === "All Saved"
    ? toShow
    : toShow.filter((p) => p.category === activeCol);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Wishlist</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{toShow.length} saved items</Text>
        </View>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.muted }]}
          onPress={() => setView((v) => v === "grid" ? "list" : "grid")}
        >
          <Feather name={view === "grid" ? "list" : "grid"} size={18} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Collections */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.colsRow, { borderBottomColor: colors.border }]}>
        {COLLECTIONS.map((col) => {
          const isActive = col === activeCol;
          return (
            <Pressable
              key={col}
              style={[styles.colPill, { borderColor: isActive ? colors.primary : colors.border, backgroundColor: isActive ? colors.primary + "18" : "transparent" }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveCol(col); }}
            >
              <Text style={[styles.colText, { color: isActive ? colors.primary : colors.mutedForeground }]}>{col}</Text>
            </Pressable>
          );
        })}
        <Pressable style={[styles.colPill, { borderColor: colors.border, borderStyle: "dashed" }]}>
          <Feather name="plus" size={13} color={colors.mutedForeground} />
          <Text style={[styles.colText, { color: colors.mutedForeground }]}>New</Text>
        </Pressable>
      </ScrollView>

      {/* Price drop banner */}
      <Pressable style={[styles.dropBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
        <View style={[styles.dropIcon, { backgroundColor: colors.primary }]}>
          <Feather name="trending-down" size={16} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.dropTitle, { color: colors.foreground }]}>Price drops on your wishlist!</Text>
          <Text style={[styles.dropSub, { color: colors.mutedForeground }]}>1 item dropped in price. Grab it now!</Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.primary} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === "web" ? 90 : 80 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="bookmark" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing saved yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Tap the bookmark icon on any product to save it here.</Text>
            <Pressable style={[styles.exploreBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/explore" as any)}>
              <Text style={styles.exploreBtnText}>Explore Products</Text>
            </Pressable>
          </View>
        ) : view === "grid" ? (
          <View style={styles.grid}>
            {filtered.map((p) => {
              const isSaved = wishlist.includes(p.id);
              return (
                <Pressable
                  key={p.id}
                  style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/product/${p.id}`)}
                >
                  <View style={styles.gridImageWrap}>
                    <Image source={p.image} style={styles.gridImage} resizeMode="cover" />
                    {p.discount > 0 && (
                      <View style={[styles.discountBadge, { backgroundColor: colors.live }]}>
                        <Text style={styles.discountText}>{p.discount}%</Text>
                      </View>
                    )}
                    <Pressable
                      style={[styles.heartBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleWishlist(p.id); }}
                    >
                      <Feather name="heart" size={16} color={isSaved || wishlist.length === 0 ? "#FF3B5C" : "#fff"} />
                    </Pressable>
                  </View>
                  <View style={styles.gridInfo}>
                    <Text style={[styles.gridName, { color: colors.foreground }]} numberOfLines={2}>{p.title}</Text>
                    <View style={styles.gridPriceRow}>
                      <Text style={[styles.gridPrice, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
                      {p.originalPrice > p.price && (
                        <Text style={[styles.gridOldPrice, { color: colors.mutedForeground }]}>₹{p.originalPrice}</Text>
                      )}
                    </View>
                    <View style={styles.gridRating}>
                      <Feather name="star" size={11} color="#F59E0B" />
                      <Text style={[styles.gridRatingText, { color: colors.mutedForeground }]}>{p.rating}</Text>
                    </View>
                    <Pressable
                      style={[styles.addBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        addItem({ id: p.id, title: p.title, price: p.price, image: p.image, sellerName: p.sellerName });
                      }}
                    >
                      <Feather name="shopping-bag" size={12} color="#fff" />
                      <Text style={styles.addBtnText}>Add to Cart</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {filtered.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <Image source={p.image} style={styles.listImage} resizeMode="cover" />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.listName, { color: colors.foreground }]} numberOfLines={2}>{p.title}</Text>
                  <Text style={[styles.listSeller, { color: colors.mutedForeground }]}>{p.sellerName}</Text>
                  <View style={styles.listPriceRow}>
                    <Text style={[styles.listPrice, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
                    {p.discount > 0 && <Text style={[styles.listDiscount, { color: colors.online }]}>{p.discount}% off</Text>}
                  </View>
                  <View style={styles.listActions}>
                    <Pressable
                      style={[styles.listAddBtn, { backgroundColor: colors.primary }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addItem({ id: p.id, title: p.title, price: p.price, image: p.image, sellerName: p.sellerName }); }}
                    >
                      <Text style={styles.listAddBtnText}>Add to Cart</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.listRemoveBtn, { backgroundColor: colors.muted }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleWishlist(p.id); }}
                    >
                      <Feather name="trash-2" size={14} color={colors.live} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10, gap: 12, borderBottomWidth: 1 },
  backBtn:        { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  title:          { fontSize: 20, fontWeight: "900" },
  subtitle:       { fontSize: 12, marginTop: 1 },
  iconBtn:        { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  colsRow:        { paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  colPill:        { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1 },
  colText:        { fontSize: 13, fontWeight: "600" },
  dropBanner:     { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 14, marginTop: 12, marginBottom: 0, padding: 12, borderRadius: 14, borderWidth: 1 },
  dropIcon:       { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dropTitle:      { fontSize: 13, fontWeight: "700" },
  dropSub:        { fontSize: 12 },
  emptyState:     { alignItems: "center", gap: 14, paddingTop: 60, paddingHorizontal: 30 },
  emptyIcon:      { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle:     { fontSize: 20, fontWeight: "800" },
  emptySub:       { fontSize: 14, textAlign: "center", lineHeight: 20 },
  exploreBtn:     { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  exploreBtnText: { color: "#fff", fontWeight: "700" },
  grid:           { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard:       { width: "47%", borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  gridImageWrap:  { position: "relative" },
  gridImage:      { width: "100%", height: 160 },
  discountBadge:  { position: "absolute", top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  discountText:   { color: "#fff", fontSize: 11, fontWeight: "800" },
  heartBtn:       { position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  gridInfo:       { padding: 10, gap: 4 },
  gridName:       { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  gridPriceRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  gridPrice:      { fontSize: 14, fontWeight: "800" },
  gridOldPrice:   { fontSize: 12, textDecorationLine: "line-through" },
  gridRating:     { flexDirection: "row", alignItems: "center", gap: 3 },
  gridRatingText: { fontSize: 11 },
  addBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10, marginTop: 2 },
  addBtnText:     { color: "#fff", fontSize: 12, fontWeight: "700" },
  listCard:       { flexDirection: "row", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  listImage:      { width: 90, height: 110, borderRadius: 12 },
  listName:       { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  listSeller:     { fontSize: 12 },
  listPriceRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  listPrice:      { fontSize: 16, fontWeight: "800" },
  listDiscount:   { fontSize: 12, fontWeight: "600" },
  listActions:    { flexDirection: "row", gap: 8, marginTop: 4 },
  listAddBtn:     { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  listAddBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  listRemoveBtn:  { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
