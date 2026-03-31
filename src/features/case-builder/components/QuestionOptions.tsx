import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface QuestionOption {
  id: string;
  label: string;
  value: string;
  description?: string;
}

interface QuestionOptionsProps {
  options: (QuestionOption | string)[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  index?: number;
}

export function QuestionOptions({
  options,
  onSelect,
  multiSelect = false,
  index = 0,
}: QuestionOptionsProps) {
  const { isDark } = useLegalTheme();
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (value: string) => {
    if (multiSelect) {
      const newSelected = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      setSelected(newSelected);
      onSelect(newSelected.join(", "));
    } else {
      setSelected([value]);
      onSelect(value);
    }
  };

  return (
    <View className="px-4 mb-4">
      {options.map((optionRaw, idx) => {
        const option =
          typeof optionRaw === "string"
            ? {
                id: `opt-${idx}-${optionRaw}`,
                label: optionRaw,
                value: optionRaw,
              }
            : optionRaw;

        const isSelected = selected.includes(option.value);

        return (
          <Animated.View
            key={option.id}
            entering={FadeInDown.delay((index + idx) * 80).springify()}
          >
            <TouchableOpacity
              onPress={() => handleSelect(option.value)}
              className={`mb-3 p-4 rounded-2xl border ${
                isSelected
                  ? "bg-[#F0F9FF] dark:bg-[#0C4A6E]/30 border-[#0284C7] dark:border-[#38BDF8]"
                  : "bg-white dark:bg-neutral-900 border-legal-slate/15 dark:border-neutral-800"
              }`}
              activeOpacity={0.7}
              style={
                !isSelected
                  ? {
                      elevation: 1,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                    }
                  : {}
              }
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <ThemedText
                    variant="body"
                    weight="medium"
                    className={
                      isSelected
                        ? "text-[#0284C7] dark:text-[#38BDF8]"
                        : "text-[#0F172A] dark:text-[#F8FAFC]"
                    }
                  >
                    {option.label}
                  </ThemedText>
                  {option.description && (
                    <ThemedText
                      variant="caption"
                      className={`mt-1 ${isSelected ? "text-[#0284C7]/80 dark:text-[#38BDF8]/80" : "text-legal-slate/60"}`}
                    >
                      {option.description}
                    </ThemedText>
                  )}
                </View>
                {isSelected && (
                  <View className="w-6 h-6 rounded-full bg-[#0284C7] dark:bg-[#38BDF8] items-center justify-center shadow-sm">
                    <Check
                      size={14}
                      color={isDark ? "#0F172A" : "white"}
                      strokeWidth={3}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
