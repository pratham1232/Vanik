import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { formatCount, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function PostCard({ post, product }: { post: any; product: any }) {
  const colors = useColors();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    heartScale.value = withSpring(1.4, {}, () => { heartScale.value = withSpring(1); });
    setLiked((prev) => {
      setLikes((l: number) => l + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Pressable style={styles.sellerRow} onPress={() => {}}>
          <Image source={{ uri: post.sellerAvatar }} style={styles.avatar} />
          <View>
            <Text style={[styles.sellerName, { color: colors.foreground }]}>{post.sellerName}</Text>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>{post.time}</Text>
          </View>
        </Pressable>
        <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
      </View>

      <Pressable onPress={() => router.push({ pathname: "/product/[id]", params: { id: post.productId } })}>
        <Image source={post.image} style={styles.postImage} resizeMode="cover" />
      </Pressable>

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <Pressable onPress={handleLike} style={styles.actionBtn}>
            <Animated.View style={heartStyle}>
              <Feather name="heart" size={22} color={liked ? colors.live : colors.foreground} />
            </Animated.View>
            <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>{formatCount(likes)}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Feather name="message-circle" size={22} color={colors.foreground} />
            <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>{formatCount(post.comments)}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Feather name="send" size={22} color={colors.foreground} />
          </Pressable>
        </View>
        <Feather name="bookmark" size={22} color={colors.foreground} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.caption, { color: colors.foreground }]}>
          <Text style={{ fontWeight: "700" }}>{post.sellerName} </Text>
          {post.caption}
        </Text>

        {product && (
          <Pressable
            style={[styles.productTag, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
          >
            <Image source={product.image} style={styles.productThumb} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>{product.title}</Text>
              <Text style={[styles.productPrice, { color: colors.primary }]}>{formatPrice(product.price)}</Text>
            </View>
            <Feather name="shopping-bag" size={16} color={colors.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, borderTopWidth: 1, borderBottomWidth: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  sellerName: { fontSize: 14, fontWeight: "700" },
  time: { fontSize: 12 },
  postImage: { width: "100%", height: 340 },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10 },
  leftActions: { flexDirection: "row", gap: 18 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionCount: { fontSize: 13 },
  body: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  caption: { fontSize: 14, lineHeight: 20 },
  productTag: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, borderWidth: 1 },
  productThumb: { width: 44, height: 44, borderRadius: 8 },
  productName: { fontSize: 13, fontWeight: "600" },
  productPrice: { fontSize: 13, fontWeight: "700" },
});
