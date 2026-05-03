import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CHAT_MESSAGES, CHAT_THREADS, PRODUCTS, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const REACTIONS = ["❤️", "😂", "🔥", "😮", "👏", "💯"];

interface Reaction { emoji: string; count: number; mine: boolean }
interface Msg {
  id: string; from: "me" | string; type: string;
  text?: string; time: string; read: boolean;
  productId?: string; voiceDuration?: string;
  reactions?: Reaction[]; forwarded?: boolean;
}

const AUTO_REPLIES = [
  "Got it, thank you! 😊", "Sure, let me check that for you.",
  "That looks amazing! 🔥", "Can you share more details?",
  "Will ship it out today! 📦", "Great choice! 🎉",
];

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const botPad    = Platform.OS === "web" ? 34 : insets.bottom;

  const thread  = CHAT_THREADS.find((c) => c.id === id) ?? CHAT_THREADS[0];
  const raw     = CHAT_MESSAGES[id ?? "c1"] ?? CHAT_MESSAGES["c1"];
  const [msgs, setMsgs]           = useState<Msg[]>(raw);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [reaction, setReaction]   = useState<string | null>(null);  // target msg id
  const [selected, setSelected]   = useState<string | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const typingTimer = useRef<any>(null);
  const sendScale   = useRef(new Animated.Value(1)).current;

  /* ─ send ─ */
  const handleSend = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.8, useNativeDriver: true, speed: 60 }),
      Animated.spring(sendScale, { toValue: 1,   useNativeDriver: true, speed: 60 }),
    ]).start();
    const newMsg: Msg = { id: "m" + Date.now(), from: "me", type: "text", text: input.trim(), time: "Now", read: false };
    setMsgs((p) => [...p, newMsg]);
    setInput("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => setTyping(true), 700);
    setTimeout(() => {
      setTyping(false);
      const reply: Msg = { id: "r" + Date.now(), from: "them", type: "text", text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)], time: "Now", read: true };
      setMsgs((p) => [...p, reply]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 2400);
  };

  /* ─ product share ─ */
  const shareProduct = () => {
    setShowAttach(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const m: Msg = { id: "p" + Date.now(), from: "me", type: "product", text: "Check this out! 🛍️", time: "Now", read: false, productId: "p1" };
    setMsgs((p) => [...p, m]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  /* ─ voice ─ */
  const sendVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const durs = ["0:12", "0:28", "0:07", "0:34"];
    const m: Msg = { id: "v" + Date.now(), from: "me", type: "voice", time: "Now", read: false, voiceDuration: durs[Math.floor(Math.random() * durs.length)] };
    setMsgs((p) => [...p, m]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  /* ─ react ─ */
  const doReact = (msgId: string, emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMsgs((prev) => prev.map((msg) => {
      if (msg.id !== msgId) return msg;
      const existing = msg.reactions ?? [];
      const idx = existing.findIndex((r) => r.emoji === emoji);
      let next: Reaction[];
      if (idx >= 0) {
        next = existing[idx].mine
          ? existing.filter((_, i) => i !== idx)
          : existing.map((r, i) => i === idx ? { ...r, count: r.count + 1, mine: true } : r);
      } else {
        next = [...existing, { emoji, count: 1, mine: true }];
      }
      return { ...msg, reactions: next };
    }));
    setReaction(null); setSelected(null);
  };

  /* ─ delete ─ */
  const deleteMsg = (msgId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setMsgs((p) => p.filter((m) => m.id !== msgId));
    setSelected(null);
  };

  /* ─ forward ─ */
  const forwardMsg = (msgId: string) => {
    const original = msgs.find((m) => m.id === msgId);
    if (!original) return;
    const fwd: Msg = { ...original, id: "fwd" + Date.now(), from: "me", forwarded: true, time: "Now" };
    setMsgs((p) => [...p, fwd]);
    setSelected(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Reaction bar overlay ── */}
      {reaction && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => { setReaction(null); setSelected(null); }}>
          <View style={[styles.reactionPopup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {REACTIONS.map((e) => (
              <Pressable key={e} style={styles.reactionItem} onPress={() => doReact(reaction, e)}>
                <Text style={styles.reactionEmoji}>{e}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}

      {/* ── Actions bottom sheet ── */}
      <Modal
        visible={!!selected && !reaction}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setSelected(null)}>
          <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Reaction strip */}
            <View style={styles.sheetReactions}>
              {REACTIONS.map((e) => (
                <Pressable key={e} style={styles.sheetEmoji} onPress={() => { if (selected) doReact(selected, e); }}>
                  <Text style={styles.reactionEmoji}>{e}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />
            {[
              { icon: "corner-up-left", label: "Reply",   color: colors.foreground, fn: () => setSelected(null) },
              { icon: "share-2",        label: "Forward", color: colors.foreground, fn: () => { if (selected) forwardMsg(selected); } },
              { icon: "copy",           label: "Copy",    color: colors.foreground, fn: () => setSelected(null) },
              { icon: "star",           label: "Starred", color: "#F59E0B",         fn: () => setSelected(null) },
              { icon: "trash-2",        label: "Delete",  color: "#FF3B5C",         fn: () => { if (selected) deleteMsg(selected); } },
            ].map((a) => (
              <Pressable key={a.label} style={[styles.sheetItem, { borderBottomColor: colors.border }]} onPress={a.fn}>
                <View style={[styles.sheetItemIcon, { backgroundColor: a.color + "18" }]}>
                  <Feather name={a.icon as any} size={17} color={a.color} />
                </View>
                <Text style={[styles.sheetItemLabel, { color: a.color }]}>{a.label}</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: "auto" }} />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ── Attach options ── */}
      <Modal visible={showAttach} transparent animationType="fade" onRequestClose={() => setShowAttach(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setShowAttach(false)}>
          <View style={[styles.attachGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { icon: "shopping-bag", label: "Product",  color: "#8B5CF6", fn: shareProduct },
              { icon: "image",        label: "Photo",    color: "#3B82F6", fn: () => setShowAttach(false) },
              { icon: "file-text",    label: "Document", color: "#10B981", fn: () => setShowAttach(false) },
              { icon: "map-pin",      label: "Location", color: "#F59E0B", fn: () => setShowAttach(false) },
            ].map((a) => (
              <Pressable key={a.label} style={styles.attachItem} onPress={a.fn}>
                <View style={[styles.attachIcon, { backgroundColor: a.color }]}>
                  <Feather name={a.icon as any} size={22} color="#fff" />
                </View>
                <Text style={[styles.attachLabel, { color: colors.foreground }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <Pressable style={styles.threadRow}>
          <View style={{ position: "relative" }}>
            <Image source={{ uri: thread.avatar }} style={styles.threadAvatar} />
            {thread.online && !thread.isGroup && (
              <View style={[styles.onlineDot, { backgroundColor: colors.online, borderColor: colors.surface }]} />
            )}
          </View>
          <View style={{ gap: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.threadName, { color: colors.foreground }]}>{thread.name}</Text>
              {thread.verified && (
                <View style={[styles.verifiedDot, { backgroundColor: colors.primary }]}>
                  <Feather name="check" size={8} color="#fff" />
                </View>
              )}
            </View>
            {typing ? (
              <View style={styles.typingRow}>
                <View style={[styles.typingDot, { backgroundColor: colors.online }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.online }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.online }]} />
                <Text style={[styles.typingLabel, { color: colors.online }]}>typing…</Text>
              </View>
            ) : (
              <Text style={[styles.threadSub, { color: thread.online ? colors.online : colors.mutedForeground }]}>
                {thread.online && !thread.isGroup ? "● Online" : thread.isGroup ? `${(thread as any).memberCount} members` : "Last seen recently"}
              </Text>
            )}
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable style={[styles.hBtn, { backgroundColor: colors.muted }]}>
            <Feather name="phone" size={16} color={colors.foreground} />
          </Pressable>
          <Pressable style={[styles.hBtn, { backgroundColor: colors.muted }]}>
            <Feather name="video" size={16} color={colors.foreground} />
          </Pressable>
          <Pressable style={[styles.hBtn, { backgroundColor: colors.muted }]}>
            <Feather name="more-vertical" size={16} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.msgList, { paddingBottom: botPad + 20 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Date banner */}
          <View style={styles.dateBanner}>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
            <View style={[styles.datePill, { backgroundColor: colors.muted }]}>
              <Text style={[styles.datePillText, { color: colors.mutedForeground }]}>Today</Text>
            </View>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
          </View>

          {msgs.map((msg) => {
            const isMe = msg.from === "me";
            const prod = msg.type === "product" ? PRODUCTS.find((p) => p.id === msg.productId) : null;
            const dimmed = selected === msg.id;
            return (
              <View key={msg.id} style={[styles.msgBlock, isMe && styles.msgBlockMe]}>
                {/* Avatar for incoming */}
                {!isMe && <Image source={{ uri: thread.avatar }} style={styles.msgAvatar} />}

                <View style={[{ maxWidth: "78%" }, isMe && { alignItems: "flex-end" }]}>
                  {/* Forwarded */}
                  {msg.forwarded && (
                    <View style={[styles.fwdRow, isMe && { justifyContent: "flex-end" }]}>
                      <Feather name="corner-up-right" size={10} color={colors.mutedForeground} />
                      <Text style={[styles.fwdText, { color: colors.mutedForeground }]}>Forwarded</Text>
                    </View>
                  )}

                  {/* Bubble */}
                  <Pressable
                    onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setSelected(msg.id); }}
                    delayLongPress={350}
                    style={{ opacity: dimmed ? 0.6 : 1 }}
                  >
                    <View style={[
                      styles.bubble,
                      isMe
                        ? [styles.bubbleMe, { backgroundColor: colors.primary }]
                        : [styles.bubbleThem, { backgroundColor: colors.card, borderColor: colors.border }],
                    ]}>
                      {/* Product card */}
                      {prod && (
                        <Pressable
                          style={[styles.prodCard, { backgroundColor: isMe ? "rgba(255,255,255,0.12)" : colors.muted, borderColor: isMe ? "rgba(255,255,255,0.2)" : colors.border }]}
                          onPress={() => router.push(`/product/${prod.id}`)}
                        >
                          <Image source={prod.image} style={styles.prodImg} resizeMode="cover" />
                          <View style={styles.prodBody}>
                            <Text style={[styles.prodName, { color: isMe ? "#fff" : colors.foreground }]} numberOfLines={2}>{prod.title}</Text>
                            <Text style={[styles.prodPrice, { color: isMe ? "#E9D5FF" : colors.primary }]}>{formatPrice(prod.price)}</Text>
                            <View style={[styles.prodBtn, { backgroundColor: isMe ? "rgba(255,255,255,0.22)" : colors.primary }]}>
                              <Text style={styles.prodBtnText}>View Product →</Text>
                            </View>
                          </View>
                        </Pressable>
                      )}

                      {/* Voice note */}
                      {msg.type === "voice" && (
                        <View style={styles.voice}>
                          <Pressable style={[styles.voicePlay, { backgroundColor: isMe ? "rgba(255,255,255,0.22)" : colors.primary + "30" }]}>
                            <Feather name="play" size={15} color={isMe ? "#fff" : colors.primary} />
                          </Pressable>
                          <View style={styles.waveform}>
                            {[2,5,3,7,4,9,5,3,6,4,2,7,5,4,6,3,5].map((h, i) => (
                              <View key={i} style={[styles.waveBar, {
                                height: h * 2.8,
                                backgroundColor: isMe ? "rgba(255,255,255,0.6)" : colors.primary + "99",
                              }]} />
                            ))}
                          </View>
                          <Text style={[styles.voiceDur, { color: isMe ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>{msg.voiceDuration}</Text>
                        </View>
                      )}

                      {/* Text */}
                      {msg.text && (
                        <Text style={[styles.bubbleText, { color: isMe ? "#fff" : colors.foreground }]}>{msg.text}</Text>
                      )}

                      {/* Time + ticks */}
                      <View style={[styles.bubbleFoot, isMe && { justifyContent: "flex-end" }]}>
                        <Text style={[styles.bubbleTime, { color: isMe ? "rgba(255,255,255,0.55)" : colors.mutedForeground }]}>{msg.time}</Text>
                        {isMe && (
                          <View style={styles.ticks}>
                            <Feather name="check" size={11} color={msg.read ? "#A78BFA" : "rgba(255,255,255,0.55)"} />
                            <Feather name="check" size={11} color={msg.read ? "#A78BFA" : "rgba(255,255,255,0.55)"} style={{ marginLeft: -5 }} />
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>

                  {/* Reaction chips */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <View style={[styles.chipRow, isMe && { justifyContent: "flex-end" }]}>
                      {msg.reactions.map((r) => (
                        <Pressable
                          key={r.emoji}
                          style={[styles.chip, { backgroundColor: colors.card, borderColor: r.mine ? colors.primary : colors.border }]}
                          onPress={() => doReact(msg.id, r.emoji)}
                        >
                          <Text style={styles.chipEmoji}>{r.emoji}</Text>
                          {r.count > 1 && <Text style={[styles.chipCount, { color: colors.mutedForeground }]}>{r.count}</Text>}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* Typing indicator */}
          {typing && (
            <View style={styles.msgBlock}>
              <Image source={{ uri: thread.avatar }} style={styles.msgAvatar} />
              <View style={[styles.bubble, styles.bubbleThem, { backgroundColor: colors.card, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14 }]}>
                <View style={styles.typingBubbleDots}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.typingBubbleDot, { backgroundColor: colors.mutedForeground }]} />
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Input bar ── */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: botPad + 8 }]}>
          <Pressable style={[styles.inputSideBtn, { backgroundColor: colors.muted }]} onPress={() => setShowAttach(true)}>
            <Feather name="plus" size={20} color={colors.foreground} />
          </Pressable>

          <View style={[styles.inputField, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Pressable>
              <Text style={{ fontSize: 20 }}>😊</Text>
            </Pressable>
            <TextInput
              style={[styles.inputText, { color: colors.foreground }]}
              placeholder="Message..."
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            {input.trim().length === 0 && (
              <Pressable onPress={shareProduct}>
                <Feather name="shopping-bag" size={18} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <Pressable
              style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
              onPress={input.trim() ? handleSend : sendVoice}
            >
              <Feather
                name={input.trim() ? "send" : "mic"}
                size={19}
                color={input.trim() ? "#fff" : colors.mutedForeground}
              />
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1 },
  /* Header */
  header:             { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingBottom: 10, paddingTop: 10, borderBottomWidth: 1 },
  backBtn:            { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  threadRow:          { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  threadAvatar:       { width: 42, height: 42, borderRadius: 21 },
  onlineDot:          { position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, borderWidth: 2.5 },
  nameRow:            { flexDirection: "row", alignItems: "center", gap: 5 },
  threadName:         { fontSize: 15, fontWeight: "800" },
  verifiedDot:        { width: 15, height: 15, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  threadSub:          { fontSize: 12, fontWeight: "500" },
  typingRow:          { flexDirection: "row", alignItems: "center", gap: 3 },
  typingDot:          { width: 5, height: 5, borderRadius: 2.5 },
  typingLabel:        { fontSize: 12, fontWeight: "600" },
  headerActions:      { flexDirection: "row", gap: 6 },
  hBtn:               { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  /* Message list */
  msgList:            { paddingHorizontal: 12, paddingTop: 14, gap: 8 },
  dateBanner:         { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  dateLine:           { flex: 1, height: 1 },
  datePill:           { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  datePillText:       { fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  /* Message blocks */
  msgBlock:           { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  msgBlockMe:         { justifyContent: "flex-end" },
  msgAvatar:          { width: 28, height: 28, borderRadius: 14, marginBottom: 18 },
  fwdRow:             { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3, paddingLeft: 4 },
  fwdText:            { fontSize: 11 },
  /* Bubbles */
  bubble:             { borderRadius: 20, maxWidth: "100%", overflow: "hidden" },
  bubbleMe:           { borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleThem:         { borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  bubbleText:         { fontSize: 14, lineHeight: 21 },
  bubbleFoot:         { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  bubbleTime:         { fontSize: 10 },
  ticks:              { flexDirection: "row" },
  /* Reactions */
  reactionPopup:      { position: "absolute", top: "40%", left: 16, right: 16, flexDirection: "row", justifyContent: "space-around", borderRadius: 32, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 8, zIndex: 99, elevation: 12 },
  reactionItem:       { padding: 6 },
  reactionEmoji:      { fontSize: 24 },
  chipRow:            { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  chip:               { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3.5, borderRadius: 12, borderWidth: 1 },
  chipEmoji:          { fontSize: 13 },
  chipCount:          { fontSize: 11, fontWeight: "700" },
  /* Typing bubble */
  typingBubbleDots:   { flexDirection: "row", gap: 5, alignItems: "center" },
  typingBubbleDot:    { width: 7, height: 7, borderRadius: 3.5 },
  /* Voice */
  voice:              { flexDirection: "row", alignItems: "center", gap: 8, width: 200 },
  voicePlay:          { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  waveform:           { flex: 1, flexDirection: "row", alignItems: "center", gap: 1.5, height: 30 },
  waveBar:            { width: 2.5, borderRadius: 2 },
  voiceDur:           { fontSize: 11, minWidth: 26 },
  /* Product */
  prodCard:           { borderRadius: 14, overflow: "hidden", borderWidth: 1, width: 210, marginBottom: 4 },
  prodImg:            { width: "100%", height: 120 },
  prodBody:           { padding: 10, gap: 4 },
  prodName:           { fontSize: 13, fontWeight: "700" },
  prodPrice:          { fontSize: 14, fontWeight: "900" },
  prodBtn:            { paddingVertical: 7, borderRadius: 10, alignItems: "center", marginTop: 4 },
  prodBtnText:        { color: "#fff", fontSize: 12, fontWeight: "700" },
  /* Input bar */
  inputBar:           { flexDirection: "row", alignItems: "flex-end", gap: 7, paddingHorizontal: 10, paddingTop: 10, borderTopWidth: 1 },
  inputSideBtn:       { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginBottom: 1 },
  inputField:         { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
  inputText:          { flex: 1, fontSize: 14, maxHeight: 90 },
  sendBtn:            { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginBottom: 1 },
  /* Bottom sheet */
  sheetOverlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet:              { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, paddingBottom: 32, overflow: "hidden" },
  sheetReactions:     { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, paddingHorizontal: 16 },
  sheetEmoji:         { padding: 6 },
  sheetDivider:       { height: 1 },
  sheetItem:          { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  sheetItemIcon:      { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  sheetItemLabel:     { fontSize: 15, fontWeight: "600", flex: 1 },
  /* Attach sheet */
  attachGrid:         { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, flexDirection: "row", justifyContent: "space-around", padding: 24, paddingBottom: 42, overflow: "hidden" },
  attachItem:         { alignItems: "center", gap: 10 },
  attachIcon:         { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  attachLabel:        { fontSize: 12, fontWeight: "600" },
});
