import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type UserRole, useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const ROLES: Array<{ value: UserRole; label: string; icon: string; desc: string }> = [
  { value: "buyer", label: "Buyer", icon: "shopping-bag", desc: "Discover & buy from local sellers" },
  { value: "seller", label: "Seller", icon: "package", desc: "Sell products via live & social" },
];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register, loginWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const validateStep1 = () => {
    if (!name.trim()) return "Please enter your name";
    if (!email.trim() || !email.includes("@")) return "Please enter a valid email";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPw) return "Passwords do not match";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    btnScale.value = withSpring(0.95, {}, () => { btnScale.value = withSpring(1); });
    setLoading(true);
    setError("");
    const result = await register(name.trim(), email.trim(), password, role);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Registration failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    }
  };

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError("");
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } else {
      setError(res.error || "Google login failed");
      shake();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={[styles.header, { paddingTop: topPad + 16 }]}>
            <Pressable style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => step === 2 ? setStep(1) : router.back()}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </Pressable>
            {/* Step indicator */}
            <View style={styles.steps}>
              {[1, 2].map((s) => (
                <View key={s} style={[styles.stepDot, { backgroundColor: s <= step ? colors.primary : colors.border, width: s === step ? 24 : 8 }]} />
              ))}
            </View>
          </View>

          <View style={styles.content}>
            <Text style={[styles.logo, { color: colors.foreground }]}>
              <Text style={{ color: colors.primary }}>V</Text>ANIK
            </Text>

            {step === 1 ? (
              <>
                <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Join thousands of local sellers and buyers</Text>

                <View style={styles.form}>
                  {[
                    { label: "Full Name", icon: "user", value: name, setter: setName, placeholder: "Your name", type: "default" as const },
                    { label: "Email", icon: "mail", value: email, setter: setEmail, placeholder: "you@example.com", type: "email-address" as const },
                  ].map((field) => (
                    <View key={field.label} style={styles.fieldGroup}>
                      <Text style={[styles.label, { color: colors.foreground }]}>{field.label}</Text>
                      <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                        <Feather name={field.icon as any} size={18} color={colors.mutedForeground} />
                        <TextInput
                          style={[styles.input, { color: colors.foreground }]}
                          placeholder={field.placeholder}
                          placeholderTextColor={colors.mutedForeground}
                          value={field.value}
                          onChangeText={(t) => { field.setter(t); setError(""); }}
                          autoCapitalize={field.type === "default" ? "words" : "none"}
                          keyboardType={field.type}
                        />
                      </View>
                    </View>
                  ))}

                  <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                    <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <Feather name="lock" size={18} color={colors.mutedForeground} />
                      <TextInput
                        style={[styles.input, { color: colors.foreground }]}
                        placeholder="Min 6 characters"
                        placeholderTextColor={colors.mutedForeground}
                        value={password}
                        onChangeText={(t) => { setPassword(t); setError(""); }}
                        secureTextEntry={!showPw}
                      />
                      <Pressable onPress={() => setShowPw((p) => !p)} hitSlop={8}>
                        <Feather name={showPw ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
<<<<<<< Updated upstream
=======
                    {role === "seller" && (
                      <View style={[styles.roleCheck, { backgroundColor: colors.primary }]}>
                        <Feather name="check" size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>

                  <Pressable style={styles.continueBtn} onPress={goToDetails}>
                    <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.continueGrad}>
                      <Text style={styles.continueText}>Continue as {role === "buyer" ? "Buyer" : "Seller"}</Text>
                      <Feather name="arrow-right" size={18} color="#fff" />
                    </LinearGradient>
                  </Pressable>

                  {/* OR Divider */}
                  <View style={styles.orRow}>
                    <View style={[styles.orLine, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                    <Text style={[styles.orText, { color: "rgba(255,255,255,0.3)" }]}>OR</Text>
                    <View style={[styles.orLine, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                  </View>

                  {/* Google Login */}
                  <Pressable
                    style={[styles.googleBtn, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }]}
                    onPress={handleGoogleLogin}
                    disabled={loading}
                  >
                    <View style={styles.googleIconWrap}>
                      <Text style={{ fontSize: 18 }}>G</Text>
                    </View>
                    <Text style={styles.googleBtnText}>Sign up with Google</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Create your account</Text>
                  <Text style={[styles.cardSub, { color: "rgba(255,255,255,0.55)" }]}>
                    Setting up as a <Text style={{ color: colors.primary, fontWeight: "800" }}>{role}</Text>
                  </Text>

                  <View style={[styles.inputWrap, { borderColor: "rgba(255,255,255,0.12)" }]}>
                    <Feather name="user" size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput style={styles.input} placeholder={role === "seller" ? "Store name" : "Full name"} placeholderTextColor="rgba(255,255,255,0.3)" value={name} onChangeText={(t) => { setName(t); setError(""); }} />
>>>>>>> Stashed changes
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Confirm Password</Text>
                    <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <Feather name="lock" size={18} color={colors.mutedForeground} />
                      <TextInput
                        style={[styles.input, { color: colors.foreground }]}
                        placeholder="Re-enter password"
                        placeholderTextColor={colors.mutedForeground}
                        value={confirmPw}
                        onChangeText={(t) => { setConfirmPw(t); setError(""); }}
                        secureTextEntry={!showPw}
                      />
                    </View>
                  </View>

                  {error ? (
                    <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
                      <Feather name="alert-circle" size={14} color={colors.destructive} />
                      <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                    </View>
                  ) : null}

                  <Pressable style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                    <Feather name="arrow-right" size={18} color="#fff" />
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.title, { color: colors.foreground }]}>Choose your role</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>You can always switch later from settings</Text>

                <View style={styles.rolesGrid}>
                  {ROLES.map((r) => {
                    const isActive = role === r.value;
                    return (
                      <Pressable
                        key={r.value}
                        style={[
                          styles.roleCard,
                          {
                            backgroundColor: isActive ? colors.primary + "18" : colors.card,
                            borderColor: isActive ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRole(r.value); }}
                      >
                        <View style={[styles.roleIcon, { backgroundColor: isActive ? colors.primary : colors.muted }]}>
                          <Feather name={r.icon as any} size={26} color={isActive ? "#fff" : colors.mutedForeground} />
                        </View>
                        <Text style={[styles.roleLabel, { color: colors.foreground }]}>{r.label}</Text>
                        <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{r.desc}</Text>
                        {isActive && (
                          <View style={[styles.roleCheck, { backgroundColor: colors.primary }]}>
                            <Feather name="check" size={12} color="#fff" />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Role perks */}
                <View style={[styles.perksBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  {role === "seller" ? (
                    <>
                      <Text style={[styles.perksTitle, { color: colors.foreground }]}>As a Seller you get:</Text>
                      {["Go live and sell in real-time", "Upload reels & product posts", "Full analytics dashboard", "Manage orders & payouts"].map((p) => (
                        <View key={p} style={styles.perkRow}>
                          <Feather name="check-circle" size={14} color={colors.primary} />
                          <Text style={[styles.perkText, { color: colors.mutedForeground }]}>{p}</Text>
                        </View>
                      ))}
                    </>
                  ) : (
                    <>
                      <Text style={[styles.perksTitle, { color: colors.foreground }]}>As a Buyer you get:</Text>
                      {["Personalised product feed", "Shop from live sessions", "Save to wishlist", "Order tracking & reviews"].map((p) => (
                        <View key={p} style={styles.perkRow}>
                          <Feather name="check-circle" size={14} color={colors.primary} />
                          <Text style={[styles.perkText, { color: colors.mutedForeground }]}>{p}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>

                {error ? (
                  <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
                    <Feather name="alert-circle" size={14} color={colors.destructive} />
                    <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                  </View>
                ) : null}

                <Animated.View style={btnStyle}>
                  <Pressable
                    style={[styles.nextBtn, { backgroundColor: loading ? colors.accent : colors.primary }]}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    <Text style={styles.nextBtnText}>{loading ? "Creating account..." : "Create Account"}</Text>
                    {!loading && <Feather name="arrow-right" size={18} color="#fff" />}
                  </Pressable>
                </Animated.View>
              </>
            )}

            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: colors.mutedForeground }]}>Already have an account?</Text>
              <Pressable onPress={() => router.replace("/auth/login")}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  steps: { flexDirection: "row", gap: 6, alignItems: "center" },
  stepDot: { height: 8, borderRadius: 4 },
  content: { flex: 1, padding: 24, gap: 16 },
  logo: { fontSize: 28, fontWeight: "900", letterSpacing: 3, textAlign: "center" },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: -4 },
  form: { gap: 14 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 15 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10 },
  errorText: { fontSize: 13, flex: 1 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  rolesGrid: { flexDirection: "row", gap: 12 },
  roleCard: { flex: 1, borderWidth: 2, borderRadius: 18, padding: 16, alignItems: "center", gap: 8, position: "relative" },
  roleIcon: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  roleLabel: { fontSize: 16, fontWeight: "800" },
  roleDesc: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  roleCheck: { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  perksBox: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  perksTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkText: { fontSize: 13 },
  loginRow: { flexDirection: "row", justifyContent: "center", gap: 6, paddingBottom: 24 },
  loginText: { fontSize: 14 },
<<<<<<< Updated upstream
  loginLink: { fontSize: 14, fontWeight: "700" },
=======
  loginLink: { fontSize: 14, fontWeight: "800" },

  /* Google */
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 14 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 11, fontWeight: "800" },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  googleIconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  googleBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
>>>>>>> Stashed changes
});
