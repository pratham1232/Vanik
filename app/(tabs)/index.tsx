import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import StoryRow from "@/components/StoryRow";
import { useCart } from "@/context/CartContext";
import { LIVE_SESSIONS, PRODUCTS, REELS, SELLERS, formatCount, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const CATEGORIES = [
  { icon: "👗", label: "Women",    color: "#EC4899" },
  { icon: "👔", label: "Men",      color: "#3B82F6" },
  { icon: "👶", label: "Kids",     color: "#F59E0B" },
  { icon: "🏠", label: "Home",     color: "#10B981" },
  { icon: "💄", label: "Beauty",   color: "#8B5CF6" },
  { icon: "⌚", label: "Watches",  color: "#0EA5E9" },
  { icon: "👜", label: "Bags",     color: "#F97316" },
  { icon: "🛒", label: "More",     color: "#6B7280" },
];

const BANNERS = [
  { id: "b1", title: "Mega Sale",       sub: "Up to 80% OFF",                bg: "#1E0A3C", accent: "#8B5CF6", tag: "LIMITED TIME" },
  { id: "b2", title: "New Arrivals",    sub: "Fresh Summer Collection",       bg: "#0C1A2E", accent: "#3B82F6", tag: "JUST IN"      },
  { id: "b3", title: "Resell & Earn",   sub: "Earn ₹500 per order",           bg: "#0A1F15", accent: "#10B981", tag: "EARN NOW"     },
];

function CountdownTimer() {
  const colors = useColors();
  return (
    <View style={styles.countdownRow}>
      {["02", "14", "36"].map((v, i) => (
        <React.Fragment key={i}>
          <View style={[styles.countdownBox, { backgroundColor: colors.primary }]}>
            <Text style={styles.countdownNum}>{v}</Text>
            <Text style={styles.countdownLabel}>{["HRS","MIN","SEC"][i]}</Text>
          </View>
          {i < 2 && <Text style={[styles.countdownSep, { color: colors.primary }]}>:</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

function ProductCard({ product }: { product: typeof PRODUCTS[number] }) {
  const colors = useColors();
  const { addItem } = useCart();
  const [wished, setWished] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 60 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 60 }),
    ]).start();
    addItem({ id: product.id, title: product.title, price: product.price, image: product.image, sellerName: product.sellerName });
  };

  return (
    <Pressable
      style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={styles.productImageWrap}>
        <Image source={product.image} style={styles.productImage} resizeMode="cover" />

        {/* Discount badge */}
        {product.discount > 0 && (
          <View style={[styles.discBadge, { backgroundColor: "#FF3B5C" }]}>
            <Text style={styles.discBadgeText}>{product.discount}%{"\n"}OFF</Text>
          </View>
        )}

        {/* Wishlist btn */}
        <Pressable
          style={[styles.wishBtn, { backgroundColor: wished ? "#FF3B5C" : "rgba(0,0,0,0.5)" }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWished((w) => !w); }}
        >
          <Feather name="heart" size={14} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.productBody}>
        <Text style={[styles.productBrand, { color: colors.primary }]} numberOfLines={1}>{product.sellerName}</Text>
        <Text style={[styles.productTitle, { color: colors.foreground }]} numberOfLines={2}>{product.title}</Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.foreground }]}>{formatPrice(product.price)}</Text>
          {product.originalPrice > product.price && (
            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>₹{product.originalPrice.toLocaleString("en-IN")}</Text>
          )}
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <View style={[styles.ratingBadge, { backgroundColor: "#10B981" }]}>
            <Feather name="star" size={9} color="#fff" />
            <Text style={styles.ratingNum}>{product.rating}</Text>
          </View>
          <Text style={[styles.ratingReviews, { color: colors.mutedForeground }]}>({product.reviews})</Text>
          {product.stock < 10 && (
            <Text style={[styles.lowStock, { color: "#FF3B5C" }]}>Only {product.stock} left!</Text>
          )}
        </View>

        {/* Free shipping */}
        <View style={styles.shippingRow}>
          <Feather name="truck" size={10} color="#10B981" />
          <Text style={[styles.shippingText, { color: "#10B981" }]}>Free Delivery</Text>
        </View>

        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable style={[styles.addCartBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
            <Feather name="shopping-bag" size={13} color="#fff" />
            <Text style={styles.addCartText}>Add to Cart</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { count } = useCart();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const [search, setSearch]       = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [bannerIdx, setBannerIdx] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [colors.background, colors.surface],
    extrapolate: "clamp",
  });

  const filteredProducts = activeCat === "All"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category.toLowerCase().includes(activeCat.toLowerCase()));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Sticky Header ── */}
      <Animated.View style={[styles.header, { backgroundColor: headerBg, paddingTop: topPad, borderBottomColor: colors.border }]}>
        {/* Logo row */}
        <View style={styles.headerRow}>
          <View style={styles.logoWrap}>
            <Text style={[styles.logo, { color: colors.foreground }]}>
              <Text style={{ color: colors.primary }}>V</Text>anik
            </Text>
            <View style={[styles.liveIndicator, { backgroundColor: "#FF3B5C" }]}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={[styles.hBtn, { backgroundColor: colors.muted }]} onPress={() => router.push("/notifications")}>
              <Feather name="bell" size={18} color={colors.foreground} />
              <View style={[styles.hDot, { backgroundColor: "#FF3B5C" }]} />
            </Pressable>
            <Pressable style={[styles.hBtn, { backgroundColor: colors.muted }]} onPress={() => router.push("/cart")}>
              <Feather name="shopping-cart" size={18} color={colors.foreground} />
              {count > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: "#FF3B5C" }]}>
                  <Text style={styles.cartBadgeText}>{count}</Text>
                </View>
              )}
            </Pressable>
            <Pressable style={[styles.hBtn, { backgroundColor: colors.muted }]}>
              <Feather name="user" size={18} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search sarees, kurtas, home decor..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            onFocus={() => router.push("/explore")}
          />
          <Pressable style={[styles.searchMic, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="mic" size={14} color={colors.primary} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={{ paddingTop: topPad + 96, paddingBottom: Platform.OS === "web" ? 90 : 80 }}
      >
        {/* ── Stories ── */}
        <StoryRow />

        {/* ── Hero Banner ── */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (width - 32)))}
          contentContainerStyle={{ gap: 0, paddingHorizontal: 16 }}
        >
          {BANNERS.map((b, i) => (
            <Pressable
              key={b.id}
              style={[styles.heroBanner, { backgroundColor: b.bg, width: width - 32, marginRight: i < BANNERS.length - 1 ? 12 : 0 }]}
              onPress={() => router.push("/explore")}
            >
              <View style={[styles.heroBannerTag, { backgroundColor: b.accent }]}>
                <Text style={styles.heroBannerTagText}>{b.tag}</Text>
              </View>
              <Text style={styles.heroBannerTitle}>{b.title}</Text>
              <Text style={[styles.heroBannerSub, { color: b.accent }]}>{b.sub}</Text>
              <View style={[styles.heroBannerBtn, { backgroundColor: b.accent }]}>
                <Text style={styles.heroBannerBtnText}>Shop Now →</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        {/* Dots */}
        <View style={styles.bannerDots}>
          {BANNERS.map((_, i) => (
            <View key={i} style={[styles.bannerDot, { backgroundColor: i === bannerIdx ? colors.primary : colors.border, width: i === bannerIdx ? 20 : 6 }]} />
          ))}
        </View>

        {/* ── Categories ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Shop by Category</Text>
            <Pressable onPress={() => router.push("/explore")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>View all →</Text>
            </Pressable>
          </View>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.label}
                style={[styles.catItem, activeCat === cat.label && { borderColor: colors.primary, borderWidth: 2 }, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveCat(activeCat === cat.label ? "All" : cat.label); }}
              >
                <View style={[styles.catIconWrap, { backgroundColor: cat.color + "18" }]}>
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                </View>
                <Text style={[styles.catLabel, { color: activeCat === cat.label ? colors.primary : colors.foreground }]}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Flash Sale ── */}
        <View style={[styles.flashSale, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.flashSaleHeader}>
            <View style={styles.flashLeft}>
              <Text style={{ fontSize: 18 }}>⚡</Text>
              <Text style={[styles.flashTitle, { color: colors.foreground }]}>Flash Sale</Text>
              <View style={[styles.flashBadge, { backgroundColor: "#FF3B5C" }]}>
                <Text style={styles.flashBadgeText}>LIVE</Text>
              </View>
            </View>
            <CountdownTimer />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashRow}>
            {PRODUCTS.filter((p) => p.discount > 0).map((p) => (
              <Pressable
                key={p.id}
                style={[styles.flashCard, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <Image source={p.image} style={styles.flashImage} resizeMode="cover" />
                <View style={[styles.flashDisc, { backgroundColor: "#FF3B5C" }]}>
                  <Text style={styles.flashDiscText}>{p.discount}%{"\n"}OFF</Text>
                </View>
                <Text style={[styles.flashPrice, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
                <Text style={[styles.flashOrig,  { color: colors.mutedForeground }]}>₹{p.originalPrice}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Live Now ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={[styles.liveDot, { backgroundColor: "#FF3B5C" }]} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Live Shopping</Text>
            </View>
            <Pressable>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {LIVE_SESSIONS.map((s) => (
              <Pressable key={s.id} style={styles.liveCard} onPress={() => router.push(`/live/${s.id}`)}>
                <View style={styles.liveThumbWrap}>
                  <Image source={s.thumbnail} style={styles.liveThumb} resizeMode="cover" />
                  <View style={styles.liveScrim} />
                  <View style={[styles.livePill, { backgroundColor: "#FF3B5C" }]}>
                    <View style={styles.livePillDot} />
                    <Text style={styles.livePillText}>LIVE</Text>
                  </View>
                  <View style={[styles.liveViewers, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                    <Feather name="eye" size={9} color="#fff" />
                    <Text style={styles.liveViewersText}>{formatCount(s.viewerCount)}</Text>
                  </View>
                  <Image source={{ uri: s.sellerAvatar }} style={styles.liveSellerAvatar} />
                </View>
                <Text style={[styles.liveSellerName, { color: colors.foreground }]} numberOfLines={1}>{s.sellerName}</Text>
                <Text style={[styles.liveTitle, { color: colors.mutedForeground }]} numberOfLines={1}>{s.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Reels preview ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🎬 Trending Reels</Text>
            <Pressable onPress={() => router.push("/(tabs)/reels")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Watch all →</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {REELS.map((r) => (
              <Pressable key={r.id} style={styles.reelThumb} onPress={() => router.push("/(tabs)/reels")}>
                <Image source={r.thumbnail} style={styles.reelThumbImg} resizeMode="cover" />
                <View style={styles.reelThumbScrim} />
                <View style={styles.reelThumbPlay}>
                  <Feather name="play" size={18} color="#fff" />
                </View>
                <View style={[styles.reelViewBadge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                  <Feather name="eye" size={9} color="#fff" />
                  <Text style={styles.reelViewText}>{r.views}</Text>
                </View>
                <Text style={[styles.reelThumbSeller, { color: "rgba(255,255,255,0.9)" }]} numberOfLines={1}>@{r.sellerName.replace(/\s/g, "").toLowerCase()}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Top Sellers ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>⭐ Top Sellers</Text>
            <Pressable onPress={() => router.push("/explore")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>View all →</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {SELLERS.map((s) => (
              <Pressable key={s.id} style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: s.avatar }} style={styles.sellerAvatar} />
                <View style={[styles.sellerVerifiedDot, { backgroundColor: s.verified ? colors.primary : "transparent" }]}>
                  {s.verified && <Feather name="check" size={8} color="#fff" />}
                </View>
                <Text style={[styles.sellerName, { color: colors.foreground }]} numberOfLines={1}>{s.name}</Text>
                <Text style={[styles.sellerCat, { color: colors.mutedForeground }]}>{s.category}</Text>
                <View style={styles.sellerStars}>
                  <Feather name="star" size={10} color="#F59E0B" />
                  <Text style={[styles.sellerRating, { color: colors.mutedForeground }]}>{s.rating}</Text>
                </View>
                <View style={[styles.followBtn, { borderColor: colors.primary }]}>
                  <Text style={[styles.followBtnText, { color: colors.primary }]}>Follow</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Resell & Earn banner ── */}
        <Pressable style={[styles.resellBanner, { backgroundColor: "#1E0A3C", borderColor: colors.primary + "40" }]} onPress={() => router.push("/explore")}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resellTitle}>💰 Resell & Earn</Text>
            <Text style={styles.resellSub}>Share products and earn up to ₹500 per order. No investment needed.</Text>
            <View style={styles.resellBtn}>
              <Text style={styles.resellBtnText}>Start Reselling →</Text>
            </View>
          </View>
          <Image source={PRODUCTS[0].image} style={styles.resellImage} resizeMode="cover" />
        </Pressable>

        {/* ── Product Grid ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {activeCat === "All" ? "🔥 Trending Products" : `${activeCat} Products`}
            </Text>
            <Pressable onPress={() => router.push("/explore")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
            </Pressable>
          </View>

          {/* Sort / filter bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
            {["All", "Fashion", "Beauty", "Home Decor", "Electronics"].map((f) => (
              <Pressable
                key={f}
                style={[styles.filterChip, { borderColor: activeCat === f ? colors.primary : colors.border, backgroundColor: activeCat === f ? colors.primary : "transparent" }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveCat(f); }}
              >
                <Text style={[styles.filterChipText, { color: activeCat === f ? "#fff" : colors.mutedForeground }]}>{f}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* 2-column grid */}
          <View style={styles.productGrid}>
            {(filteredProducts.length > 0 ? filteredProducts : PRODUCTS).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </View>
        </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1 },

  /* Header */
  header:             { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: 1, paddingHorizontal: 16, paddingBottom: 10 },
  headerRow:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 6, paddingBottom: 8 },
  logoWrap:           { flexDirection: "row", alignItems: "center", gap: 8 },
  logo:               { fontSize: 26, fontWeight: "900", letterSpacing: 0.5 },
  liveIndicator:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  liveText:           { color: "#fff", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  headerRight:        { flexDirection: "row", gap: 7 },
  hBtn:               { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", position: "relative" },
  hDot:               { position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4 },
  cartBadge:          { position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  cartBadgeText:      { color: "#fff", fontSize: 9, fontWeight: "800" },
  searchBar:          { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  searchInput:        { flex: 1, fontSize: 13 },
  searchMic:          { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  /* Hero banner */
  heroBanner:         { borderRadius: 18, padding: 20, height: 150, justifyContent: "center", overflow: "hidden" },
  heroBannerTag:      { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  heroBannerTagText:  { color: "#fff", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  heroBannerTitle:    { color: "#fff", fontSize: 24, fontWeight: "900", marginBottom: 2 },
  heroBannerSub:      { fontSize: 13, fontWeight: "600", marginBottom: 12 },
  heroBannerBtn:      { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  heroBannerBtnText:  { color: "#fff", fontSize: 12, fontWeight: "800" },
  bannerDots:         { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 8, marginBottom: 4 },
  bannerDot:          { height: 6, borderRadius: 3 },

  /* Section */
  section:            { marginTop: 16 },
  sectionHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:       { fontSize: 17, fontWeight: "800" },
  seeAll:             { fontSize: 13, fontWeight: "600" },
  hRow:               { paddingHorizontal: 16, gap: 10 },

  /* Categories */
  categoryGrid:       { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 },
  catItem:            { width: (width - 56) / 4, alignItems: "center", paddingVertical: 10, borderRadius: 14, borderWidth: 1, gap: 5 },
  catIconWrap:        { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  catEmoji:           { fontSize: 20 },
  catLabel:           { fontSize: 11, fontWeight: "600" },

  /* Flash sale */
  flashSale:          { marginHorizontal: 16, borderRadius: 18, padding: 14, borderWidth: 1, marginTop: 16 },
  flashSaleHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  flashLeft:          { flexDirection: "row", alignItems: "center", gap: 6 },
  flashTitle:         { fontSize: 17, fontWeight: "800" },
  flashBadge:         { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  flashBadgeText:     { color: "#fff", fontSize: 9, fontWeight: "900" },
  countdownRow:       { flexDirection: "row", alignItems: "center", gap: 4 },
  countdownBox:       { width: 38, height: 38, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  countdownNum:       { color: "#fff", fontSize: 14, fontWeight: "900", lineHeight: 16 },
  countdownLabel:     { color: "rgba(255,255,255,0.75)", fontSize: 7, fontWeight: "700", letterSpacing: 0.3 },
  countdownSep:       { fontSize: 18, fontWeight: "900", marginBottom: 2 },
  flashRow:           { gap: 8 },
  flashCard:          { width: 90, borderRadius: 12, overflow: "hidden", borderWidth: 1, position: "relative" },
  flashImage:         { width: "100%", height: 90 },
  flashDisc:          { position: "absolute", top: 4, left: 4, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  flashDiscText:      { color: "#fff", fontSize: 7, fontWeight: "900", textAlign: "center", lineHeight: 9 },
  flashPrice:         { fontSize: 11, fontWeight: "800", paddingHorizontal: 6, paddingTop: 4 },
  flashOrig:          { fontSize: 9, paddingHorizontal: 6, paddingBottom: 6, textDecorationLine: "line-through" },

  /* Live */
  liveDot:            { width: 8, height: 8, borderRadius: 4 },
  liveCard:           { width: 130 },
  liveThumbWrap:      { width: 130, height: 160, borderRadius: 14, overflow: "hidden", position: "relative" },
  liveThumb:          { width: "100%", height: "100%" },
  liveScrim:          { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)" },
  livePill:           { position: "absolute", top: 8, left: 8, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  livePillDot:        { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#fff" },
  livePillText:       { color: "#fff", fontSize: 9, fontWeight: "800" },
  liveViewers:        { position: "absolute", bottom: 8, left: 8, flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  liveViewersText:    { color: "#fff", fontSize: 9, fontWeight: "700" },
  liveSellerAvatar:   { position: "absolute", bottom: 8, right: 8, width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: "#fff" },
  liveSellerName:     { fontSize: 12, fontWeight: "700", marginTop: 6, paddingHorizontal: 2 },
  liveTitle:          { fontSize: 11, paddingHorizontal: 2 },

  /* Reels */
  reelThumb:          { width: 100, height: 160, borderRadius: 14, overflow: "hidden", position: "relative" },
  reelThumbImg:       { width: "100%", height: "100%" },
  reelThumbScrim:     { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  reelThumbPlay:      { position: "absolute", top: "50%", left: "50%", marginTop: -18, marginLeft: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  reelViewBadge:      { position: "absolute", top: 6, left: 6, flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6 },
  reelViewText:       { color: "#fff", fontSize: 9, fontWeight: "700" },
  reelThumbSeller:    { position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 10, fontWeight: "700" },

  /* Top sellers */
  sellerCard:         { width: 105, borderRadius: 16, padding: 12, alignItems: "center", gap: 4, borderWidth: 1, position: "relative" },
  sellerAvatar:       { width: 56, height: 56, borderRadius: 28 },
  sellerVerifiedDot:  { position: "absolute", top: 36, right: 28, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  sellerName:         { fontSize: 12, fontWeight: "700", textAlign: "center" },
  sellerCat:          { fontSize: 10, textAlign: "center" },
  sellerStars:        { flexDirection: "row", alignItems: "center", gap: 3 },
  sellerRating:       { fontSize: 10 },
  followBtn:          { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 14, borderWidth: 1.5, marginTop: 2 },
  followBtnText:      { fontSize: 10, fontWeight: "700" },

  /* Resell banner */
  resellBanner:       { marginHorizontal: 16, borderRadius: 18, padding: 18, marginTop: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, overflow: "hidden" },
  resellTitle:        { color: "#fff", fontSize: 18, fontWeight: "900", marginBottom: 4 },
  resellSub:          { color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 18, marginBottom: 12 },
  resellBtn:          { alignSelf: "flex-start", backgroundColor: "#8B5CF6", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  resellBtnText:      { color: "#fff", fontSize: 12, fontWeight: "800" },
  resellImage:        { width: 90, height: 90, borderRadius: 14, marginLeft: 10 },

  /* Product grid */
  filterBar:          { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterChip:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterChipText:     { fontSize: 12, fontWeight: "600" },
  productGrid:        { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  productCard:        { width: CARD_W, borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  productImageWrap:   { position: "relative" },
  productImage:       { width: "100%", height: CARD_W * 1.1 },
  discBadge:          { position: "absolute", top: 8, left: 8, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  discBadgeText:      { color: "#fff", fontSize: 8, fontWeight: "900", textAlign: "center", lineHeight: 10 },
  wishBtn:            { position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  productBody:        { padding: 10, gap: 3 },
  productBrand:       { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  productTitle:       { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  priceRow:           { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  price:              { fontSize: 15, fontWeight: "900" },
  originalPrice:      { fontSize: 11, textDecorationLine: "line-through" },
  ratingRow:          { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingBadge:        { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6 },
  ratingNum:          { color: "#fff", fontSize: 9, fontWeight: "800" },
  ratingReviews:      { fontSize: 10 },
  lowStock:           { fontSize: 9, fontWeight: "700" },
  shippingRow:        { flexDirection: "row", alignItems: "center", gap: 4 },
  shippingText:       { fontSize: 10, fontWeight: "600" },
  addCartBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10, marginTop: 4 },
  addCartText:        { color: "#fff", fontSize: 11, fontWeight: "800" },
});
