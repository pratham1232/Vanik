import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SELLERS, SELLER_SCORES } from "@/data/mockData";

function ScoreRing({ score, size, colors }: { score: number; size: number; colors: any }) {
  const color = score >= 90 ? colors.success : score >= 75 ? colors.primary : score >= 60 ? colors.warning : colors.destructive;
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color, borderWidth: 3 }]}>
      <Text style={[styles.ringScore, { color, fontSize: size / 3 }]}>{score}</Text>
    </View>
  );
}

export default function SellerReputationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Seller Trust Scores</Text>
        <Feather name="shield" size={20} color={colors.primary} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {SELLERS.map(seller => {
          const scores = SELLER_SCORES[seller.id];
          if (!scores) return null;
          return (
            <View key={seller.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.topRow}>
                <Image source={{ uri: seller.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: colors.foreground }]}>{seller.name}</Text>
                    {seller.verified && <Feather name="check-circle" size={14} color={colors.primary} />}
                  </View>
                  <Text style={[styles.category, { color: colors.mutedForeground }]}>{seller.category} • {seller.followers} followers</Text>
                </View>
                <ScoreRing score={scores.score} size={54} colors={colors} />
              </View>
              {/* Metrics */}
              <View style={styles.metricsGrid}>
                {[
                  { icon: "truck", label: "On-Time", value: `${scores.onTimeRate}%` },
                  { icon: "star", label: "Avg Rating", value: `${scores.avgStars}★` },
                  { icon: "message-circle", label: "Response", value: scores.responseTime },
                  { icon: "alert-triangle", label: "Disputes", value: `${scores.disputeRate}%` },
                ].map(m => (
                  <View key={m.label} style={[styles.metricItem, { backgroundColor: colors.surface }]}>
                    <Feather name={m.icon as any} size={14} color={colors.primary} />
                    <Text style={[styles.metricValue, { color: colors.foreground }]}>{m.value}</Text>
                    <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "900" },
  list: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 14 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 16, fontWeight: "800" },
  category: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  ring: { alignItems: "center", justifyContent: "center" },
  ringScore: { fontWeight: "900" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metricItem: { flex: 1, minWidth: "45%", padding: 12, borderRadius: 12, alignItems: "center", gap: 4 },
  metricValue: { fontSize: 15, fontWeight: "800" },
  metricLabel: { fontSize: 10, fontWeight: "600" },
});
