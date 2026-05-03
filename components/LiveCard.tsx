import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Image, Pressable, StyleSheet, Text, View, Animated } from "react-native";
import { formatCount } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface LiveCardProps {
  session: any;
  featured?: boolean;
}

export default function LiveCard({ session, featured = false }: LiveCardProps) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (featured) {
    return (
      <Pressable
        style={styles.featured}
        onPress={() => router.push({ pathname: "/live/[id]", params: { id: session.id } })}
      >
        <Image source={session.thumbnail} style={styles.featuredImage} resizeMode="cover" />
        <View style={styles.featuredOverlay}>
          <View style={styles.topRow}>
            <View style={[styles.liveBadge, { backgroundColor: colors.live }]}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.viewers}>
              <Feather name="eye" size={12} color="#fff" />
              <Text style={styles.viewerText}>{formatCount(session.viewerCount)}</Text>
            </View>
          </View>
          <View style={styles.featuredBottom}>
            <Text style={styles.featuredTitle}>{session.title}</Text>
            <Text style={styles.featuredSeller}>by {session.sellerName}</Text>
            <Pressable
              style={[styles.watchBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push({ pathname: "/live/[id]", params: { id: session.id } })}
            >
              <Feather name="play-circle" size={14} color="#fff" />
              <Text style={styles.watchBtnText}>Watch Live</Text>
            </Pressable>
          </View>
          <View style={styles.chatRow}>
            {[{ name: "Anita", msg: "Love this!" }, { name: "Riya", msg: "Do you have this in blue?" }].map((c, i) => (
              <View key={i} style={styles.chatBubble}>
                <Text style={styles.chatName}>{c.name} </Text>
                <Text style={styles.chatMsg}>{c.msg}</Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push({ pathname: "/live/[id]", params: { id: session.id } })}
    >
      <View style={styles.cardImageWrap}>
        <Image source={session.thumbnail} style={styles.cardImage} resizeMode="cover" />
        <View style={[styles.liveBadge, styles.cardBadge, { backgroundColor: colors.live }]}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={[styles.viewers, styles.cardViewers]}>
          <Feather name="eye" size={10} color="#fff" />
          <Text style={[styles.viewerText, { fontSize: 10 }]}>{formatCount(session.viewerCount)}</Text>
        </View>
      </View>
      <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>{session.title}</Text>
      <Text style={[styles.cardSeller, { color: colors.mutedForeground }]}>{session.sellerName}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featured: { marginHorizontal: 16, borderRadius: 20, overflow: "hidden", height: 380 },
  featuredImage: { width: "100%", height: "100%", position: "absolute" },
  featuredOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", padding: 16, justifyContent: "space-between" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  liveBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontWeight: "800", fontSize: 11 },
  viewers: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  viewerText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  featuredBottom: { gap: 6 },
  featuredTitle: { color: "#fff", fontSize: 22, fontWeight: "800", lineHeight: 28 },
  featuredSeller: { color: "rgba(255,255,255,0.75)", fontSize: 14 },
  watchBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, marginTop: 4 },
  watchBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  chatRow: { gap: 6 },
  chatBubble: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  chatName: { color: "#A855F7", fontWeight: "700", fontSize: 12 },
  chatMsg: { color: "#fff", fontSize: 12 },
  card: { width: 140, borderRadius: 14, overflow: "hidden", marginRight: 12 },
  cardImageWrap: { position: "relative" },
  cardImage: { width: 140, height: 110 },
  cardBadge: { position: "absolute", top: 6, left: 6 },
  cardViewers: { position: "absolute", top: 6, right: 6 },
  cardTitle: { fontSize: 12, fontWeight: "600", padding: 8, paddingBottom: 4 },
  cardSeller: { fontSize: 11, paddingHorizontal: 8, paddingBottom: 8 },
});
