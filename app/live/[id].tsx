import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";
import { LIVE_SESSIONS, PRODUCTS, formatCount, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const INITIAL_CHAT = [
  { id: "c1", name: "Aadi", msg: "Amazing collection!", time: "2m", color: "#A855F7" },
  { id: "c2", name: "Rohit", msg: "Do you ship internationally?", time: "1m", color: "#EC4899" },
  { id: "c3", name: "Seller", msg: "Yes, we do!", time: "1m", color: "#F59E0B", isSeller: true },
  { id: "c4", name: "Neha", msg: "When is the next live?", time: "just now", color: "#10B981" },
];

const REACTIONS = ["❤️", "🔥", "😍", "👏", "💯"];

interface FloatingReaction {
  id: string;
  emoji: string;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
}

export default function LiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();

  const session = LIVE_SESSIONS.find((s) => s.id === id) ?? LIVE_SESSIONS[0];
  const pinnedProduct = PRODUCTS.find((p) => p.id === session.products[0]);

  const [chat, setChat] = useState(INITIAL_CHAT);
  const [message, setMessage] = useState("");
  const [viewers, setViewers] = useState(session.viewerCount);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [showProductCard, setShowProductCard] = useState(true);
  const viewerInterval = useRef<any>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    viewerInterval.current = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 5 - 2));
    }, 3000);
    return () => clearInterval(viewerInterval.current);
  }, []);

  const sendReaction = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const reaction: FloatingReaction = {
      id: Date.now().toString(),
      emoji,
      x: new Animated.Value(Math.random() * 60 - 30),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
    };
    setFloatingReactions((prev) => [...prev, reaction]);
    Animated.parallel([
      Animated.timing(reaction.y, { toValue: -150, duration: 1200, useNativeDriver: true }),
      Animated.timing(reaction.opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]).start(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChat((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "You", msg: message.trim(), time: "just now", color: colors.primary },
    ]);
    setMessage("");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background (simulated stream) */}
      <Image source={session.thumbnail} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)" }]} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={22} color="#fff" />
        </Pressable>

        <View style={styles.liveInfo}>
          <Animated.View style={[styles.livePill, { transform: [{ scale: pulse }] }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </Animated.View>
          <View style={styles.viewerPill}>
            <Feather name="eye" size={12} color="#fff" />
            <Text style={styles.viewerText}>{formatCount(viewers)}</Text>
          </View>
        </View>

        <View style={styles.sellerInfo}>
          <Image source={{ uri: session.sellerAvatar }} style={styles.sellerAvatar} />
          <Text style={styles.sellerName}>{session.sellerName}</Text>
          <Pressable style={styles.followBtn}>
            <Text style={styles.followBtnText}>Follow</Text>
          </Pressable>
        </View>

        <Pressable style={styles.shareBtn}>
          <Feather name="share-2" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Session Title */}
      <View style={styles.sessionTitle}>
        <Text style={styles.sessionTitleText} numberOfLines={1}>{session.title}</Text>
      </View>

      {/* Pinned Product */}
      {pinnedProduct && showProductCard && (
        <View style={[styles.pinnedProduct, { backgroundColor: "rgba(20,20,40,0.9)", borderColor: "rgba(139,92,246,0.5)" }]}>
          <Image source={pinnedProduct.image} style={styles.pinnedImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pinnedTitle} numberOfLines={1}>{pinnedProduct.title}</Text>
            <Text style={styles.pinnedPrice}>{formatPrice(pinnedProduct.price)}</Text>
          </View>
          <Pressable
            style={[styles.buyNowBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              addItem({ id: pinnedProduct.id, title: pinnedProduct.title, price: pinnedProduct.price, image: pinnedProduct.image, sellerName: pinnedProduct.sellerName });
              router.push("/cart");
            }}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </Pressable>
          <Pressable onPress={() => setShowProductCard(false)}>
            <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>
      )}

      {/* Floating reactions */}
      <View style={styles.reactionsContainer} pointerEvents="none">
        {floatingReactions.map((r) => (
          <Animated.Text
            key={r.id}
            style={[styles.floatingEmoji, { transform: [{ translateX: r.x }, { translateY: r.y }], opacity: r.opacity }]}
          >
            {r.emoji}
          </Animated.Text>
        ))}
      </View>

      {/* Live Chat */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatSection}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatMessages}>
          <FlatList
            data={chat}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.chatBubble}>
                <Text style={[styles.chatName, { color: item.color }]}>{item.name}</Text>
                <Text style={styles.chatMsg}> {item.msg}</Text>
                {item.isSeller && (
                  <View style={styles.sellerBadge}>
                    <Text style={styles.sellerBadgeText}>Seller</Text>
                  </View>
                )}
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          />
        </View>

        {/* Reactions bar */}
        <View style={styles.reactionsBar}>
          {REACTIONS.map((emoji) => (
            <Pressable key={emoji} style={styles.reactionBtn} onPress={() => sendReaction(emoji)}>
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>

        {/* Chat Input */}
        <View style={[styles.chatInput, { backgroundColor: "rgba(20,20,40,0.9)", paddingBottom: bottomPad + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
          />
          <Pressable style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={sendMessage}>
            <Feather name="send" size={16} color="#fff" />
          </Pressable>
          <Pressable style={[styles.cartBtn2, { backgroundColor: colors.muted }]} onPress={() => router.push("/cart")}>
            <Feather name="shopping-cart" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  liveInfo: { flex: 1, flexDirection: "row", gap: 8 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FF3B5C", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  viewerPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  viewerText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  sellerInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  sellerAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: "#fff" },
  sellerName: { color: "#fff", fontWeight: "700", fontSize: 13 },
  followBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  followBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  shareBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  sessionTitle: { paddingHorizontal: 16, marginTop: 4 },
  sessionTitleText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  pinnedProduct: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 12, padding: 10, borderRadius: 16, borderWidth: 1 },
  pinnedImage: { width: 50, height: 50, borderRadius: 10 },
  pinnedTitle: { color: "#fff", fontSize: 13, fontWeight: "600" },
  pinnedPrice: { color: "#A855F7", fontSize: 14, fontWeight: "800" },
  buyNowBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  buyNowText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  reactionsContainer: { position: "absolute", bottom: 200, left: "50%", width: 60, height: 200 },
  floatingEmoji: { position: "absolute", fontSize: 28 },
  chatSection: { position: "absolute", bottom: 0, left: 0, right: 0 },
  chatMessages: { maxHeight: 200, paddingHorizontal: 16, paddingVertical: 8 },
  chatBubble: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, alignSelf: "flex-start" },
  chatName: { fontWeight: "700", fontSize: 13 },
  chatMsg: { color: "#fff", fontSize: 13 },
  sellerBadge: { backgroundColor: "#F59E0B", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
  sellerBadgeText: { color: "#000", fontSize: 9, fontWeight: "800" },
  reactionsBar: { flexDirection: "row", paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  reactionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  reactionEmoji: { fontSize: 20 },
  chatInput: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  input: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 10 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cartBtn2: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
