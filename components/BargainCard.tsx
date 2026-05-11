import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing, interpolateColor } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Message } from "@/context/ChatContext";
import { formatPrice } from "@/data/mockData";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface BargainCardProps {
  msg: Message;
  isMe: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
}

export default function BargainCard({ msg, isMe, onAccept, onReject, onCounter }: BargainCardProps) {
  const colors = useColors();
  const data = msg.bargainData;
  if (!data) return null;

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getStatusColor = () => {
    switch (data.status) {
      case "accepted": return "#3D8B4E"; // Emerald
      case "rejected": return "#EF4444"; // Red
      case "countered": return "#E07A10"; // Amber
      default: return colors.primary; // Orange
    }
  };

  const statusColor = getStatusColor();
  const discount = Math.round(((data.originalPrice - data.proposedPrice) / data.originalPrice) * 100);

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, animatedStyle]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: statusColor + "15", borderBottomColor: colors.border }]}>
        <Feather name="tag" size={16} color={statusColor} />
        <Text style={[styles.headerText, { color: statusColor }]}>
          {data.status === "pending" && "New Offer"}
          {data.status === "countered" && "Counter Offer"}
          {data.status === "accepted" && "Offer Accepted!"}
          {data.status === "rejected" && "Offer Rejected"}
        </Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Original Price</Text>
            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>{formatPrice(data.originalPrice)}</Text>
          </View>
          <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {data.status === "countered" ? "AI Counter" : "Proposed"}
            </Text>
            <Text style={[styles.proposedPrice, { color: statusColor }]}>
              {formatPrice(data.status === "countered" ? data.counterPrice! : data.proposedPrice)}
            </Text>
          </View>
        </View>

        {/* Progress Bar for Discount */}
        <View style={styles.discountContainer}>
          <View style={styles.discountRow}>
            <Text style={[styles.discountText, { color: colors.foreground }]}>{discount}% Requested Discount</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.muted }]}>
            <Animated.View style={[styles.bar, { width: `${Math.min(discount, 100)}%`, backgroundColor: statusColor }]} />
          </View>
        </View>

        {/* Action Buttons (Only show to the receiver of the offer) */}
        {((isMe && data.status === "countered") || (!isMe && data.status === "pending")) && (
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.rejectBtn, { backgroundColor: "#EF4444" + "15" }]} onPress={onReject}>
              <Feather name="x" size={14} color="#EF4444" />
              <Text style={[styles.btnText, { color: "#EF4444" }]}>Reject</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.counterBtn, { backgroundColor: "#E07A10" + "15" }]} onPress={onCounter}>
              <Feather name="refresh-cw" size={14} color="#E07A10" />
              <Text style={[styles.btnText, { color: "#E07A10" }]}>Counter</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.acceptBtn, { backgroundColor: "#3D8B4E" }]} onPress={onAccept}>
              <Feather name="check" size={14} color="#fff" />
              <Text style={[styles.btnText, { color: "#fff" }]}>Accept</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: {
    padding: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "line-through",
  },
  proposedPrice: {
    fontSize: 18,
    fontWeight: "900",
  },
  discountContainer: {
    marginBottom: 16,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "700",
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 3,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  rejectBtn: {},
  counterBtn: {},
  acceptBtn: {},
  btnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
