import { AdvocateCard } from "@/components/ui/AdvocateCard";
import { ThemedText } from "@/components/ui/ThemedText";
import { HeaderContext } from "@/context/HeaderContext";
import { BuddyOrb } from "@/features/buddy-ai/components/BuddyOrb";
import { MatchmakerOverlay } from "@/features/buddy-ai/components/MatchmakerOverlay";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { MOCK_ADVOCATES } from "@/services/mock/mockAdvocates";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BookOpen,
  Briefcase,
  ChevronRight,
  FileText,
  Gavel,
  PlayCircle,
  Scale,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  Users,
  X,
} from "lucide-react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "criminal", name: "Criminal Defense", icon: Gavel, color: "#EF4444" },
  { id: "family", name: "Family & Divorce", icon: Users, color: "#F59E0B" },
  {
    id: "property",
    name: "Property & Real Estate",
    icon: Briefcase,
    color: "#10B981",
  },
  {
    id: "documents",
    name: "Legal Documents",
    icon: FileText,
    color: "#3B82F6",
  },
  { id: "ipr", name: "Intellectual Property", icon: Shield, color: "#8B5CF6" },
  {
    id: "corporate",
    name: "Corporate & Business",
    icon: Scale,
    color: "#6366F1",
  },
];

const LEGAL_INSIGHTS = [
  {
    id: "1",
    title: "Constitutional Rights Basics",
    type: "Course",
    duration: "2h",
    icon: BookOpen,
    color: "#3B82F6",
  },
  {
    id: "2",
    title: "Traffic Violations Guide",
    type: "Quick Guide",
    duration: "5m",
    icon: FileText,
    color: "#10B981",
  },
  {
    id: "3",
    title: "Property Registration",
    type: "Tutorial",
    duration: "20m",
    icon: PlayCircle,
    color: "#F59E0B",
  },
  {
    id: "4",
    title: "Family Law Fundamentals",
    type: "Course",
    duration: "3h",
    icon: Users,
    color: "#8B5CF6",
  },
];

const SORT_OPTIONS = [
  { id: "rating", label: "Top Rated" },
  { id: "price_asc", label: "Price: Low" },
  { id: "price_desc", label: "Price: High" },
  { id: "reviews", label: "Most Reviews" },
];

const AVAILABILITY = [
  { id: "all", label: "All" },
  { id: "online", label: "Online Now" },
];

// ─── Category Pill (for search filters) ───────────────────────────────────────

