import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { useScreenTransition } from "@/hooks/useScreenTransition";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    BadgeCheck,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Phone,
    Star,
} from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAdvocateStore } from "../store/useAdvocateStore";

export function AdvocateProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const advocate = useAdvocateStore((state) => state.getAdvocateById(id));
  const router = useRouter();
  const { colors, isDark } = useLegalTheme();
  const [showAllStats, setShowAllStats] = useState(false);
  const insets = useSafeAreaInsets();

  // Use reusable screen transition hook
  const { contentStyle } = useScreenTransition();

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      borderBottomWidth: withTiming(scrollY.value > 20 ? 1 : 0, {
        duration: 200,
      }),
      borderColor: isDark ? "#262626" : "#E5E5E5",
      backgroundColor: interpolateColor(
        scrollY.value,
        [0, 50, 200],
        [
          isDark ? "rgba(23, 23, 23, 0)" : "rgba(249, 250, 251, 0)",
          isDark ? "rgba(23, 23, 23, 0.95)" : "rgba(249, 250, 251, 0.95)",
          isDark ? "rgba(23, 23, 23, 0.98)" : "rgba(249, 250, 251, 0.98)",
        ],
      ),
    };
  });

  const bottomBarStyle = useAnimatedStyle(() => {
    return {
      borderTopWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      backgroundColor: interpolateColor(
        scrollY.value,
        [0, 200],
        [
          isDark ? "rgba(23, 23, 23, 0.95)" : "rgba(249, 250, 251, 0.95)",
          isDark ? "rgba(23, 23, 23, 0.98)" : "rgba(249, 250, 251, 0.98)",
        ],
      ),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 10,
      elevation: 10,
    };
  });

  const profileOpacity = useAnimatedStyle(() => {
    const shouldShow = scrollY.value > 180;
    return {
      opacity: withTiming(shouldShow ? 1 : 0, { duration: 300 }),
      transform: [
        { translateY: withTiming(shouldShow ? 0 : 8, { duration: 300 }) },
      ],
    };
  });

  const defaultTitleOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(scrollY.value > 180 ? 0 : 1, { duration: 200 }),
      transform: [
        {
          translateY: withTiming(scrollY.value > 180 ? -5 : 0, {
            duration: 200,
          }),
        },
      ],
    };
  });

  if (!advocate)
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F9FAFB] dark:bg-[#171717]">
        <ThemedText>Advocate not found</ThemedText>
        <Button
          label="Go Back"
          onPress={() => router.back()}
          variant="outline"
          className="mt-4"
        />
      </SafeAreaView>
    );
  return (
    <Animated.View
      style={[{ flex: 1 }, contentStyle]}
      className="bg-[#F9FAFB] dark:bg-[#171717]"
    >
      <Animated.View
        className="flex-row items-center px-4 z-50 absolute top-0 left-0 right-0"
        style={[
          headerStyle,
          {
            paddingTop: insets.top + 8,
            height: insets.top + 60,
            paddingBottom: 12,
          },
        ]}
      >
        <View className="z-20">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center active:bg-legal-slate/10"
            activeOpacity={0.6}
          >
            <ArrowLeft
              size={24}
              color={isDark ? "#FAFAFA" : "#0F172A"}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>

        {/* Default Title Centered (Fades out) */}
        <View
          className="flex-1 items-center justify-center absolute left-0 right-0 pointer-events-none z-10"
          style={{ top: insets.top, bottom: 0 }}
        >
          <Animated.View style={defaultTitleOpacity}>
            <ThemedText
              variant="label"
              weight="bold"
              className="tracking-wide uppercase text-xs text-neutral-500 dark:text-neutral-400"
            >
              Advocate Profile
            </ThemedText>
          </Animated.View>
        </View>

        {/* Sticky Profile Info (Align Left/Right) */}
        <Animated.View
          className="flex-1 flex-row items-center justify-between absolute left-14 right-4 z-10 pointer-events-none"
          style={[profileOpacity, { top: insets.top, bottom: 0 }]}
        >
          <View className="flex-row items-center flex-1 mr-4">
            <Avatar
              source={advocate.imageUrl}
              size="sm"
              initials={advocate.name.substring(0, 2)}
              className="mr-2.5 shadow-sm border border-black/5 dark:border-white/10"
              online
            />
            <View className="flex-1">
              <View className="flex-row items-center">
                <ThemedText
                  weight="bold"
                  numberOfLines={1}
                  className="text-sm leading-tight text-neutral-900 dark:text-neutral-100 mr-1"
                >
                  {advocate.name}
                </ThemedText>
                <BadgeCheck size={14} color="#3B82F6" className="mt-0.5" />
              </View>
              <ThemedText
                numberOfLines={1}
                className="text-[10px] text-neutral-500 font-medium leading-tight"
              >
                {advocate.specialty}
              </ThemedText>
            </View>
          </View>

          <View className="flex-row items-center bg-yellow-500/10 dark:bg-yellow-500/20 px-2.5 py-1.5 rounded-full">
            <Star size={16} color="#EAB308" fill="#EAB308" />
            <ThemedText className="text-sm font-bold ml-1.5 text-yellow-700 dark:text-yellow-500">
              {advocate.rating}
            </ThemedText>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 140,
          paddingTop: insets.top + 80,
        }}
      >
        <View className="items-center mb-8">
          <View className="p-1.5 bg-white dark:bg-[#262626] rounded-full shadow-sm border border-black/5 dark:border-white/5 mb-4">
            <Avatar
              source={advocate.imageUrl}
              size="xl"
              initials={advocate.name.substring(0, 2)}
              online
            />
          </View>
          <View className="flex-row items-center mb-1.5">
            <ThemedText
              variant="h1"
              weight="bold"
              className="text-center text-neutral-900 dark:text-neutral-100 tracking-tight mr-1.5"
            >
              {advocate.name}
            </ThemedText>
            <BadgeCheck size={24} color="#3B82F6" />
          </View>
          <ThemedText
            variant="body"
            className="text-neutral-500 dark:text-neutral-400 font-medium text-center mb-3"
          >
            {advocate.specialty}
          </ThemedText>
          <View className="bg-legal-emerald/10 dark:bg-legal-emerald/20 px-3 py-1 rounded-full mb-3 border border-legal-emerald/20">
            <ThemedText className="text-legal-emerald font-medium text-[11px] uppercase tracking-wider">
              Available for Consultation
            </ThemedText>
          </View>
          <View className="flex-row items-center bg-white dark:bg-[#262626] rounded-full px-5 py-2.5 shadow-sm border border-black/5 dark:border-white/5 mt-1">
            <View className="flex-row items-center mr-3">
              <Star size={16} color="#FBBF24" fill="#FBBF24" />
              <ThemedText
                variant="body"
                weight="bold"
                className="ml-1.5 pt-0.5 text-neutral-900 dark:text-neutral-100"
              >
                {advocate.rating}
              </ThemedText>
            </View>
            <View className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700/50 mr-3" />
            <ThemedText className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">
              {advocate.reviewCount} Reviews
            </ThemedText>
          </View>
        </View>

        <View className="bg-white dark:bg-[#262626] rounded-2xl p-5 mb-6 shadow-sm border border-black/5 dark:border-white/5">
          <ThemedText
            variant="h3"
            weight="bold"
            className="mb-2 text-neutral-900 dark:text-neutral-100"
          >
            About
          </ThemedText>
          <ThemedText className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[15px]">
            Experienced advocate specializing in high-stakes litigation and
            dispute resolution. Dedicated to providing strategic legal counsel
            with a focus on client success.
          </ThemedText>
        </View>

        <View className="flex-row items-center mb-8 bg-white dark:bg-[#262626] rounded-2xl py-6 px-4 shadow-sm border border-black/5 dark:border-white/5">
          <View className="flex-1 items-center justify-center">
            <ThemedText
              variant="h2"
              weight="bold"
              className="text-neutral-900 dark:text-neutral-100"
            >
              15+
            </ThemedText>
            <ThemedText
              variant="caption"
              className="text-neutral-500 dark:text-neutral-400 mt-1 text-center font-medium"
            >
              Years Exp.
            </ThemedText>
          </View>

          <View className="w-[1px] h-12 bg-neutral-200 dark:bg-neutral-700/50" />

          <View className="flex-1 items-center justify-center">
            <ThemedText
              variant="h2"
              weight="bold"
              className="text-neutral-900 dark:text-neutral-100"
            >
              98%
            </ThemedText>
            <ThemedText
              variant="caption"
              className="text-neutral-500 dark:text-neutral-400 mt-1 text-center font-medium"
            >
              Success Rate
            </ThemedText>
          </View>
        </View>

        {advocate.caseStats && (
          <View className="mb-8">
            <ThemedText
              variant="h3"
              weight="bold"
              className="mb-4 text-neutral-900 dark:text-neutral-100"
            >
              Case Statistics
            </ThemedText>
            <View className="bg-white dark:bg-[#262626] rounded-2xl p-5 shadow-sm border border-black/5 dark:border-white/5">
              {advocate.caseStats
                .slice(0, showAllStats ? undefined : 4)
                .map((stat, index) => (
                  <View key={index} className="mb-5 last:mb-0">
                    <View className="flex-row justify-between mb-2">
                      <ThemedText
                        weight="medium"
                        className="text-neutral-800 dark:text-neutral-200"
                      >
                        {stat.category}
                      </ThemedText>
                      <ThemedText className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">
                        {stat.count} cases
                      </ThemedText>
                    </View>
                    <View className="h-2.5 bg-neutral-200 dark:bg-[#333333] rounded-full overflow-hidden">
                      <View
                        className="h-full bg-neutral-900 dark:bg-legal-ice rounded-full"
                        style={{ width: `${(stat.count / stat.total) * 100}%` }}
                      />
                    </View>
                  </View>
                ))}
              {advocate.caseStats.length > 4 && (
                <Button
                  label={showAllStats ? "Show Less" : "Show More"}
                  variant="ghost"
                  onPress={() => setShowAllStats(!showAllStats)}
                  icon={
                    showAllStats ? (
                      <ChevronUp size={20} color={colors.text} />
                    ) : (
                      <ChevronDown size={20} color={colors.text} />
                    )
                  }
                  className="mt-2"
                />
              )}
            </View>
          </View>
        )}

        {advocate.pastCasesReviews && advocate.pastCasesReviews.length > 0 && (
          <View className="mb-6">
            <ThemedText
              variant="h3"
              weight="bold"
              className="mb-4 text-neutral-900 dark:text-neutral-100"
            >
              Past Case Reviews
            </ThemedText>
            {advocate.pastCasesReviews.map((review) => (
              <View
                key={review.id}
                className="bg-white dark:bg-[#262626] p-5 rounded-2xl mb-4 border border-black/5 dark:border-white/5 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <ThemedText
                      weight="bold"
                      className="text-base text-neutral-900 dark:text-neutral-100"
                    >
                      {review.reviewerName}
                    </ThemedText>
                    <ThemedText
                      variant="caption"
                      className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5"
                    >
                      {review.genre}
                    </ThemedText>
                    <View className="flex-row items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          color={i < review.rating ? "#FBBF24" : "#E5E5E5"}
                          fill={i < review.rating ? "#FBBF24" : "transparent"}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                  </View>
                  <ThemedText
                    variant="caption"
                    className="text-neutral-400 dark:text-neutral-500 text-[10px] font-medium"
                  >
                    {review.date}
                  </ThemedText>
                </View>

                <ThemedText className="text-neutral-600 dark:text-neutral-300 text-[14px] leading-relaxed mt-3 italic">
                  "{review.comment}"
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </Animated.ScrollView>

      <Animated.View
        className="absolute bottom-0 left-0 right-0 px-5 pt-5 pb-10 backdrop-blur-sm flex-row gap-4"
        style={bottomBarStyle}
      >
        <Button
          label="Message"
          variant="outline"
          className="h-14 w-full rounded-xl border border-neutral-300 dark:border-[#333333] shadow-sm bg-white dark:bg-[#1A1A1A]"
          style={{ flex: 1 }}
          onPress={() => router.push(`/chat/${id}` as any)}
          textClassName="text-neutral-900 dark:text-neutral-100 font-semibold"
          icon={
            <MessageSquare size={18} color={isDark ? "#FAFAFA" : "#171717"} />
          }
        />
        <Button
          label="Call Advocate"
          variant="primary"
          className="h-14 w-full rounded-xl shadow-sm bg-[#171717] dark:bg-white"
          style={{ flex: 1 }}
          onPress={() => router.push(`/call/${id}` as any)}
          textClassName="text-white dark:text-[#171717] font-semibold"
          icon={<Phone size={18} color={isDark ? "#171717" : "white"} />}
        />
      </Animated.View>
    </Animated.View>
  );
}
