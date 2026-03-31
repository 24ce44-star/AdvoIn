import { useLegalTheme } from "@/hooks/useLegalTheme";
import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  index?: number;
}

export function SuggestionChips({
  suggestions,
  onSelect,
  index = 0,
}: SuggestionChipsProps) {
  const { isDark } = useLegalTheme();

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay((index + 1) * 100).springify()}
      className="mb-6"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 12,
        }}
      >
        {suggestions.map((suggestion, idx) => (
          <TouchableOpacity
            key={suggestion}
            onPress={() => onSelect(suggestion)}
            className="px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-legal-slate/15 dark:border-neutral-800"
            activeOpacity={0.7}
            style={{
              elevation: 2,
              shadowColor: isDark ? "#000" : "#0F172A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
            }}
          >
            <Text className="text-[#0F172A] dark:text-[#F8FAFC] text-[15px] font-medium tracking-tight">
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}
