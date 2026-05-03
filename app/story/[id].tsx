import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PRODUCTS, STATUSES, STORIES, formatCount, formatPrice } from "@/data/mockData";

const { width, height } = Dimensions.get("window");
const STORY_DURATION = 6000;

const STORY_IMAGES = [
  require("../../assets/images/product_fashion.png"),
  require("../../assets/images/live_banner.png"),
  require("../../assets/images/product_skincare.png"),
  require("../../assets/images/product_pottery.png"),
];

const STORY_CAPTIONS = [
  "✨ New Collection Drop — Limited Pieces!",
  "Swipe up to explore the full range 👆",
  "Behind the scenes of our latest shoot 📸",
  "Exclusive deal for Vanik followers only 🎁",
];

const REACTION_EMOJIS = ["❤️", "🔥", "😍", "😮", "👏", "💯"];
const PURPLE = "#8B5CF6";
const PINK   = "#FF3B5C";

interface FloatHeart {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  emoji: string;
}

export default function StoryScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const story = STORIES.find((s) => s.id === id) ?? STATUSES.find((s) => s.id === id) ?? STORIES[1];
  const storyCount = (story as any).storyCount ?? (story as any).count ?? 3;
  const product = PRODUCTS.find((p) => p.id === (story as any).productId);

  const [currentIndex, setCurrentIndex]   = useState(0);
  const [paused, setPaused]               = useState(false);
  const [input, setInput]                 = useState("");
  const [liked, setLiked]                 = useState(false);
  const [showEmojis, setShowEmojis]       = useState(false);
  const [floatHearts, setFloatHearts]     = useState<FloatHeart[]>([]);
  const [reactionSent, setReactionSent]   = useState<string | null>(null);

  const progress  = useRef(new Animated.Value(0)).current;
  const anim      = useRef<Animated.CompositeAnimation | null>(null);
  const heartScale = useRef(new Animated.Value(1)).current;

  const startProgress = (idx: number) => {
    progress.setValue(0);
    anim.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    anim.current.start(({ finished }) => { if (finished) goNext(idx); });
  };

  const goNext = (idx: number) => {
    if (idx < storyCount - 1) setCurrentIndex(idx + 1);
    else router.back();
  };

  const goPrev = (idx: number) => {
    if (idx > 0) setCurrentIndex(idx - 1);
    else router.back();
  };

  useEffect(() => {
    if (!paused) startProgress(currentIndex);
    return () => { anim.current?.stop(); };
  }, [currentIndex, paused]);

  const handleDoubleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    spawnFloat("❤️", width / 2, height / 2);
    setLiked(true);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true, speed: 40 }),
      Animated.spring(heartScale, { toValue: 1,   useNativeDriver: true, speed: 40 }),
    ]).start();
  };

  const spawnFloat = (emoji: string, x: number, y: number) => {
    const id = `f_${Date.now()}_${Math.random()}`;
    const xAnim   = new Animated.Value(x + (Math.random() - 0.5) * 60);
    const yAnim   = new Animated.Value(y);
    const opacity = new Animated.Value(1);
    const scale   = new Animated.Value(0.5);

    setFloatHearts((prev) => [...prev, { id, x: xAnim, y: yAnim, opacity, scale, emoji }]);

    Animated.parallel([
      Animated.timing(yAnim,   { toValue: y - 180, duration: 1000, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0,        duration: 1000, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1.4,                      useNativeDriver: true }),
    ]).start(() => setFloatHearts((prev) => prev.filter((h) => h.id !== id)));
  };

  const handleReaction = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    spawnFloat(emoji, width / 2 + (Math.random() - 0.5) * 100, height - 220);
    setReactionSent(emoji);
    setShowEmojis(false);
    setTimeout(() => setReactionSent(null), 1800);
  };

  return (
    <View style={styles.container}>
      {/* BG image */}
      <Image
        source={STORY_IMAGES[currentIndex % STORY_IMAGES.length]}
        style={styles.bg}
        resizeMode="cover"
      />

      {/* Gradient overlays */}
      <View style={[styles.gradientTop, { height: topPad + 140 }]} pointerEvents="none" />
      <View style={styles.gradientBottom} pointerEvents="none" />

      {/* Floating hearts */}
      {floatHearts.map((h) => (
        <Animated.Text
          key={h.id}
          style={[styles.floatHeart, {
            transform: [{ translateX: h.x }, { translateY: h.y }, { scale: h.scale }],
            opacity: h.opacity,
          }]}
        >
          {h.emoji}
        </Animated.Text>
      ))}

      {/* Reaction sent badge */}
      {reactionSent && (
        <View style={styles.reactionSentBadge}>
          <Text style={styles.reactionSentText}>{reactionSent} Sent!</Text>
        </View>
      )}

      {/* Progress bars */}
      <View style={[styles.progressRow, { paddingTop: topPad + 10 }]}>
        {Array.from({ length: storyCount }).map((_, i) => (
          <View key={i} style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, {
                width: i < currentIndex
                  ? "100%"
                  : i === currentIndex
                  ? progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] })
                  : "0%",
              }]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={[styles.storyHeader, { paddingTop: 8 }]}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: story.avatar }} style={styles.avatar} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.storyName}>{story.name}</Text>
            {(story as any).isBusiness && (
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={9} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.storyTime}>{(story as any).time ?? "Just now"}</Text>
            <View style={styles.viewersDot} />
            <Feather name="eye" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.storyTime}>{formatCount(Math.floor(Math.random() * 500) + 120)}</Text>
          </View>
        </View>
        <Pressable style={styles.headerBtn} onPress={() => {}}>
          <Feather name="more-vertical" size={20} color="#fff" />
        </Pressable>
        <Pressable style={styles.headerBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
          <Feather name="x" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Tap zones for prev / next */}
      <View style={styles.tapZones} pointerEvents="box-none">
        <Pressable
          style={styles.tapLeft}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goPrev(currentIndex); }}
          onLongPress={() => { anim.current?.stop(); setPaused(true); }}
          onPressOut={() => { if (paused) { setPaused(false); } }}
        />
        <Pressable
          style={styles.tapRight}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goNext(currentIndex); }}
          onLongPress={() => { anim.current?.stop(); setPaused(true); }}
          onPressOut={() => { if (paused) { setPaused(false); } }}
          onPress={() => handleDoubleTap()}
        />
      </View>

      {/* Story caption */}
      <View style={styles.captionArea}>
        <Text style={styles.captionText}>{STORY_CAPTIONS[currentIndex % STORY_CAPTIONS.length]}</Text>
      </View>

      {/* Product swipe-up card */}
      {product && (
        <Pressable
          style={styles.productCard}
          onPress={() => { router.back(); setTimeout(() => router.push(`/product/${product.id}`), 200); }}
        >
          <Image source={product.image} style={styles.productThumb} resizeMode="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.productCardLabel}>FEATURED PRODUCT</Text>
            <Text style={styles.productCardName} numberOfLines={1}>{product.title}</Text>
            <Text style={styles.productCardPrice}>{formatPrice(product.price)}</Text>
          </View>
          <View style={styles.shopBtn}>
            <Feather name="shopping-bag" size={13} color="#fff" />
            <Text style={styles.shopBtnText}>Shop</Text>
          </View>
        </Pressable>
      )}

      {/* Emoji reaction bar */}
      {showEmojis && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowEmojis(false)}>
          <View style={[styles.emojiBar, { bottom: bottomPad + 90 }]}>
            {REACTION_EMOJIS.map((emoji) => (
              <Pressable key={emoji} style={styles.emojiItem} onPress={() => handleReaction(emoji)}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}

      {/* Bottom input bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.bottomBar, { paddingBottom: bottomPad + 14 }]}
      >
        {/* Liked indicator */}
        <Animated.View style={[styles.heartBubble, { transform: [{ scale: heartScale }], opacity: liked ? 1 : 0 }]}>
          <Text style={{ fontSize: 18 }}>❤️</Text>
        </Animated.View>

        <View style={styles.inputRow}>
          <Pressable
            style={styles.emojiTrigger}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowEmojis((v) => !v); }}
          >
            <Text style={styles.emojiTriggerText}>😊</Text>
          </Pressable>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.replyInput}
              placeholder={`Reply to ${story.name}...`}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={input}
              onChangeText={setInput}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            />
            {input.trim().length > 0 && (
              <Pressable
                style={styles.sendBtn}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setInput("");
                }}
              >
                <Feather name="send" size={16} color={PURPLE} />
              </Pressable>
            )}
          </View>

          <Pressable
            style={[styles.likeBtn, liked && styles.likeBtnActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setLiked((l) => !l); }}
          >
            <Text style={{ fontSize: 22 }}>{liked ? "❤️" : "🤍"}</Text>
          </Pressable>

          <Pressable style={styles.shareIconBtn}>
            <Feather name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#000" },
  bg:               { ...StyleSheet.absoluteFillObject, width, height },
  gradientTop:      { position: "absolute", top: 0, left: 0, right: 0, height: 180 },
  gradientBottom:   { position: "absolute", bottom: 0, left: 0, right: 0, height: 320 },

  /* Progress */
  progressRow:      { flexDirection: "row", paddingHorizontal: 10, gap: 4, zIndex: 20, paddingBottom: 6 },
  progressTrack:    { flex: 1, height: 2.5, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.32)", overflow: "hidden" },
  progressFill:     { height: "100%", backgroundColor: "#fff", borderRadius: 2 },

  /* Header */
  storyHeader:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 10, zIndex: 20 },
  avatarRing:       { width: 42, height: 42, borderRadius: 21, borderWidth: 2.5, borderColor: PURPLE, padding: 2, overflow: "hidden" },
  avatar:           { width: "100%", height: "100%", borderRadius: 18 },
  nameRow:          { flexDirection: "row", alignItems: "center", gap: 5 },
  storyName:        { color: "#fff", fontSize: 14, fontWeight: "800" },
  verifiedBadge:    { width: 16, height: 16, borderRadius: 8, backgroundColor: PURPLE, alignItems: "center", justifyContent: "center" },
  metaRow:          { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  storyTime:        { color: "rgba(255,255,255,0.65)", fontSize: 11 },
  viewersDot:       { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.4)" },
  headerBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },

  /* Tap zones */
  tapZones:         { ...StyleSheet.absoluteFillObject, flexDirection: "row", top: 100, bottom: 120 },
  tapLeft:          { flex: 1 },
  tapRight:         { flex: 1 },

  /* Caption */
  captionArea:      { position: "absolute", bottom: 200, left: 16, right: 16 },
  captionText:      { color: "#fff", fontSize: 18, fontWeight: "800", lineHeight: 26,
                      textShadowColor: "rgba(0,0,0,0.9)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },

  /* Product card */
  productCard:      { position: "absolute", bottom: 130, left: 12, right: 12, flexDirection: "row", alignItems: "center",
                      gap: 10, padding: 12, borderRadius: 20, borderWidth: 1,
                      backgroundColor: "rgba(0,0,0,0.78)", borderColor: "rgba(255,255,255,0.14)" },
  productThumb:     { width: 52, height: 52, borderRadius: 12 },
  productCardLabel: { color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: "800", letterSpacing: 0.8, marginBottom: 1 },
  productCardName:  { color: "#fff", fontSize: 13, fontWeight: "700" },
  productCardPrice: { color: PURPLE, fontSize: 13, fontWeight: "900", marginTop: 1 },
  shopBtn:          { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: PURPLE, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14 },
  shopBtnText:      { color: "#fff", fontSize: 12, fontWeight: "800" },

  /* Emoji reaction bar */
  emojiBar:         { position: "absolute", left: 12, right: 12, flexDirection: "row", justifyContent: "space-around",
                      backgroundColor: "rgba(20,16,40,0.95)", borderRadius: 32, paddingVertical: 12,
                      borderWidth: 1, borderColor: "rgba(139,92,246,0.3)" },
  emojiItem:        { paddingHorizontal: 8 },
  emojiText:        { fontSize: 26 },

  /* Bottom bar */
  bottomBar:        { position: "absolute", bottom: 0, left: 0, right: 0 },
  heartBubble:      { alignSelf: "center", marginBottom: 6 },
  inputRow:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 },
  emojiTrigger:     { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  emojiTriggerText: { fontSize: 22 },
  inputWrap:        { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 24, borderWidth: 1.5,
                      borderColor: "rgba(255,255,255,0.4)", backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 14, paddingVertical: 9 },
  replyInput:       { flex: 1, color: "#fff", fontSize: 14 },
  sendBtn:          { marginLeft: 8 },
  likeBtn:          { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  likeBtnActive:    {},
  shareIconBtn:     { width: 42, height: 42, alignItems: "center", justifyContent: "center" },

  /* Floating hearts */
  floatHeart:       { position: "absolute", fontSize: 32, zIndex: 100 },

  /* Reaction sent */
  reactionSentBadge:  { position: "absolute", top: "45%", alignSelf: "center", left: 0, right: 0, alignItems: "center", zIndex: 50 },
  reactionSentText:   { color: "#fff", fontSize: 20, fontWeight: "800",
                        textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
});
