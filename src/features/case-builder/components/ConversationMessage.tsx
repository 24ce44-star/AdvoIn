import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { Download, FileText, Scale } from "lucide-react-native";
import React from "react";
import { Alert, Image, Platform, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

interface ConversationMessageProps {
  type: "ai" | "user";
  content: string;
  images?: string[];
  timestamp?: Date;
  index: number;
}

export function ConversationMessage({
  type,
  content,
  images,
  timestamp,
  index,
}: ConversationMessageProps) {
  const { colors, isDark } = useLegalTheme();

  let displayContent = content;
  let draftDocument: { title: string; content: string } | null = null;

  if (type === "ai") {
    const match = content.match(/\[DRAFT_DOCUMENT:\s*(\{[\s\S]*?\})\s*\]/);
    if (match) {
      let parsed = null;
      try {
        parsed = JSON.parse(match[1]);
      } catch (e) {
        // Fallback for LLMs generating literal physical newlines inside JSON string values
        try {
          const titleMatch = match[1].match(/"title"\s*:\s*"([^"]+)"/);
          const contentMatch = match[1].match(/"content"\s*:\s*"([\s\S]+?)"\s*\}/);
          if (titleMatch && contentMatch) {
            parsed = {
              title: titleMatch[1].replace(/\\n/g, "\n"),
              content: contentMatch[1].replace(/\\n/g, "\n"),
            };
          }
        } catch (err) {
          console.warn("Failed advanced parse", err);
        }
      }

      if (parsed) {
        draftDocument = parsed;
        displayContent = content.replace(match[0], "").trim();
      }
    }

    const handleDownloadDraft = async () => {
      if (!draftDocument) return;
      try {
        const htmlString = `
          <html>
            <head>
              <style>
                body { font-family: 'Times New Roman', Times, serif; padding: 40px; padding-top: 60px; line-height: 1.6; color: #000; }
                h1 { text-align: center; font-size: 22px; margin-bottom: 24px; text-transform: uppercase; text-decoration: underline; }
                .content { font-size: 16px; white-space: pre-wrap; text-align: justify; }
                @page { margin: 20mm; }
              </style>
            </head>
            <body>
              <h1>${draftDocument.title}</h1>
              <div class="content">${draftDocument.content}</div>
            </body>
          </html>
        `;
        const { uri } = await Print.printToFileAsync({ html: htmlString });
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: "Download Legal Application",
        });
      } catch (error) {
        Alert.alert("Error", "Could not generate PDF document.");
      }
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        className="mb-8 px-5"
      >
        <View className="flex-row items-start">
          <View className="w-10 h-10 rounded-full bg-[#F0F9FF] dark:bg-[#0C4A6E]/30 items-center justify-center mr-4">
            <Scale
              size={20}
              color={isDark ? "#38BDF8" : "#0284C7"}
              strokeWidth={1.5}
            />
          </View>
          <View className="flex-1 pt-0.5">
            <View className="flex-row items-center mb-1">
              <ThemedText
                variant="caption"
                weight="bold"
                className="text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-widest text-[11px]"
              >
                Buddy AI
              </ThemedText>
              {timestamp && (
                <View className="flex-row items-center ml-2">
                  <View className="w-1 h-1 rounded-full bg-legal-slate/30 dark:bg-legal-slate/60 mr-1.5" />
                  <ThemedText
                    variant="caption"
                    className="text-legal-slate/50 dark:text-legal-slate/40 text-[10px]"
                  >
                    {timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ThemedText>
                </View>
              )}
            </View>
            <Markdown
              style={{
                body: {
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontSize: 16,
                  lineHeight: 26,
                  fontFamily: "System",
                },
                paragraph: {
                  marginTop: 0,
                  marginBottom: 12,
                },
                strong: {
                  fontWeight: "700",
                  color: isDark ? "#FFFFFF" : "#000000",
                },
                em: {
                  fontStyle: "italic",
                },
                bullet_list: {
                  marginBottom: 16,
                },
                ordered_list: {
                  marginBottom: 16,
                },
                list_item: {
                  marginBottom: 10,
                  flexDirection: "row",
                  lineHeight: 26,
                },
                bullet_list_icon: {
                  marginLeft: 4,
                  marginRight: 8,
                  fontSize: 16,
                  color: isDark ? "#38BDF8" : "#0284C7",
                },
                ordered_list_icon: {
                  marginRight: 8,
                  fontSize: 16,
                  fontWeight: "700",
                  color: isDark ? "#38BDF8" : "#0284C7",
                },
                heading1: {
                  fontSize: 22,
                  fontWeight: "700",
                  marginBottom: 12,
                  marginTop: 16,
                  color: isDark ? "#FFFFFF" : "#000000",
                },
                heading2: {
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 10,
                  marginTop: 14,
                  color: isDark ? "#FFFFFF" : "#000000",
                },
                heading3: {
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                  marginTop: 12,
                  color: isDark ? "#F8FAFC" : "#111827",
                },
                blockquote: {
                  borderLeftWidth: 4,
                  borderLeftColor: isDark ? "#38BDF8" : "#0284C7",
                  paddingLeft: 12,
                  ...Platform.select({
                    ios: { opacity: 0.8 },
                    android: { opacity: 0.8 },
                  }),
                  marginBottom: 12,
                  backgroundColor: isDark ? "#0C4A6E33" : "#F0F9FF",
                  padding: 8,
                  borderRadius: 4,
                },
                code_inline: {
                  backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                  color: isDark ? "#38BDF8" : "#0284C7",
                },
                code_block: {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  padding: 12,
                  borderRadius: 8,
                  fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#1E293B" : "#E2E8F0",
                },
                link: {
                  color: isDark ? "#818CF8" : "#4F46E5",
                  textDecorationLine: "none",
                  fontWeight: "700",
                  backgroundColor: isDark ? "#4F46E525" : "#4F46E515",
                  borderColor: isDark ? "#4F46E540" : "#4F46E530",
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  marginTop: 4,
                  marginBottom: 4,
                  overflow: "hidden",
                },
              }}
            >
              {displayContent}
            </Markdown>
            
            {draftDocument && (
              <View className="mt-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                <View className="flex-row items-center p-3 border-b border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-[#0F172A]">
                  <FileText size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
                  <ThemedText className="font-bold ml-2 flex-1" numberOfLines={1}>
                    {draftDocument.title}
                  </ThemedText>
                </View>
                <View className="p-4 bg-white dark:bg-[#1E293B]">
                  <ThemedText className="text-[13px] leading-5 text-slate-500 dark:text-slate-400 mb-4" numberOfLines={4}>
                    {draftDocument.content}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={handleDownloadDraft}
                    activeOpacity={0.8}
                    className="flex-row items-center justify-center bg-[#0284C7] dark:bg-[#38BDF8] py-3 rounded-xl shadow-sm"
                  >
                    <Download size={18} color={isDark ? "#0F172A" : "#FFFFFF"} />
                    <ThemedText className="font-semibold text-white dark:text-[#0F172A] ml-2 text-[15px]">
                      Download PDF
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      className="mb-4 px-4"
    >
      <View className="flex-row justify-end">
        <View
          className="max-w-[85%] bg-[#0F172A] dark:bg-[#1E293B] px-5 py-3.5 rounded-3xl rounded-tr-sm border border-neutral-800 dark:border-neutral-700"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          {images && images.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-2 justify-end">
              {images.map((base64, idx) => (
                <View
                  key={idx}
                  className="w-[120px] h-[160px] rounded-xl overflow-hidden border border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${base64}` }}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "cover",
                    }}
                  />
                </View>
              ))}
            </View>
          )}

          {content.trim() !== "" && (
            <ThemedText className="text-white dark:text-[#F8FAFC] text-[15px] leading-[22px]">
              {content}
            </ThemedText>
          )}
          {timestamp && (
            <ThemedText
              variant="caption"
              className="text-white/50 mt-1.5 text-right text-[10px]"
            >
              {timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
