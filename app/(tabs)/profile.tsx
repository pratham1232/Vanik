import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { PRODUCTS, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

/* ─────────────────────────────────────────────────────────
   LOGOUT CONFIRM MODAL
───────────────────────────────────────────────────────── */
function LogoutModal({ visible, onConfirm, onCancel }: { visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  const colors = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={logoutStyles.overlay}>
        <View style={[logoutStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[logoutStyles.iconWrap, { backgroundColor: "#FF3B5C18" }]}>
            <Feather name="log-out" size={26} color="#FF3B5C" />
          </View>
          <Text style={[logoutStyles.title, { color: colors.foreground }]}>Sign Out?</Text>
          <Text style={[logoutStyles.sub, { color: colors.mutedForeground }]}>
            You'll need to sign in again to access your profile, orders and wishlist.
          </Text>
          <View style={logoutStyles.btnRow}>
            <Pressable style={[logoutStyles.cancelBtn, { backgroundColor: colors.muted, borderColor: colors.border }]} onPress={onCancel}>
              <Text style={[logoutStyles.cancelText, { color: colors.foreground }]}>Cancel</Text>
            </Pressable>
            <Pressable style={[logoutStyles.confirmBtn, { backgroundColor: "#FF3B5C" }]} onPress={onConfirm}>
              <Text style={logoutStyles.confirmText}>Sign Out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const logoutStyles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 32 },
  card:        { width: "100%", borderRadius: 24, padding: 24, alignItems: "center", gap: 10, borderWidth: 1 },
  iconWrap:    { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  title:       { fontSize: 20, fontWeight: "900" },
  sub:         { fontSize: 14, textAlign: "center", lineHeight: 21 },
  btnRow:      { flexDirection: "row", gap: 10, marginTop: 6, width: "100%" },
  cancelBtn:   { flex: 1, paddingVertical: 13, borderRadius: 16, alignItems: "center", borderWidth: 1 },
  cancelText:  { fontSize: 15, fontWeight: "700" },
  confirmBtn:  { flex: 1, paddingVertical: 13, borderRadius: 16, alignItems: "center" },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});

/* ─────────────────────────────────────────────────────────
   GUEST SCREEN
───────────────────────────────────────────────────────── */
function GuestScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const features = [
    { icon: "shopping-bag", color: "#8B5CF6", title: "Discover Products",   sub: "Explore millions of items from top sellers"   },
    { icon: "video",        color: "#FF3B5C", title: "Watch Live Shopping", sub: "Buy while watching live demos and hauls"       },
    { icon: "film",         color: "#3B82F6", title: "Shop via Reels",      sub: "Scroll, discover and add to cart instantly"    },
    { icon: "trending-up",  color: "#10B981", title: "Resell & Earn",       sub: "Share products, earn up to ₹500 per order"     },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.guestHeader, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.logo, { color: colors.foreground }]}>
          <Text style={{ color: colors.primary }}>V</Text>anik
        </Text>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.muted }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}
        >
          <Feather name={isDark ? "sun" : "moon"} size={17} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero card */}
        <View style={[styles.guestHero, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.guestAvatarWrap, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="user" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.guestHeroTitle, { color: colors.foreground }]}>Join Vanik</Text>
          <Text style={[styles.guestHeroSub, { color: colors.mutedForeground }]}>
            Social commerce — discover, watch, shop and earn all in one place.
          </Text>

          <Pressable style={[styles.signInBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/auth/login")}>
            <Feather name="log-in" size={17} color="#fff" />
            <Text style={styles.signInBtnText}>Sign In</Text>
          </Pressable>

          <Pressable style={[styles.registerBtn, { borderColor: colors.primary }]} onPress={() => router.push("/auth/register")}>
            <Text style={[styles.registerBtnText, { color: colors.primary }]}>Create Account</Text>
          </Pressable>
        </View>

        {/* Features */}
        <Text style={[styles.featuresHeading, { color: colors.mutedForeground }]}>WHAT YOU GET</Text>
        <View style={styles.featuresGrid}>
          {features.map((f) => (
            <View key={f.icon} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + "18" }]}>
                <Feather name={f.icon as any} size={22} color={f.color} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
              <Text style={[styles.featureSub, { color: colors.mutedForeground }]}>{f.sub}</Text>
            </View>
          ))}
        </View>

        {/* Demo accounts hint */}
        <View style={[styles.demoCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="info" size={15} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.demoTitle, { color: colors.foreground }]}>Try demo accounts</Text>
            <Text style={[styles.demoSub, { color: colors.mutedForeground }]}>
              buyer@vanik.in  ·  seller@vanik.in{"\n"}Password: demo123
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────
   SETTINGS SHEET
