import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, MessageSquare, Search, User, Wand2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import {
    Dimensions,
    Keyboard,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const TAB_BAR_MARGIN = 32; // Matches auth screen paddingHorizontal 32
const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN * 2;

export function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const ROUTES_COUNT = state.routes.length;
  // Account for the 6px padding on left/right
  const INNER_WIDTH = TAB_BAR_WIDTH - 12;
  const TAB_WIDTH = INNER_WIDTH / ROUTES_COUNT;

  // Track active index for sliding indicator
  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 18,
      stiffness: 150,
      mass: 0.8,
    });
  }, [state.index]);

  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const slideStyle = useAnimatedStyle(() => {
    // The pill now elegantly slides across all 5 standardly sized icons without disappearing
    return {
      transform: [{ translateX: activeIndex.value * TAB_WIDTH }],
    };
  });

  if (isKeyboardVisible) {
    return null;
  }

  // Zinc Hierarchy mapping exactly as Auth Page
  const bgColor = isDark ? "#18181B" : "#F4F4F5"; // zinc-900 / zinc-100 (matches switch tracker)
  const borderColor = isDark ? "#27272A" : "#E4E4E7"; // zinc-800 / zinc-200
  const slidingPillBg = isDark ? "#3F3F46" : "#FFFFFF"; // zinc-700 / white
  
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 24;

  return (
    <View
      style={{
        position: "absolute",
        bottom: bottomPadding,
        left: TAB_BAR_MARGIN,
        right: TAB_BAR_MARGIN,
        height: 64, // Matches exact auth layout components heights
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Container matching Auth Switch Component */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 20,
            backgroundColor: bgColor,
            borderWidth: 1,
            borderColor: borderColor,
            padding: 6,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Sliding Pill Indicator */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: TAB_WIDTH,
                height: "100%",
                padding: 0,
                alignItems: "center",
                justifyContent: "center",
              },
              slideStyle,
            ]}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 16, // Pill radius inside radius 20 container
                backgroundColor: slidingPillBg,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.05,
                shadowRadius: 4,
                elevation: isDark ? 0 : 2,
              }}
            />
          </Animated.View>

          {/* Route Icons */}
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const isCreateCase = route.name === "create-case";

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            let IconComponent = Home;
            let iconSize = 22;
            
            if (route.name === "index") IconComponent = Home;
            else if (route.name === "explore") IconComponent = Search;
            else if (route.name === "create-case") {
              IconComponent = Wand2; 
              iconSize = 24; // Just a tiny bit larger for emphasis, but sitting fully flush
            }
            else if (route.name === "chats") IconComponent = MessageSquare;
            else if (route.name === "profile") IconComponent = User;

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={1}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  width: TAB_WIDTH,
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: isCreateCase ? 2 : 1, // Let AI button stay purely on top layer if needed
                }}
              >
                <TabIcon 
                  Icon={IconComponent} 
                  isFocused={isFocused} 
                  size={iconSize}
                  isCreateCase={isCreateCase}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabIcon({ Icon, isFocused, size, isCreateCase }: any) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const animatedFocus = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    animatedFocus.value = withSpring(isFocused ? 1 : 0, {
      damping: 18,
      stiffness: 150,
      mass: 0.8,
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: 1 + 0.1 * animatedFocus.value }, // Slight crisp scale up
      ],
    };
  });

  // Base colors mimicking auth screen's switch button text
  const activeColor = isDark ? "#FAFAFA" : "#09090B";
  const inactiveColor = isDark ? "#A1A1AA" : "#71717A";

  // If we really want the Create Case button to subtly stand out when inactive, 
  // we could tweak its inactive color, but keeping it uniform matches the auth aesthetic.

  return (
    <Animated.View
      style={[{ alignItems: "center", justifyContent: "center" }, animatedIconStyle]}
    >
      <Icon
        size={size}
        color={isFocused ? activeColor : inactiveColor}
        strokeWidth={isFocused ? 2.5 : 2}
      />
    </Animated.View>
  );
}