function CategoryPill({
  item,
  isActive,
  onPress,
  isDark,
}: {
  item: (typeof CATEGORIES)[0];
  isActive: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${
        isActive
          ? "bg-blue-500 border-blue-500"
          : "bg-legal-surface dark:bg-neutral-900 border-legal-slate/15 dark:border-neutral-800"
      }`}
    >
      <item.icon
        size={13}
        color={isActive ? "#fff" : isDark ? "#94A3B8" : "#64748B"}
      />
      <ThemedText
        variant="caption"
        className={`ml-1.5 font-semibold ${
          isActive ? "text-white" : "text-legal-slate dark:text-neutral-400"
        }`}
      >
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );
}

// ─── Sort / Filter Chip ───────────────────────────────────────────────────────

function FilterChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-3.5 py-1.5 rounded-full mr-2 border ${
        isActive
          ? "bg-blue-500/10 border-blue-500/40"
          : "bg-transparent border-legal-slate/15 dark:border-neutral-800"
      }`}
    >
      <ThemedText
        variant="caption"
        className={`font-semibold ${
          isActive ? "text-blue-500" : "text-legal-slate dark:text-neutral-400"
        }`}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

// ─── Bento Category Card ────────────────────────────────────────────────────────
function BentoCategoryCard({
  item,
  height,
  onPress,
}: {
  item: (typeof CATEGORIES)[0];
  height: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-legal-surface dark:bg-neutral-900 rounded-3xl p-4 overflow-hidden border border-legal-slate/5 dark:border-neutral-800/50 justify-between"
      style={{ height, flex: 1 }}
    >
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center opacity-90"
        style={{ backgroundColor: `${item.color}15` }}
      >
        <item.icon size={20} color={item.color} />
      </View>
      <View>
        <ThemedText
          className="font-bold text-neutral-900 dark:text-white"
          style={{ fontSize: 15, lineHeight: 18 }}
        >
          {item.name.replace(" & ", "\n& ")}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({ item }: { item: (typeof LEGAL_INSIGHTS)[0] }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="bg-legal-surface dark:bg-neutral-900 rounded-3xl p-4 mr-3 border border-legal-slate/5 dark:border-neutral-800/50"
      style={{ width: 160 }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: `${item.color}15` }}
      >
        <item.icon size={18} color={item.color} />
      </View>
      <ThemedText
        variant="caption"
        className="font-medium mb-1"
        style={{ color: item.color }}
      >
        {item.type} • {item.duration}
      </ThemedText>
      <ThemedText
        className="font-bold text-neutral-900 dark:text-white"
        numberOfLines={2}
      >
        {item.title}
      </ThemedText>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const [matchmakerVisible, setMatchmakerVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSort, setActiveSort] = useState("rating");
  const [activeAvailability, setActiveAvailability] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { isDark } = useLegalTheme();
  const router = useRouter();
  const { category: categoryParam } = useLocalSearchParams<{
    category: string;
  }>();
  const inputRef = useRef<TextInput>(null);

  // When navigated from home screen category buttons, apply the filter
  useEffect(() => {
    if (categoryParam) {
      const valid = [
        "criminal",
        "family",
        "property",
        "documents",
        "ipr",
        "corporate",
      ];
      setActiveCategory(valid.includes(categoryParam) ? categoryParam : "all");
      setIsSearchFocused(true);
    }
  }, [categoryParam]);

  const { exploreScrollY } = useContext(HeaderContext);
  const scrollY = exploreScrollY || useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Filter badge count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== "all") count++;
    if (activeSort !== "rating") count++;
    if (activeAvailability !== "all") count++;
    return count;
  }, [activeCategory, activeSort, activeAvailability]);

  // Filtered + sorted advocates
  const results = useMemo(() => {
    let list = [...MOCK_ADVOCATES];

    // text search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.specialty.toLowerCase().includes(q),
      );
    }

    // category filter
    if (activeCategory !== "all") {
      const map: Record<string, string[]> = {
        criminal: ["criminal", "crime", "bail", "fir"],
        family: ["family", "divorce", "custody", "matrimonial"],
        property: ["property", "real estate", "land", "tenant"],
        documents: ["document", "contract", "drafting", "will"],
        ipr: ["ipr", "intellectual", "patent", "trademark"],
        corporate: ["corporate", "business", "startup"],
      };
      const keywords = map[activeCategory] ?? [];
      list = list.filter((a) =>
        keywords.some((k) => a.specialty.toLowerCase().includes(k)),
      );
    }

    // availability
    if (activeAvailability === "online") {
      list = list.filter((a) => a.isOnline);
    }

    // sort
    if (activeSort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (activeSort === "price_asc")
      list.sort((a, b) => a.pricePerSession - b.pricePerSession);
    else if (activeSort === "price_desc")
      list.sort((a, b) => b.pricePerSession - a.pricePerSession);
    else if (activeSort === "reviews")
      list.sort((a, b) => b.reviewCount - a.reviewCount);

    return list;
  }, [query, activeCategory, activeSort, activeAvailability]);

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  const handleCancel = useCallback(() => {
    setQuery("");
    setActiveCategory("all");
    setIsSearchFocused(false);
    Keyboard.dismiss();
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setIsSearchFocused(true); // Treat clicking a category as entering search mode
  }, []);

  const isSearchActive =
    isSearchFocused || query.length > 0 || activeCategory !== "all";

  return (
    <View className="flex-1 bg-legal-ice dark:bg-black">
      <MatchmakerOverlay
        visible={matchmakerVisible}
        onClose={() => setMatchmakerVisible(false)}
      />

      <Animated.ScrollView
        className="flex-1"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Search Bar ── */}
        <View className="px-5 mt-4 pt-2 mb-4">
          <View className="flex-row items-center gap-3">
            {/* Input */}
            <View
              className="flex-1 flex-row items-center bg-legal-surface dark:bg-neutral-900 rounded-3xl border border-legal-slate/10 dark:border-neutral-800 px-4"
              style={{ height: 56 }}
            >
              <Search
                size={20}
                color={
                  isSearchActive ? "#3B82F6" : isDark ? "#64748B" : "#94A3B8"
                }
              />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search lawyers, specialties..."
                placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
                className="flex-1 ml-3 text-[15px] text-neutral-900 dark:text-neutral-100"
                style={{ fontWeight: "500" }}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={handleClear} hitSlop={8}>
                  <View className="bg-neutral-200 dark:bg-neutral-700 rounded-full p-1">
                    <X size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Filter toggle */}
            {isSearchActive && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
              >
                <TouchableOpacity
                  onPress={() => setShowFilters((v) => !v)}
                  activeOpacity={0.75}
                  className={`items-center justify-center rounded-3xl border ${
                    showFilters || activeFilterCount > 0
                      ? "bg-blue-500 border-blue-500"
                      : "bg-legal-surface dark:bg-neutral-900 border-legal-slate/10 dark:border-neutral-800"
                  }`}
                  style={{ width: 56, height: 56 }}
                >
                  <SlidersHorizontal
                    size={20}
                    color={
                      showFilters || activeFilterCount > 0
                        ? "#fff"
                        : isDark
                          ? "#94A3B8"
                          : "#64748B"
                    }
                  />
                  {activeFilterCount > 0 && !showFilters && (
                    <View className="absolute -top-1 -right-1 w-4 h-4 bg-black dark:bg-white rounded-full items-center justify-center border-2 border-legal-surface dark:border-neutral-900">
                      <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Cancel */}
            {isSearchActive && (
              <Animated.View
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(150)}
              >
                <TouchableOpacity onPress={handleCancel}>
                  <ThemedText className="text-blue-500 font-semibold text-[15px]">
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>

        {isSearchActive ? (
          /* ── ACTIVE SEARCH STATE (Lawyers List & Filters) ── */
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
          >
            {/* Filter Panel */}
            {showFilters && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                className="mx-5 mb-4 bg-legal-surface dark:bg-neutral-900 rounded-3xl border border-legal-slate/10 dark:border-neutral-800 p-5"
              >
                {/* Sort */}
                <ThemedText
                  variant="caption"
                  className="text-legal-slate font-semibold mb-3 uppercase tracking-wider"
                  style={{ fontSize: 11 }}
                >
                  Sort By
                </ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-5"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt.id}
                      label={opt.label}
                      isActive={activeSort === opt.id}
                      onPress={() => setActiveSort(opt.id)}
                    />
                  ))}
                </ScrollView>

                {/* Availability */}
                <ThemedText
                  variant="caption"
                  className="text-legal-slate font-semibold mb-3 uppercase tracking-wider"
                  style={{ fontSize: 11 }}
                >
                  Availability
                </ThemedText>
                <View className="flex-row mb-2">
                  {AVAILABILITY.map((opt) => (
                    <FilterChip
                      key={opt.id}
                      label={opt.label}
                      isActive={activeAvailability === opt.id}
                      onPress={() => setActiveAvailability(opt.id)}
                    />
                  ))}
                </View>

                {/* Reset */}
                {activeFilterCount > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setActiveCategory("all");
                      setActiveSort("rating");
                      setActiveAvailability("all");
                    }}
                    className="mt-4 self-center bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full"
                  >
                    <ThemedText className="text-neutral-900 dark:text-neutral-300 font-semibold text-[13px]">
                      Reset Filters
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}

            {/* Category Pills Header for Filtering */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 4,
              }}
              className="mb-5"
            >
              <CategoryPill
                item={{
                  id: "all",
                  name: "All Categories",
                  icon: Search,
                  color: "",
                }}
                isActive={activeCategory === "all"}
                onPress={() => setActiveCategory("all")}
                isDark={isDark}
              />
              {CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  item={cat}
                  isActive={activeCategory === cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  isDark={isDark}
                />
              ))}
            </ScrollView>

            {/* Results */}
            <View className="px-5">
              <View className="flex-row items-center justify-between mb-4 mt-2">
                <ThemedText className="font-bold text-[18px]">
                  Top Rated Lawyers
                </ThemedText>
                {activeSort !== "rating" && (
                  <View className="flex-row items-center bg-blue-500/10 px-2.5 py-1 rounded-md">
                    <Star size={11} color="#3B82F6" />
                    <ThemedText
                      variant="caption"
                      className="text-blue-500 font-bold ml-1.5"
                    >
                      {SORT_OPTIONS.find((s) => s.id === activeSort)?.label}
                    </ThemedText>
                  </View>
                )}
              </View>

              {results.length === 0 ? (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  className="items-center py-16"
                >
                  <View className="w-20 h-20 rounded-full bg-legal-surface dark:bg-neutral-900 items-center justify-center mb-5 border border-legal-slate/10 dark:border-neutral-800">
                    <Search size={32} color={isDark ? "#374151" : "#E2E8F0"} />
                  </View>
                  <ThemedText
                    weight="bold"
                    className="text-legal-charcoal dark:text-neutral-300 mb-2"
                    style={{ fontSize: 18 }}
                  >
                    No lawyers found
                  </ThemedText>
                  <ThemedText
                    className="text-legal-slate text-center"
                    style={{ fontSize: 14 }}
                  >
                    Try adjusting your search or filters
                  </ThemedText>
                </Animated.View>
              ) : (
                <View className="gap-3">
                  {results.map((advocate, i) => (
                    <Animated.View
                      key={advocate.id}
                      entering={FadeIn.delay(i * 40).duration(250)}
                      layout={Layout.springify()}
                    >
                      <AdvocateCard
                        {...advocate}
                        onPress={() => router.push(`/advocate/${advocate.id}`)}
                      />
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        ) : (
          /* ── DEFAULT DEFAULT STATE (Compact Bento Grid & Insights) ── */
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
          >
            {/* Bento Grid: Categories */}
            <View className="px-5 mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <ThemedText className="font-bold text-[18px]">
                  Browse Categories
                </ThemedText>
              </View>

              <View className="flex-row gap-3">
                {/* Visual Column 1 */}
                <View className="flex-1 gap-3">
                  <BentoCategoryCard
                    item={CATEGORIES[0]} // Criminal (Short)
                    height={110}
                    onPress={() => handleCategorySelect(CATEGORIES[0].id)}
                  />
                  <BentoCategoryCard
                    item={CATEGORIES[2]} // Property (Tall)
                    height={150}
                    onPress={() => handleCategorySelect(CATEGORIES[2].id)}
                  />
                  <BentoCategoryCard
                    item={CATEGORIES[4]} // IPR (Short)
                    height={110}
                    onPress={() => handleCategorySelect(CATEGORIES[4].id)}
                  />
                </View>

                {/* Visual Column 2 */}
                <View className="flex-1 gap-3">
                  <BentoCategoryCard
                    item={CATEGORIES[1]} // Family (Tall)
                    height={150}
                    onPress={() => handleCategorySelect(CATEGORIES[1].id)}
                  />
                  <BentoCategoryCard
                    item={CATEGORIES[3]} // Documents (Short)
                    height={110}
                    onPress={() => handleCategorySelect(CATEGORIES[3].id)}
                  />
                  <BentoCategoryCard
                    item={CATEGORIES[5]} // Corporate (Tall)
                    height={110}
                    onPress={() => handleCategorySelect(CATEGORIES[5].id)}
                  />
                </View>
              </View>
            </View>

            {/* Legal Insights Section */}
            <View className="mb-6">
              <View className="px-5 flex-row items-center justify-between mb-4">
                <ThemedText className="font-bold text-[18px]">
                  Legal Insights
                </ThemedText>
                <TouchableOpacity className="flex-row items-center opacity-70">
                  <ThemedText variant="caption" className="font-semibold mr-1">
                    See All
                  </ThemedText>
                  <ChevronRight
                    size={14}
                    color={isDark ? "#A3A3A3" : "#525252"}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {LEGAL_INSIGHTS.map((insight, index) => (
                  <Animated.View
                    key={insight.id}
                    entering={FadeIn.delay(index * 100).springify()}
                  >
                    <InsightCard item={insight} />
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}
      </Animated.ScrollView>

      {/* Buddy Orb */}
      <View
        className="absolute right-5 items-center pointer-events-box-none z-50"
        style={{ bottom: 100 }}
      >
        <BuddyOrb onPress={() => setMatchmakerVisible(true)} />
      </View>
    </View>
  );
}
