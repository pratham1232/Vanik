import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useApp } from "@/context/AppContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface ProductCardProps {
  product: any;
  width?: number;
  compact?: boolean;
}

export default function ProductCard({ product, width = 160, compact = false }: ProductCardProps) {
  const colors = useColors();
  const { toggleWishlist, isWishlisted } = useApp();
  const { addItem } = useCart();
   const scale = useSharedValue(1);
  const liked = isWishlisted(product._id || product.id);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(1.2, {}, () => { scale.value = withSpring(1); });
    toggleWishlist(product._id || product.id);
  };

  const handleAddCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem({ 
      id: product._id || product.id, 
      title: product.title, 
      price: product.price, 
      image: product.images?.[0] || product.image, 
      sellerName: product.seller?.name || product.sellerName 
    });
  };

  return (
    <Pressable
      style={[styles.card, { width, backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product._id || product.id } })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images?.[0] || product.image }} style={[styles.image, { width, height: compact ? 120 : 150 }]} resizeMode="cover" />
        {product.discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.live }]}>
            <Text style={styles.discountText}>{product.discount}% OFF</Text>
          </View>
        )}
        <Animated.View style={[styles.wishBtn, animStyle]}>
          <Pressable onPress={handleWishlist} hitSlop={8}>
            <Feather name="heart" size={16} color={liked ? colors.live : colors.mutedForeground} fill={liked ? colors.live : "none"} />
          </Pressable>
        </Animated.View>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{product.title}</Text>
        <View style={styles.ratingRow}>
          <Feather name="star" size={11} color={colors.gold} />
          <Text style={[styles.rating, { color: colors.mutedForeground }]}> {product.rating} ({product.reviews})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.foreground }]}>{formatPrice(product.price)}</Text>
          {product.discount > 0 && (
            <Text style={[styles.original, { color: colors.mutedForeground }]}>{formatPrice(product.originalPrice)}</Text>
          )}
        </View>
        {!compact && (
          <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAddCart}>
            <Text style={styles.addBtnText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, overflow: "hidden", borderWidth: 1, marginRight: 12 },
  imageContainer: { position: "relative" },
  image: {},
  discountBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  wishBtn: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 6 },
  info: { padding: 10, gap: 4 },
  title: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 11 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 15, fontWeight: "700" },
  original: { fontSize: 12, textDecorationLine: "line-through" },
  addBtn: { borderRadius: 8, paddingVertical: 7, alignItems: "center", marginTop: 4 },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
