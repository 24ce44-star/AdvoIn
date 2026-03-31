import { Easing, withTiming } from "react-native-reanimated";

/**
 * Professional navigation animation configurations
 * Optimized for smooth, consistent, fast transitions across all screens
 */

export const NAVIGATION_TIMING = {
  // Faster screen transitions for snappier feel
  SCREEN_TRANSITION: 250,
  // Modal presentations
  MODAL_TRANSITION: 300,
  // Tab switches
  TAB_TRANSITION: 200,
  // Gesture-based navigation
  GESTURE_RESPONSE: 150,
  // Content fade during navigation
  CONTENT_FADE: 200,
} as const;

export const SPRING_CONFIGS = {
  // Smooth, professional spring for screen transitions
  screen: {
    damping: 32,
    stiffness: 300,
    mass: 0.7,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // Slightly bouncier for modals
  modal: {
    damping: 28,
    stiffness: 260,
    mass: 0.75,
    velocity: 2,
  },
  // Quick and responsive for gestures
  gesture: {
    damping: 35,
    stiffness: 350,
    mass: 0.6,
  },
} as const;

export const EASING_CONFIGS = {
  // Standard ease out for most animations
  standard: {
    duration: NAVIGATION_TIMING.SCREEN_TRANSITION,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  // Smooth deceleration
  decelerate: {
    duration: NAVIGATION_TIMING.SCREEN_TRANSITION,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  },
  // Quick acceleration
  accelerate: {
    duration: NAVIGATION_TIMING.GESTURE_RESPONSE,
    easing: Easing.bezier(0.4, 0, 1, 1),
  },
  // Content fade timing
  contentFade: {
    duration: NAVIGATION_TIMING.CONTENT_FADE,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  },
} as const;

/**
 * Reusable animation helper for screen content
 * Use this in any screen to get consistent, smooth back animations
 */
export const createContentAnimation = (opacity: any) => {
  "worklet";
  return withTiming(opacity, EASING_CONFIGS.contentFade);
};

/**
 * Hook-like function to create animated style for screen content
 * Prevents content from disappearing instantly during back navigation
 */
export const getContentAnimatedStyle = (opacityValue: any) => {
  "worklet";
  return {
    opacity: opacityValue,
  };
};
