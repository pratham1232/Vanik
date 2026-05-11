import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { COMMUNITY_EXPERTS, CATEGORIES } from "@/data/mockData";

export default function CommunityExpertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [applied, setApplied] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Community Experts</Text>
        <Feather name="award" size={20} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {/* Apply Card */}
        <View style={[styles.applyCard, { backgroundColor: colors.card, borderColor: colors.primary + "30" }]}>
          <LinearGradient colors={colors.gradientPrimary as any} style={styles.applyGrad}>
            <Feather name="award" size={28} color="#fff" />
            <Text style={styles.applyTitle}>Become a Category Expert</Text>
            <Text style={styles.applySub}>Make 10+ purchases in a category to qualify. Earn badges, priority reviews, and affiliate commissions!</Text>
          </LinearGradient>
          {!applied ? (
            <Pressable style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setApplied(true); }}>
              <Text style={styles.applyBtnText}>Apply Now</Text>
            </Pressable>
          ) : (
            <View style={[styles.appliedBadge, { backgroundColor: colors.success + "15" }]}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={[styles.appliedText, { color: colors.success }]}>Application Submitted!</Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Experts</Text>
        {COMMUNITY_EXPERTS.map(expert => (
          <View key={expert.id} style={[styles.expertCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.expertRow}>
              <Image source={{ uri: expert.avatar }} style={styles.expertAvatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={[styles.expertName, { color: colors.foreground }]}>{expert.name}</Text>
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Feather name="award" size={10} color="#fff" />
                    <Text style={styles.badgeText}>{expert.badge}</Text>
                  </View>
                </View>
                <Text style={[styles.expertMeta, { color: colors.mutedForeground }]}>
                  {expert.purchases} purchases • {expert.category}
                </Text>
              </View>
            </View>
            <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.primary }]}>₹{expert.commissionEarned.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Earned</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{expert.purchases}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Purchases</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{expert.category}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Category</Text>
              </View>
            </View>
          </View>
        ))}
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
  applyCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  applyGrad: { padding: 24, alignItems: "center", gap: 8 },
  applyTitle: { color: "#fff", fontSize: 18, fontWeight: "900", textAlign: "center" },
  applySub: { color: "rgba(255,255,255,0.85)", fontSize: 13, textAlign: "center", lineHeight: 20 },
  applyBtn: { margin: 16, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  appliedBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, margin: 16, paddingVertical: 14, borderRadius: 14 },
  appliedText: { fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  expertCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  expertRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  expertAvatar: { width: 48, height: 48, borderRadius: 24 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  expertName: { fontSize: 16, fontWeight: "800" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  expertMeta: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  statsRow: { flexDirection: "row", paddingTop: 12, borderTopWidth: 1, gap: 8 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 14, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "600" },
});
