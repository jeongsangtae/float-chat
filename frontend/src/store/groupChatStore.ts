import { create } from "zustand";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import {
  UserInfo,
  GroupChatData,
  GroupChatInvites,
  GroupChatInviteProps,
  GroupChatInviteListProps,
} from "../types";

const apiURL = import.meta.env.VITE_API_URL;

// interface ModalData {
//   method: "POST" | "PATCH";
//   modalId?: string;
//   modalTitle?: string;
// }

interface GroupChatStore {
  socket: Socket | null;
  loading: boolean;
  groupChats: GroupChatData[];
  groupChatUsers: Omit<UserInfo, "tokenExp">[];
  groupChatInvites: GroupChatInvites[];
  getGroupChats: () => Promise<void>;
  getGroupChatUsers: (roomId: string) => Promise<void>;
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
  leaveGroupChat: (_id: string) => Promise<void>;
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
  rejectGroupChatInvite: (groupChatInviteId: string) => Promise<void>;
}

const useGroupChatStore = create<GroupChatStore>((set, get) => ({
  socket: null,
  loading: true,
  groupChats: [],
  groupChatUsers: [],
  groupChatInvites: [],
  getGroupChats: async () => {
    try {
      const response = await fetch(`${apiURL}/groupChats`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 조회 실패");
      }

      const socket = useSocketStore.getState().socket;
      // console.log("소켓 있음? :", socket);
      if (!socket) return; // 소켓이 없으면 실행 안 함

      socket.off("groupChatEdit");

      socket.on("groupChatEdit", (updatedGroupChatData) => {
        set((prev) => ({
          groupChats: prev.groupChats.map((groupChat) =>
            groupChat._id === updatedGroupChatData._id
              ? { ...groupChat, ...updatedGroupChatData }
              : groupChat
          ),
        }));
      });

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("groupChatDelete");

      // 삭제된 그룹 채팅방에 참여한 다른 사용자 화면에 실시간 반영
      socket.on("groupChatDelete", (roomId) => {
        set((prev) => ({
          groupChats: prev.groupChats.filter(
            (groupChat: GroupChatData) => groupChat._id !== roomId
          ),
        }));

        // 현재 사용자가 삭제된 방에 있는 경우 홈으로 이동
        if (window.location.pathname === `/group-chat/${roomId}`) {
          window.location.href = "/";
        }
      });

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

  getGroupChatUsers: async (roomId) => {
    try {
      const response = await fetch(`${apiURL}/groupChat/${roomId}/users`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 참여자 조회 실패");
      }

      const socket = useSocketStore.getState().socket;
      // console.log("소켓 있음? :", socket);
      if (!socket) return; // 소켓이 없으면 실행 안 함

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("acceptGroupChat");
      socket.off("groupChatLeave");

      // 그룹 채팅방에 새로운 사용자가 추가되었을 때, 사용자 목록을 실시간 반영
      // 중복 방지를 위해 some을 사용
      socket.on("acceptGroupChat", (newUser) => {
        set((prev) => ({
          groupChatUsers: prev.groupChatUsers.some(
            (user) => user._id === newUser._id
          )
            ? prev.groupChatUsers
            : [...prev.groupChatUsers, newUser],
        }));
      });

      // concat을 사용해 그룹 채팅방 사용자 목록을 실시간 반영
      // socket.on("acceptGroupChat", (newUser) => {
      //   set((prev) => ({
      //     groupChatUsers: prev.groupChatUsers.concat(newUser),
      //   }));
      // });

      // concat을 사용하고 중복 방지 내용을 적용
      // socket.on("acceptGroupChat", (newUser) => {
      //   set((prev) => ({
      //     groupChatUsers: prev.groupChatUsers.find(user => user._id === newUser._id)
      //       ? prev.groupChatUsers
      //       : prev.groupChatUsers.concat(newUser),
      //   }));
      // });

      // 그룹 채팅방을 나간 사용자를 제외한 사용자 목록을 실시간 반영
      socket.on("groupChatLeave", (leavingUserId) => {
        set((prev) => ({
          groupChatUsers: prev.groupChatUsers.filter(
            (groupChatUser: Omit<UserInfo, "tokenExp">) =>
              groupChatUser._id !== leavingUserId
          ),
        }));
      });

      const resData: { groupChatUsers: Omit<UserInfo, "tokenExp">[] } =
        await response.json();

      set({ groupChatUsers: resData.groupChatUsers });
    } catch (error) {
      alert(
        "그룹 채팅방 참여자를 불러오는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
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

    console.log(requestBody.modalData);

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

  deleteGroupChat: async (_id) => {
    try {
      const response = await fetch(`${apiURL}/groupChat/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 삭제 실패");
      }

      // 삭제한 사용자 본인 화면 즉시 실시간 반영
      const updatedGroupChats = get().groupChats.filter(
        (groupChat: GroupChatData) => groupChat._id !== _id
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

  leaveGroupChat: async (_id) => {
    try {
      const response = await fetch(`${apiURL}/leaveGroupChat/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 나가기 실패");
      }

      // 실시간 반영
      const updatedGroupChats = get().groupChats.filter(
        (groupChat: GroupChatData) => groupChat._id !== _id
      );

      set({ groupChats: updatedGroupChats });
    } catch (error) {
      console.error("에러 내용:", error);
      alert("그룹 채팅방 나가기 중 문제가 발생했습니다.");
    }
  },

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

      const socket = useSocketStore.getState().socket;
      // console.log("소켓 있음? :", socket);
      if (!socket) return; // 소켓이 없으면 실행 안 함

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("groupChatInvite");

      // 그룹 채팅방 초대 실시간 반영
      socket.on("groupChatInvite", (newInvite) => {
        set((prev) => ({
          groupChatInvites: [...prev.groupChatInvites, newInvite],
        }));
      });

      // 중복 방지
      socket.off("friendDeleteGroupChatInviteCleanup");

      // 친구 삭제 시에 해당 친구와 관련된 그룹 채팅방 초대 목록 모두 삭제 실시간 반영
      socket.on(
        "friendDeleteGroupChatInviteCleanup",
        ({ userId, friendId }) => {
          set((prev) => ({
            groupChatInvites: prev.groupChatInvites.filter(
              (groupChatInvite) =>
                !(
                  (groupChatInvite.requester === friendId &&
                    groupChatInvite.receiver === userId) ||
                  (groupChatInvite.requester === userId &&
                    groupChatInvite.receiver === friendId)
                )
            ),
          }));
        }
      );

      // 중복 방지
      socket.off("groupChatInvitesDelete");

      // 그룹 채팅방 삭제 시에 그룹 채팅방 초대 목록 정리 실시간 반영
      socket.on("groupChatInvitesDelete", (roomId) => {
        set((prev) => ({
          groupChatInvites: prev.groupChatInvites.filter(
            (groupChatInvite) => groupChatInvite.roomId !== roomId
          ),
        }));
      });

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

  rejectGroupChatInvite: async (groupChatInviteId) => {
    try {
      const response = await fetch(
        `${apiURL}/rejectGroupChat/${groupChatInviteId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("친구 요청 취소 또는 거절 실패");
      }

      const resData = await response.json();

      console.log(resData.message);

      set((prevGroupChatInvites) => ({
        groupChatInvites: prevGroupChatInvites.groupChatInvites.filter(
          (req) => req._id !== groupChatInviteId
        ),
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      alert("그룹 채팅방 초대 거절 중 문제가 발생했습니다.");
    }
  },
}));

export default useGroupChatStore;
