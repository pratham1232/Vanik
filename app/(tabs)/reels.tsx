import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { PRODUCTS, REELS, formatCount, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = height;

const MUSIC_TRACKS = [
  "Trending Beats — DJ Remix Vol. 3",
  "Summer Vibes — Lo-fi Chill",
  "Bollywood Hits — Top 10",
  "Fashion Week Mix — Studio Session",
];

function FloatingHeart({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1.4, { damping: 5 });
    opacity.value = withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 700 }));
    translateY.value = withTiming(-80, { duration: 1000 }, () => { onDone(); });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.floatingHeart, { left: x - 30, top: y - 30 }, style]}>
      <Feather name="heart" size={60} color="#FF3B5C" />
    </Animated.View>
  );
}

function ReelItem({ reel, isActive }: { reel: any; isActive: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useApp();
  const { isLoggedIn } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(reel.likes);
  const [saved, setSaved] = useState(reel.saved);
  const [following, setFollowing] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const lastTap = useRef(0);
  const heartScale = useSharedValue(1);
  const discRotate = useSharedValue(0);
  const product = PRODUCTS.find((p) => p.id === reel.productId);
  const isSaved = isWishlisted(reel.productId);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 90 : 80 + insets.bottom;

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  React.useEffect(() => {
    if (isActive) {
      discRotate.value = withTiming(360, { duration: 4000 });
    }
  }, [isActive]);

  const handleDoubleTap = (e: any) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const { locationX, locationY } = e.nativeEvent;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!liked) {
        setLiked(true);
        setLikes((l: number) => l + 1);
      }
      heartScale.value = withSequence(withSpring(1.5), withSpring(1));
      const id = Date.now();
      setHearts((h) => [...h, { id, x: locationX, y: locationY }]);
    }
    lastTap.current = now;
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    heartScale.value = withSequence(withSpring(1.5), withSpring(1));
    setLiked((p) => { setLikes((l: number) => l + (p ? -1 : 1)); return !p; });
  };

  const COMMENTS = [
    { user: "Riya", text: "Obsessed with this! 😍", avatar: "https://i.pravatar.cc/50?img=5" },
    { user: "Karan", text: "Just ordered 🛒", avatar: "https://i.pravatar.cc/50?img=12" },
    { user: "Priya", text: "Where can I buy this?", avatar: "https://i.pravatar.cc/50?img=22" },
    { user: "Meera", text: "Love the aesthetic ✨", avatar: "https://i.pravatar.cc/50?img=9" },
  ];

  return (
    <View style={[styles.reel, { width, height: ITEM_HEIGHT }]}>
      {/* Background */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDoubleTap}>
        <Image source={reel.thumbnail} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.scrim} />
      </Pressable>

      {/* Floating hearts on double tap */}
      {hearts.map((h) => (
        <FloatingHeart key={h.id} x={h.x} y={h.y} onDone={() => setHearts((prev) => prev.filter((p) => p.id !== h.id))} />
      ))}

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Text style={styles.topTitle}>Reels</Text>
        <View style={styles.topRight}>
          <Pressable style={styles.topBtn}>
            <Feather name="camera" size={22} color="#fff" />
          </Pressable>
          <Pressable style={styles.topBtn}>
            <Feather name="search" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Right Actions */}
      <View style={[styles.rightActions, { bottom: bottomPad + 20 }]}>
        {/* Seller avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarRing, { borderColor: following ? "#8B5CF6" : "#fff" }]}>
            <Image source={{ uri: reel.sellerAvatar }} style={styles.avatar} />
          </View>
          <Pressable
            style={[styles.followBtn, { backgroundColor: following ? "#8B5CF6" : "#fff" }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFollowing((f) => !f); }}
          >
            <Feather name={following ? "check" : "plus"} size={10} color={following ? "#fff" : "#8B5CF6"} />
          </Pressable>
        </View>

        {/* Like */}
        <Pressable style={styles.actionItem} onPress={handleLike}>
          <Animated.View style={heartStyle}>
            <Feather name="heart" size={30} color={liked ? "#FF3B5C" : "#fff"} />
          </Animated.View>
          <Text style={styles.actionCount}>{formatCount(likes)}</Text>
        </Pressable>

        {/* Comment */}
        <Pressable style={styles.actionItem} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowComments(true); }}>
          <Feather name="message-circle" size={28} color="#fff" />
          <Text style={styles.actionCount}>{formatCount(reel.comments)}</Text>
        </Pressable>

        {/* Share to chat */}
        <Pressable style={styles.actionItem} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/chat/c1"); }}>
          <Feather name="send" size={26} color="#fff" />
          <Text style={styles.actionCount}>{formatCount(reel.shares)}</Text>
        </Pressable>

        {/* Save */}
        <Pressable style={styles.actionItem} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSaved((s: boolean) => !s); toggleWishlist(reel.productId); }}>
          <Feather name="bookmark" size={26} color={saved || isSaved ? "#F59E0B" : "#fff"} />
        </Pressable>

        {/* More */}
        <Pressable style={styles.actionItem}>
          <Feather name="more-horizontal" size={24} color="#fff" />
        </Pressable>

        {/* Music disc */}
        <Animated.View style={[styles.musicDisc, { borderColor: "#8B5CF6" }]}>
          <Image source={{ uri: reel.sellerAvatar }} style={styles.musicThumb} />
        </Animated.View>
      </View>

      {/* Bottom Info */}
      <View style={[styles.bottomInfo, { bottom: bottomPad + 16 }]}>
        {/* Seller row */}
        <View style={styles.sellerRow}>
          <Pressable style={[styles.sellerNameBtn]}>
            <Text style={styles.sellerHandle}>@{reel.sellerName.replace(/\s+/g, "").toLowerCase()}</Text>
          </Pressable>
          <View style={[styles.liveBadge, { backgroundColor: "#FF3B5C" }]}>
            <Feather name="film" size={10} color="#fff" />
            <Text style={styles.liveBadgeText}>{reel.duration}</Text>
          </View>
        </View>

        {/* Caption + hashtags */}
        <Pressable onPress={() => setCaptionExpanded((e) => !e)}>
          <Text style={styles.caption} numberOfLines={captionExpanded ? 6 : 2}>{reel.caption}</Text>
        </Pressable>

        {/* Music row */}
        <View style={styles.musicRow}>
          <Feather name="music" size={13} color="rgba(255,255,255,0.8)" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <Text style={styles.musicText}>{MUSIC_TRACKS[parseInt(reel.id.replace("r", "")) % MUSIC_TRACKS.length]}</Text>
          </ScrollView>
        </View>

        {/* Product card */}
        {product && (
          <BlurView
            intensity={40}
            tint="dark"
            style={styles.productCard}
          >
            <Pressable
              style={styles.productCardInner}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <Image source={product.image} style={styles.productThumb} resizeMode="cover" />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.productName} numberOfLines={1}>{product.title}</Text>
                <View style={styles.productPriceRow}>
                  <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                  {product.discount > 0 && (
                    <View style={[styles.discountPill, { backgroundColor: "#FF3B5C" }]}>
                      <Text style={styles.discountText}>{product.discount}% OFF</Text>
                    </View>
                  )}
                </View>
              </View>
              <Pressable
                style={[styles.addBtn, { backgroundColor: "#8B5CF6" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  addItem({ id: product.id, title: product.title, price: product.price, image: product.image, sellerName: product.sellerName });
                }}
              >
                <Feather name="shopping-bag" size={14} color="#fff" />
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </Pressable>
          </BlurView>
        )}
      </View>

      {/* Comments Sheet */}
      {showComments && (
        <Pressable style={styles.commentsOverlay} onPress={() => setShowComments(false)}>
          <View style={[styles.commentsSheet, { backgroundColor: "rgba(15,15,30,0.97)" }]}>
            <View style={styles.commentsHandle} />
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>{formatCount(reel.comments)} Comments</Text>
              <Pressable onPress={() => setShowComments(false)}>
                <Feather name="x" size={20} color="#fff" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
              {COMMENTS.map((c, i) => (
                <View key={i} style={styles.commentRow}>
                  <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentUser}>{c.user}</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                  <Pressable>
                    <Feather name="heart" size={16} color="rgba(255,255,255,0.5)" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
            <View style={styles.commentInput}>
              <Image source={{ uri: "https://i.pravatar.cc/50?img=60" }} style={styles.commentAvatar} />
              <View style={styles.commentInputBox}>
                <Text style={styles.commentPlaceholder}>Add a comment...</Text>
              </View>
              <Pressable style={styles.commentSendBtn}>
                <Feather name="send" size={18} color="#8B5CF6" />
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
}

export default function ReelsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={REELS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ReelItem reel={item} isActive={index === currentIndex} />}
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT))}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  reel: { position: "relative", overflow: "hidden" },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)" },
  floatingHeart: { position: "absolute", zIndex: 100 },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, zIndex: 10 },
  topTitle: { color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: 1 },
  topRight: { flexDirection: "row", gap: 16 },
  topBtn: { padding: 4 },
  rightActions: { position: "absolute", right: 12, alignItems: "center", gap: 22, zIndex: 10 },
  avatarSection: { position: "relative", marginBottom: 4 },
  avatarRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, padding: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  followBtn: { position: "absolute", bottom: -6, left: "50%", marginLeft: -10, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionItem: { alignItems: "center", gap: 4 },
  actionCount: { color: "#fff", fontSize: 12, fontWeight: "700", textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  musicDisc: { width: 42, height: 42, borderRadius: 21, borderWidth: 2.5, overflow: "hidden", marginTop: 8 },
  musicThumb: { width: 38, height: 38, borderRadius: 19 },
  bottomInfo: { position: "absolute", left: 12, right: 80, gap: 10, zIndex: 10 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sellerNameBtn: { alignSelf: "flex-start" },
  sellerHandle: { color: "#fff", fontSize: 16, fontWeight: "900", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  caption: { color: "#fff", fontSize: 14, fontWeight: "500", lineHeight: 20, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  musicRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  musicText: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" },
  productCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  productCardInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10 },
  productThumb: { width: 50, height: 50, borderRadius: 12 },
  productName: { color: "#fff", fontSize: 13, fontWeight: "800" },
  productPriceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  productPrice: { color: "#fff", fontSize: 14, fontWeight: "900" },
  discountPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  commentsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  commentsSheet: { height: "70%", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  commentsHandle: { width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  commentsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  commentsTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  commentRow: { flexDirection: "row", gap: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentUser: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700", marginBottom: 2 },
  commentText: { color: "#fff", fontSize: 14, fontWeight: "500", lineHeight: 18 },
  commentInput: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 16, marginTop: 10 },
  commentInputBox: { flex: 1, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", paddingHorizontal: 16 },
  commentPlaceholder: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  commentSendBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
});
