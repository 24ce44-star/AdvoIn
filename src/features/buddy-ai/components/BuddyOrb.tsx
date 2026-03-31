import { useLegalTheme } from "@/hooks/useLegalTheme";
import { Sparkles } from "lucide-react-native";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from "react-native-reanimated";

interface BuddyOrbProps {
  onPress: () => void;
}

export function BuddyOrb({ onPress }: BuddyOrbProps) {
  const { colors, isDark } = useLegalTheme();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center justify-center">
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          },
          animatedStyle,
        ]}
      />
      <TouchableOpacity
        onPress={onPress}
        className="w-14 h-14 rounded-full bg-legal-navy dark:bg-white items-center justify-center shadow-2xl shadow-legal-navy/40 dark:shadow-white/20 border border-white/10 dark:border-black/5"
        activeOpacity={0.9}
        style={{
          elevation: 8,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Sparkles
          size={24}
          color={isDark ? "black" : "white"}
          strokeWidth={1.5}
        />
      </TouchableOpacity>
    </View>
  );
}
