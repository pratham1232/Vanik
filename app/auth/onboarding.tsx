import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "video",
    title: "Live Commerce",
    subtitle: "Watch and shop from live sessions by local sellers in real time.",
    color: "#FF3B5C",
    bg: "#FF3B5C18",
  },
  {
    id: "2",
    icon: "film",
    title: "Social Feed & Reels",
    subtitle: "Discover products through short videos, stories and posts from sellers you love.",
    color: "#8B5CF6",
    bg: "#8B5CF618",
  },
  {
    id: "3",
    icon: "cpu",
    title: "AI-Powered Discovery",
    subtitle: "Get personalised product recommendations based on your taste and behaviour.",
    color: "#EC4899",
    bg: "#EC489918",
  },
  {
    id: "4",
    icon: "shield",
    title: "Safe & Trusted",
    subtitle: "Verified sellers, secure payments, and buyer protection on every order.",
    color: "#10B981",
    bg: "#10B98118",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      flatRef.current?.scrollToIndex({ index: next });
      setIndex(next);
    } else {
      router.replace("/auth/login");
    }
  };

  const handleSkip = () => {
    router.replace("/auth/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo */}
      <View style={[styles.top, { paddingTop: topPad + 20 }]}>
        <Text style={[styles.logo, { color: colors.foreground }]}>
          <Text style={{ color: colors.primary }}>V</Text>ANIK
        </Text>
        <Pressable onPress={handleSkip}>
          <Text style={[styles.skip, { color: colors.mutedForeground }]}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
              <Feather name={item.icon as any} size={64} color={item.color} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.slideSubtitle, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? colors.primary : colors.border,
                width: i === index ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={[styles.bottom, { paddingBottom: bottomPad + 24 }]}>
        <Pressable
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {index === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Feather name={index === SLIDES.length - 1 ? "check" : "arrow-right"} size={18} color="#fff" />
        </Pressable>

        {index === SLIDES.length - 1 && (
          <Pressable onPress={() => router.replace("/auth/register")}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>
              New here? Create an account
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 8 },
  logo: { fontSize: 26, fontWeight: "900", letterSpacing: 3 },
  skip: { fontSize: 15, fontWeight: "600" },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36, gap: 20 },
  iconCircle: { width: 150, height: 150, borderRadius: 75, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  slideTitle: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  slideSubtitle: { fontSize: 16, lineHeight: 26, textAlign: "center" },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 20 },
  dot: { height: 8, borderRadius: 4 },
  bottom: { paddingHorizontal: 24, gap: 16, alignItems: "center" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16, width: "100%" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  registerLink: { fontSize: 14, fontWeight: "700" },
});
