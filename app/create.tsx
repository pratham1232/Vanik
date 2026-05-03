import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { PRODUCTS, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

type ContentType = "post" | "reel" | "story" | "product" | "live";

const CONTENT_TYPES: Array<{ type: ContentType; icon: string; label: string; sellerOnly?: boolean }> = [
  { type: "post", icon: "image", label: "Post" },
  { type: "reel", icon: "film", label: "Reel" },
  { type: "story", icon: "circle", label: "Story" },
  { type: "product", icon: "package", label: "Product", sellerOnly: true },
  { type: "live", icon: "video", label: "Go Live", sellerOnly: true },
];

export default function CreateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isSeller = user?.role === "seller";

  const [activeType, setActiveType] = useState<ContentType>("post");
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handlePublish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    btnScale.value = withSpring(0.95, {}, () => { btnScale.value = withSpring(1); });
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      activeType === "live" ? "Going Live!" : "Published!",
      activeType === "live"
        ? "Your live session is starting. Viewers can join now."
        : `Your ${activeType} has been published successfully.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const availableTypes = CONTENT_TYPES.filter((t) => !t.sellerOnly || isSeller);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={[styles.closeBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create</Text>
        <Animated.View style={btnStyle}>
          <Pressable
            style={[styles.publishBtn, { backgroundColor: loading ? colors.accent : colors.primary }]}
            onPress={handlePublish}
            disabled={loading}
          >
            <Text style={styles.publishBtnText}>{loading ? "Publishing..." : activeType === "live" ? "Go Live" : "Publish"}</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Type selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.typeRow, { borderBottomColor: colors.border }]}>
        {availableTypes.map((t) => {
          const isActive = activeType === t.type;
          return (
            <Pressable
              key={t.type}
              style={[styles.typeBtn, isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveType(t.type); }}
            >
              <Feather name={t.icon as any} size={18} color={isActive ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.typeLabel, { color: isActive ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} keyboardShouldPersistTaps="handled">

          {/* Media upload area */}
          {activeType !== "live" && activeType !== "product" && (
            <Pressable style={[styles.mediaBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <View style={[styles.mediaInner, { borderColor: colors.border }]}>
                <Feather name={activeType === "reel" ? "film" : activeType === "story" ? "circle" : "image"} size={36} color={colors.mutedForeground} />
                <Text style={[styles.mediaLabel, { color: colors.foreground }]}>
                  Tap to add {activeType === "reel" ? "video" : activeType === "story" ? "story image" : "photo"}
                </Text>
                <Text style={[styles.mediaHint, { color: colors.mutedForeground }]}>
                  {activeType === "reel" ? "Max 60 seconds" : activeType === "story" ? "Disappears after 24h" : "Up to 10 photos"}
                </Text>
                <View style={[styles.uploadBtn, { backgroundColor: colors.primary }]}>
                  <Feather name="upload" size={16} color="#fff" />
                  <Text style={styles.uploadBtnText}>Select Media</Text>
                </View>
              </View>
            </Pressable>
          )}

          {/* Live session setup */}
          {activeType === "live" && (
            <View style={styles.section}>
              <View style={[styles.livePreview, { backgroundColor: colors.muted }]}>
                <Feather name="video" size={48} color={colors.primary} />
                <Text style={[styles.livePreviewText, { color: colors.foreground }]}>Camera preview</Text>
                <Text style={[styles.livePreviewHint, { color: colors.mutedForeground }]}>Your live will appear here</Text>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Session Title</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.foreground }]}
                    placeholder="e.g. Summer Collection Live!"
                    placeholderTextColor={colors.mutedForeground}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Product listing form */}
          {activeType === "product" && (
            <View style={styles.section}>
              <Pressable style={[styles.productImageBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="camera" size={32} color={colors.mutedForeground} />
                <Text style={[styles.mediaLabel, { color: colors.foreground }]}>Add product photos</Text>
                <Text style={[styles.mediaHint, { color: colors.mutedForeground }]}>First photo is the cover image</Text>
              </Pressable>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Product Title</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput style={[styles.textInput, { color: colors.foreground }]} placeholder="What are you selling?" placeholderTextColor={colors.mutedForeground} value={title} onChangeText={setTitle} />
                </View>
              </View>

              <View style={styles.priceRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Price (₹)</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Feather name="tag" size={16} color={colors.mutedForeground} style={{ marginRight: 6 }} />
                    <TextInput style={[styles.textInput, { color: colors.foreground, flex: 1 }]} placeholder="0" placeholderTextColor={colors.mutedForeground} value={price} onChangeText={setPrice} keyboardType="numeric" />
                  </View>
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Stock</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Feather name="box" size={16} color={colors.mutedForeground} style={{ marginRight: 6 }} />
                    <TextInput style={[styles.textInput, { color: colors.foreground, flex: 1 }]} placeholder="Qty" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
                  </View>
                </View>
              </View>

              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {["Fashion", "Beauty", "Home Decor", "Electronics", "Food", "Other"].map((cat) => (
                    <Pressable key={cat} style={[styles.catPill, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <Text style={[styles.catText, { color: colors.foreground }]}>{cat}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {/* Caption */}
          {activeType !== "product" && activeType !== "live" && (
            <View style={[styles.captionSection, { borderTopColor: colors.border }]}>
              <View style={styles.captionRow}>
                {user && <Image source={{ uri: user.avatar }} style={styles.avatar} />}
                <TextInput
                  style={[styles.captionInput, { color: colors.foreground }]}
                  placeholder={`Write a caption${activeType === "story" ? " for your story..." : "..."}`}
                  placeholderTextColor={colors.mutedForeground}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  maxLength={2200}
                />
              </View>
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{caption.length}/2200</Text>
            </View>
          )}

          {/* Tag products (for posts/reels) */}
          {(activeType === "post" || activeType === "reel") && (
            <View style={[styles.section, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tag Products</Text>
              <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>Let viewers shop directly from your content</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {PRODUCTS.slice(0, 4).map((p) => {
                  const isSelected = selectedProduct === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      style={[styles.tagProductCard, { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedProduct(isSelected ? null : p.id); }}
                    >
                      <Image source={p.image} style={styles.tagProductImage} />
                      <View style={styles.tagProductInfo}>
                        <Text style={[styles.tagProductName, { color: colors.foreground }]} numberOfLines={1}>{p.title}</Text>
                        <Text style={[styles.tagProductPrice, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
                      </View>
                      {isSelected && <View style={[styles.tagCheck, { backgroundColor: colors.primary }]}><Feather name="check" size={12} color="#fff" /></View>}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Settings row */}
          {activeType !== "live" && (
            <View style={[styles.settingsSection, { borderTopColor: colors.border }]}>
              {[
                { icon: "map-pin", label: "Add Location" },
                { icon: "users", label: "Tag People" },
                { icon: "eye", label: "Audience: Everyone" },
              ].map((s) => (
                <Pressable key={s.label} style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                  <Feather name={s.icon as any} size={20} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>{s.label}</Text>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10, gap: 12, borderBottomWidth: 1 },
  closeBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "800" },
  publishBtn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20 },
  publishBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  typeRow: { paddingHorizontal: 8, borderBottomWidth: 1, gap: 4 },
  typeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 12 },
  typeLabel: { fontSize: 14, fontWeight: "600" },
  mediaBox: { margin: 16, borderRadius: 18, padding: 2, borderWidth: 1, overflow: "hidden" },
  mediaInner: { borderRadius: 16, borderWidth: 2, borderStyle: "dashed", alignItems: "center", padding: 40, gap: 10 },
  mediaLabel: { fontSize: 16, fontWeight: "700" },
  mediaHint: { fontSize: 13 },
  uploadBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 8 },
  uploadBtnText: { color: "#fff", fontWeight: "700" },
  section: { padding: 16, gap: 14 },
  livePreview: { height: 200, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 8 },
  livePreviewText: { fontSize: 16, fontWeight: "700" },
  livePreviewHint: { fontSize: 13 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: "600" },
  inputWrap: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5 },
  textInput: { flex: 1, fontSize: 15 },
  priceRow: { flexDirection: "row", gap: 12 },
  productImageBox: { height: 160, borderRadius: 18, borderWidth: 2, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8 },
  catPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 13, fontWeight: "600" },
  captionSection: { borderTopWidth: 1, padding: 16, gap: 8 },
  captionRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  captionInput: { flex: 1, fontSize: 15, lineHeight: 22, minHeight: 80 },
  charCount: { fontSize: 12, textAlign: "right" },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  sectionHint: { fontSize: 13, marginTop: -6 },
  tagProductCard: { width: 140, borderRadius: 12, borderWidth: 1.5, overflow: "hidden", position: "relative" },
  tagProductImage: { width: "100%", height: 90 },
  tagProductInfo: { padding: 8, gap: 2 },
  tagProductName: { fontSize: 12, fontWeight: "600" },
  tagProductPrice: { fontSize: 13, fontWeight: "800" },
  tagCheck: { position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  settingsSection: { borderTopWidth: 1 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  settingLabel: { flex: 1, fontSize: 15 },
});
