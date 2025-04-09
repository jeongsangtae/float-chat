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
  directChatForm: (id: string, nickname: string) => Promise<void>;
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

      socket.off("updatedDirectChat");

      socket.on("updatedDirectChat", (updatedDirectChatData) => {
        set((prev) => ({
          directChats: prev.directChats.concat(updatedDirectChatData),
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

  directChatForm: async (id, nickname) => {
    try {
      const requestBody = { id, nickname };

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

      // set({ directChatRoomId: resData.roomId });

      set((prev) => ({
        directChats: [...prev.directChats, resData.directChat],
      }));

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
