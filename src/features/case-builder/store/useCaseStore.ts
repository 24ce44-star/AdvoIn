import { create } from "zustand";
import { CaseData } from "../types/case.types";

interface CaseStore {
  cases: CaseData[];
  currentCase: Partial<CaseData> | null;
  newChatTrigger: number;
  isHistoryOpen: boolean;
  addCase: (caseData: CaseData) => void;
  updateCase: (id: string, updates: Partial<CaseData>) => void;
  deleteCase: (id: string) => void;
  setCurrentCase: (caseData: Partial<CaseData> | null) => void;
  getCaseById: (id: string) => CaseData | undefined;
  initialMessage: string | null;
  triggerNewChat: (initialMessage?: string) => void;
  setHistoryOpen: (open: boolean) => void;
  loadCaseIntoBuilder: (caseId: string) => void;
  loadedCaseId: string | null;
}

export const useCaseStore = create<CaseStore>((set, get) => ({
  cases: [],
  currentCase: null,
  newChatTrigger: 0,
  isHistoryOpen: false,
  initialMessage: null,
  loadedCaseId: null,

  addCase: (caseData) =>
    set((state) => {
      // Avoid duplicate cases with the same ID
      const exists = state.cases.find((c) => c.id === caseData.id);
      if (exists) {
        return {
          cases: state.cases.map((c) => (c.id === caseData.id ? caseData : c)),
        };
      }
      return { cases: [...state.cases, caseData] };
    }),

  updateCase: (id, updates) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
      ),
    })),

  deleteCase: (id) =>
    set((state) => ({
      cases: state.cases.filter((c) => c.id !== id),
      loadedCaseId: state.loadedCaseId === id ? null : state.loadedCaseId,
    })),

  setCurrentCase: (caseData) =>
    set({
      currentCase: caseData,
    }),

  getCaseById: (id) => get().cases.find((c) => c.id === id),

  triggerNewChat: (initialMessage?: string) =>
    set((state) => ({
      newChatTrigger: state.newChatTrigger + 1,
      loadedCaseId: null,
      initialMessage: initialMessage || null,
    })),

  setHistoryOpen: (open) => set({ isHistoryOpen: open }),

  loadCaseIntoBuilder: (caseId: string) =>
    set({ loadedCaseId: caseId, isHistoryOpen: false }),
}));
