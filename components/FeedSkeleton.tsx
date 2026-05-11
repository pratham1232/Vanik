import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

export function FeedSkeleton() {
  const colors = useColors();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderCard = (key: number) => (
    <Animated.View key={key} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, animStyle]}>
      {/* Image skeleton */}
      <View style={[styles.image, { backgroundColor: colors.primary + "20" }]} />
      {/* Body skeleton */}
      <View style={styles.body}>
        <View style={[styles.textLine, { width: "40%", backgroundColor: colors.primary + "15" }]} />
        <View style={[styles.textLine, { width: "80%", backgroundColor: colors.primary + "15", height: 16 }]} />
        <View style={[styles.textLine, { width: "30%", backgroundColor: colors.primary + "15", height: 18, marginTop: 4 }]} />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.grid}>
      {[1, 2, 3, 4, 5, 6].map((i) => renderCard(i))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_W,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
  },
  body: {
    padding: 12,
    gap: 8,
  },
  textLine: {
    height: 12,
    borderRadius: 6,
  },
});
