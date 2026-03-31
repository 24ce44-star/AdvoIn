import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    FileText,
    Scale,
    Share2,
    Users,
} from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, Share, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useCaseStore } from "../store/useCaseStore";

export default function CaseReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useLegalTheme();
  const { getCaseById, deleteCase } = useCaseStore();

  const caseData = getCaseById(id!);

  if (!caseData) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black px-4">
        <AlertCircle size={48} color={isDark ? "#F8FAFC" : "#0F172A"} />
        <ThemedText variant="h2" weight="bold" className="mt-4 text-center">
          Case Not Found
        </ThemedText>
        <ThemedText
          variant="body"
          className="mt-2 text-center text-legal-slate"
        >
          This case may have been deleted or doesn't exist.
        </ThemedText>
        <Button
          label="Go Back"
          onPress={() => router.back()}
          variant="primary"
          className="mt-6"
        />
      </View>
    );
  }

  const handleShare = async () => {
    try {
      const report = generateTextReport(caseData);
      await Share.share({
        message: report,
        title: `Case Report: ${caseData.title}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Case",
      "Are you sure you want to delete this case? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCase(id!);
            router.replace("/(tabs)/profile" as any);
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    router.push(`/case-builder/${id}` as any);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Status Banner */}
      <View
        className={`px-4 py-3 ${
          caseData.status === "completed"
            ? "bg-legal-emerald/10"
            : caseData.status === "in-progress"
              ? "bg-legal-steel/10"
              : "bg-legal-slate/10"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <CheckCircle2
              size={20}
              color={
                caseData.status === "completed"
                  ? "#059669"
                  : caseData.status === "in-progress"
                    ? "#3B82F6"
                    : "#64748B"
              }
            />
            <ThemedText variant="body" weight="medium" className="ml-2">
              {caseData.status === "completed"
                ? "Case Completed"
                : caseData.status === "in-progress"
                  ? "In Progress"
                  : "Draft"}
            </ThemedText>
          </View>
          <ThemedText variant="caption" className="text-legal-slate">
            {caseData.completeness}% Complete
          </ThemedText>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-4 pt-6 pb-4">
          <ThemedText variant="h1" weight="bold" className="mb-2">
            {caseData.title || "Untitled Case"}
          </ThemedText>
          <View className="flex-row items-center">
            <View className="px-3 py-1 rounded-full bg-legal-steel/10 dark:bg-legal-steel/20">
              <ThemedText
                variant="caption"
                className="text-legal-steel font-medium"
              >
                {caseData.category}
              </ThemedText>
            </View>
            {caseData.urgency && (
              <View
                className={`ml-2 px-3 py-1 rounded-full ${
                  caseData.urgency === "critical"
                    ? "bg-legal-crimson/10"
                    : caseData.urgency === "high"
                      ? "bg-orange-500/10"
                      : "bg-legal-slate/10"
                }`}
              >
                <ThemedText
                  variant="caption"
                  className={`font-medium ${
                    caseData.urgency === "critical"
                      ? "text-legal-crimson"
                      : caseData.urgency === "high"
                        ? "text-orange-500"
                        : "text-legal-slate"
                  }`}
                >
                  {caseData.urgency.toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Sections */}
        <View className="px-4 space-y-4">
          {/* AI Executive Summary */}
          {caseData.aiSummary && (
            <Animated.View
              entering={FadeInDown.delay(50).springify()}
              className="bg-blue-50 dark:bg-[#0C4A6E]/20 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30"
            >
              <Markdown style={markdownStyles(isDark)}>
                {caseData.aiSummary}
              </Markdown>
            </Animated.View>
          )}

          {/* Description */}
          {caseData.description && (
            <ReportSection
              icon={FileText}
              title="Raw Description"
              content={caseData.description}
              index={0}
            />
          )}

          {/* Parties */}
          {(caseData.parties?.plaintiff || caseData.parties?.defendant) && (
            <ReportSection
              icon={Users}
              title="Parties Involved"
              content={`Plaintiff: ${caseData.parties.plaintiff || "Not specified"}\nDefendant: ${caseData.parties.defendant || "Not specified"}`}
              index={1}
            />
          )}

          {/* Timeline */}
          {caseData.timeline && caseData.timeline.length > 0 && (
            <ReportSection
              icon={Calendar}
              title="Timeline of Events"
              content={caseData.timeline
                .map(
                  (event, idx) =>
                    `${idx + 1}. ${event.date}: ${event.description}`,
                )
                .join("\n")}
              index={2}
            />
          )}

          {/* Legal Issues */}
          {caseData.legalIssues && caseData.legalIssues.length > 0 && (
            <ReportSection
              icon={Scale}
              title="Legal Issues"
              content={caseData.legalIssues
                .map((issue, idx) => `• ${issue}`)
                .join("\n")}
              index={3}
            />
          )}

          {/* Desired Outcome */}
          {caseData.desiredOutcome && (
            <ReportSection
              icon={CheckCircle2}
              title="Desired Outcome"
              content={caseData.desiredOutcome}
              index={4}
            />
          )}

          {/* Evidence */}
          {caseData.evidence && caseData.evidence.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500).springify()}
              className="bg-legal-ice dark:bg-neutral-900 rounded-xl p-4 border border-legal-slate/10 dark:border-neutral-800"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-legal-steel/10 dark:bg-legal-steel/20 items-center justify-center mr-3">
                  <FileText size={16} color={isDark ? "#0EA5E9" : "#3B82F6"} />
                </View>
                <ThemedText variant="h3" weight="bold">
                  Evidence ({caseData.evidence.length})
                </ThemedText>
              </View>
              {caseData.evidence.map((item, idx) => (
                <View key={idx} className="mb-2">
                  <ThemedText variant="body" className="text-legal-slate">
                    • {item.name} ({item.type})
                  </ThemedText>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Witnesses */}
          {caseData.witnesses && caseData.witnesses.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(600).springify()}
              className="bg-legal-ice dark:bg-neutral-900 rounded-xl p-4 border border-legal-slate/10 dark:border-neutral-800"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-legal-steel/10 dark:bg-legal-steel/20 items-center justify-center mr-3">
                  <Users size={16} color={isDark ? "#0EA5E9" : "#3B82F6"} />
                </View>
                <ThemedText variant="h3" weight="bold">
                  Witnesses ({caseData.witnesses.length})
                </ThemedText>
              </View>
              {caseData.witnesses.map((witness, idx) => (
                <View key={idx} className="mb-2">
                  <ThemedText variant="body" weight="medium">
                    {witness.name}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-legal-slate">
                    {witness.relation}
                  </ThemedText>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Metadata */}
          <Animated.View
            entering={FadeInDown.delay(700).springify()}
            className="bg-legal-ice dark:bg-neutral-900 rounded-xl p-4 border border-legal-slate/10 dark:border-neutral-800"
          >
            <ThemedText variant="caption" className="text-legal-slate mb-1">
              Created: {new Date(caseData.createdAt).toLocaleDateString()}
            </ThemedText>
            <ThemedText variant="caption" className="text-legal-slate mb-1">
              Last Updated: {new Date(caseData.updatedAt).toLocaleDateString()}
            </ThemedText>
            {caseData.completedAt && (
              <ThemedText variant="caption" className="text-legal-slate">
                Completed: {new Date(caseData.completedAt).toLocaleDateString()}
              </ThemedText>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-legal-slate/10 dark:border-neutral-800 px-4 py-3">
        <View className="flex-row space-x-2">
          {caseData.status !== "completed" && (
            <Button
              label="Continue"
              onPress={handleEdit}
              variant="primary"
              className="flex-1"
            />
          )}
          <Button
            label="Share"
            onPress={handleShare}
            variant="outline"
            className="flex-1"
            icon={<Share2 size={16} color={isDark ? "#F8FAFC" : "#0F172A"} />}
          />
          <Button
            label="Delete"
            onPress={handleDelete}
            variant="outline"
            className="flex-1"
            icon={<AlertCircle size={16} color="#E11D48" />}
          />
        </View>
      </View>
    </View>
  );
}

function ReportSection({
  icon: Icon,
  title,
  content,
  index,
}: {
  icon: any;
  title: string;
  content: string;
  index: number;
}) {
  const { isDark } = useLegalTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      className="bg-legal-ice dark:bg-neutral-900 rounded-xl p-4 border border-legal-slate/10 dark:border-neutral-800"
    >
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-legal-steel/10 dark:bg-legal-steel/20 items-center justify-center mr-3">
          <Icon size={16} color={isDark ? "#0EA5E9" : "#3B82F6"} />
        </View>
        <ThemedText variant="h3" weight="bold">
          {title}
        </ThemedText>
      </View>
      <ThemedText variant="body" className="text-legal-slate leading-relaxed">
        {content}
      </ThemedText>
    </Animated.View>
  );
}

function generateTextReport(caseData: any): string {
  let report = `CASE REPORT\n\n`;
  report += `Title: ${caseData.title || "Untitled Case"}\n`;
  report += `Category: ${caseData.category}\n`;
  report += `Status: ${caseData.status}\n`;
  report += `Urgency: ${caseData.urgency || "Not specified"}\n`;
  report += `Created: ${new Date(caseData.createdAt).toLocaleDateString()}\n\n`;

  if (caseData.aiSummary) {
    report += `AI EXECUTIVE SUMMARY:\n${caseData.aiSummary}\n\n`;
  }

  if (caseData.description) {
    report += `RAW DESCRIPTION:\n${caseData.description}\n\n`;
  }

  if (caseData.parties) {
    report += `PARTIES INVOLVED:\n`;
    report += `Plaintiff: ${caseData.parties.plaintiff || "Not specified"}\n`;
    report += `Defendant: ${caseData.parties.defendant || "Not specified"}\n\n`;
  }

  if (caseData.timeline && caseData.timeline.length > 0) {
    report += `TIMELINE:\n`;
    caseData.timeline.forEach((event: any, idx: number) => {
      report += `${idx + 1}. ${event.date}: ${event.description}\n`;
    });
    report += `\n`;
  }

  if (caseData.legalIssues && caseData.legalIssues.length > 0) {
    report += `LEGAL ISSUES:\n`;
    caseData.legalIssues.forEach((issue: string) => {
      report += `• ${issue}\n`;
    });
    report += `\n`;
  }

  if (caseData.desiredOutcome) {
    report += `DESIRED OUTCOME:\n${caseData.desiredOutcome}\n\n`;
  }

  return report;
}

const markdownStyles = (isDark: boolean) => ({
  body: {
    color: isDark ? "#E2E8F0" : "#334155",
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    color: isDark ? "#38BDF8" : "#0284C7",
    fontSize: 22,
    fontWeight: "bold" as const,
    marginTop: 20,
    marginBottom: 10,
  },
  heading2: {
    color: isDark ? "#38BDF8" : "#0284C7",
    fontSize: 18,
    fontWeight: "bold" as const,
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    color: isDark ? "#7DD3FC" : "#0369A1",
    fontSize: 16,
    fontWeight: "bold" as const,
    marginTop: 12,
    marginBottom: 4,
  },
  strong: {
    fontWeight: "bold" as const,
    color: isDark ? "#F8FAFC" : "#0F172A",
  },
  listItem: {
    marginBottom: 6,
  },
});
