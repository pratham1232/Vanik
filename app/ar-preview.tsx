import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PRODUCTS, formatPrice } from "@/data/mockData";

export default function ARPreviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [arActive, setArActive] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>AR Try-On</Text>
        <View style={[styles.arBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.arBadgeText}>AR</Text>
        </View>
      </View>

      {/* AR Camera Area */}
      <View style={[styles.cameraArea, { backgroundColor: colors.muted }]}>
        {arActive ? (
          <View style={styles.arView}>
            <LinearGradient colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.6)"]} style={StyleSheet.absoluteFill} />
            <Image source={selectedProduct.image} style={styles.arProductOverlay} />
            <View style={styles.arCorners}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={[styles.corner, {
                  top: i < 2 ? 0 : undefined, bottom: i >= 2 ? 0 : undefined,
                  left: i % 2 === 0 ? 0 : undefined, right: i % 2 === 1 ? 0 : undefined,
                  borderTopWidth: i < 2 ? 3 : 0, borderBottomWidth: i >= 2 ? 3 : 0,
                  borderLeftWidth: i % 2 === 0 ? 3 : 0, borderRightWidth: i % 2 === 1 ? 3 : 0,
                  borderColor: colors.primary,
                }]} />
              ))}
            </View>
            <View style={[styles.arTag, { backgroundColor: colors.primary }]}>
              <Feather name="box" size={12} color="#fff" />
              <Text style={styles.arTagText}>{selectedProduct.title}</Text>
            </View>
            <View style={[styles.arActions, { paddingBottom: 20 }]}>
              <Pressable style={[styles.arActionBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]} onPress={() => setArActive(false)}>
                <Feather name="x" size={20} color="#fff" />
              </Pressable>
              <Pressable style={[styles.arCaptureBtn, { borderColor: colors.primary }]}>
                <View style={[styles.arCaptureInner, { backgroundColor: colors.primary }]} />
              </Pressable>
              <Pressable style={[styles.arActionBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
                <Feather name="refresh-cw" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.previewPlaceholder}>
            <Feather name="camera" size={48} color={colors.mutedForeground} />
            <Text style={[styles.previewText, { color: colors.mutedForeground }]}>Select a product to start AR preview</Text>
            <Pressable
              style={[styles.startBtn, { backgroundColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setArActive(true); }}
            >
              <Feather name="camera" size={16} color="#fff" />
              <Text style={styles.startText}>Open Camera</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Product Selector */}
      <View style={styles.selectorSection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose a Product</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsRow}>
          {PRODUCTS.map(p => (
            <Pressable key={p.id}
              style={[styles.productThumb, {
                borderColor: selectedProduct.id === p.id ? colors.primary : colors.border,
                borderWidth: selectedProduct.id === p.id ? 2 : 1,
                backgroundColor: colors.card,
              }]}
              onPress={() => { setSelectedProduct(p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Image source={p.image} style={styles.thumbImg} />
              <Text style={[styles.thumbTitle, { color: colors.foreground }]} numberOfLines={1}>{p.title}</Text>
              <Text style={[styles.thumbPrice, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "900" },
  arBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  arBadgeText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  cameraArea: { flex: 1, margin: 16, borderRadius: 24, overflow: "hidden" },
  previewPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  previewText: { fontSize: 14, fontWeight: "600" },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20 },
  startText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  arView: { flex: 1, alignItems: "center", justifyContent: "center" },
  arProductOverlay: { width: 150, height: 150, borderRadius: 20, opacity: 0.85 },
  arCorners: { position: "absolute", width: 200, height: 200, top: "30%" },
  corner: { position: "absolute", width: 30, height: 30 },
  arTag: { position: "absolute", bottom: 100, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  arTagText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  arActions: { position: "absolute", bottom: 20, flexDirection: "row", alignItems: "center", gap: 24 },
  arActionBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  arCaptureBtn: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  arCaptureInner: { width: 50, height: 50, borderRadius: 25 },
  selectorSection: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  productsRow: { gap: 12 },
  productThumb: { width: 120, borderRadius: 16, padding: 10, gap: 6 },
  thumbImg: { width: 100, height: 80, borderRadius: 12, alignSelf: "center" },
  thumbTitle: { fontSize: 11, fontWeight: "700" },
  thumbPrice: { fontSize: 13, fontWeight: "800" },
});
