import { useLegalTheme } from "@/hooks/useLegalTheme";
import { Sparkles } from "lucide-react-native";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

export function TypingIndicator() {
  const { isDark } = useLegalTheme();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
    );
    dot2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
    );
    dot3.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot1.value * 0.7,
    transform: [{ scale: 0.8 + dot1.value * 0.4 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot2.value * 0.7,
    transform: [{ scale: 0.8 + dot2.value * 0.4 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot3.value * 0.7,
    transform: [{ scale: 0.8 + dot3.value * 0.4 }],
  }));

  return (
    <View className="px-4 mb-4 flex-row items-center">
      <View className="w-8 h-8 rounded-full bg-legal-steel/10 dark:bg-legal-steel/20 items-center justify-center mr-3">
        <Sparkles size={16} color={isDark ? "#0EA5E9" : "#3B82F6"} />
      </View>
      <View className="flex-row space-x-1.5 py-3 px-4 rounded-2xl bg-legal-ice dark:bg-neutral-900">
        <Animated.View
          style={dot1Style}
          className="w-2 h-2 rounded-full bg-legal-slate dark:bg-neutral-400"
        />
        <Animated.View
          style={dot2Style}
          className="w-2 h-2 rounded-full bg-legal-slate dark:bg-neutral-400"
        />
        <Animated.View
          style={dot3Style}
          className="w-2 h-2 rounded-full bg-legal-slate dark:bg-neutral-400"
        />
      </View>
    </View>
  );
}
