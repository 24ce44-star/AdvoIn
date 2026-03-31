import { AdvocateCardProps } from "@/components/ui/AdvocateCard";
import { MOCK_ADVOCATES } from "@/services/mock/mockAdvocates";
import { create } from "zustand";

interface AdvocateState {
  advocates: AdvocateCardProps[];
  filter: string;
  setFilter: (filter: string) => void;
  getAdvocateById: (id: string) => AdvocateCardProps | undefined;
}

export const useAdvocateStore = create<AdvocateState>((set, get) => ({
  advocates: MOCK_ADVOCATES,
  filter: "All",
  setFilter: (filter) => set({ filter }),
  getAdvocateById: (id) => get().advocates.find((adv) => adv.id === id),
}));