───────────────────────────────────────────────────────── */
function SettingsSheet({ onBack, user, onLogoutPress, isDark, toggleTheme }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const items = [
    { icon: "package",       label: "My Orders",        color: "#F59E0B", route: "/orders"       },
    { icon: "heart",         label: "Wishlist",          color: "#FF3B5C", route: "/wishlist"      },
    { icon: "shopping-cart", label: "My Cart",           color: "#10B981", route: "/cart"          },
    { icon: "bell",          label: "Notifications",    color: "#8B5CF6", route: "/notifications"  },
    { icon: "credit-card",   label: "Payment Methods",  color: "#3B82F6", route: null              },
    { icon: "map-pin",       label: "Saved Addresses",  color: "#EC4899", route: null              },
    { icon: "shield",        label: "Privacy & Security",color: "#10B981", route: null             },
    { icon: "help-circle",   label: "Help & Support",   color: "#06B6D4", route: null              },
    { icon: "star",          label: "Rate the App",     color: "#F59E0B", route: null              },
    { icon: "info",          label: "About Vanik",      color: "#6B7280", route: null              },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.settingsTopBar, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={[styles.iconBtn, { backgroundColor: colors.muted }]} onPress={onBack}>
          <Feather name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.settingsTopTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Profile quick row */}
        <Pressable style={[styles.settingsProfile, { borderBottomColor: colors.border }]} onPress={() => { onBack(); router.push("/edit-profile"); }}>
          <View style={[styles.settingsAvatarRing, { borderColor: colors.primary }]}>
            <Image source={{ uri: user?.avatar }} style={styles.settingsAvatar} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingsName, { color: colors.foreground }]}>{user?.name}</Text>
            <Text style={[styles.settingsEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
          </View>
          <Feather name="edit-2" size={16} color={colors.primary} />
        </Pressable>

        {/* Dark mode toggle */}
        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.settingIconWrap, { backgroundColor: colors.primary + "20" }]}>
            <Feather name={isDark ? "moon" : "sun"} size={18} color={colors.primary} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.foreground }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}
            trackColor={{ false: colors.border, true: colors.primary + "88" }}
            thumbColor={isDark ? colors.primary : "#ccc"}
          />
        </View>

        {items.map((item) => (
          <Pressable
            key={item.label}
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
            onPress={() => { if (item.route) { onBack(); router.push(item.route as any); } else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: item.color + "18" }]}>
              <Feather name={item.icon as any} size={18} color={item.color} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
          </Pressable>
        ))}

        <Pressable style={[styles.logoutBtn, { backgroundColor: "#FF3B5C10", borderColor: "#FF3B5C40" }]} onPress={onLogoutPress}>
          <Feather name="log-out" size={18} color="#FF3B5C" />
          <Text style={[styles.logoutText]}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PROFILE
───────────────────────────────────────────────────────── */
const HIGHLIGHTS = [
  { id: "h1", label: "New In",  color: "#8B5CF6", icon: "package" },
  { id: "h2", label: "Sale",    color: "#FF3B5C", icon: "tag"     },
  { id: "h3", label: "Reviews", color: "#10B981", icon: "star"    },
  { id: "h4", label: "Live",    color: "#F59E0B", icon: "video"   },
  { id: "h5", label: "Behind",  color: "#3B82F6", icon: "camera"  },
];

