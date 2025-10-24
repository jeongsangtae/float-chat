import { create } from "zustand";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import { DirectChatData } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface DirectChatStore {
  socket: Socket | null;
  directChats: DirectChatData[];
  // directChatRoomId: string;
  getDirectChat: () => Promise<void>;
  directChatForm: (
    id: string,
    nickname: string,
    avatarColor: string
  ) => Promise<void>;
  closeDirectChat: (_id: string) => Promise<void>;
}

const useDirectChatStore = create<DirectChatStore>((set) => ({
  socket: null,
  directChats: [],
  // directChatRoomId: "",
  getDirectChat: async () => {
    try {
      const response = await fetch(`${apiURL}/directChats`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`다이렉트 채팅방 조회 실패`);
      }

      const socket = useSocketStore.getState().socket;
      if (!socket) return; // 소켓이 없으면 실행 안 함

      const sortFn = (a: DirectChatData, b: DirectChatData) =>
        new Date(b.lastMessageDate).getTime() -
        new Date(a.lastMessageDate).getTime();

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("directChatProfileUpdated");

      socket.on(
        "directChatProfileUpdated",
        ({ userId, newNickname, newAvatarColor, newAvatarImageUrl }) => {
          set((prev) => ({
            directChats: prev.directChats.map((directChat) => {
              const isUser = directChat.participants.some(
                (participant) => participant._id === userId
              );

              if (!isUser) return directChat;

              const nicknameUpdatedParticipants = directChat.participants.map(
                (participant) =>
                  participant._id === userId
                    ? {
                        ...participant,
                        nickname: newNickname,
                        avatarColor: newAvatarColor,
                        avatarImageUrl: newAvatarImageUrl,
                      }
                    : participant
              );

              return {
                ...directChat,
                participants: nicknameUpdatedParticipants,
              };
            }),
          }));
        }
      );

      socket.off("invisibleDirectChat");

      // 다이렉트 채팅방이 화면에 보이지 않을 때 추가
      socket.on("invisibleDirectChat", (updatedDirectChatData) => {
        set((prev) => ({
          directChats: [...prev.directChats, updatedDirectChatData].sort(
            sortFn
          ),
        }));
      });

      // 다이렉트 채팅방이 화면에 보이지 않을 때 추가
      // some을 사용해 중복 방지
      // socket.on("invisibleDirectChat", (updatedDirectChatData) => {
      //   // 로직을 많이 간소화한 축약형
      //   set((prev) => ({
      //     directChats: prev.directChats.some(
      //       (room) => room._id === updatedDirectChatData._id
      //     )
      //       ? prev.directChats.sort(sortFn)
      //       : [...prev.directChats, updatedDirectChatData].sort(sortFn),
      //   }));

      socket.off("updatedDirectChat");

      // 이미 존재하는 다이렉트 채팅방 업데이트
      socket.on("updatedDirectChat", (updatedDirectChatData) => {
        set((prev) => ({
          directChats: prev.directChats
            .map((room) =>
              room._id === updatedDirectChatData._id
                ? updatedDirectChatData
                : room
            )
            .sort(sortFn),
        }));
      });

      const resData: { directChats: DirectChatData[] } = await response.json();

      set({ directChats: resData.directChats });
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "다이렉트 채팅방 목록을 불러오는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  directChatForm: async (id, nickname, avatarColor, avatarImageUrl) => {
    try {
      const requestBody = { id, nickname, avatarColor, avatarImageUrl };

      const response = await fetch(`${apiURL}/directChatForm`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`다이렉트 채팅방 생성 실패`);
      }

      const resData = await response.json();

      // 다이렉트 채팅방 추가 시에 중복을 방지하기 위해 some 사용
      set((prev) => {
        const exists = prev.directChats.some(
          (room) => room._id === resData.directChat._id
        );
        // 중복된 다이렉트 채팅방은 추가하지 않음
        return exists
          ? prev
          : {
              directChats: [...prev.directChats, resData.directChat].sort(
                (a, b) =>
                  new Date(b.lastMessageDate).getTime() -
                  new Date(a.lastMessageDate).getTime()
              ),
            };
      });

      return resData.roomId;
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "다이렉트 채팅방 추가 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  closeDirectChat: async (_id) => {
    try {
      const response = await fetch(`${apiURL}/closeDirectChat/${_id}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("다이렉트 채팅방 닫기 실패");
      }
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "다이렉트 채팅방 닫기 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },
}));

export default useDirectChatStore;
