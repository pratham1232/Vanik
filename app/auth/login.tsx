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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
<<<<<<< Updated upstream
  const { login } = useAuth();
=======
  const { login, sendOTP, loginWithGoogle } = useAuth();
>>>>>>> Stashed changes

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    btnScale.value = withSpring(0.95, {}, () => { btnScale.value = withSpring(1); });
    setLoading(true);
    setError("");
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    }
  };

<<<<<<< Updated upstream
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={[styles.header, { paddingTop: topPad + 16 }]}>
            <Pressable style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
=======
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

  const topPad = Platform.OS === "web" ? 40 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradientDark as any}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.circle1, { backgroundColor: colors.primary + "15" }]} />
      <View style={[styles.circle2, { backgroundColor: colors.secondary + "10" }]} />
      <View style={[styles.circle3, { backgroundColor: colors.primary + "08" }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Pressable
            style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.08)" }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoV}>V</Text>
            </View>
            <Text style={styles.logoText}>
              <Text style={{ color: colors.primary }}>V</Text>
              <Text style={{ color: "#fff" }}>anik</Text>
            </Text>
            <Text style={[styles.tagline, { color: "rgba(255,255,255,0.5)" }]}>
              Discover · Shop · Earn
            </Text>
          </View>

          {/* Card */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
                transform: [{ translateX: shakeAnim }],
              },
            ]}
          >
            {/* Mode tabs */}
            <View style={[styles.modeRow, { backgroundColor: "rgba(255,255,255,0.06)" }]}>
              <Pressable
                style={[styles.modeTab, mode === "otp" && { backgroundColor: colors.primary }]}
                onPress={() => mode !== "otp" && switchMode("otp")}
              >
                <Feather name="smartphone" size={14} color={mode === "otp" ? "#fff" : "rgba(255,255,255,0.5)"} />
                <Text style={[styles.modeText, { color: mode === "otp" ? "#fff" : "rgba(255,255,255,0.5)" }]}>
                  Phone
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeTab, mode === "email" && { backgroundColor: colors.primary }]}
                onPress={() => mode !== "email" && switchMode("email")}
              >
                <Feather name="mail" size={14} color={mode === "email" ? "#fff" : "rgba(255,255,255,0.5)"} />
                <Text style={[styles.modeText, { color: mode === "email" ? "#fff" : "rgba(255,255,255,0.5)" }]}>
                  Email
                </Text>
              </Pressable>
            </View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {mode === "otp" ? (
                <>
                  <Text style={styles.cardTitle}>Welcome back</Text>
                  <Text style={[styles.cardSub, { color: "rgba(255,255,255,0.55)" }]}>
                    Enter your phone number to continue
                  </Text>

                  {/* Phone input */}
                  <View style={[styles.inputGroup, { borderColor: error ? "#FF3B5C" : "rgba(255,255,255,0.12)" }]}>
                    <View style={styles.countryCode}>
                      <Text style={styles.flag}>🇮🇳</Text>
                      <Text style={styles.codeText}>+91</Text>
                      <Feather name="chevron-down" size={12} color="rgba(255,255,255,0.4)" />
                    </View>
                    <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Phone number"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={(t) => { setPhone(t.replace(/\D/g, "")); setError(""); }}
                    />
                  </View>

                  {/* Submit */}
                  <Pressable
                    style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleOTPSubmit}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitGradient}
                    >
                      {loading ? (
                        <Text style={styles.submitText}>Sending OTP...</Text>
                      ) : (
                        <>
                          <Text style={styles.submitText}>Get OTP</Text>
                          <Feather name="arrow-right" size={18} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Sign in with Email</Text>
                  <Text style={[styles.cardSub, { color: "rgba(255,255,255,0.55)" }]}>
                    Use your email and password
                  </Text>

                  {/* Email */}
                  <View style={[styles.inputWrap, { borderColor: error ? "#FF3B5C" : "rgba(255,255,255,0.12)" }]}>
                    <Feather name="mail" size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(""); }}
                    />
                  </View>

                  {/* Password */}
                  <View style={[styles.inputWrap, { borderColor: error ? "#FF3B5C" : "rgba(255,255,255,0.12)" }]}>
                    <Feather name="lock" size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      secureTextEntry={!showPass}
                      value={password}
                      onChangeText={(t) => { setPassword(t); setError(""); }}
                    />
                    <Pressable onPress={() => setShowPass(!showPass)}>
                      <Feather name={showPass ? "eye-off" : "eye"} size={16} color="rgba(255,255,255,0.4)" />
                    </Pressable>
                  </View>

                  {/* Submit */}
                  <Pressable
                    style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleEmailSubmit}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitGradient}
                    >
                      {loading ? (
                        <Text style={styles.submitText}>Signing in...</Text>
                      ) : (
                        <>
                          <Text style={styles.submitText}>Sign In</Text>
                          <Feather name="arrow-right" size={18} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </>
              )}

              {/* Error */}
              {error !== "" && (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={14} color="#FF3B5C" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </Animated.View>

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
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </Pressable>

            {/* Demo hint */}
            <View style={[styles.demoHint, { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }]}>
              <Feather name="info" size={13} color={colors.primary} />
              <Text style={[styles.demoText, { color: "rgba(255,255,255,0.5)" }]}>
                Demo: OTP is <Text style={{ color: colors.primary, fontWeight: "800" }}>1234</Text>
                {"\n"}Email: buyer@vanik.in / seller@vanik.in (pass: demo123)
              </Text>
            </View>
          </Animated.View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: "rgba(255,255,255,0.45)" }]}>
              Don't have an account?
            </Text>
            <Pressable onPress={() => router.push("/auth/register")}>
              <Text style={[styles.registerLink, { color: colors.primary }]}> Create Account</Text>
