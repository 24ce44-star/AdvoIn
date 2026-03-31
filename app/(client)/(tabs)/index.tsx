import { ThemedText } from "@/components/ui/ThemedText";
import { HeaderContext } from "@/context/HeaderContext";
import { AdvocateList } from "@/features/advocates/components/AdvocateList";
import { GroqService } from "@/features/case-builder/services/groq.service";
import { useCaseStore } from "@/features/case-builder/store/useCaseStore";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import {
    ArrowRight,
    FileText,
    Gavel,
    Scale,
    Shield,
    Sparkles,
} from "lucide-react-native";
import React, { useContext, useRef, useState } from "react";
import {
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

const CATEGORIES = [
  { id: "family", name: "Family", icon: Scale },
  { id: "corporate", name: "Corporate", icon: Shield },
  { id: "property", name: "Property", icon: FileText },
  { id: "criminal", name: "Criminal", icon: Gavel },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useLegalTheme();
  const insets = useSafeAreaInsets();
  const { triggerNewChat } = useCaseStore();
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleLaunchAI = async (text?: string) => {
    const launchText = (
      (typeof text === "string" ? text : prompt) || ""
    ).trim();

    if (!launchText) {
      // No text — go straight to case builder
      triggerNewChat();
      router.push("/create-case");
      return;
    }

    setIsAnalyzing(true);
    setPrompt("");
    inputRef.current?.blur();

    try {
      const { intent, category } = await GroqService.detectIntent(launchText);

      if (intent === "find_lawyer") {
        // Route to explore with pre-selected category filter
        router.push({
          pathname: "/(client)/(tabs)/explore",
          params: category ? { category } : {},
        });
      } else {
        // Route to case builder with the initial message
        triggerNewChat(launchText);
        router.push("/create-case");
      }
    } catch {
      // Fallback: always go to case builder
      triggerNewChat(launchText);
      router.push("/create-case");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const { homeScrollY } = useContext(HeaderContext);
  const scrollY = homeScrollY || useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0.4, { duration: 1800 }),
      ),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Sync with context value
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
        [0, 200],
        [
          isDark ? "rgba(10, 10, 10, 1)" : "rgba(255, 255, 255, 1)", // Opaque Standard Theme
          isDark ? "rgba(23, 23, 23, 0.98)" : "rgba(248, 250, 252, 0.98)", // Accent Scrolled
        ],
      ),
    };
  });

  return (
    <View className="flex-1 bg-legal-ice dark:bg-black">
      {/* Sticky Header */}
      <Animated.ScrollView
        className="flex-1"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: 120, // Increased to account for the new floating tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="px-6 mt-2">
          <ThemedText
            variant="h1"
            weight="bold"
            className="mb-2 leading-tight text-legal-navy dark:text-legal-ice"
          >
            Find the perfect{"\n"}
            <ThemedText variant="h1" weight="bold" className="text-legal-steel">
              legal authority.
            </ThemedText>
          </ThemedText>
          <ThemedText variant="body" className="text-legal-slate mb-6">
            Connect with expert advocates instantly
          </ThemedText>

          {/* AI Legal Issue Input Builder */}
          <View className="mb-8">
            <View className="flex-row items-center bg-[#FAFAFA] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-[20px] px-5 h-[64px]">
              {isAnalyzing ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#71717A" : "#A1A1AA"}
                />
              ) : (
                <Sparkles
                  size={20}
                  color={isDark ? "#71717A" : "#A1A1AA"}
                  strokeWidth={3}
                />
              )}
              <TextInput
                ref={inputRef}
                className="flex-1 ml-3 text-[17px] font-medium tracking-tight h-full"
                style={{ color: isDark ? "#FAFAFA" : "#09090B" }}
                placeholder={
                  isAnalyzing
                    ? "Analyzing your request..."
                    : "Describe your legal issue..."
                }
                placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
                value={prompt}
                onChangeText={setPrompt}
                onSubmitEditing={() => handleLaunchAI()}
                returnKeyType="send"
                editable={!isAnalyzing}
              />

              {prompt.trim().length > 0 && !isAnalyzing && (
                <TouchableOpacity
                  onPress={() => handleLaunchAI()}
                  className="ml-2 w-[34px] h-[34px] items-center justify-center bg-zinc-950 dark:bg-zinc-50 rounded-[12px]"
                  activeOpacity={0.7}
                >
                  <ArrowRight
                    size={16}
                    color={isDark ? "#09090B" : "#FAFAFA"}
                    strokeWidth={3}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom row: chips */}
            <View className="flex-row gap-2 mt-3 px-1">
              {["FIR", "Property", "Family", "Contract"].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  activeOpacity={0.7}
                  disabled={isAnalyzing}
                  onPress={() =>
                    handleLaunchAI(`Help me with a ${tag} legal issue.`)
                  }
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1.5"
                  style={{ opacity: isAnalyzing ? 0.4 : 1 }}
                >
                  <ThemedText className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 tracking-tight">
                    {tag}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View className="flex-row justify-between mb-10">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="items-center"
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/(client)/(tabs)/explore",
                    params: { category: cat.id },
                  })
                }
              >
                <View className="w-16 h-16 rounded-2xl bg-legal-surface dark:bg-neutral-900 items-center justify-center mb-2 border border-legal-slate/10 dark:border-neutral-800 shadow-sm">
                  <cat.icon
                    size={26}
                    color="#3B82F6" // legal-steel pop
                    strokeWidth={1.5}
                  />
                </View>
                <ThemedText
                  variant="caption"
                  className="font-medium text-legal-charcoal dark:text-legal-ice"
                >
                  {cat.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section Header */}
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText
              variant="h3"
              weight="bold"
              className="text-legal-navy dark:text-legal-ice"
            >
              Top Advocates
            </ThemedText>
            <TouchableOpacity>
              <ThemedText
                variant="caption"
                className="text-legal-steel font-medium"
              >
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Advocates List */}
        <View className="min-h-[500px]">
          <AdvocateList scrollEnabled={false} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}
