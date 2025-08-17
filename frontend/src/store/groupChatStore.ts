import { create } from "zustand";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import {
  UserInfo,
  GroupChatData,
  GroupChatUserData,
  GroupChatInvites,
  GroupChatInviteProps,
  GroupChatInviteListProps,
} from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface GroupChatStore {
  socket: Socket | null;
  loading: boolean;
  groupChats: GroupChatData[];
  groupChatUsers: GroupChatUserData[];
  groupChatInvites: GroupChatInvites[];
  getGroupChats: () => Promise<void>;
  getGroupChatUsers: (roomId: string) => Promise<void>;
  groupChatForm: (
    trimmedTitle: string,
    // userInfo: UserInfo,
    modalData: {
      method: "POST" | "PATCH";
      _id?: string;
      title?: string;
    }
  ) => Promise<void>;
  groupChatAnnouncementForm: (
    trimmedAnnouncement: string,
    // userInfo: UserInfo,
    modalData: {
      method: "POST" | "PATCH";
      groupChatId?: string;
      announcement?: string;
    }
  ) => Promise<void>;
  deleteGroupChat: (_id: string) => Promise<void>;
  leaveGroupChat: (_id: string) => Promise<void>;
  getGroupChatInvites: () => Promise<void>;
  inviteGroupChat: ({
    roomId,
    friendId,
    nickname,
  }: Omit<GroupChatInviteProps, "onToggle" | "avatarColor">) => Promise<void>;
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
      if (!socket) return; // 소켓이 없으면 실행 안 함

      socket.off("groupChatHostProfileUpdated");

      socket.on(
        "groupChatHostProfileUpdated",
        ({ userId, newNickname, newAvatarColor }) => {
          set((prev) => ({
            groupChats: prev.groupChats.map((groupChat) =>
              groupChat.hostId === userId
                ? {
                    ...groupChat,
                    hostNickname: newNickname,
                    hostAvatarColor: newAvatarColor,
                  }
                : groupChat
            ),
          }));
        }
      );

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
      if (!socket) return; // 소켓이 없으면 실행 안 함

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("groupChatUserProfileUpdated");

      // 그룹 채팅방 참여자 중 한 사용자가 닉네임을 변경했을 때, 해당 사용자의 닉네임을 실시간 반영해 업데이트
      socket.on(
        "groupChatUserProfileUpdated",
        ({ userId, newNickname, newAvatarColor }) => {
          set((prev) => ({
            groupChatUsers: prev.groupChatUsers.map((groupChatUser) => {
              return groupChatUser._id === userId
                ? {
                    ...groupChatUser,
                    nickname: newNickname,
                    avatarColor: newAvatarColor,
                  }
                : groupChatUser;
            }),
          }));
        }
      );

      socket.off("acceptGroupChat");

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

      socket.off("groupChatLeave");
      // 그룹 채팅방을 나간 사용자를 제외한 사용자 목록을 실시간 반영
      socket.on("groupChatLeave", (leavingUserId) => {
        set((prev) => ({
          groupChatUsers: prev.groupChatUsers.filter(
            (groupChatUser: Omit<UserInfo, "tokenExp">) =>
              groupChatUser._id !== leavingUserId
          ),
        }));
      });

      const resData: { groupChatUsers: GroupChatUserData[] } =
        await response.json();

      set({ groupChatUsers: resData.groupChatUsers });
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "그룹 채팅방 참여자를 불러오는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  groupChatForm: async (trimmedTitle, modalData) => {
    try {
      // const { _id, email, username, nickname, avatarColor } = userInfo;

      const requestBody = {
        title: trimmedTitle,
        // _id,
        // email,
        // username,
        // nickname,
        // avatarColor,
        modalData,
      };

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
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "그룹 채팅방 추가 및 수정 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  groupChatAnnouncementForm: async (
    trimmedAnnouncement,
    // userInfo,
    modalData
  ) => {
    try {
      // const { _id, email, username, nickname, avatarColor } = userInfo;

      // 사용자 정보 관련 내용 삭제하는 것을 고려중 사용되지 않고 있음
      const requestBody = {
        trimmedAnnouncement,
        // _id,
        // email,
        // username,
        // nickname,
        // avatarColor,
        modalData,
      };

      const response = await fetch(`${apiURL}/groupChatAnnouncementForm`, {
        method: modalData.method,
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`그룹 채팅방 공지 수정 실패`);
      }

      const resData = await response.json();

      console.log(resData);
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "그룹 채팅방 공지 수정 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
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
      alert(
        "그룹 채팅방 나가기 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
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
      if (!socket) return; // 소켓이 없으면 실행 안 함

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("groupChatInviteProfileUpdated");

      // 그룹 채팅방 초대 닉네임 업데이트 실시간 반영
      socket.on(
        "groupChatInviteProfileUpdated",
        ({ userId, newNickname, newAvatarColor }) => {
          set((prev) => ({
            groupChatInvites: prev.groupChatInvites.map((groupChatInvite) => {
              const updatedGroupChatInvite = { ...groupChatInvite };

              if (groupChatInvite.requester === userId) {
                updatedGroupChatInvite.requesterNickname = newNickname;
                updatedGroupChatInvite.avatarColor = newAvatarColor;
              } else if (groupChatInvite.receiver === userId) {
                updatedGroupChatInvite.receiverNickname = newNickname;
              }
              return updatedGroupChatInvite;
            }),
          }));
        }
      );

      socket.off("groupChatInvite");

      // 그룹 채팅방 초대 실시간 반영
      socket.on("groupChatInvite", (newInvite) => {
        set((prev) => ({
          groupChatInvites: [...prev.groupChatInvites, newInvite],
        }));
      });

      socket.off("acceptGroupChatInvite");

      // 그룹 채팅방 초대 수락 시에 실시간 반영
      socket.on("acceptGroupChatInvite", (groupChatInviteId) => {
        set((prev) => ({
          groupChatInvites: prev.groupChatInvites.filter(
            (groupChatInvite) => groupChatInvite._id !== groupChatInviteId
          ),
        }));
      });

      socket.off("rejectGroupChatInvite");

      // 그룹 채팅방 초대 거절 시에 실시간 반영
      socket.on("rejectGroupChatInvite", (groupChatInviteId) => {
        set((prev) => ({
          groupChatInvites: prev.groupChatInvites.filter(
            (groupChatInvite) => groupChatInvite._id !== groupChatInviteId
          ),
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
      socket.off("groupChatDeleteInvitesDelete");

      // 그룹 채팅방 삭제 시에 그룹 채팅방 초대 목록 정리 실시간 반영
      socket.on("groupChatDeleteInvitesDelete", (roomId) => {
        set((prev) => ({
          groupChatInvites: prev.groupChatInvites.filter(
            (groupChatInvite) => groupChatInvite.roomId !== roomId
          ),
        }));
      });

      // 중복 방지
      socket.off("groupChatLeaveInvitesDelete");

      // 그룹 채팅방 나갈 시에 그룹 채팅방 초대 목록 정리 실시간 반영
      socket.on("groupChatLeaveInvitesDelete", ({ userId, roomId }) => {
        set((prev) => ({
          groupChatInvites: prev.groupChatInvites.filter(
            (groupChatInvite) =>
              !(
                groupChatInvite.roomId === roomId &&
                (groupChatInvite.requester === userId ||
                  groupChatInvite.receiver === userId)
              )
          ),
        }));
      });

      set({ groupChatInvites: resData.groupChatInvites });
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "그룹 채팅방 초대 목록 조회 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
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
      alert(
        "그룹 채팅방 초대 수락 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
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
      alert(
        "그룹 채팅방 초대 거절 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },
}));

export default useGroupChatStore;
