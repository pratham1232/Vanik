import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const ADDRESSES = [
  { id: "a1", name: "Home", line: "42 MG Road, Koramangala", city: "Bangalore, KA 560034", default: true },
  { id: "a2", name: "Work", line: "WeWork Embassy, Brigade", city: "Bangalore, KA 560025", default: false },
];

const PAYMENT_METHODS = [
  { id: "pm1", label: "UPI",         sub: "GooglePay, PhonePe, Paytm",   icon: "smartphone" },
  { id: "pm2", label: "Credit/Debit",sub: "Visa, Mastercard, RuPay",     icon: "credit-card" },
  { id: "pm3", label: "Net Banking", sub: "All major banks supported",    icon: "globe"       },
  { id: "pm4", label: "Cash on Delivery", sub: "Pay when delivered",     icon: "truck"       },
];

const COUPONS: Record<string, number> = { VANIK10: 10, FIRST20: 20, SAVE50: 50 };

const STEPS = ["Cart", "Address", "Payment", "Review"];

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("a1");
  const [selectedPayment, setSelectedPayment] = useState("pm1");
  const [checkedOut, setCheckedOut] = useState(false);
  const successScale = useSharedValue(0.5);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const discount = appliedCoupon ? COUPONS[appliedCoupon] ?? 0 : 0;
  const discountAmount = Math.round(total * discount / 100);
  const finalTotal = total - discountAmount;

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponError("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setCouponError("Invalid coupon code");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCheckout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCheckedOut(true);
    successScale.value = withSequence(withSpring(1.2), withSpring(1));
    setTimeout(() => {
      clearCart();
      setCheckedOut(false);
      setStep(0);
      router.push("/orders" as any);
    }, 2200);
  };

  const successStyle = useAnimatedStyle(() => ({ transform: [{ scale: successScale.value }] }));

  if (checkedOut) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successState}>
          <Animated.View style={[styles.successRing, { borderColor: colors.primary, backgroundColor: colors.primary + "20" }, successStyle]}>
            <Feather name="check" size={52} color={colors.primary} />
          </Animated.View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Order Placed! 🎉</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your order has been confirmed.{"\n"}Redirecting to order tracking…
          </Text>
          <View style={[styles.successOrderId, { backgroundColor: colors.muted }]}>
            <Feather name="package" size={14} color={colors.primary} />
            <Text style={[styles.successOrderIdText, { color: colors.foreground }]}>Order #VNK-{Math.floor(Math.random() * 9000) + 1000}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{STEPS[step]}</Text>
        {items.length > 0 && step === 0 && (
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert("Clear Cart?", "Remove all items?", [{ text: "Cancel" }, { text: "Clear", onPress: clearCart, style: "destructive" }]); }}>
            <Text style={[styles.clearBtn, { color: colors.live }]}>Clear</Text>
          </Pressable>
        )}
        {step === 0 && (
          <View style={[styles.itemCount, { backgroundColor: colors.primary }]}>
            <Text style={styles.itemCountText}>{items.reduce((s, i) => s + i.quantity, 0)}</Text>
          </View>
        )}
      </View>

      {/* Stepper */}
      <View style={[styles.stepper, { borderBottomColor: colors.border }]}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <Pressable style={styles.stepItem} onPress={() => i < step && setStep(i)}>
              <View style={[styles.stepCircle, {
                backgroundColor: i <= step ? colors.primary : colors.muted,
                borderColor: i <= step ? colors.primary : colors.border,
              }]}>
                {i < step ? (
                  <Feather name="check" size={12} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, { color: i === step ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, { color: i === step ? colors.primary : colors.mutedForeground, fontWeight: i === step ? "700" : "400" }]}>{s}</Text>
            </Pressable>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: i < step ? colors.primary : colors.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {items.length === 0 && step === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="shopping-cart" size={44} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Add products from the home feed or explore tab</Text>
          <Pressable style={[styles.shopBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Feather name="shopping-bag" size={16} color="#fff" />
            <Text style={styles.shopBtnText}>Continue Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 110 }}>
            {/* STEP 0: Cart Items */}
            {step === 0 && (
              <View style={{ padding: 14, gap: 12 }}>
                {items.map((item) => (
                  <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Pressable onPress={() => router.push(`/product/${item.id}`)}>
                      <Image source={item.image} style={styles.itemImg} resizeMode="cover" />
                    </Pressable>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
                      <Text style={[styles.itemSeller, { color: colors.mutedForeground }]}>by {item.sellerName}</Text>
                      <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatPrice(item.price)}</Text>
                      <View style={styles.qtyRow}>
                        <Pressable style={[styles.qtyBtn, { backgroundColor: colors.muted }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQty(item.id, item.quantity - 1); }}>
                          <Feather name="minus" size={13} color={colors.foreground} />
                        </Pressable>
                        <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.quantity}</Text>
                        <Pressable style={[styles.qtyBtn, { backgroundColor: colors.muted }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQty(item.id, item.quantity + 1); }}>
                          <Feather name="plus" size={13} color={colors.foreground} />
                        </Pressable>
                        <Text style={[styles.itemSubtotal, { color: colors.mutedForeground }]}>= {formatPrice(item.price * item.quantity)}</Text>
                      </View>
                    </View>
                    <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeItem(item.id); }}>
                      <Feather name="trash-2" size={18} color={colors.live} />
                    </Pressable>
                  </View>
                ))}

                {/* Coupon */}
                <View style={[styles.couponCard, { backgroundColor: colors.card, borderColor: appliedCoupon ? colors.online : colors.border }]}>
                  <Feather name="tag" size={18} color={appliedCoupon ? colors.online : colors.primary} />
                  {appliedCoupon ? (
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.couponApplied, { color: colors.online }]}>"{appliedCoupon}" applied — {discount}% off!</Text>
                      <Text style={[styles.couponSaved, { color: colors.online }]}>You save {formatPrice(discountAmount)}</Text>
                    </View>
                  ) : (
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <TextInput
                        style={[styles.couponInput, { color: colors.foreground }]}
                        placeholder="Enter coupon code"
                        placeholderTextColor={colors.mutedForeground}
                        value={couponInput}
                        onChangeText={(t) => { setCouponInput(t); setCouponError(""); }}
                        autoCapitalize="characters"
                      />
                      <Pressable style={[styles.applyBtn, { backgroundColor: colors.primary }]} onPress={handleApplyCoupon}>
                        <Text style={styles.applyBtnText}>Apply</Text>
                      </Pressable>
                    </View>
                  )}
                  {appliedCoupon && (
                    <Pressable onPress={() => { setAppliedCoupon(null); setCouponInput(""); }}>
                      <Feather name="x" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  )}
                </View>
                {couponError ? <Text style={[styles.couponError, { color: colors.live }]}>{couponError}</Text> : null}
                <Text style={[styles.couponHint, { color: colors.mutedForeground }]}>Try: VANIK10, FIRST20, SAVE50</Text>

                {/* Summary */}
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Price Details</Text>
                  {[
                    { label: "Price",     value: formatPrice(total),           color: colors.foreground },
                    { label: "Discount",  value: appliedCoupon ? `-${formatPrice(discountAmount)}` : "—", color: appliedCoupon ? colors.online : colors.mutedForeground },
                    { label: "Shipping",  value: "FREE",                       color: colors.online     },
                    { label: "Platform",  value: "₹0",                         color: colors.foreground },
                  ].map((row) => (
                    <View key={row.label} style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                      <Text style={[styles.summaryValue, { color: row.color }]}>{row.value}</Text>
                    </View>
                  ))}
                  <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Amount</Text>
                    <Text style={[styles.totalValue, { color: colors.foreground }]}>{formatPrice(finalTotal)}</Text>
                  </View>
                  {appliedCoupon && (
                    <Text style={[styles.savingsBanner, { color: colors.online }]}>🎉 You're saving {formatPrice(discountAmount)} on this order!</Text>
                  )}
                </View>
              </View>
            )}

            {/* STEP 1: Address */}
            {step === 1 && (
              <View style={{ padding: 14, gap: 12 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Deliver To</Text>
                {ADDRESSES.map((addr) => (
                  <Pressable
                    key={addr.id}
                    style={[styles.addressCard, { backgroundColor: colors.card, borderColor: selectedAddress === addr.id ? colors.primary : colors.border, borderWidth: selectedAddress === addr.id ? 2 : 1 }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedAddress(addr.id); }}
                  >
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={styles.addrNameRow}>
                        <View style={[styles.addrTag, { backgroundColor: selectedAddress === addr.id ? colors.primary : colors.muted }]}>
                          <Text style={[styles.addrTagText, { color: selectedAddress === addr.id ? "#fff" : colors.mutedForeground }]}>{addr.name}</Text>
                        </View>
                        {addr.default && <Text style={[styles.defaultBadge, { color: colors.primary }]}>Default</Text>}
                      </View>
                      <Text style={[styles.addrLine, { color: colors.foreground }]}>{addr.line}</Text>
                      <Text style={[styles.addrCity, { color: colors.mutedForeground }]}>{addr.city}</Text>
                    </View>
                    <View style={[styles.radioOuter, { borderColor: selectedAddress === addr.id ? colors.primary : colors.border }]}>
                      {selectedAddress === addr.id && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                    </View>
                  </Pressable>
                ))}
                <Pressable style={[styles.addAddrBtn, { borderColor: colors.primary, backgroundColor: colors.primary + "10" }]}>
                  <Feather name="plus" size={16} color={colors.primary} />
                  <Text style={[styles.addAddrText, { color: colors.primary }]}>Add New Address</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 2: Payment */}
            {step === 2 && (
              <View style={{ padding: 14, gap: 12 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
                {PAYMENT_METHODS.map((pm) => (
                  <Pressable
                    key={pm.id}
                    style={[styles.pmCard, { backgroundColor: colors.card, borderColor: selectedPayment === pm.id ? colors.primary : colors.border, borderWidth: selectedPayment === pm.id ? 2 : 1 }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedPayment(pm.id); }}
                  >
                    <View style={[styles.pmIcon, { backgroundColor: selectedPayment === pm.id ? colors.primary : colors.muted }]}>
                      <Feather name={pm.icon as any} size={18} color={selectedPayment === pm.id ? "#fff" : colors.mutedForeground} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pmLabel, { color: colors.foreground }]}>{pm.label}</Text>
                      <Text style={[styles.pmSub, { color: colors.mutedForeground }]}>{pm.sub}</Text>
                    </View>
                    <View style={[styles.radioOuter, { borderColor: selectedPayment === pm.id ? colors.primary : colors.border }]}>
                      {selectedPayment === pm.id && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <View style={{ padding: 14, gap: 12 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Review</Text>
                {/* Items */}
                <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.reviewCardTitle, { color: colors.mutedForeground }]}>ITEMS ({items.reduce((s, i) => s + i.quantity, 0)})</Text>
                  {items.map((item) => (
                    <View key={item.id} style={[styles.reviewItemRow, { borderTopColor: colors.border }]}>
                      <Image source={item.image} style={styles.reviewItemImg} resizeMode="cover" />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reviewItemName, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.reviewItemQty, { color: colors.mutedForeground }]}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={[styles.reviewItemPrice, { color: colors.primary }]}>{formatPrice(item.price * item.quantity)}</Text>
                    </View>
                  ))}
                </View>
                {/* Address */}
                <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.reviewCardTitle, { color: colors.mutedForeground }]}>DELIVERY ADDRESS</Text>
                  {ADDRESSES.filter((a) => a.id === selectedAddress).map((a) => (
                    <View key={a.id} style={{ gap: 2, marginTop: 8 }}>
                      <Text style={[styles.reviewDetail, { color: colors.foreground, fontWeight: "700" }]}>{a.name}</Text>
                      <Text style={[styles.reviewDetail, { color: colors.mutedForeground }]}>{a.line}</Text>
                      <Text style={[styles.reviewDetail, { color: colors.mutedForeground }]}>{a.city}</Text>
                    </View>
                  ))}
                </View>
                {/* Payment */}
                <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.reviewCardTitle, { color: colors.mutedForeground }]}>PAYMENT METHOD</Text>
                  {PAYMENT_METHODS.filter((p) => p.id === selectedPayment).map((p) => (
                    <View key={p.id} style={[styles.reviewPayRow, { marginTop: 8 }]}>
                      <View style={[styles.pmIcon, { backgroundColor: colors.primary }]}>
                        <Feather name={p.icon as any} size={16} color="#fff" />
                      </View>
                      <Text style={[styles.reviewDetail, { color: colors.foreground, fontWeight: "700" }]}>{p.label}</Text>
                    </View>
                  ))}
                </View>
                {/* Total */}
                <View style={[styles.reviewCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                  <View style={[styles.totalRow, { borderTopWidth: 0 }]}>
                    <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Payable</Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(finalTotal)}</Text>
                  </View>
                  {appliedCoupon && (
                    <Text style={[styles.savingsBanner, { color: colors.online }]}>Coupon "{appliedCoupon}" saves you {formatPrice(discountAmount)}</Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom action */}
          <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: bottomPad + 10 }]}>
            <View>
              <Text style={[styles.bottomTotal, { color: colors.foreground }]}>{formatPrice(finalTotal)}</Text>
              <Text style={[styles.bottomItems, { color: colors.mutedForeground }]}>{items.reduce((s, i) => s + i.quantity, 0)} items{appliedCoupon ? ` • ${discount}% off` : ""}</Text>
            </View>
            <Pressable
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (step < 3) setStep(step + 1);
                else handleCheckout();
              }}
            >
              <Text style={styles.nextBtnText}>{step < 3 ? "Continue" : "Place Order"}</Text>
              <Feather name={step < 3 ? "arrow-right" : "check"} size={18} color="#fff" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1 },
  header:            { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10, gap: 12, borderBottomWidth: 1 },
  backBtn:           { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle:       { flex: 1, fontSize: 20, fontWeight: "800" },
  clearBtn:          { fontSize: 14, fontWeight: "600" },
  itemCount:         { minWidth: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  itemCountText:     { color: "#fff", fontSize: 11, fontWeight: "700" },
  stepper:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  stepItem:          { alignItems: "center", gap: 4 },
  stepCircle:        { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  stepNum:           { fontSize: 12, fontWeight: "700" },
  stepLabel:         { fontSize: 10 },
  stepLine:          { flex: 1, height: 2, marginBottom: 12, borderRadius: 1 },
  emptyState:        { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 40 },
  emptyIcon:         { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  emptyTitle:        { fontSize: 20, fontWeight: "800" },
  emptySub:          { fontSize: 14, textAlign: "center", lineHeight: 20 },
  shopBtn:           { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 28 },
  shopBtnText:       { color: "#fff", fontSize: 15, fontWeight: "700" },
  cartItem:          { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  itemImg:           { width: 88, height: 88, borderRadius: 12 },
  itemInfo:          { flex: 1, gap: 4 },
  itemTitle:         { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  itemSeller:        { fontSize: 12 },
  itemPrice:         { fontSize: 16, fontWeight: "800" },
  qtyRow:            { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  qtyBtn:            { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  qtyText:           { fontSize: 16, fontWeight: "700", minWidth: 24, textAlign: "center" },
  itemSubtotal:      { fontSize: 12, marginLeft: 4 },
  couponCard:        { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  couponApplied:     { fontSize: 14, fontWeight: "700" },
  couponSaved:       { fontSize: 12 },
  couponInput:       { flex: 1, fontSize: 14 },
  applyBtn:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  applyBtnText:      { color: "#fff", fontWeight: "700", fontSize: 13 },
  couponError:       { fontSize: 12, paddingHorizontal: 4, marginTop: -4 },
  couponHint:        { fontSize: 11, paddingHorizontal: 4 },
  summaryCard:       { padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  summaryTitle:      { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  summaryRow:        { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel:      { fontSize: 14 },
  summaryValue:      { fontSize: 14, fontWeight: "600" },
  totalRow:          { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1 },
  totalLabel:        { fontSize: 16, fontWeight: "700" },
  totalValue:        { fontSize: 20, fontWeight: "900" },
  savingsBanner:     { fontSize: 13, fontWeight: "600", marginTop: 6 },
  sectionTitle:      { fontSize: 17, fontWeight: "800" },
  addressCard:       { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 16 },
  addrNameRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  addrTag:           { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  addrTagText:       { fontSize: 11, fontWeight: "700" },
  defaultBadge:      { fontSize: 11, fontWeight: "600" },
  addrLine:          { fontSize: 14, fontWeight: "600" },
  addrCity:          { fontSize: 13 },
  radioOuter:        { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner:        { width: 12, height: 12, borderRadius: 6 },
  addAddrBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed" },
  addAddrText:       { fontSize: 14, fontWeight: "700" },
  pmCard:            { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16 },
  pmIcon:            { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  pmLabel:           { fontSize: 15, fontWeight: "700" },
  pmSub:             { fontSize: 12, marginTop: 2 },
  reviewCard:        { padding: 14, borderRadius: 16, borderWidth: 1, gap: 0 },
  reviewCardTitle:   { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  reviewItemRow:     { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10, borderTopWidth: 1, marginTop: 10 },
  reviewItemImg:     { width: 46, height: 46, borderRadius: 10 },
  reviewItemName:    { fontSize: 13, fontWeight: "600" },
  reviewItemQty:     { fontSize: 12 },
  reviewItemPrice:   { fontSize: 14, fontWeight: "800" },
  reviewDetail:      { fontSize: 14 },
  reviewPayRow:      { flexDirection: "row", alignItems: "center", gap: 10 },
  bottomBar:         { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1 },
  bottomTotal:       { fontSize: 20, fontWeight: "900" },
  bottomItems:       { fontSize: 12, marginTop: 2 },
  nextBtn:           { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 28 },
  nextBtnText:       { color: "#fff", fontSize: 15, fontWeight: "800" },
  successState:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 18, paddingHorizontal: 30 },
  successRing:       { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", borderWidth: 3 },
  successTitle:      { fontSize: 28, fontWeight: "900" },
  successSub:        { fontSize: 15, textAlign: "center", lineHeight: 22 },
  successOrderId:    { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
  successOrderIdText:{ fontSize: 14, fontWeight: "700" },
});
