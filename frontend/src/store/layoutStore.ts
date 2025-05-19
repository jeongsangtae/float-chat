import { create } from "zustand";

type ViewType = "friends" | "directChat" | "groupChat";

interface LayoutStore {
  currentView: ViewType;
  groupChatTitle: string;
  setView: (view: ViewType) => void;
  setGroupChatTitle: (title: string) => void;
}

const useLayoutStore = create<LayoutStore>((set) => ({
  currentView: "friends",
  groupChatTitle: "",
  setView: (view) => {
    set({ currentView: view });
  },
  setGroupChatTitle: (title) => {
    set({ groupChatTitle: title });
  },
}));

export default useLayoutStore;
