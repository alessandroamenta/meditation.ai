import { create } from "zustand";

interface useFeedbackModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useFeedbackModal = create<useFeedbackModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
