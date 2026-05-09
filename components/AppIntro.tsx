import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

export default function AppIntro({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const bgOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Scale logo in and fade in
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // 2. Wait a bit, then fade out the whole overlay
      setTimeout(() => {
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
          onFinish();
        });
      }, 1200);
    });
  }, []);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      <LinearGradient colors={["#1E0A3C", "#000000"]} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.logoWrap, { transform: [{ scale }, { translateY: slideUp }], opacity }]}>
        <View style={styles.vBadge}>
          <Text style={styles.vText}>V</Text>
        </View>
        <Text style={styles.logoText}>anik</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity }]}>
        Social Commerce Reimagined
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  vBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  vText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
  },
  logoText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
  },
  tagline: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
