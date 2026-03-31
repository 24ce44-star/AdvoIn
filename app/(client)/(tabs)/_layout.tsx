import { ThemedText } from "@/components/ui/ThemedText";
import { HeaderContext } from "@/context/HeaderContext";
import { useCaseStore } from "@/features/case-builder/store/useCaseStore";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { Tabs, usePathname } from "expo-router";
import {
  Bell,
  History,
  Home,
  MessageSquare,
  Plus,
  Search,
  User,
  Wand2,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomTabBar } from "./CustomTabBar";

const ANIMATION_CONFIG = {
  duration: 300,
  useNativeDriver: true,
};

// Removed AnimatedLinearGradient reference

function Header({
  exploreScrollY,
  homeScrollY,
  exploreTransition,
  homeTransition,
  chatsScrollY,
  chatsTransition,
}: {
  exploreScrollY: SharedValue<number>;
  homeScrollY: SharedValue<number>;
  exploreTransition: SharedValue<number>;
  homeTransition: SharedValue<number>;
  chatsScrollY: SharedValue<number>;
  chatsTransition: SharedValue<number>;
}) {
  const pathname = usePathname();
  const { colors, isDark } = useLegalTheme();
  const insets = useSafeAreaInsets();

  // Determine content based on current path
  let title = "AdvoIn";
  let subtitle = "Authoritative. Intelligent.";
  let showSearch = false;
  let showBell = true;
  let showCaseBuilderActions = false;
  let titleColorClass = "text-legal-navy dark:text-legal-ice tracking-tight";
  let subtitleColorClass = "text-legal-slate mb-0.5";

  if (pathname.includes("/explore")) {
    title = "Explore Services";
    subtitle = "Good Morning, User";
    showSearch = true;
    showBell = false;
    showCaseBuilderActions = false;
    titleColorClass = "text-legal-navy dark:text-legal-ice tracking-tight";
    subtitleColorClass = "text-legal-slate dark:text-legal-slate mb-0.5";
  } else if (pathname.includes("/chats")) {
    title = "Messages";
    subtitle = "Your Conversations";
    showSearch = true; // Activated natively to catch scroll
    showBell = false;
    showCaseBuilderActions = false;
  } else if (pathname.includes("/create-case")) {
    title = "AI Case Builder";
    subtitle = "Secure Legal Draft";
    showSearch = false;
    showBell = false;
    showCaseBuilderActions = true;
  } else if (pathname.includes("/profile")) {
    title = "Profile";
    subtitle = "Account & Settings";
    showSearch = false;
    showBell = false;
    showCaseBuilderActions = false;
  }

  const searchButtonStyle = useAnimatedStyle(() => {
    // Dynamically blend between explore and chats scroll seamlessly
    const activeScrollY =
      exploreTransition.value * exploreScrollY.value +
      chatsTransition.value * chatsScrollY.value;

    const activeTransition = Math.max(
      exploreTransition.value,
      chatsTransition.value,
    );

    const targetOpacity = interpolate(
      activeScrollY,
      [50, 90],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const targetTranslateY = interpolate(
      activeScrollY,
      [50, 90],
      [10, 0],
      Extrapolation.CLAMP,
    );

    // Fade and translate search button natively based on active transition
    const finalOpacity = activeTransition * targetOpacity;
    const finalTranslateY = interpolate(
      activeTransition,
      [0, 1],
      [10, targetTranslateY],
      Extrapolation.CLAMP,
    );

    return {
      opacity: finalOpacity,
      transform: [{ translateY: finalTranslateY }],
      pointerEvents: finalOpacity < 0.1 ? "none" : "auto",
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const isHome = pathname === "/" || pathname === "/index";
    const bgStart = isDark ? "#000000" : "#FFFFFF";

    const exploreScrollVal = exploreScrollY.value;
    const exploreBgTarget = interpolateColor(
      exploreScrollVal,
      [0, 80],
      [
        isDark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)",
        isDark ? "#000000" : "#FFFFFF",
      ],
    );

    const opacityWhenExplore = interpolate(
      exploreScrollVal,
      [0, 80],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const homeScrollVal = homeScrollY.value;
    const homeOpacity = interpolate(
      homeScrollVal,
      [20, 80],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const normalBorderColor = isDark
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";
    const homeBorderColor = isDark
      ? `rgba(255, 255, 255, ${homeOpacity * 0.1})`
      : `rgba(0, 0, 0, ${homeOpacity * 0.1})`;
    const exploreBorderColor = isDark
      ? `rgba(255, 255, 255, ${opacityWhenExplore * 0.1})`
      : `rgba(0, 0, 0, ${opacityWhenExplore * 0.1})`;

    const baseBorder = isHome ? homeBorderColor : normalBorderColor;

    const backgroundColor = interpolateColor(
      exploreTransition.value,
      [0, 1],
      [bgStart, exploreBgTarget],
    );

    const borderBottomColor = interpolateColor(
      exploreTransition.value,
      [0, 1],
      [baseBorder, exploreBorderColor],
    );

    return {
      backgroundColor,
      borderBottomWidth: 1,
      borderBottomColor,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    };
  }, [pathname, isDark]);

  const headerTextStyle = useAnimatedStyle(() => {
    // We natively cross-fade the opacities avoiding any single-frame flashes
    const scrollVal = homeScrollY.value;
    const homeOpacityTarget = interpolate(
      scrollVal,
      [40, 90],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const homeTranslateTarget = interpolate(
      scrollVal,
      [40, 90],
      [5, 0],
      Extrapolation.CLAMP,
    );

    const finalOpacity = interpolate(
      homeTransition.value,
      [0, 1],
      [1, homeOpacityTarget],
    );

    const finalTranslateY = interpolate(
      homeTransition.value,
      [0, 1],
      [0, homeTranslateTarget],
    );

    return {
      opacity: finalOpacity,
      transform: [{ translateY: finalTranslateY }],
    };
  });

  return (
    <Animated.View
      className="px-6 pb-4 flex-row justify-between items-center z-50 overflow-hidden"
      style={[{ paddingTop: insets.top + 10 }, headerAnimatedStyle]}
    >
      <View className="flex-1 justify-center py-2">
        <Animated.View style={headerTextStyle}>
          <ThemedText
            variant="caption"
            className={subtitleColorClass}
            numberOfLines={1}
          >
            {subtitle}
          </ThemedText>
          <ThemedText
            variant="h2"
            weight="bold"
            className={titleColorClass}
            numberOfLines={1}
          >
            {title}
          </ThemedText>
        </Animated.View>
      </View>

      <View className="flex-row items-center justify-end min-w-[50px] h-10">
        {showSearch && (
          <Animated.View
            style={[{ position: "absolute", right: 0 }, searchButtonStyle]}
          >
            <TouchableOpacity
              className="flex-row items-center bg-gray-50 dark:bg-neutral-800/80 px-4 py-2 rounded-full border border-gray-200 dark:border-neutral-700 shadow-sm ml-2"
              activeOpacity={0.7}
            >
              <Search size={16} color={colors.text} />
              <ThemedText className="ml-2 font-semibold text-legal-charcoal dark:text-legal-ice text-sm">
                Search
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        )}
        {showBell && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{ position: "absolute", right: 0 }}
          >
            <TouchableOpacity className="p-2">
              <Bell size={24} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>
        )}
        {showCaseBuilderActions && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{ position: "absolute", right: 0 }}
            className="flex-row items-center gap-x-1"
          >
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] mr-2"
              onPress={() => useCaseStore.getState().setHistoryOpen(true)}
            >
              <History
                size={20}
                color={isDark ? "#F8FAFC" : "#0F172A"}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="px-3 py-2 flex-row items-center rounded-full bg-[#0F172A] dark:bg-[#38BDF8]"
              onPress={() => useCaseStore.getState().triggerNewChat()}
            >
              <Plus
                size={16}
                color={isDark ? "#000000" : "#FFFFFF"}
                strokeWidth={2.5}
              />
              <ThemedText
                className="ml-1 text-sm font-semibold"
                style={{ color: isDark ? "#000000" : "#FFFFFF" }}
              >
                New
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isDark = colorScheme === "dark";

  const exploreScrollY = useSharedValue(0);
  const homeScrollY = useSharedValue(0);
  const chatsScrollY = useSharedValue(0);

  const exploreTransition = useSharedValue(
    pathname.includes("/explore") ? 1 : 0,
  );
  const homeTransition = useSharedValue(
    pathname === "/" || pathname === "/index" ? 1 : 0,
  );
  const chatsTransition = useSharedValue(pathname.includes("/chats") ? 1 : 0);

  useEffect(() => {
    exploreTransition.value = withTiming(
      pathname.includes("/explore") ? 1 : 0,
      { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
    );
    homeTransition.value = withTiming(
      pathname === "/" || pathname === "/index" ? 1 : 0,
      { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
    );
    chatsTransition.value = withTiming(pathname.includes("/chats") ? 1 : 0, {
      duration: 350,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [pathname]);

  const rootStyle = useAnimatedStyle(() => {
    const bgStart = isDark ? "#000000" : "#FFFFFF";
    const exploreBgTarget = interpolateColor(
      exploreScrollY.value,
      [0, 80],
      [
        isDark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)",
        isDark ? "#000000" : "#FFFFFF",
      ],
    );

    const backgroundColor = interpolateColor(
      exploreTransition.value,
      [0, 1],
      [bgStart, exploreBgTarget],
    );

    return { backgroundColor };
  }, [pathname, isDark]);

  const contentStyle = useAnimatedStyle(() => {
    const exploreRadius = interpolate(
      exploreScrollY.value,
      [0, 80],
      [36, 0],
      Extrapolation.CLAMP,
    );
    const radius = interpolate(
      exploreTransition.value,
      [0, 1],
      [0, exploreRadius],
    );

    return {
      flex: 1,
      backgroundColor: isDark ? "#000000" : "#FFFFFF",
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      overflow: "hidden",
    };
  }, [pathname, isDark]);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor: isDark ? "#3B82F6" : "#0F172A", // legal-steel or legal-navy
      tabBarInactiveTintColor: isDark ? "#64748B" : "#64748B", // legal-slate
      tabBarStyle: {
        backgroundColor: isDark ? "#171717" : "#FFFFFF",
        borderTopColor: isDark ? "#171717" : "#F8FAFC",
        borderTopWidth: 1,
        elevation: 0,
        shadowOpacity: 0,
        height: 70 + insets.bottom,
        paddingBottom: insets.bottom + 10,
        paddingTop: 5,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: "500" as const,
        textTransform: "none" as const,
      },
    }),
    [isDark, insets.bottom],
  );

  const homeOptions = useMemo(
    () => ({
      title: "Home",
      tabBarIcon: ({ color }: { color: string }) => (
        <Home size={24} color={color} strokeWidth={2} />
      ),
    }),
    [],
  );

  const exploreOptions = useMemo(
    () => ({
      title: "Explore",
      tabBarIcon: ({ color }: { color: string }) => (
        <Search size={24} color={color} strokeWidth={2} />
      ),
    }),
    [],
  );

  const createOptions = useMemo(
    () =>
      ({
        title: "New Case",
        tabBarIcon: ({ color }: { color: string }) => (
          <View className="bg-blue-500 w-12 h-12 rounded-full items-center justify-center -mt-6 shadow-lg shadow-blue-500/40">
            <Wand2 size={24} color="#FFFFFF" strokeWidth={2} />
          </View>
        ),
      }) as any,
    [],
  );

  const chatsOptions = useMemo(
    () => ({
      title: "Chats",
      tabBarIcon: ({ color }: { color: string }) => (
        <MessageSquare size={24} color={color} strokeWidth={2} />
      ),
    }),
    [],
  );

  const profileOptions = useMemo(
    () => ({
      title: "Profile",
      tabBarIcon: ({ color }: { color: string }) => (
        <User size={24} color={color} strokeWidth={2} />
      ),
    }),
    [],
  );

  const headerContextValue = useMemo(
    () => ({ exploreScrollY, homeScrollY, chatsScrollY }),
    [exploreScrollY, homeScrollY, chatsScrollY],
  );

  return (
    <HeaderContext.Provider value={headerContextValue}>
      <Animated.View style={[{ flex: 1 }, rootStyle]}>
        <Header
          exploreScrollY={exploreScrollY}
          homeScrollY={homeScrollY}
          chatsScrollY={chatsScrollY}
          exploreTransition={exploreTransition}
          homeTransition={homeTransition}
          chatsTransition={chatsTransition}
        />
        <Animated.View style={contentStyle}>
          <Tabs
            initialRouteName="index"
            screenOptions={screenOptions}
            tabBar={(props) => <CustomTabBar {...props} />}
          >
            <Tabs.Screen name="index" options={homeOptions} />
            <Tabs.Screen name="explore" options={exploreOptions} />
            <Tabs.Screen name="create-case" options={createOptions as any} />
            <Tabs.Screen name="chats" options={chatsOptions} />
            <Tabs.Screen name="profile" options={profileOptions} />
          </Tabs>
        </Animated.View>
      </Animated.View>
    </HeaderContext.Provider>
  );
}
