import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { FileText, MessageSquare, Plus, X } from "lucide-react-native";
import React from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useCaseStore } from "../store/useCaseStore";

export function CaseHistoryModal() {
  const {
    isHistoryOpen,
    setHistoryOpen,
    cases,
    loadCaseIntoBuilder,
    triggerNewChat,
  } = useCaseStore();
  const { isDark } = useLegalTheme();

  if (!isHistoryOpen) return null;

  return (
    <Modal visible={isHistoryOpen} transparent animationType="fade">
      <View className="flex-1 justify-center items-center px-4">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setHistoryOpen(false)}
          className="absolute inset-0 bg-black/60"
        />
        <Animated.View
          entering={FadeInDown.springify()}
          exiting={FadeOut.duration(200)}
          className="w-full max-h-[80%] bg-white dark:bg-[#0A0A0A] rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <View className="px-5 py-4 border-b border-legal-slate/10 dark:border-neutral-800 flex-row justify-between items-center">
            <View>
              <ThemedText
                variant="h2"
                weight="bold"
                className="text-legal-navy dark:text-legal-ice"
              >
                Chat History
              </ThemedText>
              <ThemedText variant="caption" className="text-legal-slate">
                Your past case building sessions
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => setHistoryOpen(false)}
              className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-full"
            >
              <X size={20} color={isDark ? "#F8FAFC" : "#0F172A"} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView
            className="px-4 py-2"
            showsVerticalScrollIndicator={false}
          >
            {cases.length === 0 ? (
              <View className="py-10 items-center justify-center">
                <View className="w-16 h-16 rounded-full bg-slate-100 dark:bg-neutral-800 items-center justify-center mb-4">
                  <MessageSquare
                    size={28}
                    color={isDark ? "#38BDF8" : "#0284C7"}
                  />
                </View>
                <ThemedText
                  variant="body"
                  weight="medium"
                  className="text-center text-legal-slate"
                >
                  No previous chats found.
                </ThemedText>
                <ThemedText
                  variant="caption"
                  className="text-center text-legal-slate/70 mt-1"
                >
                  Start building your first case to see it here!
                </ThemedText>
              </View>
            ) : (
              cases.map((c, index) => (
                <Animated.View
                  key={c.id}
                  entering={FadeInDown.delay(index * 50).springify()}
                >
                  <TouchableOpacity
                    onPress={() => loadCaseIntoBuilder(c.id)}
                    className="flex-row items-center justify-between p-4 mb-3 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800"
                  >
                    <View className="flex-row flex-1 items-center mr-3">
                      <View className="w-10 h-10 rounded-full bg-[#F0F9FF] dark:bg-[#0C4A6E]/30 items-center justify-center mr-3">
                        <FileText
                          size={20}
                          color={isDark ? "#38BDF8" : "#0284C7"}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText
                          variant="body"
                          weight="medium"
                          className="text-legal-navy dark:text-legal-ice"
                        >
                          {c.title || "Untitled Case"}
                        </ThemedText>
                        <ThemedText
                          variant="caption"
                          className="text-legal-slate mt-0.5"
                        >
                          {new Date(c.createdAt).toLocaleDateString()} •{" "}
                          {c.completeness}% Complete
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </ScrollView>

          {/* Footer Action */}
          <View className="px-4 py-4 border-t border-legal-slate/10 dark:border-neutral-800">
            <Button
              label="Start New Chat"
              icon={<Plus size={18} color={isDark ? "#0F172A" : "white"} />}
              onPress={() => {
                setHistoryOpen(false);
                triggerNewChat();
              }}
              variant="primary"
              className="w-full py-4 rounded-2xl bg-[#0F172A] dark:bg-[#38BDF8]"
              textClassName="font-semibold text-white dark:text-[#0F172A]"
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
