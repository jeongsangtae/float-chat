import { create } from "zustand";
import { toast } from "react-toastify";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import {
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
  saveGroupChatOrder: (groupChatIds: string[]) => Promise<void>;
  getGroupChatUsers: (roomId: string) => Promise<void>;
  groupChatForm: (
    trimmedTitle: string,
    modalData: {
      method: "POST" | "PATCH" | "DELETE";
      _id?: string;
      title?: string;
    }
  ) => Promise<void>;
  groupChatAnnouncementForm: (
    trimmedAnnouncement: string,
    modalData: {
      method: "POST" | "PATCH" | "DELETE";
      groupChatId?: string;
      announcement?: string;
    }
  ) => Promise<void>;
  groupChatAnnouncementDelete: (
    announcement: string,
    modalData: { method: "POST" | "PATCH" | "DELETE"; groupChatId?: string }
  ) => Promise<void>;
  deleteGroupChat: (_id: string) => Promise<void>;
  leaveGroupChat: (_id: string) => Promise<void>;
  getGroupChatInvites: () => Promise<void>;
  inviteGroupChat: ({
    roomId,
    friendId,
    nickname,
  }: Omit<
    GroupChatInviteProps,
    "onToggle" | "avatarColor" | "avatarImageUrl"
  >) => Promise<void>;
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

  // 그룹 채팅방 목록 조회 및 실시간 이벤트 등록
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

      // 그룹 채팅방 방장의 프로필 변경 사항을 목록에 실시간 반영
      socket.on(
        "groupChatHostProfileUpdated",
        ({ userId, newNickname, newAvatarColor, newAvatarImageUrl }) => {
          set((prev) => ({
            groupChats: prev.groupChats.map((groupChat) =>
              groupChat.hostId === userId
                ? {
                    ...groupChat,
                    hostNickname: newNickname,
                    hostAvatarColor: newAvatarColor,
                    hostAvatarImageUrl: newAvatarImageUrl,
                  }
                : groupChat
            ),
          }));
        }
      );

      const updateGroupChat = (updatedGroupChatData: GroupChatData) => {
        set((prev) => ({
          groupChats: prev.groupChats.map((groupChat) =>
            groupChat._id === updatedGroupChatData._id
              ? { ...groupChat, ...updatedGroupChatData }
              : groupChat
          ),
        }));
      };

      // 그룹 채팅방 정보 수정 내용을 실시간 반영
      socket.off("groupChatEdit");

      socket.on("groupChatEdit", updateGroupChat);

      // 그룹 채팅방 공지 수정 내용을 실시간 반영
      socket.off("groupChatAnnouncementEdit");

      socket.on("groupChatAnnouncementEdit", updateGroupChat);

      // 그룹 채팅방 공지 삭제 내용을 실시간 반영
      socket.off("groupChatAnnouncementDelete");

      socket.on("groupChatAnnouncementDelete", updateGroupChat);

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

      set({ groupChats: resData.groupChats, loading: false });
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("불러오기 실패 - 새로고침 후 다시 시도해주세요");
    } finally {
      set({ loading: false });
    }
  },

  // 사용자가 변경한 그룹 채팅방 순서를 서버에 저장
  saveGroupChatOrder: async (groupChatIds) => {
    try {
      const response = await fetch(`${apiURL}/user/group-chat-order`, {
        method: "PATCH",
        body: JSON.stringify({ groupChatOrder: groupChatIds }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 목록 저장 실패");
      }
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("저장 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 그룹 채팅방 참여자 목록 조회 및 실시간 이벤트 등록
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
      socket.off("onlineGroupChatUser");

      // 그룹 채팅방 참여자 중 온라인 상태가 된 사용자를 실시간 반영해 업데이트
      // 온라인으로 변경된 참여자의 상태만 true로 업데이트
      socket.on("onlineGroupChatUser", ({ onlineGroupChatUser }) => {
        set((prev) => ({
          groupChatUsers: prev.groupChatUsers.map((groupChatUser) =>
            groupChatUser._id === onlineGroupChatUser._id
              ? { ...groupChatUser, onlineChecked: true }
              : groupChatUser
          ),
        }));
      });

      socket.off("offlineGroupChatUser");

      // 그룹 채팅방 참여자 중 오프라인 상태가 된 사용자를 실시간 반영해 업데이트
      // 오프라인으로 변경된 참여자의 상태만 false로 업데이트
      socket.on("offlineGroupChatUser", ({ offlineGroupChatUser }) => {
        set((prev) => ({
          groupChatUsers: prev.groupChatUsers.map((groupChatUser) =>
            groupChatUser._id === offlineGroupChatUser._id
              ? { ...groupChatUser, onlineChecked: false }
              : groupChatUser
          ),
        }));
      });

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("groupChatUserProfileUpdated");

      // 그룹 채팅방 참여자 중 한 사용자가 닉네임을 변경했을 때, 해당 사용자의 닉네임을 실시간 반영해 업데이트
      socket.on(
        "groupChatUserProfileUpdated",
        ({ userId, newNickname, newAvatarColor, newAvatarImageUrl }) => {
          set((prev) => ({
            groupChatUsers: prev.groupChatUsers.map((groupChatUser) => {
              return groupChatUser._id === userId
                ? {
                    ...groupChatUser,
                    nickname: newNickname,
                    avatarColor: newAvatarColor,
                    avatarImageUrl: newAvatarImageUrl,
                  }
                : groupChatUser;
            }),
          }));
        }
      );

      socket.off("acceptGroupChat");

      // 그룹 채팅방에 새 사용자가 추가되면 중복 확인 후 사용자 목록에 반영
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

      // 그룹 채팅방을 나간 사용자를 사용자 목록에서 제거
      socket.on("groupChatLeave", (leavingUserId) => {
        set((prev) => ({
          groupChatUsers: prev.groupChatUsers.filter(
            (groupChatUser) => groupChatUser._id !== leavingUserId
          ),
        }));
      });

      const resData: { groupChatUsers: GroupChatUserData[] } =
        await response.json();

      set({ groupChatUsers: resData.groupChatUsers });
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("불러오기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 그룹 채팅방 생성 및 수정
  groupChatForm: async (trimmedTitle, modalData) => {
    try {
      const requestBody = { title: trimmedTitle, modalData };

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

      // 생성 또는 수정 결과를 화면에 즉시 반영
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
      throw error;
    }
  },

  // 그룹 채팅방 공지 생성 및 수정
  groupChatAnnouncementForm: async (trimmedAnnouncement, modalData) => {
    try {
      // 사용자 정보 관련 내용 삭제하는 것을 고려중 사용되지 않고 있음
      const requestBody = { trimmedAnnouncement, modalData };

      const response = await fetch(`${apiURL}/groupChatAnnouncementForm`, {
        method: modalData.method,
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`그룹 채팅방 공지 수정 실패`);
      }
    } catch (error) {
      console.error("에러 내용:", error);
      throw error;
    }
  },

  // 그룹 채팅방 공지 삭제
  groupChatAnnouncementDelete: async (announcement, modalData) => {
    try {
      const requestBody = { announcement, modalData };

      const response = await fetch(`${apiURL}/groupChatAnnouncementDelete`, {
        method: modalData.method,
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`그룹 채팅방 삭제 수정 실패`);
      }
    } catch (error) {
      console.error("에러 내용:", error);
      throw error;
    }
  },

  // 그룹 채팅방 삭제 및 실시간 반영
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
      toast.error("삭제 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 그룹 채팅방 나가기 및 실시간 반영
  leaveGroupChat: async (_id) => {
    try {
      const response = await fetch(`${apiURL}/leaveGroupChat/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("그룹 채팅방 나가기 실패");
      }

      // 나간 그룹 채팅방을 목록에서 즉시 제거
      const updatedGroupChats = get().groupChats.filter(
        (groupChat: GroupChatData) => groupChat._id !== _id
      );

      set({ groupChats: updatedGroupChats });
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("나가기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 그룹 채팅방 초대 목록 조회 및 실시간 이벤트 등록
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
      // 초대 요청자 또는 수신자의 프로필 변경 사항 반영
      socket.on(
        "groupChatInviteProfileUpdated",
        ({ userId, newNickname, newAvatarColor, newAvatarImageUrl }) => {
          set((prev) => ({
            groupChatInvites: prev.groupChatInvites.map((groupChatInvite) => {
              const updatedGroupChatInvite = { ...groupChatInvite };

              if (groupChatInvite.requester === userId) {
                updatedGroupChatInvite.requesterNickname = newNickname;
                updatedGroupChatInvite.avatarColor = newAvatarColor;
                updatedGroupChatInvite.avatarImageUrl = newAvatarImageUrl;
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

      const removeGroupChatInvite = (groupChatInviteId: string) => {
        set((prev) => ({
          groupChatInvites: prev.groupChatInvites.filter(
            (groupChatInvite) => groupChatInvite._id !== groupChatInviteId
          ),
        }));
      };

      socket.off("acceptGroupChatInvite");

      // 그룹 채팅방 초대 수락 시에 실시간 반영
      socket.on("acceptGroupChatInvite", removeGroupChatInvite);

      socket.off("rejectGroupChatInvite");

      // 그룹 채팅방 초대 거절 시에 실시간 반영
      socket.on("rejectGroupChatInvite", removeGroupChatInvite);

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
      toast.error("불러오기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 그룹 채팅방 초대 전송
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
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("초대 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 그룹 채팅방 초대 수락
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

      set((prevGroupChatInvites) => ({
        groupChatInvites: prevGroupChatInvites.groupChatInvites.filter(
          (req) => req._id !== groupChatInviteId
        ),
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("수락 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 그룹 채팅방 초대 거절
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
        throw new Error("그룹 채팅방 초대 거절 실패");
      }

      set((prevGroupChatInvites) => ({
        groupChatInvites: prevGroupChatInvites.groupChatInvites.filter(
          (req) => req._id !== groupChatInviteId
        ),
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("거절 실패 - 새로고침 후 다시 시도해주세요");
    }
  },
}));

export default useGroupChatStore;
