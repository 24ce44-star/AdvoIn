import { EASING_CONFIGS } from "@/utils/navigationConfig";
import { useEffect } from "react";
import {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

/**
 * Reusable hook for smooth screen transitions
 * Handles content opacity during navigation to prevent instant disappearance
 *
 * Usage:
 * ```tsx
 * const { contentStyle } = useScreenTransition();
 *
 * return (
 *   <Animated.View style={[{ flex: 1 }, contentStyle]}>
 *     // Your screen content
 *   </Animated.View>
 * );
 * ```
 */
export function useScreenTransition() {
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in when screen mounts
    contentOpacity.value = withTiming(1, EASING_CONFIGS.contentFade);
  }, []);

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  return {
    contentStyle,
    contentOpacity,
  };
}
