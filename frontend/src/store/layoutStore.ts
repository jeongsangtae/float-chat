import { create } from "zustand";

type ViewType = "friends" | "directChat" | "groupChat";

interface LayoutStore {
  theme: string;
  currentView: ViewType;
  groupChatTitle: string;
  setTheme: (theme: string) => void;
  setView: (view: ViewType) => void;
  setGroupChatTitle: (title: string) => void;
}

const useLayoutStore = create<LayoutStore>((set) => ({
  theme: localStorage.getItem("theme") || "dark",
  currentView: "friends",
  groupChatTitle: "",
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    set({ theme });
  },
  setView: (view) => {
    set({ currentView: view });
  },
  setGroupChatTitle: (title) => {
    set({ groupChatTitle: title });
  },
}));

export default useLayoutStore;
