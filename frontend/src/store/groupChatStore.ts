import { create } from "zustand";

import { GroupChatData } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface GroupChatState {
  loading: boolean;
  groupChats: GroupChatData[];
  getGroupChats: () => Promise<void>;
}

const useGroupChatStore = create<GroupChatState>((set) => ({
  loading: true,
  groupChats: [],
  getGroupChats: async () => {
    try {
      const response = await fetch(`${apiURL}/groupChats`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 조회 실패");
      }

      const resData: { groupChats: GroupChatData[] } = await response.json();

      // 상태 업데이트
      set({ groupChats: resData.groupChats, loading: false });
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "그룹 채팅방 목록을 불러오는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    } finally {
      set({ loading: false });
    }
  },

  createGroupChat: async () => {},
}));

export default useGroupChatStore;
