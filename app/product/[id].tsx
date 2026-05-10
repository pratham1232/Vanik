import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/constants/api";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useCart } from "@/context/CartContext";
import { PRODUCTS, SELLERS, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem, count } = useCart();
  const { toggleWishlist, isWishlisted, toggleFollow, isFollowing } = useApp();

  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const liked = isWishlisted(id as string);
  const following = seller ? isFollowing(seller._id || seller.id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(res.data);
        setSeller(res.data.seller);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const [addedFeedback, setAddedFeedback] = useState(false);
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleAddCart = () => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    btnScale.value = withSpring(0.93, {}, () => { btnScale.value = withSpring(1); });
    addItem({ id: product._id || product.id, title: product.title, price: product.price, image: product.images?.[0] || product.image, sellerName: product.seller?.name || product.sellerName });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [aiAnalysisVisible, setAiAnalysisVisible] = useState(false);

  // Mock AI Insights
  const aiInsights = [
    "✨ Premium build quality rated 9/10 by buyers.",
    "🔥 Trending in Fashion this week.",
    "✅ Verified by Vanik AI for authenticity.",
    "🌟 Top choice for \"Minimalist Style\" lovers."
  ];

  if (loading || !product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.mutedForeground }}>Loading Premium Details...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back / Actions Header */}
      <View style={[styles.topBar, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent"]}
          style={StyleSheet.absoluteFillObject}
        />
        <Pressable style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.3)" }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.topRight}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.3)" }]}
            onPress={() => router.push("/cart")}
          >
            <Feather name="shopping-cart" size={20} color="#fff" />
            {count > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.live }]}>
                <Text style={styles.cartBadgeText}>{count}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.3)" }]}>
            <Feather name="share-2" size={20} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.3)" }]}
            onPress={() => toggleWishlist(product._id || product.id)}
          >
            <Feather name="heart" size={20} color={liked ? "#FF3B5C" : "#fff"} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 100 }}>
        {/* Product Image */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.images?.[0] || product.image }} style={styles.productImage} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.imageOverlay}
          />
          {product.discount > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: "#FF3B5C" }]}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
          <View style={styles.aiMatchBadge}>
            <BlurView intensity={60} tint="dark" style={styles.aiMatchInner}>
              <Text style={styles.aiMatchText}>✨ 98% Match</Text>
            </BlurView>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Price */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.category, { color: colors.primary }]}>{product.category}</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>{product.title}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{product.subtitle}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map((i) => (
              <Feather key={i} name="star" size={14} color={i <= Math.round(product.rating) ? colors.gold : colors.border} />
            ))}
            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
              {product.rating} ({product.reviews} reviews)
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.foreground }]}>{formatPrice(product.price)}</Text>
            {product.discount > 0 && (
              <>
                <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>{formatPrice(product.originalPrice)}</Text>
                <View style={[styles.saveBadge, { backgroundColor: colors.online + "30", borderColor: colors.online }]}>
                  <Text style={[styles.saveText, { color: colors.online }]}>Save {formatPrice(product.originalPrice - product.price)}</Text>
                </View>
              </>
            )}
          </View>

          {/* Stock */}
          <View style={[styles.stockRow, { backgroundColor: colors.muted }]}>
            <Feather name="package" size={14} color={colors.primary} />
            <Text style={[styles.stockText, { color: colors.mutedForeground }]}>
              {product.stock} items in stock · Free shipping
            </Text>
          </View>

          {/* AI Insights Card */}
          <Pressable 
            style={[styles.aiCard, { borderColor: colors.primary + "40" }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAiAnalysisVisible(!aiAnalysisVisible);
            }}
          >
            <LinearGradient
              colors={[colors.primary + "15", colors.accent + "15"]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.aiCardHeader}>
              <View style={styles.aiSparkWrap}>
                <Text style={styles.aiSpark}>✨</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiCardTitle, { color: colors.foreground }]}>Vanik AI Insights</Text>
                <Text style={[styles.aiCardSub, { color: colors.mutedForeground }]}>Tap to see detailed analysis</Text>
              </View>
              <Feather name={aiAnalysisVisible ? "chevron-up" : "chevron-down"} size={18} color={colors.primary} />
            </View>
            
            {aiAnalysisVisible && (
              <View style={styles.aiContent}>
                {aiInsights.map((insight, idx) => (
                  <View key={idx} style={styles.insightRow}>
                    <View style={[styles.insightDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.insightText, { color: colors.foreground }]}>{insight}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>

          {/* Seller */}
          <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: seller?.avatar || "https://i.pravatar.cc/150" }} style={styles.sellerAvatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.sellerNameRow}>
                <Text style={[styles.sellerName, { color: colors.foreground }]}>{seller.name}</Text>
                {seller.verified && <Feather name="check-circle" size={14} color={colors.primary} />}
              </View>
              <Text style={[styles.sellerFollowers, { color: colors.mutedForeground }]}>{seller.followers} followers · ★{seller.rating}</Text>
            </View>
            <Pressable
              style={[styles.followBtn, { backgroundColor: following ? colors.muted : colors.primary, borderColor: following ? colors.border : colors.primary, borderWidth: 1 }]}
              onPress={() => toggleFollow(seller._id || seller.id)}
            >
              <Text style={[styles.followBtnText, { color: following ? colors.foreground : "#fff" }]}>
                {following ? "Following" : "Follow"}
              </Text>
            </Pressable>
          </View>

          {/* Description */}
          <View style={{ gap: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About this product</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>{product.description}</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {product.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{tag}</Text>
              </View>
            ))}
          </View>

          {/* Delivery info */}
          <View style={[styles.deliveryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { icon: "truck", label: "Free Delivery", sub: "Delivered in 3-5 days" },
              { icon: "refresh-cw", label: "Easy Returns", sub: "7 day return policy" },
              { icon: "shield", label: "Secure Payment", sub: "100% buyer protection" },
            ].map((item) => (
              <View key={item.label} style={styles.deliveryItem}>
                <Feather name={item.icon as any} size={18} color={colors.primary} />
                <View>
                  <Text style={[styles.deliveryLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.deliverySub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
        <Pressable style={[styles.cartBtn, { borderColor: colors.primary }]}>
          <Feather name="heart" size={18} color={colors.primary} />
        </Pressable>
        <Animated.View style={[{ flex: 1 }, btnStyle]}>
          <Pressable
            style={[styles.addToCartBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={handleAddCart}
          >
            <Feather name="shopping-bag" size={18} color={colors.primary} />
            <Text style={[styles.addToCartText, { color: colors.primary }]}>Add to Cart</Text>
          </Pressable>
        </Animated.View>
        <Pressable
          style={[styles.buyNowBtn, { backgroundColor: colors.primary }]}
          onPress={() => { handleAddCart(); router.push("/cart"); }}
        >
          <Text style={styles.buyNowText}>{addedFeedback ? "Added!" : "Buy Now"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10 },
  topRight: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  cartBadge: { position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cartBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  imageWrap: { position: "relative" },
  productImage: { width: "100%", height: 340 },
  discountBadge: { position: "absolute", top: 16, left: 16, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  discountText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  content: { padding: 16, gap: 16 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  category: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: "800", lineHeight: 28, marginTop: 4 },
  subtitle: { fontSize: 14, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, marginLeft: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  price: { fontSize: 28, fontWeight: "800" },
  originalPrice: { fontSize: 16, textDecorationLine: "line-through" },
  saveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  saveText: { fontSize: 12, fontWeight: "700" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  stockText: { fontSize: 13 },
  sellerCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  sellerAvatar: { width: 46, height: 46, borderRadius: 23 },
  sellerNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sellerName: { fontSize: 15, fontWeight: "700" },
  sellerFollowers: { fontSize: 12, marginTop: 2 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  followBtnText: { fontSize: 13, fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  description: { fontSize: 14, lineHeight: 22 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  tagText: { fontSize: 12 },
  deliveryCard: { borderRadius: 14, padding: 14, gap: 14, borderWidth: 1 },
  deliveryItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  deliveryLabel: { fontSize: 14, fontWeight: "600" },
  deliverySub: { fontSize: 12 },
  bottomCTA: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  cartBtn: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  addToCartBtn: { flex: 1, height: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 2 },
  addToCartText: { fontSize: 15, fontWeight: "700" },
  buyNowBtn: { flex: 1.2, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  buyNowText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 100 },
  aiMatchBadge: { position: "absolute", bottom: 20, left: 16 },
  aiMatchInner: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, overflow: "hidden" },
  aiMatchText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  aiCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1, padding: 16, marginVertical: 8 },
  aiCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiSparkWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(139,92,246,0.2)", alignItems: "center", justifyContent: "center" },
  aiSpark: { fontSize: 16 },
  aiCardTitle: { fontSize: 15, fontWeight: "800" },
  aiCardSub: { fontSize: 12, marginTop: 1 },
  aiContent: { marginTop: 16, gap: 10 },
  insightRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  insightDot: { width: 6, height: 6, borderRadius: 3 },
  insightText: { fontSize: 13, lineHeight: 18 },
});
