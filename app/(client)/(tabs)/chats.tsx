import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { HeaderContext } from "@/context/HeaderContext";
import { useAdvocateStore } from "@/features/advocates/store/useAdvocateStore";
import { BuddyOrb } from "@/features/buddy-ai/components/BuddyOrb";
import { MatchmakerOverlay } from "@/features/buddy-ai/components/MatchmakerOverlay";
import { useAIChatStore } from "@/features/buddy-ai/store/useAIChatStore";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { useRouter } from "expo-router";
import { Check, Plus, Search, Sparkles, Trash2 } from "lucide-react-native";
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
    Platform,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    useWindowDimensions,
} from "react-native";
import Animated, {
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

interface ChatPreview {
  id: string;
  advocateId: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isTyping?: boolean;
}

const formatRelativeTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0 && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (
    diffDays === 1 ||
    (diffDays === 0 && now.getDate() !== date.getDate())
  ) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

export default function ChatsScreen() {
  const [activeTab, setActiveTab] = useState<"lawyers" | "ai">("lawyers");
  const [matchmakerVisible, setMatchmakerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { colors, isDark } = useLegalTheme();
  const router = useRouter();
  const { advocates } = useAdvocateStore();
  const { chats: aiChats, deleteChats } = useAIChatStore();
  const searchInputRef = useRef<TextInput>(null);

  const [selectedAiChats, setSelectedAiChats] = useState<string[]>([]);

  const { chatsScrollY } = useContext(HeaderContext);
  const fallbackScrollY = useSharedValue(0);
  const scrollY = chatsScrollY || fallbackScrollY;

  const activeTabIndex = useSharedValue(0);
  const { width: windowWidth } = useWindowDimensions();
  const horizScrollRef = useRef<any>(null);

  const horizontalScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      activeTabIndex.value = event.contentOffset.x / windowWidth;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / windowWidth);
      runOnJS(setActiveTab)(index === 0 ? "lawyers" : "ai");
    },
  });

  const handleTabPress = (tab: "lawyers" | "ai") => {
    setActiveTab(tab);
    horizScrollRef.current?.scrollTo({
      x: tab === "lawyers" ? 0 : windowWidth,
      y: 0,
      animated: true,
    });
  };

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      left: `${activeTabIndex.value * 50}%`,
    } as any;
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Remove focus from input if keyboard hides (e.g., via hardware back button or drag)
  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      searchInputRef.current?.blur();
    });
    return () => hideSubscription.remove();
  }, []);

  // Mock Chats Data - In a real app, this would come from a backend/store
  const chats: ChatPreview[] = useMemo(() => {
    // Create chats for the first few advocates
    return advocates.slice(0, 5).map((adv, index) => ({
      id: adv.id,
      advocateId: adv.id,
      lastMessage:
        index === 0
          ? "Please send over the documents for review."
          : index === 1
            ? "I'll see you in court comfortably."
            : "Thank you for the consultation.",
      timestamp: index === 0 ? "10:30 AM" : index === 1 ? "Yesterday" : "Tue",
      unreadCount: index === 0 ? 2 : 0,
      isTyping: index === 1,
    }));
  }, [advocates]);

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    return chats.filter((chat) => {
      const advocate = advocates.find((a) => a.id === chat.advocateId);
      return (
        advocate?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [chats, advocates, searchQuery]);

  const filteredAIChats = useMemo(() => {
    let result = aiChats;
    if (searchQuery) {
      result = aiChats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    // Automatically sort latest first based on updatedAt (falling back to createdAt)
    return result.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, [aiChats, searchQuery]);

  const renderChatItem = useCallback(
    ({ item }: { item: ChatPreview }) => {
      const advocate = advocates.find((a) => a.id === item.advocateId);
      if (!advocate) return null;

      const isUnread = item.unreadCount > 0;

      return (
        <TouchableOpacity
          className="flex-row items-center px-6 py-4 bg-transparent active:bg-zinc-100 dark:active:bg-zinc-900"
          onPress={() => router.push(`/chat/${item.id}`)}
          activeOpacity={0.7}
        >
          <View className="relative">
            <Avatar source={advocate.imageUrl} size="md" />
            {advocate.isOnline && (
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-black" />
            )}
          </View>

          <View className="flex-1 ml-4 justify-center">
            <View className="flex-row justify-between items-center mb-1">
              <ThemedText
                className={`text-[17px] tracking-tight ${isUnread ? "font-bold text-zinc-950 dark:text-zinc-50" : "font-semibold text-zinc-800 dark:text-zinc-200"}`}
              >
                {advocate.name}
              </ThemedText>
              <ThemedText
                className={`text-[13px] ${isUnread ? "font-bold text-blue-500 dark:text-blue-400" : "font-medium text-zinc-400 dark:text-zinc-500"}`}
              >
                {item.timestamp}
              </ThemedText>
            </View>

            <View className="flex-row justify-between items-center pr-1">
              <ThemedText
                className={`text-[15px] leading-snug tracking-tight flex-1 mr-4 ${isUnread ? "font-semibold text-zinc-900 dark:text-zinc-100" : "font-medium text-zinc-500 dark:text-zinc-400"}`}
                numberOfLines={2}
              >
                {item.isTyping ? (
                  <ThemedText className="font-semibold text-blue-500 dark:text-blue-400 italic">
                    Typing...
                  </ThemedText>
                ) : (
                  item.lastMessage
                )}
              </ThemedText>
              {isUnread && (
                <View className="w-[10px] h-[10px] rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [advocates, isDark],
  );

  const renderAIChatItem = useCallback(
    ({ item }: { item: any }) => {
      const lastMsg = item.messages[item.messages.length - 1];
      const rawContent = lastMsg ? lastMsg.content : "New conversation...";
      const previewText =
        rawContent
          .replace(/[#*_~`>]/g, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim() || "New conversation...";

      const isSelected = selectedAiChats.includes(item.id);
      const formattedTime = formatRelativeTime(
        item.updatedAt || item.createdAt,
      );

      const handlePress = () => {
        if (selectedAiChats.length > 0) {
          // If already in selection mode, toggle selection
          setSelectedAiChats((prev) =>
            prev.includes(item.id)
              ? prev.filter((id) => id !== item.id)
              : [...prev, item.id],
          );
        } else {
          router.push(`/chat/ai/${item.id}`);
        }
      };

      const handleLongPress = () => {
        if (!selectedAiChats.includes(item.id)) {
          setSelectedAiChats((prev) => [...prev, item.id]);
        }
      };

      return (
        <TouchableOpacity
          className={`flex-row items-center px-6 py-4 bg-transparent ${
            isSelected
              ? "bg-blue-50/50 dark:bg-blue-900/10"
              : "active:bg-zinc-100 dark:active:bg-zinc-900"
          }`}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={300}
          activeOpacity={0.7}
        >
          {isSelected ? (
            <View className="w-[50px] h-[50px] rounded-full bg-blue-500 items-center justify-center shadow-lg shadow-blue-500/30">
              <Check size={24} color="#FFFFFF" strokeWidth={3} />
            </View>
          ) : (
            <View
              className="w-[50px] h-[50px] rounded-full items-center justify-center"
              style={{
                backgroundColor: item.themeColor
                  ? `${item.themeColor}15` // 15% opacity
                  : isDark
                    ? "#3B82F620"
                    : "#3B82F610",
              }}
            >
              {item.emoji ? (
                <ThemedText className="text-[22px] leading-none pt-1">
                  {item.emoji}
                </ThemedText>
              ) : (
                <Sparkles size={22} color={isDark ? "#60A5FA" : "#3B82F6"} />
              )}
            </View>
          )}

          <View className="flex-1 ml-4 justify-center">
            <View className="flex-row justify-between items-center mb-1">
              <ThemedText
                className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex-1 mr-2"
                numberOfLines={1}
              >
                {item.title || "AI History"}
              </ThemedText>

              <ThemedText className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500">
                {formattedTime}
              </ThemedText>
            </View>

            <View className="flex-row justify-between items-center pr-1">
              <ThemedText
                className="text-[15px] leading-snug tracking-tight font-medium text-zinc-500 dark:text-zinc-400 flex-1 mr-4"
                numberOfLines={2}
              >
                {previewText}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [isDark, selectedAiChats, router],
  );

  const renderListHeader = useCallback(
    () => (
      <View>
        <View className="px-6 pt-2 pb-2">
          <View className="flex-row items-center bg-[#FAFAFA] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-[20px] px-5 h-[62px]">
            <Search
              size={20}
              color={isDark ? "#71717A" : "#A1A1AA"}
              strokeWidth={3}
            />
            <TextInput
              ref={searchInputRef}
              placeholder="Search conversations..."
              placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className={`flex-1 ml-3 text-[17px] font-medium tracking-tight h-full ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}
            />
          </View>
        </View>

        <View className="px-6 mb-5 mt-3">
          <View className="p-[6px] bg-[#FAFAFA] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-[20px]">
            <View className="flex-row relative">
              {/* Animated Sliding Pill */}
              <Animated.View
                className="absolute top-0 bottom-0 rounded-[16px]"
                style={[
                  {
                    width: "50%",
                    backgroundColor: isDark ? "#3F3F46" : "#FFFFFF",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                  indicatorStyle,
                ]}
              />

              <TouchableOpacity
                onPress={() => handleTabPress("lawyers")}
                className="flex-1 py-3.5 items-center rounded-[16px] z-10"
                activeOpacity={0.7}
              >
                <ThemedText
                  className={`text-[14px] font-semibold tracking-tight ${
                    activeTab === "lawyers"
                      ? isDark
                        ? "text-zinc-100"
                        : "text-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  Lawyers
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleTabPress("ai")}
                className="flex-1 flex-row justify-center py-3.5 items-center rounded-[16px] z-10"
                activeOpacity={0.7}
              >
                <Sparkles
                  size={14}
                  color={
                    activeTab === "ai"
                      ? isDark
                        ? "#F4F4F5"
                        : "#18181B"
                      : "#71717A"
                  }
                  className="mr-1.5"
                />
                <ThemedText
                  className={`text-[14px] font-semibold tracking-tight ${
                    activeTab === "ai"
                      ? isDark
                        ? "text-zinc-100"
                        : "text-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  AI History
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    ),
    [isDark, searchQuery, activeTab],
  );

  const renderAIHeader = useCallback(() => {
    const isSelecting = selectedAiChats.length > 0;

    return (
      <View
        className={`px-6 flex-row items-center ${
          isSelecting ? "justify-between mb-4 mt-2" : "justify-end mb-4 mt-2"
        }`}
      >
        {isSelecting && (
          <ThemedText className="text-[15px] font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            {selectedAiChats.length} Selected
          </ThemedText>
        )}

        {isSelecting ? (
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity
              onPress={() => setSelectedAiChats([])}
              className="px-2 py-1"
            >
              <ThemedText className="text-[14px] font-semibold text-zinc-500 dark:text-zinc-400">
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                deleteChats(selectedAiChats);
                setSelectedAiChats([]);
              }}
              className="flex-row items-center bg-red-100 dark:bg-red-900/30 px-4 py-1.5 rounded-[12px] ml-2"
              activeOpacity={0.7}
            >
              <Trash2 size={14} color={isDark ? "#F87171" : "#EF4444"} />
              <ThemedText className="text-[13px] font-bold ml-1.5 tracking-tight text-red-600 dark:text-red-400">
                Delete
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push(`/chat/ai/${Date.now()}`)}
            className="flex-row items-center bg-zinc-950 dark:bg-zinc-50 px-4 py-2 rounded-[14px]"
            activeOpacity={0.7}
          >
            <Plus
              size={16}
              color={isDark ? "#09090B" : "#FAFAFA"}
              strokeWidth={3}
            />
            <ThemedText
              className="text-[14px] font-bold ml-1.5 tracking-tight"
              style={{ color: isDark ? "#09090B" : "#FAFAFA" }}
            >
              New Chat
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [isDark, router, selectedAiChats, deleteChats]);

  const renderEmptyList = useCallback(
    () => (
      <View className="items-center justify-center mt-20 px-10">
        <View className="w-24 h-24 rounded-full bg-legal-slate/5 dark:bg-[#262626] items-center justify-center mb-6 drop-shadow-sm">
          <Search size={36} color={isDark ? "#FAFAFA" : "#0F172A"} />
        </View>
        <ThemedText className="text-center font-bold text-[22px] mb-3 tracking-tight text-legal-charcoal dark:text-legal-ice">
          No messages found
        </ThemedText>
        <ThemedText className="text-center text-[16px] text-legal-slate/80 dark:text-legal-slate leading-snug">
          Start a new conversation by tapping the Edit icon above, connecting
          with a Buddy, or starting an AI Chat.
        </ThemedText>
      </View>
    ),
    [isDark, activeTab],
  );

  const keyExtractorChats = useCallback((item: any) => item.id, []);

  const handleDismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    searchInputRef.current?.blur();
  }, []);

  return (
    <TouchableWithoutFeedback
      onPress={handleDismissKeyboard}
      accessible={false}
    >
      <View className="flex-1 bg-legal-ice dark:bg-black">
        <MatchmakerOverlay
          visible={matchmakerVisible}
          onClose={() => setMatchmakerVisible(false)}
        />

        {/* Fixed Header */}
        {renderListHeader()}

        {/* Pager wrapper containing both lists side-by-side */}
        <Animated.ScrollView
          ref={horizScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={horizontalScrollHandler}
          scrollEventThrottle={16}
          className="flex-1"
        >
          {/* Lawyers List */}
          <View style={{ width: windowWidth }}>
            <Animated.FlatList
              data={filteredChats as any[]}
              keyExtractor={keyExtractorChats}
              renderItem={renderChatItem}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingBottom: 120,
                paddingTop: 8,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={Keyboard.dismiss}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
              ListEmptyComponent={renderEmptyList}
            />
          </View>

          {/* AI Chats List */}
          <View style={{ width: windowWidth }}>
            <Animated.FlatList
              data={filteredAIChats as any[]}
              keyExtractor={keyExtractorChats}
              renderItem={renderAIChatItem}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingBottom: 120,
                paddingTop: 8,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={Keyboard.dismiss}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
              ListEmptyComponent={renderEmptyList}
              ListHeaderComponent={renderAIHeader}
            />
          </View>
        </Animated.ScrollView>

        {/* Buddy Orb */}
        <View
          className="absolute right-5 items-center pointer-events-box-none z-50"
          style={{ bottom: 100 }}
        >
          <BuddyOrb onPress={() => setMatchmakerVisible(true)} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
