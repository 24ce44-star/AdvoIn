import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { useRouter } from "expo-router";
import { ChevronRight, FileText } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { CaseData } from "../types/case.types";

interface CaseListItemProps {
  caseData: CaseData;
}

export function CaseListItem({ caseData }: CaseListItemProps) {
  const { isDark } = useLegalTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/case-report/${caseData.id}` as any);
  };

  const statusColor =
    caseData.status === "completed"
      ? "#059669"
      : caseData.status === "in-progress"
        ? "#3B82F6"
        : "#64748B";

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-3 border border-legal-slate/10 dark:border-neutral-800"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-legal-steel/10 dark:bg-legal-steel/20 items-center justify-center mr-3">
          <FileText size={20} color={isDark ? "#0EA5E9" : "#3B82F6"} />
        </View>

        <View className="flex-1">
          <ThemedText variant="body" weight="bold" className="mb-1">
            {caseData.title || "Untitled Case"}
          </ThemedText>

          <View className="flex-row items-center mb-2">
            <View className="px-2 py-0.5 rounded-full bg-legal-steel/10 dark:bg-legal-steel/20 mr-2">
              <ThemedText
                variant="caption"
                className="text-legal-steel text-xs"
              >
                {caseData.category}
              </ThemedText>
            </View>
            <View
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: statusColor }}
            />
            <ThemedText variant="caption" className="text-legal-slate text-xs">
              {caseData.status}
            </ThemedText>
          </View>

          <ThemedText variant="caption" className="text-legal-slate">
            {new Date(caseData.updatedAt).toLocaleDateString()} •{" "}
            {caseData.completeness}% complete
          </ThemedText>
        </View>

        <ChevronRight size={20} color={isDark ? "#64748B" : "#94A3B8"} />
      </View>
    </TouchableOpacity>
  );
}
