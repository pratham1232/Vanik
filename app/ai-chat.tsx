import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { PRODUCTS, formatPrice } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface AIMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  products?: typeof PRODUCTS;
  isTyping?: boolean;
}

type AIPersonality = "friendly" | "pro" | "genz";

const PERSONALITIES: Record<AIPersonality, { label: string; icon: string; greeting: string; responseStyle: string }> = {
  friendly: {
    label: "Friendly",
    icon: "😊",
    greeting: "Hi there! I'm Vanik AI, your personal shopping assistant ✨\n\nWhat are you looking for today?",
    responseStyle: "I found some great options for you! ✨"
  },
  pro: {
    label: "Pro",
    icon: "💼",
    greeting: "Greetings. I am your professional commerce consultant. How may I assist your procurement today?",
    responseStyle: "Based on market trends and your preferences, I recommend these high-value selections:"
  },
  genz: {
    label: "Gen-Z",
    icon: "🔥",
    greeting: "Yo! Vanik AI here. What's the vibe today? I'll help you find the absolute drips. 🚀",
    responseStyle: "No cap, these are straight fire! check 'em out: 📈"
  }
};

export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : Math.max(insets.bottom, 20);
  const scrollRef = useRef<ScrollView>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [personality, setPersonality] = useState<AIPersonality>("friendly");

  const glowAnim = useRef(new Animated.Value(0)).current;
  const waveAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Initialize with personality greeting
  useEffect(() => {
    setMessages([{ id: "1", sender: "ai", text: PERSONALITIES[personality].greeting }]);
  }, [personality]);

  // Header glow & Voice wave animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    const animations = waveAnims.map((anim, i) => 
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMsg = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: userMsg }]);
    scrollToBottom();
    
    setIsAiTyping(true);
    
    // Simulate AI thinking and responding
    setTimeout(() => {
      setIsAiTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      let aiText = PERSONALITIES[personality].responseStyle;
      let matchedProducts = PRODUCTS.slice(0, 2); // Default to first two
      
      if (userMsg.toLowerCase().includes("bag") || userMsg.toLowerCase().includes("leather")) {
        matchedProducts = [PRODUCTS[0]];
      } else if (userMsg.toLowerCase().includes("skincare") || userMsg.toLowerCase().includes("beauty")) {
        matchedProducts = [PRODUCTS[3]];
      } else if (userMsg.toLowerCase().includes("watch") || userMsg.toLowerCase().includes("men")) {
        matchedProducts = [PRODUCTS[1]];
      }

      setMessages(prev => [...prev, { 
        id: Date.now().toString() + "_ai", 
        sender: "ai", 
        text: aiText,
        products: matchedProducts 
      }]);
      scrollToBottom();
    }, 2500);
  };

  const renderProductCard = (product: typeof PRODUCTS[number]) => (
    <Pressable key={product.id} style={styles.productCard} onPress={() => router.push(`/product/${product.id}`)}>
      <Image source={product.image} style={styles.productImg} resizeMode="cover" />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          <View style={styles.ratingBadge}>
            <Feather name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>
        <View style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>View Details</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1E0A3C", "#000000"]} style={StyleSheet.absoluteFillObject} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Animated.View style={[styles.glowRing, { transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.2] }) }], opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }) }]} />
          <View style={styles.aiAvatar}>
            <Text style={{ fontSize: 18 }}>✨</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Vanik AI</Text>
            <Text style={styles.headerSub}>Shopping Assistant</Text>
          </View>
        </View>
      </View>

      {/* ── Personality Selector ── */}
      <View style={styles.personalityBar}>
        {(Object.keys(PERSONALITIES) as AIPersonality[]).map((p) => {
          const isActive = personality === p;
          const config = PERSONALITIES[p];
          return (
            <Pressable
              key={p}
              style={[styles.personalityBtn, isActive && { backgroundColor: "rgba(139,92,246,0.3)", borderColor: "#8B5CF6" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPersonality(p);
              }}
            >
              <Text style={styles.personalityIcon}>{config.icon}</Text>
              <Text style={[styles.personalityLabel, { color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }]}>{config.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Chat Feed ── */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.chatList, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.msgWrapper, msg.sender === "user" ? styles.msgWrapperUser : styles.msgWrapperAI]}>
              {msg.sender === "ai" && (
                <View style={styles.aiSmallAvatar}>
                  <Text style={{ fontSize: 14 }}>✨</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.sender === "user" ? styles.bubbleUser : styles.bubbleAI]}>
                <Text style={[styles.msgText, { color: msg.sender === "user" ? "#fff" : "#E2E8F0" }]}>
                  {msg.text}
                </Text>
                
                {/* Render embedded products if any */}
                {msg.products && msg.products.length > 0 && (
                  <View style={styles.embeddedProducts}>
                    {msg.products.map(renderProductCard)}
                  </View>
                )}
              </View>
            </View>
          ))}
          
          {/* Typing Indicator */}
          {isAiTyping && (
            <View style={[styles.msgWrapper, styles.msgWrapperAI]}>
              <View style={styles.aiSmallAvatar}><Text style={{ fontSize: 14 }}>✨</Text></View>
              <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                <View style={styles.waveContainer}>
                  {waveAnims.map((anim, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.waveBar,
                        {
                          transform: [{ scaleY: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.2] }) }],
                          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] })
                        }
                      ]}
                    />
                  ))}
                  <Text style={styles.typingText}>AI is thinking...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Input Bar ── */}
        <View style={[styles.inputArea, { paddingBottom: botPad + 10 }]}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.inputField}
              placeholder="Ask anything..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <Pressable style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]} onPress={handleSend}>
              <LinearGradient colors={["#8B5CF6", "#EC4899"]} style={styles.sendGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Feather name="arrow-up" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitleWrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(139,92,246,0.3)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#8B5CF6" },
  glowRing: { position: "absolute", left: -6, top: -6, width: 52, height: 52, borderRadius: 26, backgroundColor: "#8B5CF6" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "#A78BFA", fontSize: 12, fontWeight: "600" },

  chatList: { padding: 16, gap: 16 },
  msgWrapper: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "85%" },
  msgWrapperUser: { alignSelf: "flex-end" },
  msgWrapperAI: { alignSelf: "flex-start" },
  aiSmallAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(139,92,246,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  
  bubble: { padding: 14, borderRadius: 20 },
  bubbleUser: { backgroundColor: "rgba(255,255,255,0.15)", borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: "rgba(139,92,246,0.15)", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "rgba(139,92,246,0.3)" },
  typingBubble: { paddingVertical: 10, paddingHorizontal: 16 },
  msgText: { fontSize: 15, lineHeight: 22 },

  embeddedProducts: { marginTop: 12, gap: 10 },
  productCard: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", width: 260 },
  productImg: { width: 80, height: "100%" },
  productInfo: { flex: 1, padding: 10, gap: 4 },
  productTitle: { color: "#fff", fontSize: 13, fontWeight: "600" },
  productMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  productPrice: { color: "#8B5CF6", fontSize: 14, fontWeight: "800" },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  viewBtn: { alignSelf: "flex-start", backgroundColor: "rgba(139,92,246,0.2)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginTop: 4 },
  viewBtnText: { color: "#A78BFA", fontSize: 10, fontWeight: "700" },

  inputArea: { paddingHorizontal: 16, paddingTop: 10 },
  inputWrap: { flexDirection: "row", alignItems: "flex-end", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  inputField: { flex: 1, color: "#fff", fontSize: 15, maxHeight: 100, minHeight: 36, paddingBottom: Platform.OS==="ios"?8:6 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, overflow: "hidden", marginLeft: 8 },
  sendGrad: { flex: 1, alignItems: "center", justifyContent: "center" },

  /* Personality Selector */
  personalityBar: { flexDirection: "row", justifyContent: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  personalityBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "transparent" },
  personalityIcon: { fontSize: 14 },
  personalityLabel: { fontSize: 12, fontWeight: "700" },

  /* Typing Wave */
  waveContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  waveBar: { width: 3, height: 16, backgroundColor: "#8B5CF6", borderRadius: 2 },
  typingText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600", marginLeft: 6 },
});
