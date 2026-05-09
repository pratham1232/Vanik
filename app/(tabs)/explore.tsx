import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
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
    <View style={[styles.container, { backgroundColor: "#050510" }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Root Aura Gradient ── */}
      <LinearGradient 
        colors={["#0A0A1F", "#050510", "#000000"]} 
        style={StyleSheet.absoluteFillObject} 
      />
      <View style={styles.topAura}>
        <LinearGradient 
          colors={["rgba(139,92,246,0.12)", "transparent"]} 
          style={StyleSheet.absoluteFillObject} 
        />
      </View>

      {/* ── Glass Header ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <BlurView intensity={30} tint="dark" style={styles.searchBar}>
          <Feather name="search" size={18} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={[styles.searchInput, { color: "#fff" }]}
            placeholder="Search fashion, beauty, home..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x-circle" size={18} color="rgba(255,255,255,0.4)" />
            </Pressable>
          )}
        </BlurView>
        <Pressable style={[styles.filterBtn, { backgroundColor: "#8B5CF6" }]}>
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
  topAura: { position: "absolute", top: 0, left: 0, right: 0, height: 400 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, height: 50, borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "500" },
  filterBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  tabsRow: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  tabPill: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1 },
  tabPillText: { fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  bannerRow: { paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  dealBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, width: 260, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  dealIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  dealLabel: { fontSize: 15, fontWeight: "800", letterSpacing: -0.3 },
  dealSub: { fontSize: 13, marginTop: 1 },
  section: { paddingHorizontal: 14, marginBottom: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, marginTop: 10 },
  sectionTitle: { fontSize: 19, fontWeight: "900", letterSpacing: -0.4 },
  seeAll: { fontSize: 13, fontWeight: "700" },
  hashtagChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1 },
  hashtagText: { fontSize: 14, fontWeight: "800", letterSpacing: 0.2 },
  hashtagCount: { fontSize: 12, fontWeight: "600" },
  sellerCard: { width: 120, alignItems: "center", gap: 8, padding: 12, borderRadius: 18, borderWidth: 1, position: "relative", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  sellerAvatarRing: { borderWidth: 2, borderRadius: 32, padding: 3 },
  sellerAvatar: { width: 56, height: 56, borderRadius: 28 },
  sellerCheck: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  sellerName: { fontSize: 13, fontWeight: "800", textAlign: "center", letterSpacing: -0.2 },
  sellerFollowers: { fontSize: 12, textAlign: "center", fontWeight: "600" },
  followBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 14, borderWidth: 1 },
  followBtnText: { fontSize: 12, fontWeight: "700" },
  productsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, paddingHorizontal: 14 },
  emptyState: { flex: 1, alignItems: "center", gap: 12, paddingTop: 50, width: "100%" },
  emptyText: { fontSize: 16, fontWeight: "600" },
  resellBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, borderRadius: 20, marginHorizontal: 14, marginVertical: 16, shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  resellBannerTitle: { color: "#fff", fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
  resellBannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 3, fontWeight: "500" },
  resellStartBtn: { backgroundColor: "#fff", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, shadowColor: "#fff", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  resellStartText: { color: "#8B5CF6", fontWeight: "800", fontSize: 14, letterSpacing: 0.2 },
  supplierCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  supplierImage: { width: 68, height: 68, borderRadius: 14 },
  supplierName: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  supplierPriceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  wholesaleBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  wholesaleLabel: { fontSize: 12, fontWeight: "700" },
  wholesalePrice: { fontSize: 13, fontWeight: "800" },
  sellingBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  sellingLabel: { fontSize: 12, fontWeight: "700" },
  sellingPrice: { fontSize: 13, fontWeight: "800" },
  commissionRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  commissionText: { fontSize: 13, fontWeight: "700" },
  shareEarnBtn: { flexDirection: "column", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  shareEarnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
