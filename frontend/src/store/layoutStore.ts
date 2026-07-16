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
  // 저장된 테마가 있으면 사용하고, 없으면 기본값(dark) 적용
  theme: localStorage.getItem("theme") || "dark",
  currentView: "friends",
  groupChatTitle: "",

  // 테마 변경
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    set({ theme });
  },

  // 현재 레이아웃(View) 변경
  setView: (view) => {
    set({ currentView: view });
  },

  // 현재 그룹 채팅방 제목 변경
  setGroupChatTitle: (title) => {
    set({ groupChatTitle: title });
  },
}));

export default useLayoutStore;
