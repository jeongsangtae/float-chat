import { create } from "zustand";

import { GroupChatData } from "../types";
import { UserInfo } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface GroupChatState {
  loading: boolean;
  groupChats: GroupChatData[];
  getGroupChats: () => Promise<void>;
  groupChatForm: (title: string, userInfo: UserInfo) => Promise<void>;
  deleteGroupChat: (_id: string) => Promise<void>;
}

const useGroupChatStore = create<GroupChatState>((set, get) => ({
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

  groupChatForm: async (title: string, userInfo: UserInfo) => {
    const { _id, email, username, nickname } = userInfo;

    const requestBody = { title, _id, email, username, nickname };

    const response = await fetch(`${apiURL}/createGroupChat`, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`그룹 채팅방 생성 실패`);
    }

    const resDate = await response.json();

    // 실시간 반영
    set((prev) => ({
      groupChats: [...prev.groupChats, resDate.newGroupChat],
    }));
  },

  // editGroupChatTitle: async() => {
  //   try {
  //     const response = await fetch(`${apiURL}/editGroupChatTitle`, {
  //       method: "PATCH"
  //     })
  //   } catch(error) {

  //   }
  // },

  deleteGroupChat: async (_id: string) => {
    try {
      const response = await fetch(`${apiURL}/groupChat/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`그룹 채팅방 삭제 실패`);
      }

      // 실시간 반영
      const updatedGroupChats = get().groupChats.filter(
        (chat: GroupChatData) => chat._id !== _id
      );

      set({ groupChats: updatedGroupChats });
    } catch (error) {
      if (error instanceof Error) {
        console.error("에러 내용:", error.message);
      } else {
        console.error("알 수 없는 에러:", error);
      }

      alert(
        "그룹 채팅방을 삭제하는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },
}));

export default useGroupChatStore;
