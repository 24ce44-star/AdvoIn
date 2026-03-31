import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import {
    AlertCircle,
    Calendar,
    ChevronLeft,
    Edit3,
    FileText,
    Scale,
    Users,
} from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CaseData } from "../types/case.types";

interface CasePreviewCardProps {
  caseData: Partial<CaseData>;
  onEdit: (field: string) => void;
  onClose?: () => void;
}

export function CasePreviewCard({
  caseData,
  onEdit,
  onClose,
}: CasePreviewCardProps) {
  const { isDark } = useLegalTheme();

  const sections = [
    {
      title: "Case Category",
      icon: Scale,
      value: caseData.category,
      field: "category",
      show: !!caseData.category,
    },
    {
      title: "Description",
      icon: FileText,
      value: caseData.description,
      field: "description",
      show: !!caseData.description,
    },
    {
      title: "Parties Involved",
      icon: Users,
      value: caseData.parties
        ? `Plaintiff: ${caseData.parties.plaintiff || "Not specified"}\nDefendant: ${caseData.parties.defendant || "Not specified"}`
        : undefined,
      field: "parties",
      show: !!(caseData.parties?.plaintiff || caseData.parties?.defendant),
    },
    {
      title: "Timeline Events",
      icon: Calendar,
      value: caseData.timeline?.length
        ? caseData.timeline
            .map((e, i) => `${i + 1}. ${e.date}: ${e.description}`)
            .join("\n")
        : undefined,
      field: "timeline",
      show: !!(caseData.timeline && caseData.timeline.length > 0),
    },
    {
      title: "Legal Issues",
      icon: Scale,
      value: caseData.legalIssues?.length
        ? caseData.legalIssues.join("\n• ")
        : undefined,
      field: "legalIssues",
      show: !!(caseData.legalIssues && caseData.legalIssues.length > 0),
    },
    {
      title: "Evidence",
      icon: FileText,
      value: caseData.evidence?.length
        ? `${caseData.evidence.length} items collected`
        : undefined,
      field: "evidence",
      show: !!(caseData.evidence && caseData.evidence.length > 0),
    },
    {
      title: "Witnesses",
      icon: Users,
      value: caseData.witnesses?.length
        ? caseData.witnesses.map((w) => w.name).join(", ")
        : undefined,
      field: "witnesses",
      show: !!(caseData.witnesses && caseData.witnesses.length > 0),
    },
    {
      title: "Desired Outcome",
      icon: AlertCircle,
      value: caseData.desiredOutcome,
      field: "desiredOutcome",
      show: !!caseData.desiredOutcome,
    },
  ].filter((section) => section.show || !section.value);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="px-4 pt-4">
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            className="flex-row items-center bg-slate-100 dark:bg-neutral-900 self-start px-4 py-2 rounded-full mb-4 border border-slate-200 dark:border-neutral-800"
          >
            <ChevronLeft size={18} color={isDark ? "#F8FAFC" : "#0F172A"} />
            <ThemedText
              variant="body"
              weight="medium"
              className="ml-1 text-[#0F172A] dark:text-[#F8FAFC]"
            >
              Return to Chat
            </ThemedText>
          </TouchableOpacity>
        )}
        <ThemedText variant="h2" weight="bold" className="mb-2">
          Case Summary
        </ThemedText>
        <ThemedText variant="caption" className="mb-6">
          Review your case details. Tap any section to add or edit information.
        </ThemedText>

        {sections.map((section, index) => {
          const Icon = section.icon;
          const hasValue = !!section.value;

          return (
            <Animated.View
              key={section.field}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <TouchableOpacity
                onPress={() => onEdit(section.field)}
                className={`mb-4 p-4 rounded-xl border ${
                  hasValue
                    ? "bg-white dark:bg-neutral-900 border-legal-slate/20 dark:border-neutral-800"
                    : "bg-legal-crimson/5 dark:bg-legal-crimson/10 border-legal-crimson/30"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        hasValue
                          ? "bg-legal-steel/10 dark:bg-legal-steel/20"
                          : "bg-legal-crimson/10"
                      }`}
                    >
                      <Icon
                        size={16}
                        color={
                          hasValue
                            ? isDark
                              ? "#0EA5E9"
                              : "#3B82F6"
                            : "#E11D48"
                        }
                      />
                    </View>
                    <ThemedText variant="body" weight="medium">
                      {section.title}
                    </ThemedText>
                  </View>
                  <Edit3
                    size={16}
                    color={isDark ? "#64748B" : "#94A3B8"}
                    strokeWidth={2}
                  />
                </View>

                {hasValue ? (
                  <ThemedText
                    variant="body"
                    className="text-legal-slate dark:text-neutral-400 ml-11"
                  >
                    {section.value}
                  </ThemedText>
                ) : (
                  <ThemedText
                    variant="caption"
                    className="text-legal-crimson ml-11"
                  >
                    Not provided yet - tap to add
                  </ThemedText>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}
