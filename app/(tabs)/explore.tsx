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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProductCard from "@/components/ProductCard";
import { HASHTAGS, PRODUCTS, SELLERS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const EXPLORE_TABS = [
  { label: "All", icon: "grid" },
  { label: "Fashion", icon: "shopping-bag" },
  { label: "Beauty", icon: "star" },
  { label: "Home", icon: "home" },
  { label: "Suppliers", icon: "package" },
];

const BANNER_DEALS = [
  { label: "Upto 70% Off", sub: "Fashion Week Sale", color: "#8B5CF6", icon: "tag" },
  { label: "Resell & Earn", sub: "Up to ₹500/order", color: "#EC4899", icon: "trending-up" },
  { label: "Free Shipping", sub: "On orders above ₹499", color: "#10B981", icon: "truck" },
];

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = PRODUCTS.filter((p) =>
    query.length >= 2
      ? p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.includes(query.toLowerCase()))
      : activeTab === "All" ||
        (activeTab === "Fashion" && p.category === "Fashion") ||
        (activeTab === "Beauty" && p.category === "Beauty") ||
        (activeTab === "Home" && p.category === "Home Decor") ||
        activeTab === "Suppliers"
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search products, brands, hashtags..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <Pressable style={[styles.filterBtn, { backgroundColor: colors.primary }]}>
          <Feather name="sliders" size={16} color="#fff" />
        </Pressable>
      </View>

      {/* Tab pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        {EXPLORE_TABS.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <Pressable
              key={tab.label}
              style={[styles.tabPill, { backgroundColor: isActive ? colors.primary : colors.muted, borderColor: isActive ? colors.primary : colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab.label); }}
            >
              <Feather name={tab.icon as any} size={14} color={isActive ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.tabPillText, { color: isActive ? "#fff" : colors.mutedForeground }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 90 : 80 }}>
        {/* Deal banners */}
        {query.length < 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerRow}>
            {BANNER_DEALS.map((b) => (
              <Pressable key={b.label} style={[styles.dealBanner, { backgroundColor: b.color + "18", borderColor: b.color + "40" }]}>
                <View style={[styles.dealIcon, { backgroundColor: b.color }]}>
                  <Feather name={b.icon as any} size={18} color="#fff" />
                </View>
                <View>
                  <Text style={[styles.dealLabel, { color: colors.foreground }]}>{b.label}</Text>
                  <Text style={[styles.dealSub, { color: colors.mutedForeground }]}>{b.sub}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={b.color} style={{ marginLeft: "auto" }} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Trending hashtags */}
        {query.length < 2 && activeTab === "All" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending</Text>
              <Feather name="trending-up" size={16} color={colors.primary} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {HASHTAGS.map((h) => (
                <Pressable
                  key={h.tag}
                  style={[styles.hashtagChip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}
                  onPress={() => setQuery(h.tag.replace("#", ""))}
                >
                  <Text style={[styles.hashtagText, { color: colors.primary }]}>{h.tag}</Text>
                  <Text style={[styles.hashtagCount, { color: colors.mutedForeground }]}>{h.posts}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Meesho-style: Suppliers/Resell tab */}
        {activeTab === "Suppliers" ? (
          <View style={styles.section}>
            {/* Resell banner */}
            <View style={[styles.resellBanner, { backgroundColor: colors.primary, borderRadius: 16, marginBottom: 16 }]}>
              <View>
                <Text style={styles.resellBannerTitle}>Resell & Earn 💰</Text>
                <Text style={styles.resellBannerSub}>Share products. Earn up to ₹500/order</Text>
              </View>
              <Pressable style={styles.resellStartBtn}>
                <Text style={styles.resellStartText}>Start Now</Text>
              </Pressable>
            </View>

            {/* Supplier list */}
            {PRODUCTS.filter((p) => p.resellable).map((p) => (
              <Pressable
                key={p.id}
                style={[styles.supplierCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <Image source={p.image} style={styles.supplierImage} resizeMode="cover" />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.supplierName, { color: colors.foreground }]} numberOfLines={1}>{p.title}</Text>
                  <View style={styles.supplierPriceRow}>
                    <View style={[styles.wholesaleBadge, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.wholesaleLabel, { color: colors.mutedForeground }]}>Cost </Text>
                      <Text style={[styles.wholesalePrice, { color: colors.foreground }]}>₹{p.wholesalePrice}</Text>
                    </View>
                    <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
                    <View style={[styles.sellingBadge, { backgroundColor: colors.primary + "18" }]}>
                      <Text style={[styles.sellingLabel, { color: colors.mutedForeground }]}>Sell at </Text>
                      <Text style={[styles.sellingPrice, { color: colors.primary }]}>₹{p.price}</Text>
                    </View>
                  </View>
                  <View style={styles.commissionRow}>
                    <Feather name="trending-up" size={13} color={colors.online} />
                    <Text style={[styles.commissionText, { color: colors.online }]}>Earn ₹{p.commission} per order</Text>
                  </View>
                </View>
                <Pressable style={[styles.shareEarnBtn, { backgroundColor: colors.primary }]}>
                  <Feather name="share-2" size={14} color="#fff" />
                  <Text style={styles.shareEarnText}>Share</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : (
          <>
            {/* Top Sellers */}
            {query.length < 2 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Popular Stores</Text>
                  <Pressable><Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text></Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {SELLERS.map((seller) => (
                    <Pressable key={seller.id} style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={[styles.sellerAvatarRing, { borderColor: colors.primary }]}>
                        <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} />
                      </View>
                      {seller.verified && (
                        <View style={[styles.sellerCheck, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                          <Feather name="check" size={9} color="#fff" />
                        </View>
                      )}
                      <Text style={[styles.sellerName, { color: colors.foreground }]} numberOfLines={1}>{seller.name}</Text>
                      <Text style={[styles.sellerFollowers, { color: colors.mutedForeground }]}>{seller.followers}</Text>
                      <View style={[styles.followBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary }]}>
                        <Text style={[styles.followBtnText, { color: colors.primary }]}>Follow</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Products grid */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {query.length >= 2 ? `Results for "${query}"` : activeTab === "All" ? "All Products" : activeTab}
                </Text>
                <Text style={[styles.seeAll, { color: colors.mutedForeground }]}>{filtered.length} items</Text>
              </View>
              <View style={styles.productsGrid}>
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} width={170} />
                ))}
                {filtered.length === 0 && (
                  <View style={styles.emptyState}>
                    <Feather name="search" size={36} color={colors.mutedForeground} />
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No products found</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingBottom: 12, paddingTop: 10, borderBottomWidth: 1 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  filterBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  tabsRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  tabPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tabPillText: { fontSize: 13, fontWeight: "600" },
  bannerRow: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  dealBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, width: 240 },
  dealIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  dealLabel: { fontSize: 14, fontWeight: "800" },
  dealSub: { fontSize: 12 },
  section: { paddingHorizontal: 14, marginBottom: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  hashtagChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  hashtagText: { fontSize: 14, fontWeight: "700" },
  hashtagCount: { fontSize: 12 },
  sellerCard: { width: 110, alignItems: "center", gap: 6, padding: 12, borderRadius: 16, borderWidth: 1, position: "relative" },
  sellerAvatarRing: { borderWidth: 2, borderRadius: 30, padding: 2 },
  sellerAvatar: { width: 52, height: 52, borderRadius: 26 },
  sellerCheck: { position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  sellerName: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  sellerFollowers: { fontSize: 11, textAlign: "center" },
  followBtn: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  followBtnText: { fontSize: 12, fontWeight: "700" },
  productsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  emptyState: { flex: 1, alignItems: "center", gap: 10, paddingTop: 40, width: "100%" },
  emptyText: { fontSize: 15 },
  resellBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  resellBannerTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  resellBannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  resellStartBtn: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  resellStartText: { color: "#8B5CF6", fontWeight: "800", fontSize: 13 },
  supplierCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  supplierImage: { width: 64, height: 64, borderRadius: 12 },
  supplierName: { fontSize: 14, fontWeight: "700" },
  supplierPriceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  wholesaleBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  wholesaleLabel: { fontSize: 11 },
  wholesalePrice: { fontSize: 12, fontWeight: "700" },
  sellingBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  sellingLabel: { fontSize: 11 },
  sellingPrice: { fontSize: 12, fontWeight: "700" },
  commissionRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  commissionText: { fontSize: 12, fontWeight: "600" },
  shareEarnBtn: { flexDirection: "column", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  shareEarnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
