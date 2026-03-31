import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[]; // Array of base64 strings or local URIs
  aiDetectors?: string[]; // Array of detected AI generators from EXIF data
  timestamp: string;
}

export interface AIChat {
  id: string;
  title: string;
  isTitleFinal?: boolean;
  emoji?: string;
  themeColor?: string;
  messages: AIChatMessage[];
  updatedAt: string;
  createdAt: string;
}

interface AIChatStore {
  chats: AIChat[];
  activeChatId: string | null;
  addChat: (chat: AIChat) => void;
  updateChat: (id: string, updates: Partial<AIChat>) => void;
  deleteChat: (id: string) => void;
  deleteChats: (ids: string[]) => void;
  setActiveChatId: (id: string | null) => void;
  addMessageToChat: (chatId: string, message: AIChatMessage) => void;
}

export const useAIChatStore = create<AIChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,

      addChat: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats],
        })),

      updateChat: (id, updates) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c,
          ),
        })),

      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          activeChatId: state.activeChatId === id ? null : state.activeChatId,
        })),

      deleteChats: (ids) =>
        set((state) => ({
          chats: state.chats.filter((c) => !ids.includes(c.id)),
          activeChatId:
            state.activeChatId && ids.includes(state.activeChatId)
              ? null
              : state.activeChatId,
        })),

      setActiveChatId: (id) => set({ activeChatId: id }),

      addMessageToChat: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        })),
    }),
    {
      name: "buddy-ai-chats",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
