import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChat, Message as Msg } from "@/context/ChatContext";
import { PRODUCTS, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const REACTIONS = ["❤️", "😂", "🔥", "😮", "👏", "💯"];

interface Reaction { emoji: string; count: number; mine: boolean }
// Msg interface moved to ChatContext

const AUTO_REPLIES = [
  "Got it, thank you! 😊", "Sure, let me check that for you.",
  "That looks amazing! 🔥", "Can you share more details?",
  "Will ship it out today! 📦", "Great choice! 🎉",
];

/* ── Bouncy Typing Dots ── */
function TypingDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (val: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: -5, duration: 250, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.delay(400 - delay),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 100);
    animate(dot3, 200);
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      <Animated.View style={[styles.typingDot, { backgroundColor: color, transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.typingDot, { backgroundColor: color, transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.typingDot, { backgroundColor: color, transform: [{ translateY: dot3 }] }]} />
    </View>
  );
}

/* ── Voice Note Bubble ── */
function VoiceNoteBubble({ msg, isMe, colors }: { msg: Msg, isMe: boolean, colors: any }) {
  const [playing, setPlaying] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (playing) {
      Animated.loop(Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1.5, duration: 300, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 300, useNativeDriver: true })
      ])).start();
      Animated.timing(progress, { toValue: 1, duration: parseInt(msg.voiceDuration!.split(":")[1]) * 1000, easing: Easing.linear, useNativeDriver: false }).start(() => {
        setPlaying(false);
        progress.setValue(0);
        waveAnim.stopAnimation();
      });
    } else {
      waveAnim.stopAnimation();
      waveAnim.setValue(1);
      progress.stopAnimation();
    }
  }, [playing]);

  const textColor = isMe ? "#fff" : colors.foreground;
  const iconColor = isMe ? "#fff" : colors.primary;

  return (
    <View style={styles.voiceRow}>
      <Pressable style={styles.voicePlay} onPress={() => setPlaying(!playing)}>
        <Feather name={playing ? "pause" : "play"} size={20} color={iconColor} />
      </Pressable>
      <View style={styles.voiceWaveWrap}>
        <Animated.View style={[styles.voiceWaveBg, { backgroundColor: iconColor, opacity: 0.3, transform: [{ scaleY: waveAnim }] }]} />
        <Animated.View style={[styles.voiceWaveProgress, { backgroundColor: iconColor, width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
      </View>
      <Text style={[styles.voiceTime, { color: textColor }]}>{msg.voiceDuration}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sendMessage, messages: allMessages, getThreadById, markAsRead } = useChat();
  
  const scrollRef = useRef<ScrollView>(null);
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const botPad    = Platform.OS === "web" ? 34 : Math.max(insets.bottom, 20);

  const thread  = getThreadById(id!) || { name: "Chat", avatar: "https://i.pravatar.cc/100?img=1", online: false };
  const contextMsgs = allMessages[id!] || [];
  const [msgs, setMsgs] = useState<Msg[]>(contextMsgs);
  
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [reaction, setReaction]   = useState<string | null>(null);
  const [selected, setSelected]   = useState<string | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Msg | null>(null);
  const [showSmartReplies, setShowSmartReplies] = useState(true);
  const sendScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (id) markAsRead(id);
  }, [id, markAsRead]);

  useEffect(() => {
    setMsgs(contextMsgs);
  }, [id, allMessages]);

  useEffect(() => {
    // Check if last message was from them to simulate typing when we send
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg?.from === "me") {
      setTyping(true);
      const timer = setTimeout(() => setTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [msgs]);

  const scrollToBottom = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

  const handleSend = () => {
    if (!input.trim() || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.8, useNativeDriver: true, speed: 60 }),
      Animated.spring(sendScale, { toValue: 1,   useNativeDriver: true, speed: 60 }),
    ]).start();
    
    sendMessage(id, input.trim(), "text", { replyTo: replyingTo?.id });
    setInput("");
    setReplyingTo(null);
    setShowSmartReplies(false);
    scrollToBottom();
  };

  const shareProduct = () => {
    setShowAttach(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const m: Msg = { id: "p" + Date.now(), from: "me", type: "product", text: "Check this out! 🛍️", time: "Now", read: false, productId: "p1" };
    setMsgs((p) => [...p, m]);
    scrollToBottom();
  };

  const sendVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const durs = ["0:12", "0:28", "0:07", "0:34"];
    const m: Msg = { id: "v" + Date.now(), from: "me", type: "voice", time: "Now", read: false, voiceDuration: durs[Math.floor(Math.random() * durs.length)] };
    setMsgs((p) => [...p, m]);
    scrollToBottom();
  };

  const doReact = (msgId: string, emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMsgs((prev) => prev.map((msg) => {
      if (msg.id !== msgId) return msg;
      const existing = msg.reactions ?? [];
      const idx = existing.findIndex((r) => r.emoji === emoji);
      let next: Reaction[];
      if (idx >= 0) {
        next = existing[idx].mine ? existing.filter((_, i) => i !== idx) : existing.map((r, i) => i === idx ? { ...r, count: r.count + 1, mine: true } : r);
      } else {
        next = [...existing, { emoji, count: 1, mine: true }];
      }
      return { ...msg, reactions: next };
    }));
    setReaction(null); setSelected(null);
  };

  const deleteMsg = (msgId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setMsgs((p) => p.filter((m) => m.id !== msgId));
    setSelected(null);
  };

  const forwardMsg = (msgId: string) => {
    const original = msgs.find((m) => m.id === msgId);
    if (!original) return;
    const fwd: Msg = { ...original, id: "fwd" + Date.now(), from: "me", forwarded: true, time: "Now" };
    setMsgs((p) => [...p, fwd]);
    setSelected(null);
    scrollToBottom();
  };

  const setReply = (msg: Msg) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReplyingTo(msg);
    setSelected(null);
  };

  const renderMessage = (msg: Msg) => {
    const isMe = msg.from === "me";
    const prod = msg.type === "product" ? PRODUCTS.find((p) => p.id === msg.productId) : null;
    const dimmed = selected === msg.id;
    const repliedMsg = msg.replyTo ? msgs.find(m => m.id === msg.replyTo) : null;

    return (
      <View key={msg.id} style={[styles.msgBlock, isMe && styles.msgBlockMe]}>
        {!isMe && <Image source={{ uri: thread.avatar }} style={styles.msgAvatar} />}
        
        <View style={[{ maxWidth: "78%" }, isMe && { alignItems: "flex-end" }]}>
          {msg.forwarded && (
            <View style={[styles.fwdRow, isMe && { justifyContent: "flex-end" }]}>
              <Feather name="corner-up-right" size={10} color={colors.mutedForeground} />
              <Text style={[styles.fwdText, { color: colors.mutedForeground }]}>Forwarded</Text>
            </View>
          )}

          <Pressable
            onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setSelected(msg.id); }}
            delayLongPress={350}
            style={{ opacity: dimmed ? 0.6 : 1 }}
          >
            {isMe ? (
              <LinearGradient colors={["#8B5CF6", "#A78BFA"]} style={[styles.bubble, styles.bubbleMe]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {repliedMsg && (
                  <View style={styles.replyInBubbleMe}>
                    <Text style={styles.replyInNameMe}>{repliedMsg.from === "me" ? "You" : thread.name}</Text>
                    <Text style={styles.replyInTextMe} numberOfLines={1}>{repliedMsg.text || (repliedMsg.type === "voice" ? "🎤 Voice Note" : "Product")}</Text>
                  </View>
                )}
                {msg.type === "text" && <Text style={styles.msgTextMe}>{msg.text}</Text>}
                {msg.type === "voice" && <VoiceNoteBubble msg={msg} isMe={isMe} colors={colors} />}
                {msg.type === "product" && prod && (
                  <Pressable style={styles.shareProd} onPress={() => router.push(`/product/${prod.id}`)}>
                    <Image source={prod.image} style={styles.shareProdImg} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.shareProdTitle} numberOfLines={1}>{prod.title}</Text>
                      <Text style={styles.shareProdPrice}>{formatPrice(prod.price)}</Text>
                    </View>
                  </Pressable>
                )}
                <View style={styles.timeRow}>
                  <Text style={styles.timeTextMe}>{msg.time}</Text>
                  <Feather name="check" size={12} color={msg.read ? "#67E8F9" : "rgba(255,255,255,0.7)"} />
                </View>
              </LinearGradient>
            ) : (
              <View style={[styles.bubble, styles.bubbleThem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {repliedMsg && (
                  <View style={[styles.replyInBubbleThem, { borderLeftColor: colors.primary, backgroundColor: colors.primary + "15" }]}>
                    <Text style={[styles.replyInNameThem, { color: colors.primary }]}>{repliedMsg.from === "me" ? "You" : thread.name}</Text>
                    <Text style={[styles.replyInTextThem, { color: colors.mutedForeground }]} numberOfLines={1}>{repliedMsg.text || (repliedMsg.type === "voice" ? "🎤 Voice Note" : "Product")}</Text>
                  </View>
                )}
                {msg.type === "text" && <Text style={[styles.msgTextThem, { color: colors.foreground }]}>{msg.text}</Text>}
                {msg.type === "voice" && <VoiceNoteBubble msg={msg} isMe={isMe} colors={colors} />}
                {msg.type === "product" && prod && (
                  <Pressable style={[styles.shareProd, { backgroundColor: colors.muted }]} onPress={() => router.push(`/product/${prod.id}`)}>
                    <Image source={prod.image} style={styles.shareProdImg} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.shareProdTitle, { color: colors.foreground }]} numberOfLines={1}>{prod.title}</Text>
                      <Text style={[styles.shareProdPrice, { color: colors.primary }]}>{formatPrice(prod.price)}</Text>
                    </View>
                  </Pressable>
                )}
                <View style={styles.timeRow}>
                  <Text style={styles.timeTextThem}>{msg.time}</Text>
                </View>
              </View>
            )}
          </Pressable>

          {msg.reactions && msg.reactions.length > 0 && (
            <Pressable style={[styles.reactsBadge, isMe ? styles.reactsBadgeMe : styles.reactsBadgeThem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setReaction(msg.id)}>
              {msg.reactions.map((r, i) => (
                <View key={i} style={styles.reactItem}>
                  <Text style={styles.reactEmoji}>{r.emoji}</Text>
                  {r.count > 1 && <Text style={[styles.reactCount, { color: colors.foreground }]}>{r.count}</Text>}
                </View>
              ))}
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ── Overlays ── */}
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

      <Modal visible={!!selected && !reaction} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setSelected(null)}>
          <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sheetReactions}>
              {REACTIONS.map((e) => (
                <Pressable key={e} style={styles.sheetEmoji} onPress={() => { if (selected) doReact(selected, e); }}>
                  <Text style={styles.reactionEmoji}>{e}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />
            {[
              { icon: "corner-up-left", label: "Reply",   color: colors.foreground, fn: () => { if (selected) { setReply(msgs.find(m => m.id === selected)!); } } },
              { icon: "share-2",        label: "Forward", color: colors.foreground, fn: () => { if (selected) forwardMsg(selected); } },
              { icon: "copy",           label: "Copy",    color: colors.foreground, fn: () => setSelected(null) },
              { icon: "trash-2",        label: "Delete",  color: "#FF3B5C",         fn: () => { if (selected) deleteMsg(selected); } },
            ].map((a) => (
              <Pressable key={a.label} style={[styles.sheetItem, { borderBottomColor: colors.border }]} onPress={a.fn}>
                <View style={[styles.sheetItemIcon, { backgroundColor: a.color + "18" }]}>
                  <Feather name={a.icon as any} size={17} color={a.color} />
                </View>
                <Text style={[styles.sheetItemLabel, { color: a.color }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

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
      <BlurView intensity={80} tint="dark" style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>

        <Pressable style={styles.threadRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: thread.avatar }} style={styles.threadAvatar} />
            {thread.online && <View style={[styles.onlineIndicator, { backgroundColor: "#10B981" }]} />}
          </View>
          <View style={{ gap: 1 }}>
            <Text style={[styles.threadName, { color: "#fff" }]}>{thread.name}</Text>
            {typing ? (
              <View style={styles.typingRow}>
                <TypingDots color="#A78BFA" />
                <Text style={[styles.typingLabel, { color: "#A78BFA" }]}>typing</Text>
              </View>
            ) : (
              <Text style={[styles.threadSub, { color: thread.online ? "#10B981" : "rgba(255,255,255,0.5)" }]}>
                {thread.online ? "● Online" : "Last seen recently"}
              </Text>
            )}
          </View>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={[styles.hBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}><Feather name="phone" size={16} color="#fff" /></Pressable>
          <Pressable style={[styles.hBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}><Feather name="video" size={16} color="#fff" /></Pressable>
        </View>
      </BlurView>

      {/* ── Messages & Input ── */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.msgList, { paddingBottom: 10 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom()}
        >
          {/* Date banner */}
          <View style={styles.dateBanner}>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
            <View style={[styles.datePill, { backgroundColor: colors.muted }]}>
              <Text style={[styles.datePillText, { color: colors.mutedForeground }]}>Today</Text>
            </View>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
          </View>

          {msgs.map(renderMessage)}
        </ScrollView>

        {/* ── Reply Bar ── */}
        {replyingTo && (
          <View style={[styles.replyBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={[styles.replyBarLine, { backgroundColor: colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.replyBarName, { color: colors.primary }]}>{replyingTo.from === "me" ? "Replying to yourself" : `Replying to ${thread.name}`}</Text>
              <Text style={[styles.replyBarText, { color: colors.mutedForeground }]} numberOfLines={1}>{replyingTo.text || "Media message"}</Text>
            </View>
            <Pressable onPress={() => setReplyingTo(null)} style={styles.replyBarClose}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        {/* ── Smart Replies ── */}
        {showSmartReplies && (
          <View style={{ backgroundColor: colors.surface }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smartReplyRow}>
              {["Yes, it's available!", "What's the price?", "Can you share more pics?", "Is shipping free?"].map((replyText) => (
                <Pressable
                  key={replyText}
                  style={[styles.smartReplyChip, { borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInput(replyText);
                  }}
                >
                  <Text style={{ fontSize: 12, marginRight: 4 }}>✨</Text>
                  <Text style={[styles.smartReplyText, { color: colors.foreground }]}>{replyText}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Input ── */}
        <BlurView intensity={40} tint="dark" style={[styles.inputArea, { paddingBottom: botPad + 8 }]}>
          <Pressable style={[styles.attachBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAttach(true); }}>
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
          
          <View style={[styles.inputWrap, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }]}>
            <TextInput
              style={[styles.inputField, { color: "#fff" }]}
              placeholder="Message..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={input}
              onChangeText={setInput}
              multiline
            />
            {input.trim() ? (
              <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                <LinearGradient colors={["#8B5CF6", "#6D28D9"]} style={styles.sendBtn}>
                  <Pressable onPress={handleSend}>
                    <Feather name="send" size={16} color="#fff" />
                  </Pressable>
                </LinearGradient>
              </Animated.View>
            ) : (
              <Pressable style={styles.micBtn} onPress={sendVoice}>
                <Feather name="mic" size={18} color="rgba(255,255,255,0.6)" />
              </Pressable>
            )}
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },

  /* Header */
  header:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1 },
  backBtn:          { padding: 8, marginRight: 4 },
  threadRow:        { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrap:       { position: "relative" },
  threadAvatar:     { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)" },
  onlineIndicator:  { position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: "#000" },
  threadName:       { fontSize: 16, fontWeight: "800" },
  threadSub:        { fontSize: 11, fontWeight: "600" },
  typingRow:        { flexDirection: "row", alignItems: "center", gap: 4 },
  typingDot:        { width: 4, height: 4, borderRadius: 2 },
  typingLabel:      { fontSize: 11, fontWeight: "700" },
  headerActions:    { flexDirection: "row", gap: 8 },
  hBtn:             { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  /* Messages List */
  msgList:          { padding: 16, gap: 14 },
  dateBanner:       { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  dateLine:         { flex: 1, height: 1 },
  datePill:         { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginHorizontal: 8 },
  datePillText:     { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },

  /* Bubbles */
  msgBlock:         { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  msgBlockMe:       { justifyContent: "flex-end" },
  msgAvatar:        { width: 28, height: 28, borderRadius: 14, marginBottom: 2 },
  bubble:           { padding: 12, borderRadius: 18, position: "relative" },
  bubbleMe:         { borderBottomRightRadius: 4 },
  bubbleThem:       { borderBottomLeftRadius: 4, borderWidth: 1 },
  fwdRow:           { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4, paddingHorizontal: 4 },
  fwdText:          { fontSize: 10, fontWeight: "700", fontStyle: "italic" },
  
  msgTextMe:        { color: "#fff", fontSize: 15, lineHeight: 21 },
  msgTextThem:      { fontSize: 15, lineHeight: 21 },
  timeRow:          { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 },
  timeTextMe:       { color: "rgba(255,255,255,0.7)", fontSize: 10 },
  timeTextThem:     { color: "#9CA3AF", fontSize: 10 },

  /* Replies in bubble */
  replyInBubbleMe:    { backgroundColor: "rgba(0,0,0,0.15)", borderLeftWidth: 3, borderLeftColor: "#fff", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 8 },
  replyInNameMe:      { color: "#fff", fontSize: 12, fontWeight: "800", marginBottom: 2 },
  replyInTextMe:      { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  replyInBubbleThem:  { borderLeftWidth: 3, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 8 },
  replyInNameThem:    { fontSize: 12, fontWeight: "800", marginBottom: 2 },
  replyInTextThem:    { fontSize: 13 },

  /* Voice Note */
  voiceRow:         { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 160 },
  voicePlay:        { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  voiceWaveWrap:    { flex: 1, height: 16, justifyContent: "center", position: "relative" },
  voiceWaveBg:      { position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2 },
  voiceWaveProgress:{ position: "absolute", left: 0, height: 4, borderRadius: 2 },
  voiceTime:        { fontSize: 11, fontWeight: "600", minWidth: 28 },

  /* Shared Product */
  shareProd:        { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(0,0,0,0.15)", padding: 8, borderRadius: 12, minWidth: 180 },
  shareProdImg:     { width: 44, height: 44, borderRadius: 8 },
  shareProdTitle:   { color: "#fff", fontSize: 13, fontWeight: "700" },
  shareProdPrice:   { color: "#fff", fontSize: 12, fontWeight: "800", marginTop: 2 },

  /* Reactions Badge */
  reactsBadge:      { position: "absolute", bottom: -12, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, borderWidth: 1, elevation: 1 },
  reactsBadgeMe:    { left: 16 },
  reactsBadgeThem:  { right: 16 },
  reactItem:        { flexDirection: "row", alignItems: "center", gap: 2 },
  reactEmoji:       { fontSize: 12 },
  reactCount:       { fontSize: 10, fontWeight: "800" },

  /* Input Area */
  smartReplyRow:    { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  smartReplyChip:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, backgroundColor: "rgba(139,92,246,0.1)" },
  smartReplyText:   { fontSize: 13, fontWeight: "600" },
  
  replyBar:         { flexDirection: "row", alignItems: "center", padding: 10, paddingHorizontal: 16, borderTopWidth: 1, gap: 10 },
  replyBarLine:     { width: 3, height: "100%", borderRadius: 2 },
  replyBarName:     { fontSize: 13, fontWeight: "800", marginBottom: 2 },
  replyBarText:     { fontSize: 13 },
  replyBarClose:    { padding: 4 },
  
  inputArea:        { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 10, gap: 8 },
  attachBtn:        { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  inputWrap:        { flex: 1, flexDirection: "row", alignItems: "flex-end", borderRadius: 20, borderWidth: 1, padding: 4, paddingLeft: 12, minHeight: 40 },
  inputField:       { flex: 1, fontSize: 15, maxHeight: 100, minHeight: 32, paddingBottom: Platform.OS==="ios"?6:4 },
  sendBtn:          { width: 32, height: 32, borderRadius: 16, backgroundColor: "#8B5CF6", alignItems: "center", justifyContent: "center" },
  micBtn:           { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  /* Overlays */
  reactionPopup:    { position: "absolute", top: "35%", alignSelf: "center", flexDirection: "row", gap: 8, padding: 12, borderRadius: 24, borderWidth: 1, elevation: 10, shadowColor: "#000", shadowOffset: {width:0, height:5}, shadowOpacity: 0.2, shadowRadius: 10 },
  reactionItem:     { padding: 4 },
  reactionEmoji:    { fontSize: 28 },
  
  sheetOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:            { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1 },
  sheetReactions:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  sheetEmoji:       { padding: 8, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 12 },
  sheetDivider:     { height: 1, marginBottom: 16 },
  sheetItem:        { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  sheetItemIcon:    { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  sheetItemLabel:   { fontSize: 15, fontWeight: "600" },

  attachGrid:       { flexDirection: "row", flexWrap: "wrap", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 24, justifyContent: "center", borderWidth: 1 },
  attachItem:       { alignItems: "center", gap: 8 },
  attachIcon:       { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  attachLabel:      { fontSize: 13, fontWeight: "600" },
});
