import { Button } from "@/components/ui/Button";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { useRouter } from "expo-router";
import { CheckCircle2, FileText } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Keyboard, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CaseBuilderInput } from "../components/CaseBuilderInput";
import { CaseHistoryModal } from "../components/CaseHistoryModal";
import { CasePreviewCard } from "../components/CasePreviewCard";
import { ConversationMessage } from "../components/ConversationMessage";
import { QuestionOptions } from "../components/QuestionOptions";
import { SuggestionChips } from "../components/SuggestionChips";
import { TypingIndicator } from "../components/TypingIndicator";
import { useCaseBuilder } from "../hooks/useCaseBuilder";
import { useCaseStore } from "../store/useCaseStore";

export default function CaseBuilderScreen() {
  const router = useRouter();
  const { isDark } = useLegalTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { addCase, newChatTrigger, loadedCaseId, getCaseById } = useCaseStore();

  const {
    messages,
    caseData,
    isLoading,
    processUserResponse,
    startConversation,
    analyzeCompleteness,
    resetBuilder,
    loadCase,
    generateCaseSummary,
  } = useCaseBuilder();

  // Listen for new chat requests
  useEffect(() => {
    if (newChatTrigger > 0) {
      resetBuilder();
      const initialMsg = useCaseStore.getState().initialMessage;

      if (initialMsg) {
        useCaseStore.setState({ initialMessage: null });
        setTimeout(() => {
          startConversation().then(() => {
            setTimeout(() => {
              processUserResponse(initialMsg);
            }, 500);
          });
        }, 100);
      } else {
        setTimeout(() => startConversation(), 100);
      }
      setShowPreview(false);
    }
  }, [newChatTrigger]);

  // Listen for loading history cases
  useEffect(() => {
    if (loadedCaseId) {
      const caseToLoad = getCaseById(loadedCaseId);
      if (caseToLoad) {
        loadCase(caseToLoad);
        setShowPreview(false);
      }
    }
  }, [loadedCaseId]);

  useEffect(() => {
    const initialMsg = useCaseStore.getState().initialMessage;
    if (newChatTrigger === 0 && !loadedCaseId) {
      if (initialMsg) {
        useCaseStore.setState({ initialMessage: null });
        startConversation().then(() => {
          setTimeout(() => {
            processUserResponse(initialMsg);
          }, 500);
        });
      } else {
        startConversation();
      }
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    const handleBackPress = () => {
      if (showPreview) {
        setShowPreview(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [showPreview]);

  const handleSend = async (
    message: string,
    base64Images?: string[],
    aiDetectors?: string[],
    isSpoken: boolean = false,
  ) => {
    Keyboard.dismiss();
    await processUserResponse(message, isSpoken);
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    await processUserResponse(suggestion);
  };

  const handleFinalize = async () => {
    const analysis = await analyzeCompleteness();

    // Calculate completeness
    let completeness = 0;
    if (caseData.category) completeness += 10;
    if (caseData.description) completeness += 20;
    if (caseData.parties?.plaintiff) completeness += 15;
    if (caseData.parties?.defendant) completeness += 15;
    if (caseData.timeline && caseData.timeline.length > 0) completeness += 15;
    if (caseData.legalIssues && caseData.legalIssues.length > 0)
      completeness += 10;
    if (caseData.desiredOutcome) completeness += 15;

    // Generate Professional AI Summary
    const aiSummary = await generateCaseSummary();

    const finalCase: any = {
      id: caseData.id || Date.now().toString(),
      title: caseData.category ? `${caseData.category} Case` : "Legal Case",
      category: caseData.category || "Uncategorized",
      description: caseData.description || "",
      parties: caseData.parties || { plaintiff: "", defendant: "" },
      timeline: caseData.timeline || [],
      evidence: caseData.evidence || [],
      witnesses: caseData.witnesses || [],
      legalIssues: caseData.legalIssues || [],
      desiredOutcome: caseData.desiredOutcome || "",
      urgency: caseData.urgency || "medium",
      status: "completed",
      completeness,
      createdAt: caseData.createdAt || new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
      conversationId: Date.now().toString(),
      aiSummary: aiSummary,
      messages: messages,
    };

    if (!analysis.isComplete && completeness < 50) {
      Alert.alert(
        "Case Incomplete",
        `Your case is only ${completeness}% complete. Some important details are missing:\n\n${analysis.missingFields.join("\n")}\n\nWould you like to save it anyway?`,
        [
          { text: "Go Back", style: "cancel" },
          {
            text: "Save Anyway",
            onPress: () => {
              addCase(finalCase);
              Alert.alert(
                "Case Saved!",
                "Your case has been saved. You can view it in your profile or continue editing later.",
                [
                  {
                    text: "View Report",
                    onPress: () =>
                      router.push(`/case-report/${finalCase.id}` as any),
                  },
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ],
              );
            },
          },
        ],
      );
    } else {
      addCase(finalCase);
      Alert.alert(
        "Case Complete!",
        `Your case file is ${completeness}% complete and ready to be shared with advocates.`,
        [
          {
            text: "View Report",
            onPress: () => router.push(`/case-report/${finalCase.id}` as any),
          },
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const handleEditField = () => {
    setShowPreview(false);
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions =
    lastMessage?.type === "ai" &&
    lastMessage.suggestions &&
    lastMessage.suggestions.length > 0;
  const showOptions =
    lastMessage?.type === "ai" &&
    lastMessage.options &&
    lastMessage.options.length > 0;

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <CaseHistoryModal />
      {/* Content */}
      {showPreview ? (
        <CasePreviewCard
          caseData={caseData}
          onEdit={handleEditField}
          onClose={handlePreviewToggle}
        />
      ) : (
        <View className="flex-1">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message, index) => (
              <ConversationMessage
                key={message.id}
                type={message.type}
                content={message.content}
                timestamp={message.timestamp}
                index={index}
              />
            ))}

            {isLoading && <TypingIndicator />}

            {showSuggestions && (
              <SuggestionChips
                suggestions={lastMessage.suggestions!}
                onSelect={handleSuggestionSelect}
                index={messages.length}
              />
            )}

            {showOptions && (
              <QuestionOptions
                options={lastMessage.options!}
                onSelect={handleSuggestionSelect}
                index={messages.length}
              />
            )}
          </ScrollView>

          {/* Action Buttons */}
          {messages.length > 5 && !showPreview && (
            <Animated.View
              entering={FadeInDown.springify()}
              className="px-4 pb-4 bg-transparent mt-2"
            >
              <View className="flex-row gap-x-3">
                <View className="flex-1">
                  <Button
                    label="Preview"
                    onPress={handlePreviewToggle}
                    variant="outline"
                    size="md"
                    className="w-full rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800"
                    icon={
                      <FileText
                        size={18}
                        color={isDark ? "#64748B" : "#94A3B8"}
                      />
                    }
                    textClassName="text-[#0F172A] dark:text-[#F8FAFC] ml-1.5 font-medium"
                  />
                </View>
                <View className="flex-1">
                  <Button
                    label="Finalize"
                    onPress={handleFinalize}
                    size="md"
                    className="w-full rounded-2xl bg-[#0F172A] dark:bg-[#38BDF8]"
                    textClassName="text-white dark:text-[#0F172A] font-semibold ml-1.5"
                    icon={
                      <CheckCircle2
                        size={18}
                        color={isDark ? "#0F172A" : "white"}
                      />
                    }
                  />
                </View>
              </View>
            </Animated.View>
          )}

          {/* Input */}
          <CaseBuilderInput
            onSend={handleSend}
            isLoading={isLoading}
            placeholder="Describe your situation in detail..."
          />
        </View>
      )}
    </View>
  );
}