>>>>>>> Stashed changes
            </Pressable>
          </View>

          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <Text style={[styles.logo, { color: colors.foreground }]}>
                <Text style={{ color: colors.primary }}>V</Text>ANIK
              </Text>
              <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Shop. Sell. Connect.</Text>
            </View>

            <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Sign in to continue shopping and selling
            </Text>

            {/* Demo accounts hint */}
            <View style={[styles.hintBox, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={[styles.hintText, { color: colors.primary }]}>
                Demo: buyer@vanik.in / seller@vanik.in — password: demo123
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: error ? colors.destructive : colors.border }]}>
                  <Feather name="mail" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.mutedForeground}
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(""); }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: error ? colors.destructive : colors.border }]}>
                  <Feather name="lock" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.mutedForeground}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(""); }}
                    secureTextEntry={!showPw}
                    autoComplete="password"
                  />
                  <Pressable onPress={() => setShowPw((p) => !p)} hitSlop={8}>
                    <Feather name={showPw ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
                  <Feather name="alert-circle" size={14} color={colors.destructive} />
                  <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                </View>
              ) : null}

              <Pressable style={{ alignSelf: "flex-end" }}>
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
              </Pressable>

              <Animated.View style={btnStyle}>
                <Pressable
                  style={[styles.loginBtn, { backgroundColor: loading ? colors.accent : colors.primary }]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <Text style={styles.loginBtnText}>Signing in...</Text>
                  ) : (
                    <>
                      <Text style={styles.loginBtnText}>Sign In</Text>
                      <Feather name="arrow-right" size={18} color="#fff" />
                    </>
                  )}
                </Pressable>
              </Animated.View>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={[styles.registerText, { color: colors.mutedForeground }]}>Don't have an account?</Text>
              <Pressable onPress={() => router.push("/auth/register")}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>Sign Up</Text>
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
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, padding: 24, gap: 20 },
  logoSection: { alignItems: "center", gap: 4, marginBottom: 8 },
  logo: { fontSize: 32, fontWeight: "900", letterSpacing: 3 },
  tagline: { fontSize: 14 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: -8 },
  hintBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  hintText: { fontSize: 12, flex: 1, lineHeight: 18 },
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 15 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10 },
  errorText: { fontSize: 13, flex: 1 },
  forgotText: { fontSize: 13, fontWeight: "600" },
  loginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16, marginTop: 4 },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  line: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  registerRow: { flexDirection: "row", justifyContent: "center", gap: 6, paddingBottom: 24 },
  registerText: { fontSize: 14 },
<<<<<<< Updated upstream
  registerLink: { fontSize: 14, fontWeight: "700" },
=======
  registerLink: { fontSize: 14, fontWeight: "800" },

  /* Terms */
  terms: { fontSize: 11, textAlign: "center", marginTop: 16, lineHeight: 16 },

  /* Google */
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 12 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 11, fontWeight: "800" },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  googleIconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  googleBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
>>>>>>> Stashed changes
});
