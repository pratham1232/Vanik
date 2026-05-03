import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
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
import { PRODUCTS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const SAMPLE_MEDIA = [
  require("../assets/images/product_fashion.png"),
  require("../assets/images/live_banner.png"),
  require("../assets/images/product_skincare.png"),
  require("../assets/images/product_pottery.png"),
  require("../assets/images/product_bag.png"),
  require("../assets/images/product_watch.png"),
];

const FILTERS = ["None", "Warm", "Cool", "Vivid", "Fade", "Drama"];
const STICKERS = ["🔥", "💯", "✨", "❤️", "🎉", "😍", "👏", "🛍️", "💜", "⚡"];
const TEXT_STYLES = ["Bold", "Neon", "Shadow", "Outline"];

export default function AddStoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedMedia, setSelectedMedia] = useState(0);
  const [activeFilter, setActiveFilter]   = useState("None");
  const [activeTab, setActiveTab]         = useState<"media" | "text" | "sticker" | "product">("media");
  const [caption, setCaption]             = useState("");
  const [addedStickers, setAddedStickers] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [duration, setDuration]           = useState<"24h" | "48h">("24h");
  const [audience, setAudience]           = useState<"everyone" | "followers" | "close">("everyone");
  const [posted, setPosted]               = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  const handlePost = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPosted(true);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 10 }).start();
    setTimeout(() => router.back(), 1800);
  };

  if (posted) {
    return (
      <View style={[styles.successScreen, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.successCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.successIconRing, { backgroundColor: colors.primary + "20" }]}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Story Posted!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your story is now live for {duration} · {audience === "everyone" ? "Everyone" : audience === "followers" ? "Followers" : "Close Friends"}
          </Text>
          <View style={[styles.successBar, { backgroundColor: colors.primary + "30" }]}>
            <Animated.View style={[styles.successBarFill, { backgroundColor: colors.primary, width: "100%" }]} />
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: topPad + 6 }]}>
        <Pressable style={styles.topBtn} onPress={() => router.back()}>
          <Feather name="x" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.topTitle}>New Story</Text>
        <Pressable style={[styles.topBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
          <Feather name="settings" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* ── Preview ── */}
      <View style={styles.previewContainer}>
        <Image
          source={SAMPLE_MEDIA[selectedMedia]}
          style={[styles.preview, { opacity: activeFilter === "Fade" ? 0.7 : 1 }]}
          resizeMode="cover"
        />
        {/* Filter overlay */}
        {activeFilter === "Warm"  && <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,140,0,0.18)" }]} pointerEvents="none" />}
        {activeFilter === "Cool"  && <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(40,80,255,0.18)" }]} pointerEvents="none" />}
        {activeFilter === "Vivid" && <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(180,0,220,0.10)" }]} pointerEvents="none" />}
        {activeFilter === "Drama" && <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.32)" }]} pointerEvents="none" />}

        {/* Caption overlay */}
        {caption.length > 0 && (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionOverlayText}>{caption}</Text>
          </View>
        )}

        {/* Sticker overlays */}
        {addedStickers.map((s, i) => (
          <Text key={i} style={[styles.stickerOnPreview, { top: 120 + i * 44, left: 40 + (i % 3) * 80 }]}>{s}</Text>
        ))}

        {/* Product tag */}
        {selectedProduct && (
          <View style={styles.productTagOnPreview}>
            <Feather name="tag" size={12} color="#fff" />
            <Text style={styles.productTagText}>{PRODUCTS.find(p => p.id === selectedProduct)?.title}</Text>
          </View>
        )}

        {/* Duration badge */}
        <View style={[styles.durationBadge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Feather name="clock" size={11} color="#fff" />
          <Text style={styles.durationBadgeText}>{duration}</Text>
        </View>
      </View>

      {/* ── Tool tabs ── */}
      <View style={[styles.toolTabs, { backgroundColor: "rgba(0,0,0,0.85)" }]}>
        {([
          { key: "media",   icon: "image",      label: "Media"   },
          { key: "text",    icon: "type",        label: "Text"    },
          { key: "sticker", icon: "smile",       label: "Sticker" },
          { key: "product", icon: "shopping-bag",label: "Product" },
        ] as const).map((t) => (
          <Pressable
            key={t.key}
            style={styles.toolTab}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(t.key); }}
          >
            <Feather name={t.icon} size={18} color={activeTab === t.key ? "#8B5CF6" : "rgba(255,255,255,0.55)"} />
            <Text style={[styles.toolTabLabel, { color: activeTab === t.key ? "#8B5CF6" : "rgba(255,255,255,0.45)" }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Panel ── */}
      <View style={[styles.panel, { backgroundColor: "rgba(10,8,24,0.97)" }]}>

        {/* Media grid */}
        {activeTab === "media" && (
          <>
            {/* Filters row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
              {FILTERS.map((f) => (
                <Pressable
                  key={f}
                  style={[styles.filterChip, { borderColor: activeFilter === f ? "#8B5CF6" : "rgba(255,255,255,0.18)", backgroundColor: activeFilter === f ? "#8B5CF6" + "30" : "transparent" }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveFilter(f); }}
                >
                  <Text style={[styles.filterChipText, { color: activeFilter === f ? "#A78BFA" : "rgba(255,255,255,0.55)" }]}>{f}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Media grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>
              {SAMPLE_MEDIA.map((img, i) => (
                <Pressable
                  key={i}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedMedia(i); }}
                  style={[styles.mediaThumbWrap, selectedMedia === i && styles.mediaThumbSelected]}
                >
                  <Image source={img} style={styles.mediaThumb} resizeMode="cover" />
                  {selectedMedia === i && (
                    <View style={styles.mediaSelectedCheck}>
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  )}
                </Pressable>
              ))}
              {/* Camera option */}
              <Pressable style={[styles.mediaThumbWrap, { borderColor: "rgba(139,92,246,0.5)" }]}>
                <View style={[styles.mediaThumb, { backgroundColor: "rgba(139,92,246,0.18)", alignItems: "center", justifyContent: "center" }]}>
                  <Feather name="camera" size={26} color="#8B5CF6" />
                  <Text style={styles.cameraLabel}>Camera</Text>
                </View>
              </Pressable>
            </ScrollView>
          </>
        )}

        {/* Text / caption */}
        {activeTab === "text" && (
          <View style={styles.textPanel}>
            <TextInput
              style={styles.captionInput}
              placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={caption}
              onChangeText={setCaption}
              multiline
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.textStyleRow}>
              {TEXT_STYLES.map((s) => (
                <Pressable key={s} style={styles.textStyleChip}>
                  <Text style={styles.textStyleChipText}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stickers */}
        {activeTab === "sticker" && (
          <View style={styles.stickerGrid}>
            {STICKERS.map((s) => (
              <Pressable
                key={s}
                style={styles.stickerItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAddedStickers((prev) => [...prev.slice(-4), s]);
                }}
              >
                <Text style={styles.stickerEmoji}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Product tag */}
        {activeTab === "product" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow}>
            {PRODUCTS.slice(0, 6).map((p) => (
              <Pressable
                key={p.id}
                style={[
                  styles.productCard,
                  { borderColor: selectedProduct === p.id ? "#8B5CF6" : "rgba(255,255,255,0.12)", backgroundColor: selectedProduct === p.id ? "#8B5CF620" : "rgba(255,255,255,0.05)" },
                ]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedProduct((prev) => prev === p.id ? null : p.id); }}
              >
                <Image source={p.image} style={styles.productThumb} resizeMode="cover" />
                <Text style={styles.productTitle} numberOfLines={2}>{p.title}</Text>
                <Text style={styles.productPrice}>₹{p.price.toLocaleString("en-IN")}</Text>
                {selectedProduct === p.id && (
                  <View style={styles.productCheck}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Settings row */}
        <View style={styles.settingsRow}>
          {/* Audience */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>👥 Audience</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {(["everyone", "followers", "close"] as const).map((a) => (
                <Pressable
                  key={a}
                  style={[styles.settingChip, { borderColor: audience === a ? "#8B5CF6" : "rgba(255,255,255,0.15)", backgroundColor: audience === a ? "#8B5CF620" : "transparent" }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAudience(a); }}
                >
                  <Text style={[styles.settingChipText, { color: audience === a ? "#A78BFA" : "rgba(255,255,255,0.5)" }]}>
                    {a === "everyone" ? "Everyone" : a === "followers" ? "Followers" : "Close Friends"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Duration */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>⏱ Duration</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {(["24h", "48h"] as const).map((d) => (
                <Pressable
                  key={d}
                  style={[styles.settingChip, { borderColor: duration === d ? "#8B5CF6" : "rgba(255,255,255,0.15)", backgroundColor: duration === d ? "#8B5CF620" : "transparent" }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDuration(d); }}
                >
                  <Text style={[styles.settingChipText, { color: duration === d ? "#A78BFA" : "rgba(255,255,255,0.5)" }]}>{d}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Post button */}
        <Pressable
          style={[styles.postBtn, { marginBottom: bottomPad + 8 }]}
          onPress={handlePost}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.postBtnText}>Share Story</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1 },
  /* Top bar */
  topBar:              { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 10, zIndex: 20 },
  topBtn:              { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  topTitle:            { color: "#fff", fontSize: 17, fontWeight: "800" },
  /* Preview */
  previewContainer:    { width, height: width * 1.15, position: "relative" },
  preview:             { width: "100%", height: "100%" },
  captionOverlay:      { position: "absolute", bottom: 28, left: 16, right: 16, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 12, padding: 10 },
  captionOverlayText:  { color: "#fff", fontSize: 15, fontWeight: "700", textAlign: "center" },
  stickerOnPreview:    { position: "absolute", fontSize: 36, zIndex: 10 },
  productTagOnPreview: { position: "absolute", bottom: 28, left: 12, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(139,92,246,0.85)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  productTagText:      { color: "#fff", fontSize: 12, fontWeight: "700" },
  durationBadge:       { position: "absolute", top: 70, right: 12, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  durationBadgeText:   { color: "#fff", fontSize: 11, fontWeight: "700" },
  /* Tool tabs */
  toolTabs:            { flexDirection: "row", paddingVertical: 8 },
  toolTab:             { flex: 1, alignItems: "center", gap: 3 },
  toolTabLabel:        { fontSize: 10, fontWeight: "600" },
  /* Panel */
  panel:               { flex: 1, paddingTop: 12 },
  filtersRow:          { paddingHorizontal: 14, gap: 8, paddingBottom: 10 },
  filterChip:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterChipText:      { fontSize: 12, fontWeight: "600" },
  mediaRow:            { paddingHorizontal: 14, gap: 8, paddingBottom: 8 },
  mediaThumbWrap:      { width: 80, height: 80, borderRadius: 12, overflow: "hidden", borderWidth: 2, borderColor: "transparent" },
  mediaThumbSelected:  { borderColor: "#8B5CF6" },
  mediaThumb:          { width: "100%", height: "100%" },
  mediaSelectedCheck:  { position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: "#8B5CF6", alignItems: "center", justifyContent: "center" },
  cameraLabel:         { color: "#8B5CF6", fontSize: 10, marginTop: 4 },
  /* Text tab */
  textPanel:           { paddingHorizontal: 14, gap: 10 },
  captionInput:        { color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12, minHeight: 80 },
  textStyleRow:        { gap: 8 },
  textStyleChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  textStyleChipText:   { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  /* Stickers */
  stickerGrid:         { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, gap: 6 },
  stickerItem:         { width: (width - 56) / 5, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" },
  stickerEmoji:        { fontSize: 26 },
  /* Product */
  productRow:          { paddingHorizontal: 14, gap: 10, paddingBottom: 4 },
  productCard:         { width: 110, borderRadius: 14, borderWidth: 1.5, overflow: "hidden", position: "relative" },
  productThumb:        { width: "100%", height: 80 },
  productTitle:        { color: "#fff", fontSize: 11, fontWeight: "600", padding: 6, paddingBottom: 2 },
  productPrice:        { color: "#A78BFA", fontSize: 11, fontWeight: "800", paddingHorizontal: 6, paddingBottom: 6 },
  productCheck:        { position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: "#8B5CF6", alignItems: "center", justifyContent: "center" },
  /* Settings */
  settingsRow:         { flexDirection: "row", paddingHorizontal: 14, gap: 16, marginTop: 10, marginBottom: 6 },
  settingGroup:        { flex: 1, gap: 6 },
  settingLabel:        { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700" },
  settingChip:         { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  settingChipText:     { fontSize: 11, fontWeight: "600" },
  /* Post button */
  postBtn:             { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 14, marginTop: 8, paddingVertical: 14, borderRadius: 20, backgroundColor: "#8B5CF6" },
  postBtnText:         { color: "#fff", fontSize: 16, fontWeight: "800" },
  /* Success */
  successScreen:       { flex: 1, alignItems: "center", justifyContent: "center" },
  successCard:         { alignItems: "center", gap: 14, padding: 32 },
  successIconRing:     { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  successEmoji:        { fontSize: 48 },
  successTitle:        { fontSize: 26, fontWeight: "900" },
  successSub:          { fontSize: 14, textAlign: "center", lineHeight: 22 },
  successBar:          { width: 200, height: 4, borderRadius: 2, overflow: "hidden", marginTop: 8 },
  successBarFill:      { height: "100%", borderRadius: 2 },
});
