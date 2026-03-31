# Navigation Animation Guide

## Overview

This guide explains how to use the reusable animation system for smooth, consistent screen transitions throughout the app.

## Quick Start

### For Any New Screen

Simply import and use the `useScreenTransition` hook:

```tsx
import { useScreenTransition } from "@/hooks/useScreenTransition";
import Animated from "react-native-reanimated";

export function MyScreen() {
  const { contentStyle } = useScreenTransition();

  return (
    <Animated.View style={[{ flex: 1 }, contentStyle]}>
      {/* Your screen content */}
    </Animated.View>
  );
}
```

That's it! Your screen now has smooth fade-in/fade-out animations during navigation.

## Features

### 1. Smooth Back Navigation

- Content fades smoothly instead of disappearing instantly
- Consistent 200ms fade timing across all screens
- Professional bezier easing curves

### 2. Fast & Efficient

- **250ms** screen transitions (down from 300ms)
- **300ms** modal transitions (down from 350ms)
- **200ms** tab switches
- Optimized spring physics for natural motion

### 3. Reusable Everywhere

The same animation works for:

- Advocate profile screens
- Chat screens
- Call screens
- Any custom screen you create

## Configuration

### Navigation Timing (`src/utils/navigationConfig.ts`)

```typescript
export const NAVIGATION_TIMING = {
  SCREEN_TRANSITION: 250, // Main screen transitions
  MODAL_TRANSITION: 300, // Modal presentations
  TAB_TRANSITION: 200, // Tab switches
  GESTURE_RESPONSE: 150, // Gesture-based navigation
  CONTENT_FADE: 200, // Content fade during navigation
};
```

### Spring Configurations

```typescript
export const SPRING_CONFIGS = {
  screen: {
    damping: 32,
    stiffness: 300,
    mass: 0.7,
  },
  modal: {
    damping: 28,
    stiffness: 260,
    mass: 0.75,
    velocity: 2,
  },
  gesture: {
    damping: 35,
    stiffness: 350,
    mass: 0.6,
  },
};
```

### Easing Curves

```typescript
export const EASING_CONFIGS = {
  standard: Easing.bezier(0.25, 0.1, 0.25, 1), // Standard ease
  decelerate: Easing.bezier(0.4, 0, 0.2, 1), // Smooth deceleration
  accelerate: Easing.bezier(0.4, 0, 1, 1), // Quick acceleration
  contentFade: Easing.bezier(0.4, 0, 0.2, 1), // Content fade
};
```

## Examples

### Basic Screen

```tsx
import { useScreenTransition } from "@/hooks/useScreenTransition";
import Animated from "react-native-reanimated";

export function ProfileScreen() {
  const { contentStyle } = useScreenTransition();

  return (
    <Animated.View style={[{ flex: 1 }, contentStyle]}>
      <Text>Profile Content</Text>
    </Animated.View>
  );
}
```

### Screen with ScrollView

```tsx
import { useScreenTransition } from "@/hooks/useScreenTransition";
import Animated from "react-native-reanimated";

export function AdvocateProfileScreen() {
  const { contentStyle } = useScreenTransition();
  const scrollY = useSharedValue(0);

  return (
    <Animated.View style={[{ flex: 1 }, contentStyle]}>
      <Animated.ScrollView onScroll={scrollHandler}>
        {/* Content */}
      </Animated.ScrollView>
    </Animated.View>
  );
}
```

### Screen with SafeAreaView

```tsx
import { useScreenTransition } from "@/hooks/useScreenTransition";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export function ChatScreen() {
  const { contentStyle } = useScreenTransition();

  return (
    <Animated.View style={[{ flex: 1 }, contentStyle]}>
      <SafeAreaView style={{ flex: 1 }}>{/* Content */}</SafeAreaView>
    </Animated.View>
  );
}
```

### Modal with Custom Spring

```tsx
import { SPRING_CONFIGS } from "@/utils/navigationConfig";
import { withSpring } from "react-native-reanimated";

const translateY = useSharedValue(SCREEN_HEIGHT);

// Open modal
translateY.value = withSpring(0, SPRING_CONFIGS.modal);

// Close modal
translateY.value = withSpring(SCREEN_HEIGHT, {
  damping: 32,
  stiffness: 320,
  mass: 0.7,
  velocity: 3,
});
```

## Best Practices

### 1. Always Wrap Root Content

```tsx
// ✅ Good
<Animated.View style={[{ flex: 1 }, contentStyle]}>
  <SafeAreaView>
    {/* Content */}
  </SafeAreaView>
</Animated.View>

// ❌ Bad - SafeAreaView outside Animated.View
<SafeAreaView>
  <Animated.View style={contentStyle}>
    {/* Content */}
  </Animated.View>
</SafeAreaView>
```

### 2. Use Consistent Timing

```tsx
// ✅ Good - Use constants
animationDuration: NAVIGATION_TIMING.SCREEN_TRANSITION;

// ❌ Bad - Hardcoded values
animationDuration: 300;
```

### 3. Reuse Spring Configs

```tsx
// ✅ Good - Use predefined configs
withSpring(value, SPRING_CONFIGS.modal);

// ❌ Bad - Custom values everywhere
withSpring(value, { damping: 25, stiffness: 200 });
```

## Troubleshooting

### Content Still Disappears Instantly

Make sure you:

1. Imported `useScreenTransition` hook
2. Wrapped your root content in `Animated.View`
3. Applied the `contentStyle` to the animated view

### Animation Feels Slow

Adjust timing in `navigationConfig.ts`:

```typescript
SCREEN_TRANSITION: 200,  // Faster (was 250)
CONTENT_FADE: 150,       // Faster (was 200)
```

### Animation Feels Too Fast

Increase timing values:

```typescript
SCREEN_TRANSITION: 300,  // Slower (was 250)
CONTENT_FADE: 250,       // Slower (was 200)
```

### Want More Bounce

Reduce damping in spring configs:

```typescript
screen: {
  damping: 25,      // More bounce (was 32)
  stiffness: 300,
  mass: 0.7,
}
```

## Performance Tips

1. **Use Native Driver**: All animations use native driver by default
2. **Avoid Layout Animations**: Stick to opacity and transform animations
3. **Minimize Re-renders**: Use `useSharedValue` for animated values
4. **Worklet Functions**: Mark animation functions with `'worklet'` directive

## Migration Guide

### Before (Old Way)

```tsx
const contentOpacity = useSharedValue(1);

const contentStyle = useAnimatedStyle(() => {
  return {
    opacity: contentOpacity.value,
  };
});

return (
  <Animated.View style={[{ flex: 1 }, contentStyle]}>
    {/* Content */}
  </Animated.View>
);
```

### After (New Way)

```tsx
const { contentStyle } = useScreenTransition();

return (
  <Animated.View style={[{ flex: 1 }, contentStyle]}>
    {/* Content */}
  </Animated.View>
);
```

## Summary

- **One hook** for all screen transitions: `useScreenTransition()`
- **Consistent timing** across the entire app
- **Smooth back navigation** with no content flashing
- **Fast and efficient** with optimized spring physics
- **Easy to customize** through centralized config

For questions or issues, refer to the implementation in:

- `src/hooks/useScreenTransition.ts`
- `src/utils/navigationConfig.ts`
- `src/features/advocates/screens/AdvocateProfileScreen.tsx` (example)
- `src/features/consultation/screens/ChatScreen.tsx` (example)
