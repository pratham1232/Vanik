import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { LIVE_REPLAYS, PRODUCTS, formatPrice, formatCount } from "@/data/mockData";

export default function LiveReplayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const replay = LIVE_REPLAYS.find(r => r.id === id) ?? LIVE_REPLAYS[0];
  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [playing, setPlaying] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalSeconds = (() => {
    const [m, s] = replay.duration.split(":").map(Number);
    return m * 60 + s;
  })();

  const handleTagPress = (tag: typeof replay.productTags[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveTag(activeTag === tag.productId ? null : tag.productId);
  };

  const handleBuyFromReplay = (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({ id: product.id, title: product.title, price: product.price, image: product.image, sellerName: product.sellerName });
    router.push("/cart");
  };

  return (
    <View style={styles.container}>
      {/* Video Area */}
      <View style={styles.videoArea}>
        <Image source={replay.thumbnail} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.3)" }]} />

        {/* Top Controls */}
        <View style={[styles.topBar, { paddingTop: topPad }]}>
          <Pressable style={styles.circleBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={styles.replayBadge}>
            <Feather name="play-circle" size={12} color="#fff" />
            <Text style={styles.replayText}>REPLAY</Text>
          </View>
          <View style={styles.viewerPill}>
            <Feather name="eye" size={12} color="#fff" />
            <Text style={styles.viewerText}>{formatCount(replay.viewCount)}</Text>
          </View>
        </View>

        {/* Play/Pause */}
        <Pressable style={styles.playOverlay} onPress={() => setPlaying(!playing)}>
          {!playing && (
            <View style={styles.playBtn}>
              <Feather name="play" size={40} color="#fff" />
            </View>
          )}
        </Pressable>

        {/* Product Tag Markers */}
        {replay.productTags.map((tag, i) => {
          const product = PRODUCTS.find(p => p.id === tag.productId);
          if (!product) return null;
          return (
            <Pressable
              key={tag.productId + i}
              style={[styles.tagMarker, { top: 100 + i * 60, right: 16 }]}
              onPress={() => handleTagPress(tag)}
            >
              <LinearGradient colors={["#FF7A2F", "#E07A10"]} style={styles.tagPill}>
                <Feather name="shopping-bag" size={12} color="#fff" />
                <Text style={styles.tagTimestamp}>{tag.timestamp}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          {replay.productTags.map((tag, i) => {
            const [m, s] = tag.timestamp.split(":").map(Number);
            const tagSec = m * 60 + s;
            const leftPercent = (tagSec / totalSeconds) * 100;
            return <View key={i} style={[styles.tagDot, { left: `${leftPercent}%`, backgroundColor: "#FF7A2F" }]} />;
          })}
          <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
            <View style={[styles.progressFill, { width: "35%", backgroundColor: "#FF7A2F" }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>11:15</Text>
            <Text style={styles.timeText}>{replay.duration}</Text>
          </View>
        </View>
      </View>

      {/* Seller Info */}
      <View style={[styles.sellerRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Image source={{ uri: replay.sellerAvatar }} style={styles.sellerAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.sellerName, { color: colors.foreground }]}>{replay.sellerName}</Text>
          <Text style={[styles.replayTitle, { color: colors.mutedForeground }]}>{replay.title}</Text>
        </View>
        <Pressable style={[styles.followBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.followText}>Follow</Text>
        </Pressable>
      </View>

      {/* Shoppable Product Tags List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.tagsList}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          <Feather name="tag" size={16} color={colors.primary} /> Products in this replay
        </Text>
        {replay.productTags.map((tag, i) => {
          const product = PRODUCTS.find(p => p.id === tag.productId);
          if (!product) return null;
          const isActive = activeTag === tag.productId;
          return (
            <Pressable
              key={tag.productId + i}
              style={[styles.productCard, { backgroundColor: colors.card, borderColor: isActive ? colors.primary : colors.border }]}
              onPress={() => handleTagPress(tag)}
            >
              <View style={[styles.timestampBadge, { backgroundColor: colors.primary }]}>
                <Feather name="clock" size={10} color="#fff" />
                <Text style={styles.timestampText}>{tag.timestamp}</Text>
              </View>
              <View style={styles.productRow}>
                <Image source={product.image} style={styles.productImg} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.productTitle, { color: colors.foreground }]}>{product.title}</Text>
                  <Text style={[styles.productLabel, { color: colors.mutedForeground }]}>{tag.label}</Text>
                  <View style={styles.priceActionRow}>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>{formatPrice(product.price)}</Text>
                    <Pressable
                      style={[styles.buyBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleBuyFromReplay(tag.productId)}
                    >
                      <Feather name="shopping-cart" size={14} color="#fff" />
                      <Text style={styles.buyText}>Buy Now</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoArea: { height: 350, position: "relative" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10, zIndex: 10 },
  circleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  replayBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,122,0,0.8)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  replayText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  viewerPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  viewerText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  playOverlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  playBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  tagMarker: { position: "absolute", zIndex: 20 },
  tagPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  tagTimestamp: { color: "#fff", fontSize: 11, fontWeight: "800" },
  progressBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 12 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  tagDot: { position: "absolute", width: 8, height: 8, borderRadius: 4, bottom: 28, zIndex: 5, marginLeft: -4 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  timeText: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },
  sellerRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderBottomWidth: 1 },
  sellerAvatar: { width: 40, height: 40, borderRadius: 20 },
  sellerName: { fontSize: 15, fontWeight: "800" },
  replayTitle: { fontSize: 12, fontWeight: "600" },
  followBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  followText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  tagsList: { padding: 16, gap: 12, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  productCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  timestampBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start", borderBottomRightRadius: 12 },
  timestampText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  productRow: { flexDirection: "row", padding: 12, gap: 12 },
  productImg: { width: 60, height: 60, borderRadius: 12 },
  productTitle: { fontSize: 14, fontWeight: "700" },
  productLabel: { fontSize: 12, marginTop: 2 },
  priceActionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  productPrice: { fontSize: 16, fontWeight: "900" },
  buyBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  buyText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
