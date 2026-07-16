import { create } from "zustand";
import { toast } from "react-toastify";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import { DirectChatData } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface DirectChatStore {
  socket: Socket | null;
  directChats: DirectChatData[];
  getDirectChat: () => Promise<void>;
  directChatForm: (
    id: string,
    nickname: string,
    avatarColor: string | null,
    avatarImageUrl: string | null
  ) => Promise<string>;
  closeDirectChat: (_id: string) => Promise<void>;
}

// 최근 메시지 기준으로 채팅방 정렬
const sortDirectChats = (a: DirectChatData, b: DirectChatData) =>
  new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();

const useDirectChatStore = create<DirectChatStore>((set) => ({
  socket: null,
  directChats: [],

  // 다이렉트 채팅방 목록 조회 및 실시간 이벤트 등록
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

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("directChatProfileUpdated");

      // 참가자 프로필 변경 시 채팅방 목록에도 반영
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
            sortDirectChats
          ),
        }));
      });

      // 다이렉트 채팅방이 화면에 보이지 않을 때 추가
      // some을 사용해 중복 방지
      // socket.on("invisibleDirectChat", (updatedDirectChatData) => {
      //   set((prev) => ({
      //     directChats: prev.directChats.some(
      //       (room) => room._id === updatedDirectChatData._id
      //     )
      //       ? prev.directChats.sort(sortFn)
      //       : [...prev.directChats, updatedDirectChatData].sort(sortFn),
      //   }));

      socket.off("updatedDirectChat");

      // 다이렉트 채팅방 추가 시에 중복을 방지하기 위해 some 사용
      // 기존 다이렉트 채팅방 정보 갱신 및 최신순 정렬
      socket.on("updatedDirectChat", (updatedDirectChatData) => {
        set((prev) => ({
          directChats: prev.directChats
            .map((room) =>
              room._id === updatedDirectChatData._id
                ? updatedDirectChatData
                : room
            )
            .sort(sortDirectChats),
        }));
      });

      const resData: { directChats: DirectChatData[] } = await response.json();

      set({ directChats: resData.directChats });
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("불러오기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 다이렉트 채팅방 생성
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

      // 이미 존재하는 채팅방이면 추가하지 않음
      set((prev) => {
        const exists = prev.directChats.some(
          (room) => room._id === resData.directChat._id
        );
        return exists
          ? prev
          : {
              directChats: [...prev.directChats, resData.directChat].sort(
                sortDirectChats
              ),
            };
      });

      return resData.roomId;
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("생성 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 다이렉트 채팅방 숨김 처리
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
      toast.error("닫기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },
}));

export default useDirectChatStore;
