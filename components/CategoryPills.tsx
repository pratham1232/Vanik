import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { CATEGORIES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface Props {
  onSelect?: (cat: string) => void;
}

export default function CategoryPills({ onSelect }: Props) {
  const colors = useColors();
  const [active, setActive] = useState("All");

  const handleSelect = (cat: string) => {
    setActive(cat);
    onSelect?.(cat);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <Pressable
            key={cat}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? colors.primary : colors.muted,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handleSelect(cat)}
          >
            <Text style={[styles.text, { color: isActive ? "#fff" : colors.mutedForeground }]}>{cat}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25, borderWidth: 1 },
  text: { fontSize: 13, fontWeight: "600" },
});
