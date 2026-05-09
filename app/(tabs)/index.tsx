import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { LIVE_SESSIONS, PRODUCTS, formatCount, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const CATEGORIES = [
  { icon: "👗", label: "Women",    color: "#EC4899", grad: ["#FCE7F3", "#FBCFE8"] },
  { icon: "👔", label: "Men",      color: "#3B82F6", grad: ["#DBEAFE", "#BFDBFE"] },
  { icon: "👶", label: "Kids",     color: "#F59E0B", grad: ["#FEF3C7", "#FDE68A"] },
  { icon: "🏠", label: "Home",     color: "#10B981", grad: ["#D1FAE5", "#A7F3D0"] },
  { icon: "💄", label: "Beauty",   color: "#8B5CF6", grad: ["#EDE9FE", "#DDD6FE"] },
  { icon: "⌚", label: "Watches",  color: "#0EA5E9", grad: ["#E0F2FE", "#BAE6FD"] },
  { icon: "👜", label: "Bags",     color: "#F97316", grad: ["#FFEDD5", "#FED7AA"] },
  { icon: "🎁", label: "Gifts",    color: "#EC4899", grad: ["#FCE7F3", "#FBCFE8"] },
];

const BANNERS = [
  { id: "b1", title: "Mega Sale",       sub: "Up to 80% OFF",                img: PRODUCTS[0].image, grad: ["transparent", "rgba(30,10,60,0.9)"], accent: "#8B5CF6", tag: "LIMITED TIME" },
  { id: "b2", title: "New Arrivals",    sub: "Fresh Summer Collection",       img: PRODUCTS[2].image, grad: ["transparent", "rgba(12,26,46,0.9)"], accent: "#3B82F6", tag: "JUST IN"      },
  { id: "b3", title: "Resell & Earn",   sub: "Earn ₹500 per order",           img: PRODUCTS[4].image, grad: ["transparent", "rgba(10,31,21,0.9)"], accent: "#10B981", tag: "EARN NOW"     },
];

/* ─────────────────────────────────────────────────────────
   PRODUCT CARD (Vertical / Horizontal variants)
───────────────────────────────────────────────────────── */
function ProductCard({ product, horizontal = false }: { product: typeof PRODUCTS[number], horizontal?: boolean }) {
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

  const cardWidth = horizontal ? 160 : CARD_W;

  return (
    <Pressable
      style={[styles.productCard, { backgroundColor: "rgba(18,18,42,0.5)", borderColor: "rgba(139,92,246,0.2)", width: cardWidth }]}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={[styles.productImageWrap, { height: horizontal ? 180 : 200 }]}>
        <Image source={product.image} style={styles.productImage} resizeMode="cover" />
        <LinearGradient colors={["transparent", "rgba(5,5,15,0.9)"]} style={styles.productImageGrad} pointerEvents="none" />

        {/* Discount badge */}
        {product.discount > 0 && (
          <View style={[styles.discBadge, { backgroundColor: "#FF3B5C" }]}>
            <Text style={styles.discBadgeText}>{product.discount}%{"\n"}OFF</Text>
          </View>
        )}

        {/* Wishlist btn */}
        <Pressable
          style={[styles.wishBtn, { backgroundColor: wished ? "#FF3B5C" : "rgba(0,0,0,0.3)" }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWished((w) => !w); }}
        >
          <Feather name="heart" size={14} color="#fff" />
        </Pressable>

        {/* Floating Add to Cart */}
        <Animated.View style={[styles.floatAddCartWrap, { transform: [{ scale }] }]}>
          <Pressable style={[styles.floatAddCart, { backgroundColor: "#8B5CF6" }]} onPress={handleAdd}>
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.productBody}>
        <Text style={[styles.productBrand, { color: "#A78BFA" }]} numberOfLines={1}>{product.sellerName}</Text>
        <Text style={[styles.productTitle, { color: "#fff" }]} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: "#fff" }]}>{formatPrice(product.price)}</Text>
          {product.originalPrice > product.price && (
            <Text style={[styles.originalPrice, { color: "rgba(255,255,255,0.4)" }]}>₹{product.originalPrice.toLocaleString("en-IN")}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { count } = useCart();
  const topPad    = Platform.OS === "web" ? 20 : insets.top;
  const [search, setSearch]       = useState("");
  const [bannerIdx, setBannerIdx] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header blur intensity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Root Aura Gradient ── */}
      <LinearGradient 
        colors={["#0A0A1F", "#050510", "#000000"]} 
        style={StyleSheet.absoluteFillObject} 
      />
      <View style={styles.topAura}>
        <LinearGradient 
          colors={["rgba(139,92,246,0.15)", "transparent"]} 
          style={StyleSheet.absoluteFillObject} 
        />
      </View>

      {/* ── Glassmorphism Header ── */}
      <Animated.View style={[styles.header, { paddingTop: topPad }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>

        <View style={styles.headerRow}>
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>
              <Text style={{ color: "#E9D5FF" }}>V</Text>anik
            </Text>
            <View style={[styles.liveIndicator, { backgroundColor: "#FF3B5C" }]}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={[styles.hBtn, { backgroundColor: "rgba(139,92,246,0.3)", borderColor: "#8B5CF6", borderWidth: 1 }]} onPress={() => router.push("/ai-chat")}>
              <Text style={{ fontSize: 16 }}>✨</Text>
            </Pressable>
            <Pressable style={[styles.hBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]} onPress={() => router.push("/notifications")}>
              <Feather name="bell" size={18} color="#fff" />
              <View style={[styles.hDot, { backgroundColor: "#FF3B5C" }]} />
            </Pressable>
            <Pressable style={[styles.hBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]} onPress={() => router.push("/cart")}>
              <Feather name="shopping-cart" size={18} color="#fff" />
              {count > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: "#FF3B5C" }]}>
                  <Text style={styles.cartBadgeText}>{count}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchSection}>
          <BlurView intensity={25} tint="dark" style={[styles.searchPill, { borderColor: "rgba(255,255,255,0.1)" }]}>
            <Feather name="search" size={18} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search awesome products..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={search}
              onChangeText={setSearch}
            />
            <Pressable style={styles.micBtn}>
              <Feather name="mic" size={18} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </BlurView>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={{ paddingTop: topPad + 140, paddingBottom: 120 }}
      >
        {/* ── Featured Banners ── */}
        <View style={styles.bannerSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (width - 32)))}
            scrollEventThrottle={16}
          >
            {BANNERS.map((b) => (
              <View key={b.id} style={[styles.banner, { backgroundColor: "#0A0A1F" }]}>
                <Image source={b.img} style={styles.bannerImg} resizeMode="cover" />
                <LinearGradient colors={["rgba(0,0,0,0.2)", "rgba(10,10,31,0.95)"]} style={StyleSheet.absoluteFillObject} />
                <View style={styles.bannerContent}>
                  <View style={[styles.bannerTag, { backgroundColor: b.accent }]}>
                    <Text style={styles.bannerTagText}>{b.tag}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerSub}>{b.sub}</Text>
                  <Pressable style={[styles.bannerBtn, { backgroundColor: b.accent }]}>
                    <Text style={styles.bannerBtnText}>Shop Now</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, bannerIdx === i ? { backgroundColor: "#fff", width: 20 } : { backgroundColor: "rgba(255,255,255,0.3)" }]} />
            ))}
          </View>
        </View>

        {/* ── Live Shopping ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Live Shopping</Text>
            <Pressable onPress={() => router.push("/explore")}><Text style={[styles.seeAll, { color: "#8B5CF6" }]}>See all</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liveScroll}>
            {LIVE_SESSIONS.map((s) => (
              <Pressable key={s.id} style={styles.liveCard} onPress={() => router.push(`/live/${s.id}`)}>
                <Image source={s.thumbnail} style={styles.liveImg} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={StyleSheet.absoluteFillObject} />
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
                <View style={styles.liveMeta}>
                  <Feather name="eye" size={12} color="#fff" />
                  <Text style={styles.liveViewerText}>{formatCount(s.viewerCount)}</Text>
                </View>
                <View style={styles.liveHost}>
                  <Image source={{ uri: s.sellerAvatar }} style={styles.hostAvatar} />
                </View>
                <View style={styles.liveInfoOverlay}>
                  <Text style={styles.hostName} numberOfLines={1}>{s.sellerName}</Text>
                  <Text style={styles.liveTitle} numberOfLines={1}>{s.title}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Stories ── */}
        <StoryRow />

        {/* ── Categories ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <Pressable key={cat.label} style={styles.catItem} onPress={() => router.push("/explore")}>
                <BlurView intensity={20} tint="dark" style={[styles.catIcon, { borderColor: "rgba(255,255,255,0.1)" }]}>
                  <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                </BlurView>
                <Text style={[styles.catLabel, { color: "rgba(255,255,255,0.6)" }]}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Trending Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Trending Now</Text>
            <Pressable onPress={() => router.push("/explore")}><Text style={[styles.seeAll, { color: "#8B5CF6" }]}>See all</Text></Pressable>
          </View>
          <View style={styles.productGrid}>
            {PRODUCTS.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </View>
        </View>

        {/* ── Special Banner ── */}
        <Pressable style={styles.specialBanner} onPress={() => router.push("/explore")}>
          <Image source={PRODUCTS[4]?.image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient colors={["rgba(236,72,153,0.8)", "rgba(236,72,153,0.3)"]} style={styles.specialGrad}>
            <View style={{ flex: 1 }}>
              <Text style={styles.specialTitle}>Summer Must-Haves</Text>
              <Text style={styles.specialSub}>Refresh your wardrobe with new styles.</Text>
              <View style={styles.specialBtn}>
                <Text style={styles.specialBtnText}>Explore</Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1 },
  topAura:            { position: "absolute", top: 0, left: 0, right: 0, height: 400 },
  
  /* Header */
  header:             { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, paddingBottom: 15 },
  headerRow:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 60 },
  logoWrap:           { flexDirection: "row", alignItems: "center", gap: 8 },
  logo:               { fontSize: 24, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  liveIndicator:      { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  liveText:           { color: "#fff", fontSize: 9, fontWeight: "900" },
  headerRight:        { flexDirection: "row", alignItems: "center", gap: 10 },
  hBtn:               { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  hDot:               { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: "#000" },
  cartBadge:          { position: "absolute", top: 8, right: 8, minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  cartBadgeText:      { color: "#fff", fontSize: 9, fontWeight: "900" },

  /* Search */
  searchSection:      { paddingHorizontal: 16, marginTop: 5 },
  searchPill:         { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  searchInput:        { flex: 1, color: "#fff", fontSize: 14, fontWeight: "500" },
  micBtn:             { padding: 4 },

  /* Banners */
  bannerSection:      { marginTop: 15, marginBottom: 10 },
  banner:             { width: width - 32, height: 180, marginHorizontal: 16, borderRadius: 24, overflow: "hidden", position: "relative", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  bannerImg:          { ...StyleSheet.absoluteFillObject },
  bannerContent:      { flex: 1, justifyContent: "flex-end", padding: 20, gap: 8 },
  bannerTag:          { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 8, fontWeight: "bold" },
  bannerTagText:      { color: "#fff", fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  bannerTitle:        { color: "#fff", fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  bannerSub:          { color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: "600" },
  bannerBtn:          { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, fontWeight: "bold" },
  bannerBtnText:      { color: "#fff", fontSize: 14, fontWeight: "800" },
  dots:               { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 14, paddingBottom: 8 },
  dot:                { height: 7, borderRadius: 3.5 },

  /* Sections */
  section:            { marginTop: 35, marginHorizontal: 0 },
  sectionHeader:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 18 },
  sectionTitle:       { color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  seeAll:             { fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },

  /* Live Cards */
  liveScroll:         { paddingHorizontal: 16, gap: 16 },
  liveCard:           { width: 160, height: 220, borderRadius: 24, overflow: "hidden", position: "relative", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  liveImg:            { ...StyleSheet.absoluteFillObject },
  liveBadge:          { position: "absolute", top: 12, left: 12, backgroundColor: "#FF3B5C", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  liveDot:            { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#fff" },
  liveBadgeText:      { color: "#fff", fontSize: 11, fontWeight: "900" },
  liveMeta:           { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  liveViewerText:     { color: "#fff", fontSize: 11, fontWeight: "800" },
  liveHost:           { position: "absolute", bottom: 50, left: 12, width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#fff", overflow: "hidden" },
  hostAvatar:         { width: "100%", height: "100%" },
  liveInfoOverlay:    { position: "absolute", bottom: 12, left: 12, right: 12 },
  hostName:           { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700" },
  liveTitle:          { color: "#fff", fontSize: 13, fontWeight: "800", marginTop: 2 },

  /* Categories */
  catScroll:          { paddingHorizontal: 16, gap: 24 },
  catItem:            { alignItems: "center", gap: 12, width: 80 },
  catIcon:            { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  catLabel:           { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.8)", textAlign: "center" },

  /* Products */
  productGrid:        { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 14 },
  productCard:        { borderRadius: 24, overflow: "hidden", borderWidth: 1, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  productImageWrap:   { position: "relative", overflow: "hidden" },
  productImage:       { width: "100%", height: "100%" },
  productImageGrad:   { ...StyleSheet.absoluteFillObject },
  discBadge:          { position: "absolute", top: 12, left: 12, width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  discBadgeText:      { color: "#fff", fontSize: 10, fontWeight: "900", textAlign: "center", lineHeight: 12 },
  wishBtn:            { position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  floatAddCartWrap:   { position: "absolute", bottom: 12, right: 12 },
  floatAddCart:       { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
  productBody:        { padding: 12, gap: 5 },
  productBrand:       { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  productTitle:       { fontSize: 14, fontWeight: "700", lineHeight: 19, height: 38 },
  priceContainer:     { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 6, marginTop: 4 },
  price:              { fontSize: 17, fontWeight: "900" },
  originalPrice:      { fontSize: 12, textDecorationLine: "line-through", opacity: 0.5 },

  /* Special Banner */
  specialBanner:      { marginHorizontal: 16, marginTop: 45, marginBottom: 30, borderRadius: 28, height: 180, overflow: "hidden", position: "relative", shadowColor: "#EC4899", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  specialGrad:        { ...StyleSheet.absoluteFillObject, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 },
  specialTitle:       { color: "#fff", fontSize: 30, fontWeight: "900", marginBottom: 8, letterSpacing: -0.5 },
  specialSub:         { color: "rgba(255,255,255,0.95)", fontSize: 15, fontWeight: "600", paddingRight: 50, marginBottom: 20, lineHeight: 21 },
  specialBtn:         { alignSelf: "flex-start", backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 18 },
  specialBtnText:     { color: "#EC4899", fontSize: 15, fontWeight: "900" },
});

