import React, { createContext, useContext, useState, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  withSequence,
} from "react-native-reanimated";

interface CartAnimationContextType {
  triggerCartAnimation: (startX: number, startY: number, imageUrl: string) => void;
  cartBounce: Animated.SharedValue<number>;
}

const CartAnimationContext = createContext<CartAnimationContextType | null>(null);

export const useCartAnimation = () => {
  const context = useContext(CartAnimationContext);
  if (!context) throw new Error("useCartAnimation must be used within CartAnimationProvider");
  return context;
};

const { width, height } = Dimensions.get("window");

export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
  const [animatingItems, setAnimatingItems] = useState<{ id: number; x: number; y: number; img: string }[]>([]);
  const nextId = useRef(0);
  
  // Cart icon scale for the bounce effect
  const cartBounce = useSharedValue(1);

  const triggerCartAnimation = (startX: number, startY: number, imageUrl: string) => {
    const id = nextId.current++;
    setAnimatingItems((prev) => [...prev, { id, x: startX, y: startY, img: imageUrl }]);
  };

  const removeAnimatingItem = (id: number) => {
    setAnimatingItems((prev) => prev.filter((item) => item.id !== id));
    // Trigger the cart bounce
    cartBounce.value = withSequence(
      withSpring(1.4, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
  };

  return (
    <CartAnimationContext.Provider value={{ triggerCartAnimation, cartBounce }}>
      {children}
      {/* Global Overlay for Flying Items */}
      {animatingItems.map((item) => (
        <FlyingItem
          key={item.id}
          item={item}
          onComplete={() => removeAnimatingItem(item.id)}
        />
      ))}
    </CartAnimationContext.Provider>
  );
}

function FlyingItem({ item, onComplete }: { item: any; onComplete: () => void }) {
  // We assume the cart icon is in the bottom tab bar at index 4 (Profile tab with dot) or index 3 (Inbox)
  // Actually, usually the cart is at the top right of the header, let's say Top Right (width - 40, 50).
  const endX = width - 40;
  const endY = 50;

  const posX = useSharedValue(item.x);
  const posY = useSharedValue(item.y);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    // X moves linearly
    posX.value = withTiming(endX, { duration: 600, easing: Easing.out(Easing.quad) });
    
    // Y moves with a slight parabolic curve (dips down then goes up, or just ease in)
    posY.value = withTiming(endY, { duration: 600, easing: Easing.in(Easing.quad) });
    
    // Scale down to cart size
    scale.value = withTiming(0.2, { duration: 600 });
    
    // Opacity fades slightly at the end
    opacity.value = withTiming(0, { duration: 600 }, () => {
      runOnJS(onComplete)();
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value },
      { translateY: posY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Image
      source={{ uri: item.img }}
      style={[styles.flyingImage, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  flyingImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 99999,
  },
});
