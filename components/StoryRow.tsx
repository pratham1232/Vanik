import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { STORIES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

function StoryItem({ story, index }: { story: typeof STORIES[number]; index: number }) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
    if (story.isYou) {
      router.push("/add-story");
    } else if (story.storyCount > 0) {
      router.push(`/story/${story.id}`);
    }
  };

  const unseenGradient = !story.seen && !story.isYou;

  return (
    <Pressable onPress={handlePress} style={styles.item}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {/* Gradient ring */}
        <View style={[
          styles.ringOuter,
          unseenGradient
            ? { backgroundColor: colors.primary }
            : { backgroundColor: story.seen ? colors.border : colors.primary + "60" },
        ]}>
          <View style={[styles.ringGap, { backgroundColor: colors.background }]}>
            <Image source={{ uri: story.avatar }} style={styles.avatar} />
            {story.isYou && (
              <View style={[styles.addBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                <Text style={styles.addPlus}>+</Text>
              </View>
            )}
          </View>
        </View>

        {/* Live indicator */}
        {unseenGradient && !story.isYou && (
          <View style={[styles.activeDot, { backgroundColor: colors.online, borderColor: colors.background }]} />
        )}
      </Animated.View>

      <Text style={[styles.name, { color: story.seen ? colors.mutedForeground : colors.foreground }]} numberOfLines={1}>
        {story.isYou ? "Your Story" : story.name}
      </Text>
    </Pressable>
  );
}

export default function StoryRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {STORIES.map((story, i) => (
        <StoryItem key={story.id} story={story} index={i} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { paddingHorizontal: 14, paddingVertical: 10, gap: 14 },
  item:       { alignItems: "center", gap: 6, width: 70 },
  ringOuter:  { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center" },
  ringGap:    { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", padding: 2 },
  avatar:     { width: 60, height: 60, borderRadius: 30 },
  addBadge:   { position: "absolute", bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  addPlus:    { color: "#fff", fontSize: 14, fontWeight: "900", lineHeight: 16 },
  activeDot:  { position: "absolute", bottom: 4, right: 4, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  name:       { fontSize: 11, fontWeight: "500", textAlign: "center" },
});