const ORDERS_DATA = [
  { id: "ORD-4821", product: "Handcrafted Leather Bag",   status: "Delivered", price: "₹1,899", color: "#10B981", img: PRODUCTS[0].image },
  { id: "ORD-4819", product: "Terracotta Vase Set",        status: "Shipped",   price: "₹1,299", color: "#F59E0B", img: PRODUCTS[2].image },
  { id: "ORD-4803", product: "Organic Skincare Set",       status: "Confirmed", price: "₹899",   color: "#8B5CF6", img: PRODUCTS[3].image },
];

const REVIEWS_DATA = [
  { name: "Karan M.",  stars: 5, text: "Amazing products, super fast shipping!",   avatar: "https://i.pravatar.cc/50?img=12" },
  { name: "Meera S.",  stars: 4, text: "Great quality, will definitely reorder.",   avatar: "https://i.pravatar.cc/50?img=9"  },
  { name: "Ananya R.", stars: 5, text: "Love the packaging and the products! ✨",   avatar: "https://i.pravatar.cc/50?img=47" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, isLoggedIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab]         = useState(0);
  const [showSettings, setShowSettings]   = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const isSeller  = user?.role === "seller";

  if (!isLoggedIn) return <GuestScreen />;

  const confirmLogout = () => {
    setShowLogoutModal(false);
    setShowSettings(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try { await Share.share({ message: `Check out ${user?.name}'s profile on Vanik! 🛍️` }); } catch {}
  };

  if (showSettings) {
    return (
      <>
        <SettingsSheet
          onBack={() => setShowSettings(false)}
          user={user}
          onLogoutPress={() => setShowLogoutModal(true)}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        <LogoutModal
          visible={showLogoutModal}
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      </>
    );
  }

  const BUYER_TABS  = ["Posts", "Saved", "Orders", "Reviews"];
  const SELLER_TABS = ["Products", "Reels", "Live", "Reviews"];
  const TABS = isSeller ? SELLER_TABS : BUYER_TABS;
  const ICONS = isSeller
    ? ["grid", "film", "video", "star"]
    : ["grid", "bookmark", "package", "star"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 90 : 80 }}>

        {/* ── Cover ── */}
        <View style={[styles.cover, { backgroundColor: colors.primary + "25" }]}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary + "15" }]} />
          {/* Decorative circles */}
          <View style={[styles.coverCircle1, { backgroundColor: colors.primary + "20" }]} />
          <View style={[styles.coverCircle2, { backgroundColor: "#FF3B5C20" }]} />

          <View style={[styles.coverTopBar, { paddingTop: topPad + 8 }]}>
            <Text style={[styles.coverLogo, { color: colors.foreground }]}>
              <Text style={{ color: colors.primary }}>V</Text>anik
            </Text>
            <View style={styles.coverTopRight}>
              <Pressable
                style={[styles.coverBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}
              >
                <Feather name={isDark ? "sun" : "moon"} size={17} color="#fff" />
              </Pressable>
              <Pressable
                style={[styles.coverBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}
                onPress={() => setShowSettings(true)}
              >
                <Feather name="settings" size={17} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Avatar + Actions ── */}
        <View style={[styles.avatarSection, { backgroundColor: colors.background }]}>
          {/* Avatar */}
          <View style={[styles.avatarRing, { borderColor: colors.primary, backgroundColor: colors.background }]}>
            <Image source={{ uri: user?.avatar }} style={styles.avatarImg} />
            {isSeller && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                <Feather name="check" size={9} color="#fff" />
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable style={[styles.editBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/edit-profile")}>
              <Feather name="edit-2" size={13} color="#fff" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={[styles.iconCircle, { backgroundColor: colors.muted, borderColor: colors.border }]} onPress={handleShare}>
              <Feather name="share-2" size={15} color={colors.foreground} />
            </Pressable>
            <Pressable style={[styles.iconCircle, { backgroundColor: "#FF3B5C10", borderColor: "#FF3B5C30" }]} onPress={() => setShowLogoutModal(true)}>
              <Feather name="log-out" size={15} color="#FF3B5C" />
            </Pressable>
          </View>
        </View>

        {/* ── User info ── */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name}</Text>
            {isSeller && <Feather name="check-circle" size={16} color={colors.primary} />}
            <View style={[styles.rolePill, {
              backgroundColor: isSeller ? colors.primary + "18" : "#10B98118",
              borderColor: isSeller ? colors.primary + "60" : "#10B98160",
            }]}>
              <Feather name={isSeller ? "package" : "shopping-bag"} size={10} color={isSeller ? colors.primary : "#10B981"} />
              <Text style={[styles.rolePillText, { color: isSeller ? colors.primary : "#10B981" }]}>
                {isSeller ? "Seller" : "Buyer"}
              </Text>
            </View>
          </View>

          <Text style={[styles.userHandle, { color: colors.mutedForeground }]}>@{user?.email?.split("@")[0]}</Text>

          {user?.bio ? (
            <Text style={[styles.userBio, { color: colors.foreground }]}>{user.bio}</Text>
          ) : (
            <Pressable onPress={() => router.push("/edit-profile")}>
              <Text style={[styles.addBio, { color: colors.primary }]}>+ Add a bio</Text>
            </Pressable>
          )}

          <View style={styles.metaRow}>
            <Feather name="calendar" size={11} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Joined {user?.joinedAt ?? "2024"}</Text>
            <View style={styles.metaDot} />
            <Feather name="map-pin" size={11} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>India</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Posts",     value: "12"  },
            { label: "Followers", value: (user?.followers ?? 0).toLocaleString() },
            { label: "Following", value: (user?.following ?? 0).toLocaleString() },
            { label: isSeller ? "Sales" : "Orders", value: isSeller ? "₹24K" : "8" },
          ].map((s, i) => (
            <Pressable key={s.label} style={[styles.statCell, i < 3 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
              <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Seller quick actions ── */}
        {isSeller && (
          <View style={styles.sellerActions}>
            {[
              { icon: "video",       label: "Go Live",     bg: "#FF3B5C", action: () => router.push("/live/l1") },
              { icon: "plus-circle", label: "Add Product", bg: colors.primary, action: () => router.push("/create") },
              { icon: "bar-chart-2", label: "Analytics",   bg: "#10B981", action: () => {} },
              { icon: "trending-up", label: "Resell",      bg: "#F59E0B", action: () => {} },
            ].map((a) => (
              <Pressable key={a.label} style={[styles.sellerAction, { backgroundColor: a.bg + "14", borderColor: a.bg + "35" }]} onPress={a.action}>
                <View style={[styles.sellerActionIcon, { backgroundColor: a.bg }]}>
                  <Feather name={a.icon as any} size={15} color="#fff" />
                </View>
                <Text style={[styles.sellerActionLabel, { color: a.bg }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Story Highlights ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsRow}>
          <Pressable style={styles.highlight} onPress={() => router.push("/add-story")}>
            <View style={[styles.highlightRing, { borderColor: colors.border, borderStyle: "dashed" }]}>
              <View style={[styles.highlightInner, { backgroundColor: colors.muted }]}>
                <Feather name="plus" size={20} color={colors.mutedForeground} />
              </View>
            </View>
            <Text style={[styles.highlightLabel, { color: colors.mutedForeground }]}>New</Text>
          </Pressable>
          {HIGHLIGHTS.map((h) => (
            <Pressable key={h.id} style={styles.highlight}>
              <View style={[styles.highlightRing, { borderColor: h.color }]}>
                <View style={[styles.highlightInner, { backgroundColor: h.color + "20" }]}>
                  <Feather name={h.icon as any} size={20} color={h.color} />
                </View>
              </View>
              <Text style={[styles.highlightLabel, { color: colors.mutedForeground }]}>{h.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Buyer: Resell & Earn ── */}
        {!isSeller && (
          <Pressable style={[styles.resellBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]} onPress={() => router.push("/explore")}>
            <View style={[styles.resellIconWrap, { backgroundColor: colors.primary }]}>
              <Feather name="trending-up" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resellTitle, { color: colors.foreground }]}>Resell & Earn 💰</Text>
              <Text style={[styles.resellSub, { color: colors.mutedForeground }]}>Share products, earn up to ₹500/order — no investment needed</Text>
            </View>
            <View style={[styles.resellArrow, { backgroundColor: colors.primary }]}>
              <Feather name="arrow-right" size={14} color="#fff" />
            </View>
          </Pressable>
        )}

        {/* ── Content Tabs ── */}
        <View style={[styles.tabsBar, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          {TABS.map((label, i) => (
            <Pressable
              key={label}
              style={[styles.tabItem, i === activeTab && { borderBottomWidth: 2, borderBottomColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(i); }}
            >
              <Feather name={ICONS[i] as any} size={17} color={i === activeTab ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: i === activeTab ? colors.primary : colors.mutedForeground, fontWeight: i === activeTab ? "700" : "500" }]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Tab 0: Posts / Products grid ── */}
        {activeTab === 0 && (
          isSeller ? (
            /* Seller product grid */
            <View style={styles.productGrid}>
              {PRODUCTS.map((p) => (
                <Pressable key={p.id} style={[styles.productCell, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(`/product/${p.id}`)}>
                  <Image source={p.image} style={styles.productCellImg} resizeMode="cover" />
                  <View style={styles.productCellInfo}>
                    <Text style={[styles.productCellTitle, { color: colors.foreground }]} numberOfLines={1}>{p.title}</Text>
                    <View style={styles.productCellBottom}>
                      <Text style={[styles.productCellPrice, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
                      {p.discount > 0 && (
                        <View style={[styles.productCellDisc, { backgroundColor: "#FF3B5C" }]}>
                          <Text style={styles.productCellDiscText}>{p.discount}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            /* Buyer posts grid — Instagram style */
            <View style={styles.postsGrid}>
              {PRODUCTS.map((p, i) => (
                <Pressable key={p.id} style={styles.postCell} onPress={() => router.push(`/product/${p.id}`)}>
                  <Image source={p.image} style={styles.postCellImg} resizeMode="cover" />
                  <View style={styles.postCellOverlay}>
                    {i === 0 && (
                      <View style={styles.postCellBadge}>
                        <Feather name="heart" size={10} color="#fff" />
                        <Text style={styles.postCellBadgeText}>342</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          )
        )}

        {/* ── Tab 1: Reels / Saved ── */}
        {activeTab === 1 && (
          isSeller ? (
            /* Seller: Reels grid */
            <View style={styles.postsGrid}>
              {[0,1,2,3].map((i) => (
                <Pressable key={i} style={styles.postCell} onPress={() => router.push("/(tabs)/reels")}>
                  <Image source={PRODUCTS[i % PRODUCTS.length].image} style={styles.postCellImg} resizeMode="cover" />
                  <View style={[styles.postCellOverlay, { backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" }]}>
                    <Feather name="play" size={22} color="#fff" />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            /* Buyer: Saved items */
            <View style={styles.postsGrid}>
              {PRODUCTS.slice(0, 3).map((p) => (
                <Pressable key={p.id} style={styles.postCell} onPress={() => router.push(`/product/${p.id}`)}>
                  <Image source={p.image} style={styles.postCellImg} resizeMode="cover" />
                </Pressable>
              ))}
            </View>
          )
        )}

        {/* ── Tab 2: Orders (buyer) / Live (seller) ── */}
        {activeTab === 2 && (
          isSeller ? (
            /* Seller: No live yet */
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: "#FF3B5C18" }]}>
                <Feather name="video" size={30} color="#FF3B5C" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No live sessions yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Go live to connect with your followers in real time</Text>
              <Pressable style={[styles.emptyBtn, { backgroundColor: "#FF3B5C" }]} onPress={() => router.push("/live/l1")}>
                <Feather name="video" size={14} color="#fff" />
                <Text style={styles.emptyBtnText}>Start Live</Text>
              </Pressable>
            </View>
          ) : (
            /* Buyer: Orders list */
            <View style={{ padding: 16, gap: 10 }}>
              {ORDERS_DATA.map((o) => (
                <Pressable key={o.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/orders")}>
                  <Image source={o.img} style={styles.orderImg} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.orderProduct, { color: colors.foreground }]} numberOfLines={1}>{o.product}</Text>
                    <Text style={[styles.orderId, { color: colors.mutedForeground }]}>{o.id}</Text>
                    <Text style={[styles.orderPrice, { color: colors.primary }]}>{o.price}</Text>
                  </View>
                  <View style={[styles.orderStatusBadge, { backgroundColor: o.color + "18", borderColor: o.color + "40" }]}>
                    <View style={[styles.orderStatusDot, { backgroundColor: o.color }]} />
                    <Text style={[styles.orderStatusText, { color: o.color }]}>{o.status}</Text>
                  </View>
                </Pressable>
              ))}
              <Pressable style={[styles.viewAllBtn, { borderColor: colors.primary }]} onPress={() => router.push("/orders")}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Orders</Text>
                <Feather name="arrow-right" size={15} color={colors.primary} />
              </Pressable>
            </View>
          )
        )}

        {/* ── Tab 3: Reviews ── */}
        {activeTab === 3 && (
          <View style={{ padding: 16, gap: 10 }}>
            <View style={[styles.reviewsSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewsAvg, { color: colors.foreground }]}>4.7</Text>
              <View style={styles.reviewsStars}>
                {[1,2,3,4,5].map((s) => (
                  <Feather key={s} name="star" size={18} color={s <= 4 ? "#F59E0B" : colors.border} />
                ))}
              </View>
              <Text style={[styles.reviewsCount, { color: colors.mutedForeground }]}>Based on 3 reviews</Text>
            </View>
            {REVIEWS_DATA.map((r, i) => (
              <View key={i} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: r.avatar }} style={styles.reviewAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewName, { color: colors.foreground }]}>{r.name}</Text>
                    <View style={styles.reviewStars}>
                      {[1,2,3,4,5].map((s) => (
                        <Feather key={s} name="star" size={11} color={s <= r.stars ? "#F59E0B" : colors.border} />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.reviewTime, { color: colors.mutedForeground }]}>2d ago</Text>
                </View>
                <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>{r.text}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const CELL = (width - 3) / 3;
const PROD_CARD = (width - 44) / 2;

const styles = StyleSheet.create({
  container:          { flex: 1 },

  /* ── Guest ── */
  guestHeader:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 8 },
  logo:               { fontSize: 26, fontWeight: "900", letterSpacing: 0.5 },
  iconBtn:            { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  guestHero:          { margin: 16, borderRadius: 24, padding: 24, alignItems: "center", gap: 10, borderWidth: 1 },
  guestAvatarWrap:    { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  guestHeroTitle:     { fontSize: 26, fontWeight: "900" },
  guestHeroSub:       { fontSize: 14, textAlign: "center", lineHeight: 21 },
  signInBtn:          { flexDirection: "row", alignItems: "center", gap: 8, width: "100%", paddingVertical: 14, borderRadius: 22, justifyContent: "center", marginTop: 6 },
  signInBtnText:      { color: "#fff", fontSize: 16, fontWeight: "800" },
  registerBtn:        { width: "100%", paddingVertical: 13, borderRadius: 22, borderWidth: 2, alignItems: "center" },
  registerBtnText:    { fontSize: 15, fontWeight: "700" },
  featuresHeading:    { paddingHorizontal: 20, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  featuresGrid:       { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  featureCard:        { width: (width - 44) / 2, borderRadius: 16, padding: 14, gap: 6, borderWidth: 1 },
  featureIcon:        { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  featureTitle:       { fontSize: 13, fontWeight: "700" },
  featureSub:         { fontSize: 11, lineHeight: 16 },
  demoCard:           { flexDirection: "row", alignItems: "flex-start", gap: 10, margin: 16, padding: 14, borderRadius: 16, borderWidth: 1 },
  demoTitle:          { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  demoSub:            { fontSize: 12, lineHeight: 18 },

  /* ── Cover ── */
  cover:              { height: 130, position: "relative", overflow: "hidden" },
  coverCircle1:       { position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: 60 },
  coverCircle2:       { position: "absolute", bottom: -20, left: 20, width: 80, height: 80, borderRadius: 40 },
  coverTopBar:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  coverLogo:          { fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  coverTopRight:      { flexDirection: "row", gap: 8 },
  coverBtn:           { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  /* ── Avatar section ── */
  avatarSection:      { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, marginTop: -42 },
  avatarRing:         { width: 84, height: 84, borderRadius: 42, borderWidth: 4, overflow: "hidden", position: "relative" },
  avatarImg:          { width: "100%", height: "100%", borderRadius: 42 },
  verifiedBadge:      { position: "absolute", bottom: 3, right: 3, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  actionRow:          { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 44 },
  editBtn:            { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  editBtnText:        { color: "#fff", fontSize: 13, fontWeight: "700" },
  iconCircle:         { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  /* ── User info ── */
  userInfo:           { paddingHorizontal: 16, paddingTop: 8, gap: 4 },
  nameRow:            { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  userName:           { fontSize: 20, fontWeight: "900" },
  rolePill:           { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  rolePillText:       { fontSize: 11, fontWeight: "700" },
  userHandle:         { fontSize: 14 },
  userBio:            { fontSize: 14, lineHeight: 20 },
  addBio:             { fontSize: 14, fontWeight: "600" },
  metaRow:            { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  metaDot:            { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#666" },
  metaText:           { fontSize: 12 },

  /* ── Stats ── */
  statsCard:          { flexDirection: "row", marginHorizontal: 16, marginTop: 14, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  statCell:           { flex: 1, alignItems: "center", paddingVertical: 14, gap: 2 },
  statVal:            { fontSize: 16, fontWeight: "900" },
  statLabel:          { fontSize: 11 },

  /* ── Seller actions ── */
  sellerActions:      { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 12 },
  sellerAction:       { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 14, borderWidth: 1, gap: 5 },
  sellerActionIcon:   { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  sellerActionLabel:  { fontSize: 10, fontWeight: "700" },

  /* ── Highlights ── */
  highlightsRow:      { paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  highlight:          { alignItems: "center", gap: 5 },
  highlightRing:      { width: 62, height: 62, borderRadius: 31, borderWidth: 2, padding: 3 },
  highlightInner:     { width: "100%", height: "100%", borderRadius: 27, alignItems: "center", justifyContent: "center" },
  highlightLabel:     { fontSize: 10, fontWeight: "500" },

  /* ── Resell banner ── */
  resellBanner:       { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1 },
  resellIconWrap:     { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  resellTitle:        { fontSize: 14, fontWeight: "800" },
  resellSub:          { fontSize: 11, lineHeight: 16, marginTop: 1 },
  resellArrow:        { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },

  /* ── Tabs bar ── */
  tabsBar:            { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1 },
  tabItem:            { flex: 1, flexDirection: "column", alignItems: "center", paddingVertical: 10, gap: 3 },
  tabLabel:           { fontSize: 10 },

  /* ── Posts grid ── */
  postsGrid:          { flexDirection: "row", flexWrap: "wrap", gap: 1.5, paddingTop: 2 },
  postCell:           { width: CELL, height: CELL, position: "relative" },
  postCellImg:        { width: "100%", height: "100%" },
  postCellOverlay:    { ...StyleSheet.absoluteFillObject },
  postCellBadge:      { position: "absolute", bottom: 5, left: 5, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  postCellBadgeText:  { color: "#fff", fontSize: 10, fontWeight: "700" },

  /* ── Products grid ── */
  productGrid:        { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  productCell:        { width: PROD_CARD, borderRadius: 12, overflow: "hidden", borderWidth: 1 },
  productCellImg:     { width: "100%", height: PROD_CARD * 0.85 },
  productCellInfo:    { padding: 8, gap: 4 },
  productCellTitle:   { fontSize: 12, fontWeight: "600" },
  productCellBottom:  { flexDirection: "row", alignItems: "center", gap: 6 },
  productCellPrice:   { fontSize: 13, fontWeight: "800" },
  productCellDisc:    { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6 },
  productCellDiscText:{ color: "#fff", fontSize: 9, fontWeight: "800" },

  /* ── Orders ── */
  orderCard:          { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  orderImg:           { width: 50, height: 50, borderRadius: 10 },
  orderProduct:       { fontSize: 13, fontWeight: "700" },
  orderId:            { fontSize: 11, marginTop: 1 },
  orderPrice:         { fontSize: 13, fontWeight: "800", marginTop: 2 },
  orderStatusBadge:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  orderStatusDot:     { width: 6, height: 6, borderRadius: 3 },
  orderStatusText:    { fontSize: 10, fontWeight: "700" },
  viewAllBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, marginTop: 4 },
  viewAllText:        { fontSize: 14, fontWeight: "700" },

  /* ── Reviews ── */
  reviewsSummary:     { alignItems: "center", padding: 20, borderRadius: 16, borderWidth: 1, gap: 6 },
  reviewsAvg:         { fontSize: 42, fontWeight: "900" },
  reviewsStars:       { flexDirection: "row", gap: 4 },
  reviewsCount:       { fontSize: 12 },
  reviewCard:         { borderRadius: 14, padding: 14, gap: 8, borderWidth: 1 },
  reviewHeader:       { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  reviewAvatar:       { width: 40, height: 40, borderRadius: 20 },
  reviewName:         { fontSize: 14, fontWeight: "700" },
  reviewStars:        { flexDirection: "row", gap: 2, marginTop: 3 },
  reviewTime:         { fontSize: 11 },
  reviewText:         { fontSize: 13, lineHeight: 19 },

  /* ── Empty state ── */
  emptyState:         { alignItems: "center", gap: 10, paddingVertical: 50, paddingHorizontal: 40 },
  emptyIconWrap:      { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center" },
  emptyTitle:         { fontSize: 17, fontWeight: "800" },
  emptySub:           { fontSize: 13, textAlign: "center", lineHeight: 20 },
  emptyBtn:           { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 22, marginTop: 4 },
  emptyBtnText:       { color: "#fff", fontWeight: "700", fontSize: 14 },

  /* ── Settings ── */
  settingsTopBar:     { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  settingsTopTitle:   { flex: 1, fontSize: 18, fontWeight: "800" },
  settingsProfile:    { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  settingsAvatarRing: { borderWidth: 2, borderRadius: 26, padding: 2 },
  settingsAvatar:     { width: 46, height: 46, borderRadius: 23 },
  settingsName:       { fontSize: 15, fontWeight: "700" },
  settingsEmail:      { fontSize: 13, marginTop: 1 },
  settingRow:         { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1 },
  settingIconWrap:    { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  settingLabel:       { flex: 1, fontSize: 15 },
  logoutBtn:          { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, margin: 16, paddingVertical: 15, borderRadius: 16, borderWidth: 1.5 },
  logoutText:         { color: "#FF3B5C", fontSize: 15, fontWeight: "800" },
});
