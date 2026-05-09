import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColors } from '@/hooks/useColors';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  border?: boolean;
}

export function PremiumCard({ 
  children, 
  style, 
  intensity = 60, 
  tint = 'dark',
  border = true 
}: PremiumCardProps) {
  const colors = useColors();

  if (Platform.OS === 'web') {
    return (
      <View style={[
        styles.cardWeb, 
        { 
          backgroundColor: tint === 'dark' ? 'rgba(18,18,42,0.6)' : 'rgba(255,255,255,0.7)',
          borderColor: border ? colors.glassBorder : 'transparent',
          borderWidth: border ? 1 : 0
        }, 
        style
      ]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <BlurView 
        intensity={intensity} 
        tint={tint} 
        style={[
          styles.blur, 
          { 
            borderColor: border ? colors.glassBorder : 'transparent',
            borderWidth: border ? 1 : 0 
          }
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blur: {
    padding: 16,
    borderRadius: 20,
  },
  cardWeb: {
    padding: 16,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  }
});
