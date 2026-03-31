import { useLegalTheme } from "@/hooks/useLegalTheme";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { ThemedText } from "./ThemedText";

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  genre: string;
  comment: string;
  date: string;
}

export interface CaseStat {
  category: string;
  count: number;
  total: number; // For calculating percentage width
}

export interface AdvocateCardProps {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  pricePerSession: number;
  sessionMinutes: number;
  imageUrl?: string;
  isOnline?: boolean;
  onPress?: () => void;
  className?: string;
  index?: number;
  pastCasesReviews?: Review[];
  caseStats?: CaseStat[];
}

export function AdvocateCard({
  name,
  specialty,
  rating,
  reviewCount,
  pricePerSession,
  sessionMinutes,
  imageUrl,
  isOnline,
  onPress,
  className,
  index = 0,
}: AdvocateCardProps) {
  const { colors } = useLegalTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className={cn(
          "bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-legal-slate/10 dark:border-neutral-800 shadow-sm",
          "flex-row items-center",
          className,
        )}
      >
        <View className="relative">
          <Avatar
            source={imageUrl}
            size="lg"
            initials={name.substring(0, 2).toUpperCase()}
          />
          {isOnline && (
            <View 
              className="absolute bottom-0 right-0 w-[14px] h-[14px] rounded-full bg-green-500 border-2 border-white dark:border-neutral-900 shadow-sm"
            />
          )}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 pr-2">
              <ThemedText
                variant="h3"
                weight="bold"
                className="mb-1 text-legal-charcoal dark:text-legal-ice"
              >
                {name}
              </ThemedText>
              <ThemedText variant="caption" className="text-legal-slate mb-2">
                {specialty}
              </ThemedText>
            </View>
            <View className="items-end justify-center pt-0.5">
              <View className="flex-row items-baseline">
                <ThemedText 
                  className="text-zinc-950 dark:text-zinc-50"
                  style={{ fontSize: 22, fontWeight: "700", letterSpacing: -0.8 }}
                >
                  ₹{pricePerSession}
                </ThemedText>
              </View>
              <ThemedText 
                className="text-zinc-500 dark:text-zinc-400"
                style={{ fontSize: 13, fontWeight: "500", letterSpacing: 0.2, marginTop: -1 }}
              >
                / {sessionMinutes} min
              </ThemedText>
            </View>
          </View>

          <View className="flex-row items-center mt-1">
            <Star size={14} color={colors.text} fill={colors.text} />
            <ThemedText
              variant="caption"
              className="ml-1 font-medium text-legal-charcoal dark:text-legal-ice"
            >
              {rating.toFixed(1)} ({reviewCount})
            </ThemedText>
            <View className="w-1 h-1 bg-legal-slate/30 rounded-full mx-2" />
            <Badge
              text="Specialist"
              variant="outline"
              className="px-1.5 py-0.5"
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
