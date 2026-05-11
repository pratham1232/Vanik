import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { AI_SHOPPER_QUESTIONS, PRODUCTS, formatPrice } from "@/data/mockData";

export default function AIShopperScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : Math.max(insets.bottom, 20);

  const [step, setStep] = useState(0); // 0..questions.length = onboarding, then chat
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ id: string; from: "user" | "ai"; text: string; products?: typeof PRODUCTS }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const dotAnims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  const isOnboarding = step < AI_SHOPPER_QUESTIONS.length;

  useEffect(() => {
    dotAnims.forEach((anim, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(anim, { toValue: -6, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(400),
      ])).start();
    });
  }, []);

  const handleAnswer = (answer: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (step + 1 >= AI_SHOPPER_QUESTIONS.length) {
      // Finished onboarding, generate recommendations
      setStep(step + 1);
      setMessages([{
        id: "welcome", from: "ai",
        text: `Great choices! Based on your preferences (${newAnswers.join(", ")}), here are my top picks for you:`,
        products: PRODUCTS.slice(0, 3),
      }]);
    } else {
      setStep(step + 1);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: "u" + Date.now(), from: "user", text: userMsg }]);
    setIsTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(() => {
      setIsTyping(false);
      const lower = userMsg.toLowerCase();
      let matched = PRODUCTS.filter(p =>
        p.tags.some(t => lower.includes(t)) || lower.includes(p.category.toLowerCase())
      );
      if (matched.length === 0) matched = PRODUCTS.slice(0, 2);
      setMessages(prev => [...prev, {
        id: "ai" + Date.now(), from: "ai",
        text: matched.length > 0 ? `I found ${matched.length} products matching "${userMsg}"! 🎯` : "Let me find something for you...",
        products: matched.slice(0, 3),
      }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1800);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={colors.gradientPrimary as any} style={[styles.header, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.aiDot} />
          <Text style={styles.headerTitle}>AI Personal Shopper</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>SMART</Text>
        </View>
      </LinearGradient>

      {/* Onboarding */}
      {isOnboarding ? (
        <View style={styles.onboardingWrap}>
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.stepLabel, { color: colors.primary }]}>
              Question {step + 1} of {AI_SHOPPER_QUESTIONS.length}
            </Text>
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {AI_SHOPPER_QUESTIONS[step].question}
            </Text>
            <View style={styles.optionsList}>
              {AI_SHOPPER_QUESTIONS[step].options.map(opt => (
                <Pressable
                  key={opt}
                  style={[styles.optionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  onPress={() => handleAnswer(opt)}
                >
                  <Text style={[styles.optionText, { color: colors.foreground }]}>{opt}</Text>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </View>
          {/* Progress */}
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${((step) / AI_SHOPPER_QUESTIONS.length) * 100}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>
      ) : (
        /* Chat Mode */
        <>
          <ScrollView ref={scrollRef} contentContainerStyle={styles.chatList} showsVerticalScrollIndicator={false}>
            {messages.map(msg => (
              <View key={msg.id} style={[styles.msgRow, msg.from === "user" && styles.msgRowUser]}>
                {msg.from === "ai" && (
                  <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
                    <Feather name="cpu" size={14} color="#fff" />
                  </View>
                )}
                <View style={[styles.bubble, msg.from === "user"
                  ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 }
                ]}>
                  <Text style={[styles.msgText, { color: msg.from === "user" ? "#fff" : colors.foreground }]}>{msg.text}</Text>
                  {msg.products && msg.products.map(p => (
                    <Pressable key={p.id} style={[styles.recCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => router.push(`/product/${p.id}`)}>
                      <Image source={p.image} style={styles.recImg} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.recTitle, { color: colors.foreground }]} numberOfLines={1}>{p.title}</Text>
                        <Text style={[styles.recPrice, { color: colors.primary }]}>{formatPrice(p.price)}</Text>
                      </View>
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.msgRow]}>
                <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
                  <Feather name="cpu" size={14} color="#fff" />
                </View>
                <View style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {dotAnims.map((anim, i) => (
                      <Animated.View key={i} style={[styles.typingDot, { backgroundColor: colors.primary, transform: [{ translateY: anim }] }]} />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          {/* Input */}
          <View style={[styles.inputArea, { paddingBottom: botPad + 8, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.inputField, { color: colors.foreground, backgroundColor: colors.muted }]}
              placeholder="Ask me anything about products..."
              placeholderTextColor={colors.mutedForeground}
              value={input} onChangeText={setInput} multiline
            />
            <Pressable onPress={handleSend} style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.5 }]}>
              <LinearGradient colors={colors.gradientPrimary as any} style={styles.sendGrad}>
                <Feather name="send" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  backBtn: { padding: 8 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  aiBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  aiBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  onboardingWrap: { flex: 1, padding: 20, justifyContent: "center", gap: 24 },
  questionCard: { borderRadius: 20, borderWidth: 1, padding: 24, gap: 16 },
  stepLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  questionText: { fontSize: 20, fontWeight: "800", lineHeight: 28 },
  optionsList: { gap: 10 },
  optionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 14, borderWidth: 1 },
  optionText: { fontSize: 15, fontWeight: "600" },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  chatList: { padding: 16, gap: 14, paddingBottom: 20 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "85%" },
  msgRowUser: { alignSelf: "flex-end" },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bubble: { padding: 12, borderRadius: 18, gap: 8 },
  msgText: { fontSize: 15, lineHeight: 22 },
  recCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  recImg: { width: 44, height: 44, borderRadius: 10 },
  recTitle: { fontSize: 13, fontWeight: "700" },
  recPrice: { fontSize: 14, fontWeight: "800" },
  typingDot: { width: 6, height: 6, borderRadius: 3 },
  inputArea: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 10, gap: 8, borderTopWidth: 1 },
  inputField: { flex: 1, fontSize: 15, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, maxHeight: 100, minHeight: 40 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, overflow: "hidden" },
  sendGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
});
