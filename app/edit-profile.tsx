import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar ?? "");

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Name required"); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    updateUser({ name: name.trim(), bio: bio.trim(), avatar: previewAvatar || avatar });
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const AVATAR_PRESETS = Array.from({ length: 12 }, (_, i) => `https://i.pravatar.cc/150?img=${i + 1}`);

  const fields = [
    { label: "Display Name", icon: "user", value: name, setter: setName, placeholder: "Your name", multiline: false },
    { label: "Bio", icon: "align-left", value: bio, setter: setBio, placeholder: "Tell people about yourself...", multiline: true },
    { label: "Website", icon: "link", value: website, setter: setWebsite, placeholder: "https://yourwebsite.com", multiline: false },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Profile</Text>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: loading ? colors.accent : colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save"}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Avatar section */}
          <View style={[styles.avatarSection, { borderBottomColor: colors.border }]}>
            <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
              <Image source={{ uri: previewAvatar }} style={styles.avatar} />
              <View style={[styles.avatarOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
                <Feather name="camera" size={22} color="#fff" />
              </View>
            </View>
            <Text style={[styles.avatarHint, { color: colors.mutedForeground }]}>Tap to change profile photo</Text>

            {/* Avatar presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {AVATAR_PRESETS.map((url) => (
                <Pressable
                  key={url}
                  style={[styles.preset, previewAvatar === url && { borderColor: colors.primary, borderWidth: 2.5 }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreviewAvatar(url); setAvatar(url); }}
                >
                  <Image source={{ uri: url }} style={styles.presetImg} />
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Role badge */}
          <View style={[styles.roleSection, { borderBottomColor: colors.border }]}>
            <View style={[styles.roleBadge, {
              backgroundColor: user?.role === "seller" ? colors.primary + "18" : colors.secondary + "18",
              borderColor: user?.role === "seller" ? colors.primary : colors.secondary,
            }]}>
              <Feather name={user?.role === "seller" ? "package" : "shopping-bag"} size={14} color={user?.role === "seller" ? colors.primary : colors.secondary} />
              <Text style={[styles.roleText, { color: user?.role === "seller" ? colors.primary : colors.secondary }]}>
                {user?.role === "seller" ? "Seller Account" : "Buyer Account"}
              </Text>
            </View>
            <Text style={[styles.roleHint, { color: colors.mutedForeground }]}>Role can be changed in Settings</Text>
          </View>

          {/* Form fields */}
          <View style={styles.form}>
            {fields.map((f) => (
              <View key={f.label} style={[styles.fieldWrap, { borderBottomColor: colors.border }]}>
                <View style={[styles.fieldIcon, { backgroundColor: colors.muted }]}>
                  <Feather name={f.icon as any} size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.fieldInput, { color: colors.foreground }]}
                    value={f.value}
                    onChangeText={f.setter as any}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.border}
                    multiline={f.multiline}
                    numberOfLines={f.multiline ? 3 : 1}
                    autoCapitalize={f.label === "Website" ? "none" : "sentences"}
                  />
                </View>
              </View>
            ))}

            {/* Username (read-only) */}
            <View style={[styles.fieldWrap, { borderBottomColor: colors.border }]}>
              <View style={[styles.fieldIcon, { backgroundColor: colors.muted }]}>
                <Feather name="at-sign" size={16} color={colors.mutedForeground} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
                <Text style={[styles.fieldInput, { color: colors.mutedForeground }]}>{user?.email}</Text>
              </View>
              <View style={[styles.lockedBadge, { backgroundColor: colors.muted }]}>
                <Feather name="lock" size={12} color={colors.mutedForeground} />
              </View>
            </View>
          </View>

          {/* Links section */}
          <View style={[styles.linksSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Social Links</Text>
            {[
              { icon: "instagram", label: "Instagram", placeholder: "@yourhandle" },
              { icon: "twitter", label: "Twitter / X", placeholder: "@yourhandle" },
              { icon: "youtube", label: "YouTube", placeholder: "Channel URL" },
            ].map((s) => (
              <View key={s.label} style={[styles.socialRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name={s.icon as any} size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.socialInput, { color: colors.foreground }]}
                  placeholder={s.placeholder}
                  placeholderTextColor={colors.border}
                  autoCapitalize="none"
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10, gap: 12, borderBottomWidth: 1 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "800" },
  saveBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 22 },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  avatarSection: { alignItems: "center", paddingVertical: 24, gap: 10, borderBottomWidth: 1 },
  avatarRing: { borderWidth: 3, borderRadius: 52, padding: 3, position: "relative" },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  avatarHint: { fontSize: 13 },
  presetsRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  preset: { borderRadius: 22, borderWidth: 1.5, borderColor: "transparent", overflow: "hidden" },
  presetImg: { width: 40, height: 40, borderRadius: 20 },
  roleSection: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  roleText: { fontSize: 13, fontWeight: "700" },
  roleHint: { fontSize: 12 },
  form: { paddingHorizontal: 16 },
  fieldWrap: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  fieldIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", marginTop: 2 },
  fieldLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  fieldInput: { fontSize: 15, lineHeight: 22 },
  lockedBadge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginTop: 10 },
  linksSection: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  socialRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  socialInput: { flex: 1, fontSize: 14 },
});
