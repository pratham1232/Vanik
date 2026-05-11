import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
  withSequence,
  withRepeat,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const EMOJIS = ["🛍️", "⭐", "✨", "🔥", "❤️", "👗"];

const FloatingEmoji = ({ emoji, delay, startX }: { emoji: string; delay: number; startX: number }) => {
  const ty = useSharedValue(height);
  const opacity = useSharedValue(0);
  const rx = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(
      withTiming(0.8, { duration: 500 }),
      withTiming(0, { duration: 2000 })
    ));
    ty.value = withDelay(delay, withTiming(-100, { duration: 3000, easing: Easing.out(Easing.quad) }));
    rx.value = withDelay(delay, withRepeat(withTiming(360, { duration: 4000 }), -1, false));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: ty.value },
      { translateX: Math.sin(ty.value / 100) * 30 },
      { rotate: `${rx.value}deg` }
    ],
    left: startX,
  }));

  return (
    <Animated.Text style={[styles.emoji, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
};

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const colors = useColors();

  // Core Animations
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const introOpacity = useSharedValue(1);
  const introY = useSharedValue(0);
  
  const [typedText, setTypedText] = useState("");
  const fullText = "Your neighbourhood, now open 24/7";

  useEffect(() => {
    // 1. Logo springs in
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 90,
      mass: 1,
    });

    // 2. Typewriter Effect
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40);

    // 3. Exit Animation after 2.5s
    const exitTimer = setTimeout(() => {
      introOpacity.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) });
      introY.value = withTiming(-height * 0.2, { duration: 600, easing: Easing.inOut(Easing.ease) }, () => {
        runOnJS(onFinish)();
      });
    }, 2800); // 2.5s wait + a little buffer for typewriter

    return () => {
      clearInterval(typingInterval);
      clearTimeout(exitTimer);
    };
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: introOpacity.value,
    transform: [{ translateY: introY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <LinearGradient
        colors={["#FFF1E8", "#FFD9B0"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Floating Elements */}
      {EMOJIS.map((emoji, idx) => (
        <FloatingEmoji
          key={idx}
          emoji={emoji}
          delay={300 + idx * 200}
          startX={(width / EMOJIS.length) * idx + 20}
        />
      ))}

      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, animatedLogoStyle]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoV}>V</Text>
          </View>
          <Text style={styles.logoTitle}>Vanik</Text>
        </Animated.View>
        
        <View style={styles.taglineWrap}>
          <Text style={styles.tagline}>{typedText}</Text>
          <View style={styles.cursor} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    position: "absolute",
    fontSize: 28,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF7A2F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7A2F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 16,
  },
  logoV: {
    fontSize: 56,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif",
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#2D1A0E",
    letterSpacing: -1,
    marginBottom: 12,
  },
  taglineWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5C3D2A",
  },
  cursor: {
    width: 2,
    height: 18,
    backgroundColor: "#FF7A2F",
    marginLeft: 4,
    opacity: 0.8,
  },
});
