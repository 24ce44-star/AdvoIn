import { useCallback, useRef, useState } from "react";
import { GroqMessage, GroqService } from "../services/groq.service";
import {
    BuilderStage,
    CaseData,
    ConversationMessage,
} from "../types/case.types";
import { parseAIResponse } from "../utils/aiParser";

export function useCaseBuilder() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [caseData, setCaseData] = useState<Partial<CaseData>>({
    id: Date.now().toString(),
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
    timeline: [],
    evidence: [],
    witnesses: [],
    legalIssues: [],
  });
  const [currentStage, setCurrentStage] = useState<BuilderStage>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const conversationHistory = useRef<GroqMessage[]>([]);

  const addMessage = useCallback((message: ConversationMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const addAIMessage = useCallback(
    async (content: string, suggestions?: string[], options?: any[]) => {
      const aiMessage: ConversationMessage = {
        id: Date.now().toString(),
        type: "ai",
        content,
        timestamp: new Date(),
        suggestions,
        options,
      };
      addMessage(aiMessage);
      conversationHistory.current.push({
        role: "assistant",
        content,
      });
    },
    [addMessage],
  );

  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        type: "user",
        content,
        timestamp: new Date(),
      };
      addMessage(userMessage);
      conversationHistory.current.push({
        role: "user",
        content,
      });
    },
    [addMessage],
  );

  const updateCaseData = useCallback((updates: Partial<CaseData>) => {
    setCaseData((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
  }, []);

  const processUserResponse = useCallback(
    async (userInput: string, isSpoken: boolean = false) => {
      setIsLoading(true);
      addUserMessage(userInput);

      try {
        // Get AI response based on conversation history and current stage
        let aiResponse = await GroqService.generateFollowUp(
          conversationHistory.current,
          currentStage,
          caseData,
          isSpoken, // Pass the isSpoken flag to the AI Service
        );

        // Modular, robust parsing using aiParser utility
        const { cleanMessage, extractedData, options } =
          parseAIResponse(aiResponse);

        if (extractedData) {
          updateCaseData(extractedData);
        }

        await addAIMessage(cleanMessage, undefined, options);

        // If the user spoke, make the AI speak back the response!
        if (isSpoken) {
          const Speech = require("expo-speech");
          Speech.stop();

          // Detect script from response to pick the right TTS voice
          const hasDevanagari = /[\u0900-\u097F]/.test(cleanMessage);
          const hasTamil = /[\u0B80-\u0BFF]/.test(cleanMessage);
          const hasTelugu = /[\u0C00-\u0C7F]/.test(cleanMessage);
          const hasUrdu = /[\u0600-\u06FF]/.test(cleanMessage);
          const ttsLanguage = hasTamil
            ? "ta-IN"
            : hasTelugu
              ? "te-IN"
              : hasUrdu
                ? "ur-PK"
                : hasDevanagari
                  ? "hi-IN"
                  : "en-IN";

          // Strip markdown before speaking
          const speakText = cleanMessage
            .replace(/\*\*(.+?)\*\*/g, "$1")
            .replace(/\*(.+?)\*/g, "$1")
            .replace(/#{1,6}\s*/g, "")
            .replace(/^[-•]\s+/gm, "")
            .replace(/^\d+\.\s+/gm, "")
            .replace(/\n{2,}/g, ". ")
            .replace(/\n/g, " ")
            .trim();

          Speech.speak(speakText, {
            language: ttsLanguage,
            rate: 0.95,
            pitch: 0.85,
          });
        }
      } catch (error) {
        console.error("Error processing response:", error);
        await addAIMessage(
          "I apologize, but I'm having trouble processing that. Could you please try again?",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentStage, caseData, addUserMessage, addAIMessage, updateCaseData],
  );

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    try {
      const welcomeMessage = `Hello! I'm here to help you build a comprehensive case file. I'll ask you specific questions to understand your situation fully.

Don't worry if you don't remember every detail - we'll work through it together. Ready to start?

**What type of legal matter are you dealing with?**`;

      await addAIMessage(welcomeMessage, [
        "Property Dispute",
        "Employment Issue",
        "Family Matter",
        "Contract Dispute",
        "Personal Injury",
        "Criminal Matter",
        "Consumer Rights",
        "Other",
      ]);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [addAIMessage]);

  const generateCaseSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const summary = await GroqService.generateCaseSummary(caseData);
      return summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      return "Unable to generate summary at this time.";
    } finally {
      setIsLoading(false);
    }
  }, [caseData]);

  const analyzeCompleteness = useCallback(async () => {
    setIsLoading(true);
    try {
      const analysis = await GroqService.analyzeCaseCompleteness(caseData);
      return analysis;
    } catch (error) {
      console.error("Error analyzing case:", error);
      return {
        isComplete: false,
        missingFields: [],
        suggestions: ["Please review all sections"],
      };
    } finally {
      setIsLoading(false);
    }
  }, [caseData]);

  const resetBuilder = useCallback(() => {
    setMessages([]);
    setCaseData({
      id: Date.now().toString(),
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      timeline: [],
      evidence: [],
      witnesses: [],
      legalIssues: [],
    });
    setCurrentStage("welcome");
    conversationHistory.current = [];
  }, []);

  const loadCase = useCallback(
    (loadedCaseData: CaseData) => {
      setCaseData(loadedCaseData);
      if (loadedCaseData.messages && loadedCaseData.messages.length > 0) {
        setMessages(loadedCaseData.messages);
        const newHistory: GroqMessage[] = [];
        loadedCaseData.messages.forEach((msg) => {
          newHistory.push({
            role: msg.type === "ai" ? "assistant" : "user",
            content: msg.content,
          });
        });
        conversationHistory.current = newHistory;
      } else {
        resetBuilder();
      }
    },
    [resetBuilder],
  );

  return {
    messages,
    caseData,
    currentStage,
    isLoading,
    processUserResponse,
    startConversation,
    updateCaseData,
    setCurrentStage,
    generateCaseSummary,
    analyzeCompleteness,
    resetBuilder,
    loadCase,
  };
}
