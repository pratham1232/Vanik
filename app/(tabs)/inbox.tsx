import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { STATUSES, STORIES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

/* ── Mock data ─────────────────────────────────────────── */
const CALL_LOG = [
  { id: "cl1", name: "Style Studio",     avatar: "https://i.pravatar.cc/60?img=47", type: "video", dir: "incoming", missed: false, time: "Today, 10:30 AM",    dur: "4:32"  },
  { id: "cl2", name: "Riya Sharma",      avatar: "https://i.pravatar.cc/60?img=9",  type: "voice", dir: "outgoing", missed: false, time: "Today, 9:14 AM",     dur: "1:08"  },
  { id: "cl3", name: "ClayCraft Studio", avatar: "https://i.pravatar.cc/60?img=45", type: "voice", dir: "incoming", missed: true,  time: "Yesterday, 6:00 PM", dur: ""      },
  { id: "cl4", name: "Karan M.",         avatar: "https://i.pravatar.cc/60?img=12", type: "video", dir: "outgoing", missed: false, time: "Yesterday, 2:15 PM", dur: "12:04" },
  { id: "cl5", name: "EcoThreads",       avatar: "https://i.pravatar.cc/60?img=32", type: "voice", dir: "incoming", missed: true,  time: "2 days ago",         dur: ""      },
  { id: "cl6", name: "GlowWithSam",      avatar: "https://i.pravatar.cc/60?img=11", type: "voice", dir: "incoming", missed: false, time: "3 days ago",         dur: "0:45"  },
];

/* Seller-only: customer labels */
const SELLER_LABELS = [
  { label: "New Customer",     color: "#3B82F6", count: 4  },
  { label: "Pending Payment",  color: "#F59E0B", count: 2  },
  { label: "Order Dispatched", color: "#10B981", count: 7  },
  { label: "VIP",              color: "#8B5CF6", count: 3  },
  { label: "Complaint",        color: "#FF3B5C", count: 1  },
];

/* Seller-only: broadcast lists */
const BROADCASTS = [
  { id: "b1", name: "All Customers",    count: 284, icon: "users"  },
  { id: "b2", name: "VIP Buyers",       count: 46,  icon: "star"   },
  { id: "b3", name: "Flash Sale List",  count: 130, icon: "zap"    },
];

/* Buyer-only: order tracking */
const BUYER_ORDERS = [
  { id: "ORD-4821", seller: "Style Studio",    product: "Handcrafted Leather Bag",  status: "Out for delivery", color: "#10B981", eta: "Today by 8 PM"     },
  { id: "ORD-4819", seller: "ClayCraft Studio",product: "Terracotta Vase Set",       status: "Shipped",          color: "#F59E0B", eta: "Tomorrow, Dec 28"  },
];

/* ── Activity notifications ─────────────────────────────── */
const BUYER_ACTIVITY = [
  { icon: "package",     color: "#10B981", title: "Order Confirmed",       sub: "Style Studio confirmed #VNK-4821",       time: "2m",  route: "/orders"        },
  { icon: "video",       color: "#FF3B5C", title: "Style Studio is LIVE",  sub: "Summer Collection • 2.4K watching",       time: "5m",  route: "/live/l1"       },
  { icon: "trending-up", color: "#8B5CF6", title: "You earned ₹180!",      sub: "Someone bought via your resell link",     time: "1h",  route: "/explore"       },
  { icon: "heart",       color: "#EC4899", title: "42 new likes",           sub: "Meera, Karan and 40 others liked",        time: "3h",  route: "/notifications" },
];

const SELLER_ACTIVITY = [
  { icon: "shopping-bag",color: "#10B981", title: "New Order! ₹1,899",     sub: "Riya Sharma ordered Leather Bag",         time: "2m",  route: "/orders"        },
  { icon: "star",        color: "#F59E0B", title: "5★ Review received",    sub: "Karan M. left a glowing review",          time: "30m", route: "/notifications" },
  { icon: "trending-up", color: "#8B5CF6", title: "Sales up 24% today",    sub: "Your best day this week!",                time: "1h",  route: null             },
  { icon: "users",       color: "#3B82F6", title: "12 new followers",      sub: "After your live session",                 time: "2h",  route: null             },
  { icon: "alert-circle",color: "#FF3B5C", title: "Low stock alert",       sub: "Leather Bag has only 3 left",             time: "3h",  route: null             },
];

/* ── Quick reply sheet (seller only) ─────────────────────── */
function QuickReplySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const replies = [
    "Thanks for reaching out! 😊 How can I help you?",
    "Your order has been dispatched! Track here: vanik.app/track",
    "We'll process your refund within 3-5 business days.",
    "Yes, we ship pan-India! Free delivery above ₹499.",
    "This item is currently in stock. Order now before it sells out!",
    "Thank you for your purchase! Please leave us a review 🌟",
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={qStyles.overlay} onPress={onClose}>
        <View style={[qStyles.sheet, { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: Platform.OS === "web" ? 24 : insets.bottom + 16 }]}>
          <View style={[qStyles.handle, { backgroundColor: colors.border }]} />
          <Text style={[qStyles.title, { color: colors.foreground }]}>⚡ Quick Replies</Text>
          <Text style={[qStyles.sub, { color: colors.mutedForeground }]}>Tap to copy and send</Text>
          {replies.map((r, i) => (
            <Pressable key={i} style={[qStyles.replyItem, { borderBottomColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}>
              <Text style={[qStyles.replyText, { color: colors.foreground }]}>{r}</Text>
              <Feather name="copy" size={15} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
const qStyles = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, paddingTop: 10 },
  handle:     { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  title:      { fontSize: 17, fontWeight: "800", paddingHorizontal: 18, marginBottom: 2 },
  sub:        { fontSize: 12, paddingHorizontal: 18, marginBottom: 10 },
  replyItem:  { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1 },
  replyText:  { flex: 1, fontSize: 14, lineHeight: 20 },
});

/* ── ChatRow ─────────────────────────────────────────────── */
function ChatRow({ chat, colors, isSeller }: { chat: any; colors: any; isSeller: boolean }) {
  const hasUnread = chat.unread > 0;

  /* Label for seller view */
  const labelMap: Record<string, { text: string; color: string }> = {
    c1: { text: "VIP",              color: "#8B5CF6" },
    c2: { text: "New Customer",     color: "#3B82F6" },
    c3: { text: "Pending Payment",  color: "#F59E0B" },
    c4: { text: "Order Dispatched", color: "#10B981" },
    c5: { text: "Complaint",        color: "#FF3B5C" },
  };
  const label = isSeller ? labelMap[chat.id] : null;

  return (
    <Pressable
      style={[
        styles.chatRow,
        {
          backgroundColor: hasUnread ? colors.primary + "12" : "rgba(255,255,255,0.045)",
          borderColor: hasUnread ? colors.primary + "45" : "rgba(255,255,255,0.08)",
        },
      ]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/chat/${chat.id}`); }}
      onLongPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
    >
      {hasUnread && (
        <LinearGradient
          colors={[colors.primary + "35", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chatRowGlow}
          pointerEvents="none"
        />
      )}
      <View style={{ position: "relative" }}>
        <Image source={{ uri: chat.avatar }} style={[styles.chatAvatar, chat.isGroup && { borderRadius: 18 }]} />
        {chat.online && !chat.isGroup && (
          <View style={[styles.onlineDot, { backgroundColor: "#10B981", borderColor: "#050510" }]} />
        )}
        {chat.isGroup && (
          <View style={[styles.groupBadge, { backgroundColor: "#8B5CF6", borderColor: "#050510" }]}>
            <Feather name="users" size={8} color="#fff" />
          </View>
        )}
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        {/* Top row */}
        <View style={styles.chatTop}>
          <View style={styles.chatNameRow}>
            <Text style={[styles.chatName, { color: colors.foreground, fontWeight: hasUnread ? "800" : "600" }]} numberOfLines={1}>
              {chat.name}
            </Text>
            {chat.verified && <Feather name="check-circle" size={12} color={colors.primary} />}
            {isSeller && chat.isGroup && (
              <View style={[styles.bizBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "50" }]}>
                <Text style={[styles.bizBadgeText, { color: colors.primary }]}>BIZ</Text>
              </View>
            )}
            {chat.isPinned && <Feather name="bookmark" size={10} color={colors.mutedForeground} />}
            {chat.isMuted && <Feather name="bell-off" size={10} color={colors.mutedForeground} />}
          </View>
          <View style={styles.chatTimeRow}>
            {chat.lastMsgFrom === "me" && (
              <Feather name="check" size={12} color={hasUnread ? colors.primary : "#10B981"} />
            )}
            <Text style={[styles.chatTime, { color: hasUnread ? colors.primary : colors.mutedForeground, fontWeight: hasUnread ? "700" : "400" }]}>
              {chat.time}
            </Text>
          </View>
        </View>

        {/* Preview row */}
        <View style={styles.chatBottom}>
          <Text style={[styles.chatPreview, { color: hasUnread ? colors.foreground : colors.mutedForeground, fontWeight: hasUnread ? "600" : "400" }]} numberOfLines={1}>
            {chat.lastMsg}
          </Text>
          <View style={styles.chatBadges}>
            {label && (
              <View style={[styles.labelPill, { backgroundColor: label.color + "20", borderColor: label.color + "50" }]}>
                <Text style={[styles.labelPillText, { color: label.color }]}>{label.text}</Text>
              </View>
            )}
            {hasUnread && (
              <View style={[styles.unreadBadge, { backgroundColor: chat.isMuted ? colors.mutedForeground : colors.primary }]}>
                <Text style={styles.unreadBadgeText}>{chat.unread > 99 ? "99+" : chat.unread}</Text>
              </View>
            )}
            <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.22)" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* ── Main screen ─────────────────────────────────────────── */
export default function InboxScreen() {
  const colors   = useColors();
  const insets   = useSafeAreaInsets();
  const { user } = useAuth();
  const friends: any[] = [];
  const communities: any[] = [];
  const { threads } = useChat();
  const isSeller = user?.role === "seller";

  const [activeTab,       setActiveTab]       = useState(0);
  const [search,          setSearch]          = useState("");
  const [showQuickReply,  setShowQuickReply]  = useState(false);
  const [showNewChat,     setShowNewChat]     = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered   = threads.filter((c: any) => search.length < 2 || c.name.toLowerCase().includes(search.toLowerCase()));
  const totalUnread = threads.reduce((s: number, c: any) => s + c.unread, 0);
  const onlineNow = threads.filter((c: any) => c.online).length;
  const pinned     = filtered.filter((c: any) => (c as any).isPinned);
  const unpinned   = filtered.filter((c: any) => !(c as any).isPinned);

  const TABS = isSeller
    ? ["Chats", "Broadcast", "Status", "Calls"]
    : ["Chats", "Community", "Orders", "Calls"];

  return (
    <View style={[styles.container, { backgroundColor: "#050510" }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Root Aura Gradient ── */}
      <LinearGradient 
        colors={["#0A0A1F", "#050510", "#000000"]} 
        style={StyleSheet.absoluteFillObject} 
      />
      <View style={styles.topAura}>
        <LinearGradient 
          colors={["rgba(139,92,246,0.12)", "transparent"]} 
          style={StyleSheet.absoluteFillObject} 
        />
      </View>

      {isSeller && <QuickReplySheet visible={showQuickReply} onClose={() => setShowQuickReply(false)} />}

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>
            <Text style={{ color: "#E9D5FF" }}>V</Text>anik
          </Text>
          {isSeller && (
            <View style={[styles.businessBadge, { backgroundColor: "#8B5CF6" }]}>
              <Feather name="briefcase" size={9} color="#fff" />
              <Text style={styles.businessBadgeText}>Business</Text>
            </View>
          )}
          {totalUnread > 0 && (
            <View style={[styles.unreadPill, { backgroundColor: "#FF3B5C" }]}>
              <Text style={styles.unreadPillText}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {isSeller && (
            <Pressable style={[styles.hBtn, { backgroundColor: "rgba(139,92,246,0.2)" }]} onPress={() => setShowQuickReply(true)}>
              <Feather name="zap" size={17} color="#A78BFA" />
            </Pressable>
          )}
          <Pressable style={[styles.hBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]} onPress={() => router.push("/notifications")}>
            <Feather name="bell" size={17} color="#fff" />
          </Pressable>
          <Pressable style={[styles.hBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
            <Feather name="camera" size={17} color="#fff" />
          </Pressable>
          <Pressable style={[styles.hBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
            <Feather name="more-vertical" size={17} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabRow}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
        {TABS.map((tab, i) => (
          <Pressable
            key={tab}
            style={[styles.tab, i === activeTab && { borderBottomWidth: 3, borderBottomColor: "#8B5CF6" }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(i); }}
          >
            <Text style={[styles.tabText, { color: i === activeTab ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: i === activeTab ? "800" : "600" }]}>
              {tab}
            </Text>
            {tab === "Chats" && totalUnread > 0 && (
              <View style={[styles.tabDot, { backgroundColor: "#FF3B5C" }]}>
                <Text style={styles.tabDotText}>{totalUnread}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* ═══════════════════════════════════════════
          TAB 0 — CHATS
      ═══════════════════════════════════════════ */}
      {activeTab === 0 && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 90 }}>

          {/* Search bar */}
          <View style={styles.searchSection}>
            <BlurView intensity={20} tint="dark" style={styles.searchPill}>
              <Feather name="search" size={15} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={[styles.searchInput, { color: "#fff" }]}
                placeholder="Search messages..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Feather name="x-circle" size={16} color="rgba(255,255,255,0.4)" />
                </Pressable>
              )}
            </BlurView>
          </View>

          <View style={styles.chatOverview}>
            <LinearGradient
              colors={["rgba(139,92,246,0.22)", "rgba(59,130,246,0.08)", "rgba(255,255,255,0.035)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overviewTop}>
              <View>
                <Text style={styles.overviewEyebrow}>{isSeller ? "CUSTOMER DESK" : "SOCIAL SHOPPING"}</Text>
                <Text style={styles.overviewTitle}>{isSeller ? "Reply faster, sell smoother" : "Your chats are ready"}</Text>
              </View>
              <Pressable
                style={styles.overviewAction}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/chat/c1"); }}
              >
                <Feather name="edit-3" size={16} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{filtered.length}</Text>
                <Text style={styles.overviewStatLabel}>Chats</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{totalUnread}</Text>
                <Text style={styles.overviewStatLabel}>Unread</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{onlineNow}</Text>
                <Text style={styles.overviewStatLabel}>Online</Text>
              </View>
            </View>
          </View>

          {/* ── SELLER ONLY: Labels filter ── */}
          {isSeller && (
            <>
              <View style={styles.sectionHeader}>
                <Feather name="tag" size={11} color={colors.mutedForeground} />
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LABELS</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.labelsRow}>
                <Pressable style={[styles.labelChip, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={[styles.labelChipText, { color: "#fff" }]}>All</Text>
                </Pressable>
                {SELLER_LABELS.map((l) => (
                  <Pressable key={l.label} style={[styles.labelChip, { backgroundColor: l.color + "18", borderColor: l.color + "40" }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <View style={[styles.labelDot, { backgroundColor: l.color }]} />
                    <Text style={[styles.labelChipText, { color: l.color }]}>{l.label}</Text>
                    <View style={[styles.labelCount, { backgroundColor: l.color }]}>
                      <Text style={styles.labelCountText}>{l.count}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          {/* ── BUYER ONLY: Active order tracking ── */}
          {!isSeller && BUYER_ORDERS.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Feather name="package" size={11} color={colors.mutedForeground} />
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACTIVE ORDERS</Text>
              </View>
              {BUYER_ORDERS.map((o) => (
                <Pressable key={o.id} style={[styles.orderTrackCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push("/orders")}>
                  <View style={[styles.orderTrackIcon, { backgroundColor: o.color + "18" }]}>
                    <Feather name="package" size={18} color={o.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.orderTrackProduct, { color: colors.foreground }]} numberOfLines={1}>{o.product}</Text>
                    <Text style={[styles.orderTrackSeller, { color: colors.mutedForeground }]}>{o.seller} · {o.id}</Text>
                    <View style={styles.orderTrackStatusRow}>
                      <View style={[styles.orderStatusDot, { backgroundColor: o.color }]} />
                      <Text style={[styles.orderTrackStatus, { color: o.color }]}>{o.status}</Text>
                      <Text style={[styles.orderTrackEta, { color: colors.mutedForeground }]}>· {o.eta}</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </>
          )}

          {/* Pinned chats */}
          {pinned.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Feather name="bookmark" size={11} color={colors.mutedForeground} />
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PINNED</Text>
              </View>
              <View style={styles.chatList}>
                {pinned.map((chat) => <ChatRow key={chat.id} chat={chat} colors={colors} isSeller={isSeller} />)}
              </View>
            </>
          )}

          {/* All chats */}
          <View style={styles.sectionHeader}>
            <Feather name="message-circle" size={11} color={colors.mutedForeground} />
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              {isSeller ? "CUSTOMERS" : "ALL MESSAGES"}
            </Text>
          </View>
          <View style={styles.chatList}>
            {unpinned.map((chat) => <ChatRow key={chat.id} chat={chat} colors={colors} isSeller={isSeller} />)}
          </View>

          {/* Activity feed */}
          <View style={[styles.sectionHeader, { marginTop: 6 }]}>
            <Feather name="bell" size={11} color={colors.mutedForeground} />
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              {isSeller ? "SELLER ALERTS" : "ACTIVITY"}
            </Text>
          </View>
          {(isSeller ? SELLER_ACTIVITY : BUYER_ACTIVITY).map((n, i) => (
            <Pressable key={i} style={[styles.activityRow, { borderBottomColor: colors.border }]}
              onPress={() => { if (n.route) router.push(n.route as any); }}>
              <View style={[styles.activityIcon, { backgroundColor: n.color + "20" }]}>
                <Feather name={n.icon as any} size={18} color={n.color} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.activityTitle, { color: colors.foreground }]}>{n.title}</Text>
                <Text style={[styles.activitySub, { color: colors.mutedForeground }]} numberOfLines={1}>{n.sub}</Text>
              </View>
              <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>{n.time}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ═══════════════════════════════════════════
          TAB 1 — BROADCAST (seller) / STATUS (buyer)
      ═══════════════════════════════════════════ */}
      {activeTab === 1 && (
        isSeller ? (
          /* SELLER: Broadcast lists */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
            <View style={[styles.broadcastHero, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
              <Feather name="radio" size={28} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.broadcastHeroTitle, { color: colors.foreground }]}>Broadcast Messages</Text>
                <Text style={[styles.broadcastHeroSub, { color: colors.mutedForeground }]}>Reach all your customers at once</Text>
              </View>
              <Pressable style={[styles.broadcastNewBtn, { backgroundColor: colors.primary }]}>
                <Feather name="plus" size={16} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR LISTS</Text>
            </View>
            {BROADCASTS.map((b) => (
              <Pressable key={b.id} style={[styles.broadcastRow, { borderBottomColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <View style={[styles.broadcastIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name={b.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.broadcastName, { color: colors.foreground }]}>{b.name}</Text>
                  <Text style={[styles.broadcastCount, { color: colors.mutedForeground }]}>{b.count} recipients</Text>
                </View>
                <Pressable style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
                  <Feather name="send" size={14} color="#fff" />
                  <Text style={styles.sendBtnText}>Send</Text>
                </Pressable>
              </Pressable>
            ))}

            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SELLER ANALYTICS</Text>
            </View>
            <View style={[styles.analyticsGrid, { borderColor: colors.border }]}>
              {[
                { label: "Chats Today",      value: "24",  icon: "message-circle", color: "#3B82F6" },
                { label: "Response Rate",     value: "98%", icon: "check-circle",   color: "#10B981" },
                { label: "Avg. Reply Time",   value: "3m",  icon: "clock",          color: "#F59E0B" },
                { label: "Orders via Chat",   value: "7",   icon: "shopping-bag",   color: "#8B5CF6" },
              ].map((stat, i) => (
                <View key={i} style={[styles.analyticCell, i % 2 === 0 && { borderRightWidth: 1, borderRightColor: colors.border }, i < 2 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={[styles.analyticIcon, { backgroundColor: stat.color + "18" }]}>
                    <Feather name={stat.icon as any} size={16} color={stat.color} />
                  </View>
                  <Text style={[styles.analyticVal, { color: colors.foreground }]}>{stat.value}</Text>
                  <Text style={[styles.analyticLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>QUICK REPLIES</Text>
            </View>
            <Pressable style={[styles.quickReplyBtn, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
              onPress={() => setShowQuickReply(true)}>
              <Feather name="zap" size={18} color={colors.primary} />
              <Text style={[styles.quickReplyBtnText, { color: colors.primary }]}>Manage Quick Replies</Text>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </Pressable>
          </ScrollView>
        ) : (
          /* BUYER: Community Tab */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
            {/* Friends row */}
            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR FRIENDS</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
              <Pressable style={styles.addFriendBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <View style={[styles.addFriendIcon, { backgroundColor: colors.primary + "20" }]}>
                  <Feather name="plus" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.addFriendText, { color: colors.primary }]}>Add Friend</Text>
              </Pressable>
              {friends.map((f: any) => (
                <Pressable key={f.id} style={styles.friendCol} onPress={() => router.push(`/chat/${f.id}`)}>
                  <View style={styles.friendAvatarWrap}>
                    <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                    {f.status !== "offline" && (
                      <View style={[styles.onlineDot, { backgroundColor: f.status === "online" ? "#10B981" : "#F59E0B", borderColor: "#050510", borderWidth: 2.5 }]} />
                    )}
                  </View>
                  <Text style={[styles.friendName, { color: "#fff" }]} numberOfLines={1}>{f.name.split(" ")[0]}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DISCOVER COMMUNITIES</Text>
            </View>
            {communities.map((c: any) => (
              <Pressable key={c.id} style={[styles.communityCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Image source={{ uri: c.avatar }} style={styles.communityAvatar} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.communityName, { color: colors.foreground }]} numberOfLines={1}>{c.name}</Text>
                    {c.isJoined && (
                      <View style={[styles.joinedBadge, { backgroundColor: colors.primary + "15" }]}>
                        <Text style={[styles.joinedBadgeText, { color: colors.primary }]}>Joined</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.communityDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{c.description}</Text>
                  <Text style={[styles.communityCount, { color: colors.mutedForeground }]}>{c.memberCount} members • {c.category}</Text>
                </View>
                <Pressable style={[styles.joinBtn, { backgroundColor: c.isJoined ? colors.muted : colors.primary }]}>
                  <Text style={[styles.joinBtnText, { color: c.isJoined ? colors.foreground : "#fff" }]}>{c.isJoined ? "Open" : "Join"}</Text>
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        )
      )}

      {/* ═══════════════════════════════════════════
          TAB 2 — ORDERS (buyer) / STATUS (seller)
      ═══════════════════════════════════════════ */}
      {activeTab === 2 && (
        isSeller ? (
          /* SELLER: Their own status updates */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
            <View style={[styles.myStatus, { borderBottomColor: colors.border }]}>
              <View style={styles.myStatusLeft}>
                <Image source={{ uri: user?.avatar ?? "https://i.pravatar.cc/100?img=47" }} style={styles.statusAvatar} />
                <View style={[styles.statusAddBtn, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Text style={styles.statusAddPlus}>+</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusName, { color: colors.foreground }]}>Business Status</Text>
                <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>Share products, deals & updates</Text>
              </View>
              <Pressable style={[styles.hBtn, { backgroundColor: colors.primary + "20" }]} onPress={() => router.push("/add-story")}>
                <Feather name="plus" size={17} color={colors.primary} />
              </Pressable>
            </View>

            <View style={[styles.sectionHeader, { marginTop: 4 }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR UPDATES VIEWED BY</Text>
            </View>
            {STATUSES.slice(0, 3).map((s) => (
              <View key={s.id} style={[styles.statusRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.statusRing, { borderColor: colors.border }]}>
                  <Image source={{ uri: s.avatar }} style={styles.statusRingImg} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.statusName, { color: colors.foreground }]}>{s.name}</Text>
                  <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>Viewed · {s.time}</Text>
                </View>
                <Feather name="eye" size={16} color={colors.mutedForeground} />
              </View>
            ))}
          </ScrollView>
        ) : (
          /* BUYER: Full orders tab */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACTIVE ORDERS</Text>
            </View>
            {BUYER_ORDERS.map((o) => (
              <Pressable key={o.id} style={[styles.fullOrderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/orders")}>
                <View style={styles.fullOrderTop}>
                  <View style={[styles.orderTrackIcon, { backgroundColor: o.color + "18" }]}>
                    <Feather name="package" size={20} color={o.color} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.orderTrackProduct, { color: colors.foreground }]}>{o.product}</Text>
                    <Text style={[styles.orderTrackSeller, { color: colors.mutedForeground }]}>{o.seller} · {o.id}</Text>
                  </View>
                  <View style={[styles.orderStatusBadge, { backgroundColor: o.color + "18", borderColor: o.color + "40" }]}>
                    <View style={[styles.orderStatusDot, { backgroundColor: o.color }]} />
                    <Text style={[styles.orderTrackStatus, { color: o.color }]}>{o.status}</Text>
                  </View>
                </View>
                <View style={[styles.fullOrderEta, { backgroundColor: o.color + "10" }]}>
                  <Feather name="clock" size={12} color={o.color} />
                  <Text style={[styles.fullOrderEtaText, { color: o.color }]}>{o.eta}</Text>
                </View>
                <View style={styles.fullOrderActions}>
                  <Pressable style={[styles.orderActionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    onPress={() => router.push("/chat/c1")}>
                    <Feather name="message-circle" size={14} color={colors.foreground} />
                    <Text style={[styles.orderActionText, { color: colors.foreground }]}>Message Seller</Text>
                  </Pressable>
                  <Pressable style={[styles.orderActionBtn, { backgroundColor: colors.primary }]}>
                    <Feather name="map-pin" size={14} color="#fff" />
                    <Text style={[styles.orderActionText, { color: "#fff" }]}>Track Order</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
            <Pressable style={[styles.viewAllOrders, { borderColor: colors.primary }]} onPress={() => router.push("/orders")}>
              <Text style={[styles.viewAllOrdersText, { color: colors.primary }]}>View All Orders</Text>
              <Feather name="arrow-right" size={15} color={colors.primary} />
            </Pressable>
          </ScrollView>
        )
      )}

      {/* ═══════════════════════════════════════════
          TAB 3 — CALLS
      ═══════════════════════════════════════════ */}
      {activeTab === 3 && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
          {/* Call stats for seller */}
          {isSeller && (
            <View style={[styles.callStatsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { label: "Today",    value: "8",  color: "#3B82F6" },
                { label: "Missed",   value: "2",  color: "#FF3B5C" },
                { label: "Duration", value: "32m",color: "#10B981" },
              ].map((s) => (
                <View key={s.label} style={styles.callStat}>
                  <Text style={[styles.callStatVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={[styles.callStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable style={[styles.newCallBtn, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "30" }]}>
            <View style={[styles.newCallIcon, { backgroundColor: colors.primary }]}>
              <Feather name="phone" size={18} color="#fff" />
            </View>
            <Text style={[styles.newCallText, { color: colors.primary }]}>
              {isSeller ? "Call a Customer" : "New Call"}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </Pressable>

          {isSeller && (
            <Pressable style={[styles.newCallBtn, { backgroundColor: "#3B82F620", borderColor: "#3B82F640", marginTop: -4 }]}>
              <View style={[styles.newCallIcon, { backgroundColor: "#3B82F6" }]}>
                <Feather name="video" size={18} color="#fff" />
              </View>
              <Text style={[styles.newCallText, { color: "#3B82F6" }]}>Video Call a Customer</Text>
              <Feather name="chevron-right" size={16} color="#3B82F6" />
            </Pressable>
          )}

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RECENT</Text>
          </View>
          {CALL_LOG.map((call) => (
            <Pressable key={call.id} style={[styles.callRow, { borderBottomColor: colors.border }]}>
              <View style={{ position: "relative" }}>
                <Image source={{ uri: call.avatar }} style={styles.callAvatar} />
                <View style={[styles.callTypeBadge, { backgroundColor: call.type === "video" ? "#3B82F6" : "#10B981" }]}>
                  <Feather name={call.type === "video" ? "video" : "phone"} size={8} color="#fff" />
                </View>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.callName, { color: call.missed ? "#FF3B5C" : colors.foreground }]}>{call.name}</Text>
                <View style={styles.callMeta}>
                  <Feather
                    name={call.dir === "incoming" ? "phone-incoming" : "phone-outgoing"}
                    size={12}
                    color={call.missed ? "#FF3B5C" : "#10B981"}
                  />
                  <Text style={[styles.callSub, { color: call.missed ? "#FF3B5C" : colors.mutedForeground }]}>
                    {call.missed ? "Missed" : call.dir === "incoming" ? "Incoming" : "Outgoing"}
                    {call.dur ? ` · ${call.dur}` : ""}
                  </Text>
                </View>
                <Text style={[styles.callTime, { color: colors.mutedForeground }]}>{call.time}</Text>
              </View>
              <View style={styles.callBtns}>
                <Pressable style={[styles.callbackBtn, { backgroundColor: colors.muted }]}>
                  <Feather name="phone" size={16} color="#10B981" />
                </Pressable>
                <Pressable style={[styles.callbackBtn, { backgroundColor: colors.muted }]}>
                  <Feather name="video" size={16} color="#3B82F6" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ── FAB ── */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/chat/c1"); }}
      >
        <Feather name={isSeller ? "user-plus" : "message-circle"} size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1 },
  topAura:            { position: "absolute", top: 0, left: 0, right: 0, height: 340 },
  /* Header */
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingBottom: 10, paddingTop: 8, borderBottomWidth: 1 },
  headerLeft:         { flexDirection: "row", alignItems: "center", gap: 7 },
  logo:               { fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  businessBadge:      { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  businessBadgeText:  { color: "#fff", fontSize: 9, fontWeight: "800" },
  unreadPill:         { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  unreadPillText:     { color: "#fff", fontSize: 10, fontWeight: "800" },
  headerRight:        { flexDirection: "row", gap: 6 },
  hBtn:               { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  /* Tabs */
  tabRow:             { flexDirection: "row", borderBottomWidth: 1 },
  tab:                { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, gap: 4 },
  tabText:            { fontSize: 12.5 },
  tabDot:             { minWidth: 17, height: 17, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  tabDotText:         { color: "#fff", fontSize: 9, fontWeight: "700" },
  /* Search */
  searchSection:      { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6 },
  searchPill:         { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  searchInput:        { flex: 1, fontSize: 14, fontWeight: "500" },
  /* Chat overview */
  chatOverview:       { marginHorizontal: 14, marginTop: 8, marginBottom: 6, padding: 16, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  overviewTop:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  overviewEyebrow:    { color: "rgba(255,255,255,0.48)", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  overviewTitle:      { color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 3, letterSpacing: -0.2 },
  overviewAction:     { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(139,92,246,0.85)" },
  overviewStats:      { flexDirection: "row", alignItems: "center", borderRadius: 14, backgroundColor: "rgba(0,0,0,0.18)", paddingVertical: 10 },
  overviewStat:       { flex: 1, alignItems: "center", gap: 2 },
  overviewStatValue:  { color: "#fff", fontSize: 18, fontWeight: "900" },
  overviewStatLabel:  { color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "700" },
  overviewDivider:    { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.12)" },
  /* Section headers */
  sectionHeader:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  sectionLabel:       { fontSize: 10.5, fontWeight: "700", letterSpacing: 0.8 },
  /* Labels row (seller) */
  labelsRow:          { paddingHorizontal: 14, paddingBottom: 8, gap: 7 },
  labelChip:          { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  labelDot:           { width: 6, height: 6, borderRadius: 3 },
  labelChipText:      { fontSize: 11, fontWeight: "700" },
  labelCount:         { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  labelCountText:     { color: "#fff", fontSize: 8, fontWeight: "800" },
  /* Order tracking card (buyer) */
  orderTrackCard:     { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 14, marginBottom: 8, padding: 12, borderRadius: 14, borderWidth: 1 },
  orderTrackIcon:     { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  orderTrackProduct:  { fontSize: 13, fontWeight: "700" },
  orderTrackSeller:   { fontSize: 11 },
  orderTrackStatusRow:{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  orderStatusDot:     { width: 6, height: 6, borderRadius: 3 },
  orderTrackStatus:   { fontSize: 11, fontWeight: "700" },
  orderTrackEta:      { fontSize: 10 },
  /* Chats */
  chatList:           { paddingHorizontal: 14, gap: 10 },
  chatRow:            { position: "relative", flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 2 },
  chatRowGlow:        { position: "absolute", left: 0, top: 0, bottom: 0, width: "70%" },
  chatAvatar:         { width: 54, height: 54, borderRadius: 27, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.16)" },
  onlineDot:          { position: "absolute", bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  groupBadge:         { position: "absolute", bottom: -1, right: -1, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  chatTop:            { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chatNameRow:        { flex: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  chatName:           { flexShrink: 1, fontSize: 14.5 },
  bizBadge:           { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  bizBadgeText:       { fontSize: 8, fontWeight: "900" },
  chatTimeRow:        { flexDirection: "row", alignItems: "center", gap: 3 },
  chatTime:           { fontSize: 11.5 },
  chatBottom:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chatPreview:        { fontSize: 13, flex: 1, marginRight: 6 },
  chatBadges:         { flexDirection: "row", alignItems: "center", gap: 4 },
  labelPill:          { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  labelPillText:      { fontSize: 9, fontWeight: "700" },
  unreadBadge:        { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  unreadBadgeText:    { color: "#fff", fontSize: 10, fontWeight: "800" },
  /* Activity */
  activityRow:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1 },
  activityIcon:       { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  activityTitle:      { fontSize: 14, fontWeight: "700" },
  activitySub:        { fontSize: 12 },
  activityTime:       { fontSize: 11 },
  /* Broadcast (seller) */
  broadcastHero:      { flexDirection: "row", alignItems: "center", gap: 12, margin: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  broadcastHeroTitle: { fontSize: 15, fontWeight: "800" },
  broadcastHeroSub:   { fontSize: 12, marginTop: 2 },
  broadcastNewBtn:    { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  broadcastRow:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1 },
  broadcastIcon:      { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  broadcastName:      { fontSize: 15, fontWeight: "700" },
  broadcastCount:     { fontSize: 12, marginTop: 2 },
  sendBtn:            { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  sendBtnText:        { color: "#fff", fontSize: 12, fontWeight: "700" },
  analyticsGrid:      { marginHorizontal: 14, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  analyticCell:       { width: "50%", alignItems: "center", paddingVertical: 16, gap: 6 },
  analyticIcon:       { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  analyticVal:        { fontSize: 22, fontWeight: "900" },
  analyticLabel:      { fontSize: 11 },
  quickReplyBtn:      { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 14, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  quickReplyBtnText:  { flex: 1, fontSize: 15, fontWeight: "700" },
  /* Status */
  myStatus:           { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1 },
  myStatusLeft:       { position: "relative" },
  myStatusActions:    { flexDirection: "row", gap: 6 },
  statusAvatar:       { width: 54, height: 54, borderRadius: 27 },
  statusAddBtn:       { position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  statusAddPlus:      { color: "#fff", fontSize: 16, fontWeight: "900", lineHeight: 18 },
  statusRow:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12, borderBottomWidth: 1 },
  statusRing:         { width: 58, height: 58, borderRadius: 29, borderWidth: 2.5, padding: 2.5 },
  statusRingImg:      { width: "100%", height: "100%", borderRadius: 26 },
  statusNameRow:      { flexDirection: "row", alignItems: "center", gap: 5 },
  statusName:         { fontSize: 15, fontWeight: "600" },
  statusSub:          { fontSize: 12 },
  bizTag:             { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  bizTagText:         { fontSize: 9, fontWeight: "800" },
  unseenDot:          { width: 10, height: 10, borderRadius: 5 },
  storiesRow:         { paddingHorizontal: 14, paddingVertical: 10, gap: 14 },
  storyBubble:        { alignItems: "center", gap: 5, width: 64 },
  storyBubbleRing:    { width: 64, height: 64, borderRadius: 32, borderWidth: 2.5, padding: 2 },
  storyBubbleImg:     { width: "100%", height: "100%", borderRadius: 29 },
  storyBubbleName:    { fontSize: 10.5, textAlign: "center" },
  /* Full order card */
  fullOrderCard:      { margin: 14, marginBottom: 8, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  fullOrderTop:       { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingBottom: 10 },
  orderStatusBadge:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  fullOrderEta:       { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  fullOrderEtaText:   { fontSize: 12, fontWeight: "600" },
  fullOrderActions:   { flexDirection: "row", gap: 8, padding: 12, paddingTop: 8 },
  orderActionBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  orderActionText:    { fontSize: 12, fontWeight: "700" },
  viewAllOrders:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginHorizontal: 14, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5 },
  viewAllOrdersText:  { fontSize: 14, fontWeight: "700" },
  /* Calls */
  callStatsRow:       { flexDirection: "row", marginHorizontal: 14, marginTop: 12, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  callStat:           { flex: 1, alignItems: "center", paddingVertical: 14, gap: 3 },
  callStatVal:        { fontSize: 20, fontWeight: "900" },
  callStatLabel:      { fontSize: 11 },
  newCallBtn:         { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 14, marginTop: 12, marginBottom: 8, padding: 14, borderRadius: 16, borderWidth: 1 },
  newCallIcon:        { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  newCallText:        { flex: 1, fontSize: 15, fontWeight: "700" },
  callRow:            { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  callAvatar:         { width: 50, height: 50, borderRadius: 25 },
  callTypeBadge:      { position: "absolute", bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#0B0B18" },
  callName:           { fontSize: 14, fontWeight: "600" },
  callMeta:           { flexDirection: "row", alignItems: "center", gap: 4 },
  callSub:            { fontSize: 12 },
  callTime:           { fontSize: 11 },
  callBtns:           { flexDirection: "row", gap: 6 },
  callbackBtn:        { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  /* FAB */
  fab:                { position: "absolute", bottom: Platform.OS === "web" ? 110 : 90, right: 18, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 8 },
  /* Community */
  addFriendBtn:       { width: 64, alignItems: "center", gap: 6 },
  addFriendIcon:      { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  addFriendText:      { fontSize: 11, fontWeight: "700" },
  friendCol:          { alignItems: "center", gap: 8, width: 68 },
  friendAvatarWrap:   { position: "relative", padding: 3, borderRadius: 34, borderWidth: 1.5, borderColor: "rgba(139,92,246,0.3)" },
  friendAvatar:       { width: 54, height: 54, borderRadius: 27 },
  friendName:         { fontSize: 11, fontWeight: "600", textAlign: "center", opacity: 0.8 },
  communityCard:      { flexDirection: "row", alignItems: "center", marginHorizontal: 14, marginBottom: 10, padding: 14, borderRadius: 16, borderWidth: 1, gap: 12 },
  communityAvatar:    { width: 60, height: 60, borderRadius: 16 },
  communityName:      { fontSize: 15, fontWeight: "700", flex: 1 },
  joinedBadge:        { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  joinedBadgeText:    { fontSize: 9, fontWeight: "800" },
  communityDesc:      { fontSize: 12, lineHeight: 16 },
  communityCount:     { fontSize: 11, marginTop: 2 },
  joinBtn:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  joinBtnText:        { fontSize: 13, fontWeight: "700" },
});
