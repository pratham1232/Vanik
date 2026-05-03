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
  const { login } = useAuth();

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

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={[styles.header, { paddingTop: topPad + 16 }]}>
            <Pressable style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
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
  registerLink: { fontSize: 14, fontWeight: "700" },
});
