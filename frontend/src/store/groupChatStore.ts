import { create } from "zustand";

import {
  GroupChatData,
  GroupChatInvites,
  GroupChatInviteProps,
  GroupChatInviteListProps,
} from "../types";
import { UserInfo } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

// interface ModalData {
//   method: "POST" | "PATCH";
//   modalId?: string;
//   modalTitle?: string;
// }

interface GroupChatStore {
  loading: boolean;
  groupChats: GroupChatData[];
  groupChatInvites: GroupChatInvites[];
  getGroupChats: () => Promise<void>;
  groupChatForm: (
    title: string,
    userInfo: UserInfo,
    // modalData: ModalData
    modalData: {
      method: "POST" | "PATCH";
      _id?: string;
      title?: string;
    }
  ) => Promise<void>;
  deleteGroupChat: (_id: string) => Promise<void>;
  getGroupChatInvites: () => Promise<void>;
  inviteGroupChat: ({
    roomId,
    friendId,
    nickname,
  }: GroupChatInviteProps) => Promise<void>;
  acceptGroupChatInvite: ({
    groupChatId,
    groupChatInviteId,
  }: Pick<
    GroupChatInviteListProps,
    "groupChatId" | "groupChatInviteId"
  >) => Promise<void>;
  rejectGroupChatInvite: ({
    groupChatId,
    groupChatInviteId,
  }: Pick<
    GroupChatInviteListProps,
    "groupChatId" | "groupChatInviteId"
  >) => Promise<void>;
}

const useGroupChatStore = create<GroupChatStore>((set, get) => ({
  loading: true,
  groupChats: [],
  groupChatInvites: [],
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

  groupChatForm: async (
    title: string,
    userInfo: UserInfo,
    modalData: {
      method: "POST" | "PATCH";
      _id?: string;
      title?: string;
    }
  ) => {
    const { _id, email, username, nickname } = userInfo;

    const requestBody = { title, _id, email, username, nickname, modalData };

    const response = await fetch(`${apiURL}/groupChatForm`, {
      method: modalData.method,
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`그룹 채팅방 생성 실패`);
    }

    const resData = await response.json();

    // 실시간 반영
    set((prev) => {
      if (modalData.method === "POST") {
        // 새로운 그룹 채팅방 추가
        return {
          groupChats: [...prev.groupChats, resData.newGroupChat],
        };
      } else if (modalData.method === "PATCH" && resData.editGroupChat) {
        // 기존 그룹 채팅방 수정
        return {
          groupChats: prev.groupChats.map((groupChat) =>
            groupChat._id === resData.editGroupChat._id
              ? { ...groupChat, ...resData.editGroupChat }
              : groupChat
          ),
        };
      }
      return prev;
    });
  },

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

  getGroupChatUsers: async () => {},

  getGroupChatInvites: async () => {
    try {
      const response = await fetch(`${apiURL}/groupChat/invites`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 초대 목록 조회 실패");
      }

      const resData: { groupChatInvites: GroupChatInvites[] } =
        await response.json();

      console.log(resData);

      set({ groupChatInvites: resData.groupChatInvites });
    } catch (error) {
      console.error("에러 내용:", error);
      alert("그룹 채팅방 초대 목록 조회 중 문제가 발생했습니다.");
    }
  },

  inviteGroupChat: async ({ roomId, friendId, nickname }) => {
    try {
      const requestBody = { friendId, nickname };

      const response = await fetch(`${apiURL}/groupChat/${roomId}/invite`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 초대 실패");
      }

      const resData = await response.json();

      console.log(resData);
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "그룹 채팅방 초대 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  acceptGroupChatInvite: async ({ groupChatId, groupChatInviteId }) => {
    try {
      const requestBody = { groupChatId, groupChatInviteId };

      console.log(groupChatId, groupChatInviteId);

      const response = await fetch(`${apiURL}/acceptGroupChat`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 초대 수락 실패");
      }

      const resData = await response.json();

      console.log(resData.acceptGroupChatInvite);

      set((prevGroupChatInvites) => ({
        groupChatInvites: prevGroupChatInvites.groupChatInvites.filter(
          (req) => req._id !== groupChatInviteId
        ),
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      alert("그룹 채팅방 초대 수락 중 문제가 발생했습니다.");
    }
  },

  rejectGroupChatInvite: async ({ groupChatId, groupChatInviteId }) => {},
}));

export default useGroupChatStore;
